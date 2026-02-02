"""
Rate Limiter Module
===================
Clean, modular rate limiting for FastAPI.

Two types of limits:
1. @security_rate_limit()  - IP-based, for auth endpoints (brute force)
2. @feature_rate_limit()   - Tier-based, per feature (business logic)

Usage:
    from app.core.limiter import security_rate_limit, feature_rate_limit
"""
from .config import (
    FEATURE_LIMITS,
    SECURITY_LIMITS,
    RateLimitTier,
)
from .core import TieredRateLimiter
from .decorators import (
    feature_rate_limit,
    get_identifier_and_tier,
    get_limiter,
    security_rate_limit,
)

# Legacy slowapi limiter (for backwards compatibility)
from slowapi import Limiter
from slowapi.util import get_remote_address
from ..config import get_settings

_settings = get_settings()
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=f"redis://{_settings.REDIS_HOST}:{_settings.REDIS_PORT}/0",
    strategy="fixed-window",
    key_prefix="legacy_ratelimit:",
)


__all__ = [
    # Config
    "RateLimitTier",
    "FEATURE_LIMITS",
    "SECURITY_LIMITS",
    
    # Core
    "TieredRateLimiter",
    "get_limiter",
    
    # Decorators
    "security_rate_limit",   # Auth endpoints (IP-based)
    "feature_rate_limit",    # Business features (tier-based)
    
    # Helpers
    "get_identifier_and_tier",
    
    # Legacy
    "limiter",
]
