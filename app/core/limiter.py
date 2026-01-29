from __future__ import annotations

import time
from collections import defaultdict, deque
from dataclasses import dataclass
from enum import Enum
from functools import wraps
from typing import Callable, Deque, Dict, Optional, Tuple

from fastapi import HTTPException, Request, status
from redis.asyncio import Redis

from .config import get_settings


# =============================================================================
# TIER CONFIGURATION
# =============================================================================

class RateLimitTier(str, Enum):
    """
    Rate limit tiers aligned with UserTier.
    
    Why these numbers?
    - ANONYMOUS: Strict to push signup. 5/min = typing speed test
    - FREE: 10x anonymous. Enough for casual use.
    - PRO: 5x free. Power users who pay.
    """
    ANONYMOUS = "anonymous"
    FREE = "free"
    PRO = "pro"


@dataclass(frozen=True)
class TierLimits:
    """
    Immutable limit configuration per tier.
    
    Using dataclass(frozen=True) makes this hashable and prevents
    accidental mutations - a defensive programming practice.
    """
    requests_per_minute: int
    requests_per_hour: int
    requests_per_day: int
    
    def __str__(self) -> str:
        return f"{self.requests_per_minute}/min, {self.requests_per_hour}/hr, {self.requests_per_day}/day"


# Rate limits per tier - easy to adjust
TIER_LIMITS: Dict[RateLimitTier, TierLimits] = {
    # Anonymous: Strict limits encourage signup
    RateLimitTier.ANONYMOUS: TierLimits(
        requests_per_minute=5,
        requests_per_hour=30,
        requests_per_day=100,
    ),
    # Free: Reward for signing up
    RateLimitTier.FREE: TierLimits(
        requests_per_minute=30,
        requests_per_hour=300,
        requests_per_day=1000,
    ),
    # Pro: Generous limits for paying users
    RateLimitTier.PRO: TierLimits(
        requests_per_minute=100,
        requests_per_hour=1000,
        requests_per_day=5000,
    ),
}


# =============================================================================
# RATE LIMITER CLASS
# =============================================================================

class TieredRateLimiter:
    """
    Production-grade rate limiter with tier support.
    
    Design Patterns Used:
    - Singleton (via module-level instance)
    - Strategy (different limits per tier)
    - Fallback (Redis → memory)
    
    Redis Key Format:
        ratelimit:{identifier}:{window_seconds}
        
    Example:
        ratelimit:user:550e8400-e29b-41d4-a716-446655440000:60
        ratelimit:ip:192.168.1.1:3600
    """
    
    def __init__(
        self,
        redis_client: Optional[Redis] = None,
        key_prefix: str = "ratelimit",
    ):
        self.redis_client = redis_client
        self.key_prefix = key_prefix
        
        # Fallback in-memory storage (for development/Redis failure)
        # Using deque for O(1) operations on both ends
        self._memory_store: Dict[str, Deque[float]] = defaultdict(
            lambda: deque(maxlen=10000)
        )
        
        # Metrics for monitoring
        self._metrics = {
            "total_requests": 0,
            "limited_requests": 0,
            "redis_errors": 0,
        }
    
    async def check_rate_limit(
        self,
        identifier: str,
        tier: RateLimitTier,
    ) -> Tuple[bool, Optional[str], Optional[int]]:
        """
        Check if request should be allowed.
        
        Args:
            identifier: "user:{uuid}" or "ip:{ip_address}"
            tier: User's tier (ANONYMOUS, FREE, PRO)
            
        Returns:
            Tuple of:
            - allowed: bool
            - error_message: Optional[str] (if not allowed)
            - retry_after: Optional[int] seconds (if not allowed)
        """
        self._metrics["total_requests"] += 1
        
        limits = TIER_LIMITS[tier]
        current_time = time.time()
        
        # Check all time windows (minute → hour → day)
        windows = [
            (60, limits.requests_per_minute, "minute"),
            (3600, limits.requests_per_hour, "hour"),
            (86400, limits.requests_per_day, "day"),
        ]
        
        for window_seconds, limit, window_name in windows:
            allowed, retry_after = await self._check_window(
                identifier=identifier,
                window_seconds=window_seconds,
                limit=limit,
                current_time=current_time,
            )
            
            if not allowed:
                self._metrics["limited_requests"] += 1
                error_msg = (
                    f"Rate limit exceeded: {limit} requests per {window_name}. "
                    f"Try again in {retry_after} seconds."
                )
                return False, error_msg, retry_after
        
        return True, None, None
    
    async def _check_window(
        self,
        identifier: str,
        window_seconds: int,
        limit: int,
        current_time: float,
    ) -> Tuple[bool, Optional[int]]:
        """
        Check rate limit for a specific time window.
        
        Uses Redis if available, falls back to memory.
        """
        if self.redis_client:
            try:
                return await self._check_window_redis(
                    identifier, window_seconds, limit, current_time
                )
            except Exception as e:
                self._metrics["redis_errors"] += 1
                # Fallback to memory on Redis failure
                # Log this in production!
        
        return self._check_window_memory(
            identifier, window_seconds, limit, current_time
        )
    
    async def _check_window_redis(
        self,
        identifier: str,
        window_seconds: int,
        limit: int,
        current_time: float,
    ) -> Tuple[bool, Optional[int]]:
        """
        Redis-based sliding window using sorted sets.
        
        Algorithm:
        1. Remove entries older than window
        2. Count entries in window
        3. If under limit, add new entry
        4. Set TTL to auto-cleanup
        
        This is atomic via Redis pipeline.
        """
        key = f"{self.key_prefix}:{identifier}:{window_seconds}"
        window_start = current_time - window_seconds
        
        # Pipeline for atomic operations
        pipe = self.redis_client.pipeline()
        
        # 1. Remove old entries
        pipe.zremrangebyscore(key, 0, window_start)
        
        # 2. Count current entries
        pipe.zcard(key)
        
        # Execute first batch
        results = await pipe.execute()
        request_count = results[1]
        
        # 3. Check limit
        if request_count >= limit:
            # Get oldest entry to calculate retry_after
            oldest = await self.redis_client.zrange(key, 0, 0, withscores=True)
            if oldest:
                oldest_time = oldest[0][1]
                retry_after = int(oldest_time + window_seconds - current_time) + 1
                return False, max(1, retry_after)
            return False, window_seconds
        
        # 4. Add current request and set TTL
        pipe2 = self.redis_client.pipeline()
        pipe2.zadd(key, {str(current_time): current_time})
        pipe2.expire(key, window_seconds * 2)  # 2x for safety
        await pipe2.execute()
        
        return True, None
    
    def _check_window_memory(
        self,
        identifier: str,
        window_seconds: int,
        limit: int,
        current_time: float,
    ) -> Tuple[bool, Optional[int]]:
        """
        In-memory fallback using deque.
        
        WARNING: Not suitable for production multi-process deployments!
        Each process has its own memory, so limits aren't shared.
        """
        key = f"{identifier}:{window_seconds}"
        window_start = current_time - window_seconds
        
        timestamps = self._memory_store[key]
        
        # Remove old entries
        while timestamps and timestamps[0] < window_start:
            timestamps.popleft()
        
        # Check limit
        if len(timestamps) >= limit:
            retry_after = int(timestamps[0] + window_seconds - current_time) + 1
            return False, max(1, retry_after)
        
        # Add current request
        timestamps.append(current_time)
        return True, None
    
    @staticmethod
    def get_client_ip(request: Request) -> str:
        """
        Extract client IP, handling proxies properly.
        
        IMPORTANT: In production behind a load balancer,
        configure your proxy to set X-Forwarded-For correctly
        and trust only your proxy's IP.
        """
        # Check X-Forwarded-For (set by reverse proxy)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            # First IP is the original client
            return forwarded_for.split(",")[0].strip()
        
        # Check X-Real-IP (alternative header)
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip.strip()
        
        # Direct connection
        if request.client:
            return request.client.host
        
        return "unknown"
    
    def get_metrics(self) -> Dict:
        """Get rate limiter metrics for monitoring."""
        return {
            **self._metrics,
            "memory_keys": len(self._memory_store),
            "redis_connected": self.redis_client is not None,
        }


# =============================================================================
# GLOBAL INSTANCE & HELPERS
# =============================================================================

# Singleton instance - initialized lazily
_limiter: Optional[TieredRateLimiter] = None


async def get_limiter() -> TieredRateLimiter:
    """
    Get or create the global rate limiter instance.
    
    Lazy initialization ensures settings are loaded first.
    """
    global _limiter
    
    if _limiter is None:
        settings = get_settings()
        
        # Try to connect to Redis
        try:
            redis_client = Redis.from_url(
                f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/1",
                decode_responses=True,
            )
            # Test connection
            await redis_client.ping()
        except Exception:
            redis_client = None
            # In production, log this warning!
        
        _limiter = TieredRateLimiter(redis_client=redis_client)
    
    return _limiter


def get_identifier_and_tier(request: Request) -> Tuple[str, RateLimitTier]:
    """
    Determine identifier and tier from request.
    
    This is the KEY LOGIC:
    - If user is in request.state → use user_id + user's tier
    - Otherwise → use IP + ANONYMOUS tier
    """
    # Check if user is set by auth middleware/dependency
    user = getattr(request.state, "user", None)
    
    if user is not None:
        # Authenticated user: use their ID and tier
        user_id = str(user.id)
        
        # Map UserTier to RateLimitTier
        user_tier = getattr(user, "tier", "free")
        if user_tier == "pro":
            tier = RateLimitTier.PRO
        else:
            tier = RateLimitTier.FREE
            
        return f"user:{user_id}", tier
    
    # Anonymous user: use IP
    ip = TieredRateLimiter.get_client_ip(request)
    return f"ip:{ip}", RateLimitTier.ANONYMOUS


# =============================================================================
# DECORATOR FOR ENDPOINTS
# =============================================================================

def rate_limit_tier(
    *,
    override_limit: Optional[str] = None,
):
    """
    Decorator for tier-aware rate limiting.
    
    Args:
        override_limit: Optional override like "10/minute" for specific endpoints.
                       If not set, uses the user's tier limits.
    
    Usage:
        @router.get("/search")
        @rate_limit_tier()
        async def search(request: Request, ...): ...
        
        # With override for sensitive endpoints
        @router.post("/expensive-operation")
        @rate_limit_tier(override_limit="5/minute")
        async def expensive(request: Request, ...): ...
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Find request in args/kwargs
            request = kwargs.get("request")
            if request is None:
                for arg in args:
                    if isinstance(arg, Request):
                        request = arg
                        break
            
            if request is None:
                # Can't rate limit without request, let it through
                return await func(*args, **kwargs)
            
            # Get identifier and tier
            identifier, tier = get_identifier_and_tier(request)
            
            # Get limiter
            limiter_instance = await get_limiter()
            
            # Check rate limit
            if override_limit:
                # Parse override like "10/minute"
                allowed, error_msg, retry_after = await _check_override_limit(
                    limiter_instance, identifier, override_limit
                )
            else:
                allowed, error_msg, retry_after = await limiter_instance.check_rate_limit(
                    identifier, tier
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


async def _check_override_limit(
    limiter_instance: TieredRateLimiter,
    identifier: str,
    limit_string: str,
) -> Tuple[bool, Optional[str], Optional[int]]:
    """
    Parse and check an override limit like "10/minute".
    
    Supported formats:
    - "10/minute" or "10/min"
    - "100/hour" or "100/hr"
    - "1000/day"
    """
    parts = limit_string.lower().split("/")
    if len(parts) != 2:
        # Invalid format, allow through
        return True, None, None
    
    try:
        limit = int(parts[0])
    except ValueError:
        return True, None, None
    
    unit = parts[1]
    if unit in ("minute", "min"):
        window_seconds = 60
        window_name = "minute"
    elif unit in ("hour", "hr"):
        window_seconds = 3600
        window_name = "hour"
    elif unit == "day":
        window_seconds = 86400
        window_name = "day"
    else:
        return True, None, None
    
    allowed, retry_after = await limiter_instance._check_window(
        identifier=identifier,
        window_seconds=window_seconds,
        limit=limit,
        current_time=time.time(),
    )
    
    if not allowed:
        error_msg = f"Rate limit exceeded: {limit} requests per {window_name}."
        return False, error_msg, retry_after
    
    return True, None, None


# =============================================================================
# BACKWARD COMPATIBILITY WITH SLOWAPI
# =============================================================================

# Keep the old limiter for gradual migration
from slowapi import Limiter
from slowapi.util import get_remote_address

settings = get_settings()

# Legacy limiter - use rate_limit_tier() decorator for new endpoints
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/0",
    strategy="fixed-window",
    key_prefix="legacy_ratelimit:",
)
