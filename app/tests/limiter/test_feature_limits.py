"""
Feature Rate Limit Tests
========================
Tests for feature quotas (search, ai_chat, export).
"""
import pytest
from app.core.limiter import TieredRateLimiter, RateLimitTier


@pytest.mark.asyncio
async def test_anonymous_blocked_from_ai_chat():
    """Anonymous cannot use AI chat (premium feature)."""
    limiter = TieredRateLimiter(redis_client=None)
    
    allowed, error, retry = await limiter.check_feature_limit("anon", "ai_chat", RateLimitTier.ANONYMOUS)
    
    assert allowed is False
    assert "Upgrade" in error
    assert retry is None  # Entitlement, not rate limit


@pytest.mark.asyncio
async def test_free_user_limited_ai_chat():
    """Free user: 10 AI chats/day, 11th blocked."""
    limiter = TieredRateLimiter(redis_client=None)
    
    for _ in range(10):
        await limiter.check_feature_limit("free_user", "ai_chat", RateLimitTier.FREE)
    
    allowed, error, retry = await limiter.check_feature_limit("free_user", "ai_chat", RateLimitTier.FREE)
    
    assert allowed is False
    assert "limit reached" in error.lower()


@pytest.mark.asyncio
async def test_pro_user_unlimited_search():
    """Pro user: unlimited search (-1 = no limit)."""
    limiter = TieredRateLimiter(redis_client=None)
    
    for _ in range(500):
        allowed, _, _ = await limiter.check_feature_limit("pro", "search", RateLimitTier.PRO)
        assert allowed is True


@pytest.mark.asyncio
async def test_unknown_feature_allowed():
    """Unknown feature = allowed (fail open)."""
    limiter = TieredRateLimiter(redis_client=None)
    
    allowed, _, _ = await limiter.check_feature_limit("user", "fake_feature", RateLimitTier.FREE)
    assert allowed is True
