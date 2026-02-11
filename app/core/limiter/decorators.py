"""
Rate Limiter Decorators
=======================
Easy-to-use decorators for rate limiting endpoints.
"""
from __future__ import annotations

from functools import wraps
from typing import Callable, Optional, Tuple

from fastapi import HTTPException, Request, Response, status
from redis.asyncio import Redis

from ..config import get_settings
from .config import RateLimitTier
from .core import TieredRateLimiter
from ...services import usage_service
from ..redis import get_redis
from ...core.logging import logger


# =============================================================================
# SINGLETON LIMITER INSTANCE
# =============================================================================

_limiter: Optional[TieredRateLimiter] = None


async def get_limiter() -> TieredRateLimiter:
    """Get or create the singleton rate limiter instance."""
    global _limiter

    if _limiter is None:
        settings = get_settings()

        try:
            redis_client = Redis.from_url(
                f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/0",
                decode_responses=True,
            )
            await redis_client.ping()
        except Exception:
            redis_client = None

        _limiter = TieredRateLimiter(
            redis_client=redis_client,
            key_prefix="ratelimit",
        )

    return _limiter


def get_identifier_and_tier(request: Request) -> Tuple[str, RateLimitTier]:
    """Extract user identifier and tier from request."""
    user = getattr(request.state, "user", None)

    if user is not None:
        user_id = str(user.id)
        user_tier = getattr(user, "tier", "free")
        if user_tier == "pro":
            tier = RateLimitTier.PRO
        else:
            tier = RateLimitTier.FREE
        return f"user:{user_id}", tier

    ip = TieredRateLimiter.get_client_ip(request)
    return f"ip:{ip}", RateLimitTier.ANONYMOUS


# =============================================================================
# DECORATOR: Security Rate Limit (IP-based)
# =============================================================================

def security_rate_limit():
    """
    IP-based security rate limiting.
    Use on auth endpoints to prevent brute force attacks.
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            request = kwargs.get("request")
            if request is None:
                for arg in args:
                    if isinstance(arg, Request):
                        request = arg
                        break

            if request is None:
                return await func(*args, **kwargs)

            ip = TieredRateLimiter.get_client_ip(request)
            endpoint = request.url.path
            limiter_instance = await get_limiter()

            allowed, error_msg, retry_after = await limiter_instance.check_security_limit(
                ip=ip, endpoint=endpoint
            )

            if not allowed:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=error_msg,
                    headers={"Retry-After": str(retry_after)} if retry_after else {},
                )

            return await func(*args, **kwargs)
        return wrapper
    return decorator


# =============================================================================
# DECORATOR: Feature Rate Limit (Tier-based daily)
# =============================================================================

def feature_rate_limit(feature: str):
    """
    Feature-specific daily limits based on user tier.
    Uses unified UsageService for tracking and persistence.
    Injects RateLimit headers into the response.
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            request: Request = kwargs.get("request")
            response: Optional[Response] = kwargs.get("response")

            # Try to find request/response in args if not in kwargs
            if not request:
                for arg in args:
                    if isinstance(arg, Request):
                        request = arg
                        break
            if not response:
                for arg in args:
                    if isinstance(arg, Response):
                        response = arg
                        break

            if not request:
                return await func(*args, **kwargs)

            redis_client = await get_redis()

            # We need a DB session to check/restore limits if Redis misses
            from ...db.session import engine
            from sqlmodel.ext.asyncio.session import AsyncSession

            user = getattr(request.state, "user", None)
            client_ip = TieredRateLimiter.get_client_ip(request)

            logger.debug(
                f"[RATE-LIMIT] feature={feature} | ip={client_ip} | "
                f"user={user.id if user else 'anonymous'} | "
                f"tier={user.tier if user else 'none'} | "
                f"response_param={'FOUND' if response else 'MISSING'}"
            )

            async with AsyncSession(engine) as db_session:
                # 1. Check if allowed
                allowed, error_msg, current, limit = await usage_service.check_usage_limit(
                    redis=redis_client,
                    db=db_session,
                    user=user,
                    feature=feature,
                    client_ip=client_ip
                )

                if not allowed:
                    logger.warning(
                        f"[RATE-LIMIT] BLOCKED feature={feature} | ip={client_ip} | "
                        f"user={user.id if user else 'anonymous'} | "
                        f"current={current}/{limit} | msg={error_msg}"
                    )
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail=error_msg,
                        headers={
                            "RateLimit-Limit": str(limit),
                            "RateLimit-Remaining": "0",
                            "RateLimit-Reset": "86400",
                            "RateLimit-Policy": f"{feature};q={limit}",
                        },
                    )

                # 2. Execute the actual function
                result = await func(*args, **kwargs)

                # 3. If we got here, it succeeded. Increment usage.
                await usage_service.increment_usage(
                    redis=redis_client,
                    db=db_session,
                    user=user,
                    feature=feature,
                    client_ip=client_ip
                )

                # 4. Inject headers into response if available
                # Note: This requires the endpoint to accept a 'response' parameter
                if response:
                    response.headers["RateLimit-Limit"] = str(limit)
                    response.headers["RateLimit-Remaining"] = str(max(0, limit - (current + 1)))
                    # Daily reset (approximate for now, can be improved)
                    response.headers["RateLimit-Reset"] = "86400"
                    # Include policy name
                    response.headers["RateLimit-Policy"] = f"{feature};q={limit}"
                    logger.debug(
                        f"[RATE-LIMIT] HEADERS INJECTED feature={feature} | "
                        f"limit={limit} | remaining={max(0, limit - (current + 1))} | "
                        f"policy={feature};q={limit}"
                    )
                else:
                    logger.warning(
                        f"[RATE-LIMIT] NO RESPONSE PARAM — headers NOT injected for feature={feature}. "
                        f"Endpoint must accept 'response: Response' parameter!"
                    )

                return result

        return wrapper
    return decorator
