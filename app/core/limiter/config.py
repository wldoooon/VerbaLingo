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
    PRO = "pro"


# =============================================================================
# SECURITY LIMITS (IP-based, per-endpoint)
# Protects against brute force attacks
# =============================================================================

SECURITY_LIMITS: Dict[str, Dict[str, int]] = {
    # Auth endpoints - strict (brute force protection)
    "/auth/signup": {"requests": 3, "window": 60},          # 3/min
    "/auth/login": {"requests": 2, "window": 60},           # 5/min
    "/auth/forgot-password": {"requests": 2, "window": 300}, # 2/5min
    "/auth/verify-otp": {"requests": 5, "window": 60},       # 5/min
    "/auth/reset-password": {"requests": 3, "window": 300},  # 3/5min
}


# =============================================================================
# FEATURE LIMITS (Tier-based, daily quotas)
# 0 = blocked, -1 = unlimited
# =============================================================================

FEATURE_LIMITS: Dict[str, Dict[RateLimitTier, int]] = {
    "search": {
        RateLimitTier.ANONYMOUS: 5,
        RateLimitTier.FREE: 50,
        RateLimitTier.PRO: -1,  # unlimited
    },
    "ai_chat": {
        RateLimitTier.ANONYMOUS: 0,   # blocked
        RateLimitTier.FREE: 15,
        RateLimitTier.PRO: 100,
    },
    "export": {
        RateLimitTier.ANONYMOUS: 0,   # blocked
        RateLimitTier.FREE: 5,
        RateLimitTier.PRO: -1,  # unlimited
    },
}
