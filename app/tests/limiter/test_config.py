"""
Config & Utility Tests
======================
Tests for configuration and helper functions.
"""
import pytest
from unittest.mock import MagicMock
from app.core.limiter import (
    TieredRateLimiter,
    RateLimitTier,
    FEATURE_LIMITS,
    SECURITY_LIMITS,
)


# --- Config sanity checks ---

def test_feature_limits_configured():
    """Features have tier limits."""
    assert "search" in FEATURE_LIMITS
    assert "ai_chat" in FEATURE_LIMITS
    assert "export" in FEATURE_LIMITS
    # Anonymous blocked from ai_chat
    assert FEATURE_LIMITS["ai_chat"][RateLimitTier.ANONYMOUS] == 0


def test_security_endpoints_protected():
    """Critical auth endpoints have limits."""
    assert "/api/v1/auth/login" in SECURITY_LIMITS
    assert "/api/v1/auth/register" in SECURITY_LIMITS


# --- Utility functions ---

def test_get_client_ip_from_forwarded():
    """Extract IP from X-Forwarded-For header."""
    request = MagicMock()
    request.headers = {"X-Forwarded-For": "203.0.113.50, 70.41.3.18"}
    request.client = None
    
    ip = TieredRateLimiter.get_client_ip(request)
    assert ip == "203.0.113.50"


def test_get_client_ip_from_real_ip():
    """Extract IP from X-Real-IP header."""
    request = MagicMock()
    request.headers = {"X-Real-IP": "10.0.0.1"}
    request.client = None
    
    ip = TieredRateLimiter.get_client_ip(request)
    assert ip == "10.0.0.1"


