"""
Rate Limiter Configuration
==========================
All rate limit settings in one place. Easy to modify.

Two types of limits:
1. SECURITY_LIMITS  - IP-based, per-endpoint (brute force protection)
2. FEATURE_LIMITS   - Tier-based, per-feature (business logic)
"""
from __future__ import annotations

from enum import Enum
from typing import Dict

class RateLimitTier(str, Enum):
    ANONYMOUS = "anonymous"
    FREE = "free"
    BASIC = "basic"
    PRO = "pro"
    PREMIUM = "premium"
    MAX = "max"


# =============================================================================
# SECURITY LIMITS (IP-based, per-endpoint)
# Protects against brute force attacks
# =============================================================================

SECURITY_LIMITS: Dict[str, Dict[str, int]] = {
    # Auth endpoints - strict (brute force protection)
    "/auth/signup": {"requests": 3, "window": 60},           # 3/min
    "/auth/login": {"requests": 2, "window": 60},            # 2/min
    "/auth/forgot-password": {"requests": 2, "window": 300}, # 2/5min
    "/auth/verify-otp": {"requests": 5, "window": 60},       # 5/min
    "/auth/reset-password": {"requests": 3, "window": 300},  # 3/5min
}


# =============================================================================
# FEATURE LIMITS (Tier-based, daily quotas)
# 0 = blocked, -1 = unlimited
# Search limits are daily approximations of monthly quotas:
#   FREE=100/mo→~4/day, BASIC=500/mo→~17/day, PRO=2000/mo→~67/day
# =============================================================================

FEATURE_LIMITS: Dict[str, Dict[RateLimitTier, int]] = {
    "search": {
        RateLimitTier.ANONYMOUS: 5,
        RateLimitTier.FREE: 4,
        RateLimitTier.BASIC: 17,
        RateLimitTier.PRO: 67,
        RateLimitTier.PREMIUM: -1,  # unlimited
        RateLimitTier.MAX: -1,      # unlimited
    },
    "ai_chat": {
        RateLimitTier.ANONYMOUS: 0,   # blocked
        RateLimitTier.FREE: 15,
        RateLimitTier.BASIC: 50,
        RateLimitTier.PRO: 100,
        RateLimitTier.PREMIUM: -1,  # unlimited (gated by Sparks wallet instead)
        RateLimitTier.MAX: -1,      # unlimited
    },
    "export": {
        RateLimitTier.ANONYMOUS: 0,   # blocked
        RateLimitTier.FREE: 5,
        RateLimitTier.BASIC: 10,
        RateLimitTier.PRO: -1,      # unlimited
        RateLimitTier.PREMIUM: -1,  # unlimited
        RateLimitTier.MAX: -1,      # unlimited
    },
}
