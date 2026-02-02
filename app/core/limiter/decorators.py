"""
Rate Limiter Decorators
=======================
Easy-to-use decorators for rate limiting endpoints.
"""
from __future__ import annotations

from functools import wraps
from typing import Callable, Optional, Tuple

from fastapi import HTTPException, Request, status
from redis.asyncio import Redis

from ..config import get_settings
from .config import RateLimitTier
from .core import TieredRateLimiter


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
    
    Example:
        @security_rate_limit()
        async def login(request: Request):
            pass
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
    Use on business endpoints (search, AI chat, exports).
    
    Example:
        @feature_rate_limit("search")
        async def search(request: Request):
            pass
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
            
            identifier, tier = get_identifier_and_tier(request)
            limiter_instance = await get_limiter()
            
            allowed, error_msg, retry_after = await limiter_instance.check_feature_limit(
                identifier=identifier, feature=feature, tier=tier
            )
            
            if not allowed:
                # 403 for blocked features, 429 for rate limits
                status_code = status.HTTP_403_FORBIDDEN if retry_after is None else status.HTTP_429_TOO_MANY_REQUESTS
                raise HTTPException(
                    status_code=status_code,
                    detail=error_msg,
                    headers={"Retry-After": str(retry_after)} if retry_after else {},
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


