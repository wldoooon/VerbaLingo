"""
Security Rate Limit Tests
=========================
Tests for IP-based brute force protection.
"""
import pytest
from app.core.limiter import TieredRateLimiter


@pytest.mark.asyncio
async def test_login_blocked_after_5_attempts():
    """Brute force: 6th login attempt blocked."""
    limiter = TieredRateLimiter(redis_client=None)
    
    for _ in range(5):
        await limiter.check_security_limit("192.168.1.1", "/api/v1/auth/login")
    
    allowed, error, _ = await limiter.check_security_limit("192.168.1.1", "/api/v1/auth/login")
    
    assert allowed is False
    assert error is not None


@pytest.mark.asyncio
async def test_different_ips_separate_limits():
    """Attacker IP blocked, other IPs work."""
    limiter = TieredRateLimiter(redis_client=None)
    
    for _ in range(5):
        await limiter.check_security_limit("attacker_ip", "/api/v1/auth/login")
    
    allowed_attacker, _, _ = await limiter.check_security_limit("attacker_ip", "/api/v1/auth/login")
    allowed_legit, _, _ = await limiter.check_security_limit("legit_ip", "/api/v1/auth/login")
    
    assert allowed_attacker is False
    assert allowed_legit is True
