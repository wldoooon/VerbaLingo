"""
Rate Limiter Core
=================
The TieredRateLimiter class - handles all rate limit checking logic.
"""
from __future__ import annotations

import time
from collections import defaultdict
from typing import Deque, Dict, Optional, Tuple

from fastapi import Request
from redis.asyncio import Redis

from .config import (
    FEATURE_LIMITS,
    SECURITY_LIMITS,
    RateLimitTier,
)


class TieredRateLimiter:
    """
    A rate limiter that supports:
    - Redis (production) with memory fallback (dev)
    - Sliding window algorithm
    - Security limits (IP-based)
    - Feature limits (tier-based daily quotas)
    """
    
    def __init__(
        self,
        redis_client: Optional[Redis] = None,
        key_prefix: str = "ratelimit",
    ):
        self.redis_client = redis_client
        self.key_prefix = key_prefix
        self._memory_store: Dict[str, Deque[float]] = defaultdict(
            lambda: __import__('collections').deque(maxlen=10000)
        )
        self._metrics = {
            "total_requests": 0,
            "limited_requests": 0,
            "redis_errors": 0,
        }
    
    # -------------------------------------------------------------------------
    # Main Check Methods
    # -------------------------------------------------------------------------
    
    async def check_security_limit(
        self,
        ip: str,
        endpoint: str,
    ) -> Tuple[bool, Optional[str], Optional[int]]:
        """Check IP-based security rate limit for an endpoint."""
        self._metrics["total_requests"] += 1
        # Check endpoint-specific limit only
        if endpoint in SECURITY_LIMITS:
            config = SECURITY_LIMITS[endpoint]
            allowed, retry_after = await self._check_window(
                identifier=f"security:{ip}:{endpoint}",
                window_seconds=config["window"],
                limit=config["requests"],
                current_time=time.time(),
            )
            if not allowed:
                self._metrics["limited_requests"] += 1
                return False, f"Too many requests. Try again in {retry_after}s.", retry_after
        
        return True, None, None
    
    async def check_feature_limit(
        self,
        identifier: str,
        feature: str,
        tier: RateLimitTier,
    ) -> Tuple[bool, Optional[str], Optional[int]]:
        """Check feature-specific daily limit based on tier."""
        self._metrics["total_requests"] += 1
        if feature not in FEATURE_LIMITS:
            return True, None, None
        
        limit = FEATURE_LIMITS[feature].get(tier, 0)
        
        # -1 = unlimited
        if limit == -1:
            return True, None, None
        
        # 0 = blocked (entitlement)
        if limit == 0:
            return False, f"Upgrade to access {feature}. Not available on your plan.", None
        
        # Check daily usage
        allowed, retry_after = await self._check_window(
            identifier=f"feature:{identifier}:{feature}",
            window_seconds=86400,
            limit=limit,
            current_time=time.time(),
        )
        
        if not allowed:
            hours_left = retry_after // 3600 if retry_after else 24
            return False, f"Daily {feature} limit reached ({limit}/day). Resets in {hours_left}h.", retry_after
        
        return True, None, None
    
    # -------------------------------------------------------------------------
    # Window Checking (Redis with memory fallback)
    # -------------------------------------------------------------------------
    
    async def _check_window(
        self,
        identifier: str,
        window_seconds: int,
        limit: int,
        current_time: float,
    ) -> Tuple[bool, Optional[int]]:
        if self.redis_client:
            try:
                return await self._check_window_redis(
                    identifier, window_seconds, limit, current_time
                )
            except Exception:
                self._metrics["redis_errors"] += 1
        
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
        key = f"{self.key_prefix}:{identifier}:{window_seconds}"
        window_start = current_time - window_seconds
        
        pipe = self.redis_client.pipeline()
        pipe.zremrangebyscore(key, 0, window_start)
        pipe.zcard(key)
        results = await pipe.execute()
        request_count = results[1]
        
        if request_count >= limit:
            oldest = await self.redis_client.zrange(key, 0, 0, withscores=True)
            if oldest:
                oldest_time = oldest[0][1]
                retry_after = int(oldest_time + window_seconds - current_time) + 1
                return False, max(1, retry_after)
            return False, window_seconds
        
        pipe2 = self.redis_client.pipeline()
        pipe2.zadd(key, {str(current_time): current_time})
        pipe2.expire(key, window_seconds * 2)
        await pipe2.execute()
        
        return True, None
    
    def _check_window_memory(
        self,
        identifier: str,
        window_seconds: int,
        limit: int,
        current_time: float,
    ) -> Tuple[bool, Optional[int]]:
        from collections import deque
        
        key = f"{identifier}:{window_seconds}"
        window_start = current_time - window_seconds
        
        if key not in self._memory_store:
            self._memory_store[key] = deque(maxlen=10000)
        
        timestamps = self._memory_store[key]
        
        while timestamps and timestamps[0] < window_start:
            timestamps.popleft()
        
        if len(timestamps) >= limit:
            retry_after = int(timestamps[0] + window_seconds - current_time) + 1
            return False, max(1, retry_after)
        
        timestamps.append(current_time)
        return True, None
    
    # -------------------------------------------------------------------------
    # Utility Methods
    # -------------------------------------------------------------------------
    
    @staticmethod
    def get_client_ip(request: Request) -> str:
        """Extract client IP from request headers."""
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip.strip()
        
        if request.client:
            return request.client.host
        
        return "unknown"
    
    def get_metrics(self) -> Dict:
        """Get rate limiter metrics."""
        return {
            **self._metrics,
            "memory_keys": len(self._memory_store),
            "redis_connected": self.redis_client is not None,
        }
