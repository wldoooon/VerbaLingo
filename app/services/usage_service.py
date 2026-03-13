from datetime import date, datetime, timezone
from typing import Optional, Tuple
from redis.asyncio import Redis
from sqlmodel.ext.asyncio.session import AsyncSession

from ..models.user import User, UserTier
from ..models.user_usage import UserUsage
from ..core.config import get_settings
from ..core.logging import logger

settings = get_settings()

FEATURE_LIMITS = {
    "search": {
        UserTier.FREE:     250,    
        UserTier.BASIC:    500,    
        UserTier.PRO:      2000,   
        UserTier.PREMIUM:  -1,
        UserTier.MAX:      -1,
    },
    "ai_chat": {
        UserTier.FREE:     50,     
        UserTier.BASIC:    500,
        UserTier.PRO:      2000,
        UserTier.PREMIUM:  -1,
        UserTier.MAX:      -1,
    }
}

ANONYMOUS_LIMITS = {
    "search": 3,
    "ai_chat": 0
}


def _get_redis_key(identifier: str, feature: str) -> str:
    today = date.today()
    month_key = f"{today.year}-{today.month:02}"
    return f"usage:{identifier}:{feature}:{month_key}"


def _get_limit(tier: Optional[UserTier], feature: str) -> int:
    """Get the limit for a feature based on tier. Returns -1 for unlimited."""
    if tier is None:
        return ANONYMOUS_LIMITS.get(feature, 0)
    return FEATURE_LIMITS.get(feature, {}).get(tier, 0)


async def check_usage_limit(
    redis: Redis,
    db: AsyncSession,
    user: Optional[User],
    feature: str,
    client_ip: str = "unknown"
) -> Tuple[bool, Optional[str], int, int]:
    """
    Check if user can perform the action.
    
    Returns: (allowed, error_message, current_count, limit)
    """
    # Determine identifier and tier
    if user:
        identifier = f"user:{user.id}"
        tier = user.tier
    else:
        identifier = f"ip:{client_ip}"
        tier = None
    
    # Get limit for this tier
    limit = _get_limit(tier, feature)
    
    # -1 means unlimited
    if limit == -1:
        return True, None, 0, -1
    
    # 0 means blocked
    if limit == 0:
        return False, f"Upgrade to access {feature}. Not available on your plan.", 0, 0
    
    # Check Redis counter
    redis_key = _get_redis_key(identifier, feature)
    current_count = await redis.get(redis_key)
    
    if current_count is None:
        # Redis miss - try to restore from PostgreSQL (for logged-in users)
        if user:
            current_count = await _restore_from_db(redis, db, user, feature, redis_key)
        else:
            current_count = 0
    else:
        current_count = int(current_count)
    
    # Check if over limit
    if current_count >= limit:
        return False, f"Monthly {feature} limit reached ({limit}/month). Resets next month.", current_count, limit
    
    return True, None, current_count, limit


async def increment_usage(
    redis: Redis,
    db: AsyncSession,
    user: Optional[User],
    feature: str,
    client_ip: str = "unknown"
) -> int:
    """
    Increment usage counter in Redis.
    Returns the new count.
    """
    if user:
        identifier = f"user:{user.id}"
        # Track this user as 'dirty' for the background sync task
        await redis.sadd("usage:dirty_users", str(user.id))
    else:
        identifier = f"ip:{client_ip}"
    
    redis_key = _get_redis_key(identifier, feature)
    
    # Increment and set TTL (48 hours to allow for timezone differences)
    new_count = await redis.incr(redis_key)
    await redis.expire(redis_key, 48 * 60 * 60)
    
    return new_count


async def sync_usage_to_db(
    db: AsyncSession,
    user: User,
    feature: str
) -> None:
    """
    Sync usage increment to PostgreSQL (called in background).
    Handles daily reset if date changed.
    """
    try:
        # Get user usage record
        usage = await db.get(UserUsage, user.id)
        if not usage:
            logger.warning(f"UserUsage not found for user {user.id}")
            return
        
        today = date.today()
        
        # Check if we need to reset monthly counters
        # We reset if usage_reset_at is from a different month or year
        is_new_month = (
            usage.usage_reset_at.month != today.month or 
            usage.usage_reset_at.year != today.year
        )
        
        if is_new_month:
            usage.searches_count = 0
            usage.usage_reset_at = datetime.now(timezone.utc)
        
        # Increment the appropriate counter
        if feature == "search":
            usage.searches_count += 1
            usage.total_searches += 1
        elif feature == "ai_chat":
            usage.total_ai_chats += 1
        
        usage.updated_at = datetime.now(timezone.utc)
        db.add(usage)
        await db.commit()
        
    except Exception as e:
        logger.error(f"Failed to sync usage to DB: {e}")
        # Don't raise - this is background work


async def get_user_usage_stats(
    redis: Redis,
    db: AsyncSession,
    user: User
) -> dict:
    """
    Get current usage stats for a user.
    Returns dict with current counts and limits.
    """
    today = date.today()
    month_key = f"{today.year}-{today.month:02}"
    identifier = f"user:{user.id}"
    tier = user.tier
    
    # Get current counts from Redis in a single batch (MGET)
    keys = [
        f"usage:{identifier}:search:{month_key}",
        f"usage:{identifier}:ai_chat:{month_key}"
    ]
    
    redis_counts = await redis.mget(keys)
    search_count = int(redis_counts[0] or 0)
    ai_chat_count = int(redis_counts[1] or 0)
    
    # Get lifetime stats from PostgreSQL (optional, don't block if missing)
    try:
        usage = await db.get(UserUsage, user.id)
    except Exception as e:
        logger.error(f"Error fetching UserUsage for user {user.id}: {e}")
        usage = None
    
    return {
        "tier": tier,
        "monthly": {
            "search": {"current": search_count, "limit": _get_limit(tier, "search"), "remaining": max(0, _get_limit(tier, "search") - search_count) if _get_limit(tier, "search") != -1 else -1},
            "ai_chat": {
                "current": ai_chat_count, 
                "balance": usage.ai_credit_balance if usage else 0, 
                "limit": _get_limit(tier, "ai_chat"), 
                "remaining": max(0, _get_limit(tier, "ai_chat") - ai_chat_count) if _get_limit(tier, "ai_chat") != -1 else -1
            },
        },
        "lifetime": {
            "total_searches": usage.total_searches if usage else 0,
            "total_ai_chats": usage.total_ai_chats if usage else 0,
        },
        "reset_date": date.today().isoformat(),
    }


async def _restore_from_db(
    redis: Redis,
    db: AsyncSession,
    user: User,
    feature: str,
    redis_key: str
) -> int:
    """
    Restore Redis counter from PostgreSQL after cache miss.
    This handles the case where Redis crashed/restarted.
    """
    try:
        usage = await db.get(UserUsage, user.id)
        if not usage:
            return 0
        
        today = date.today()
        
        # If the DB date is not from current month, counts are effectively 0
        if usage.usage_reset_at.month != today.month or usage.usage_reset_at.year != today.year:
            return 0
        
        # Get the count from DB
        if feature == "search":
            count = usage.searches_count
        elif feature == "ai_chat":
            count = 0 # Handled by balance mostly, but tracker might use messages
        else:
            count = 0
        
        # Restore to Redis
        if count > 0:
            await redis.set(redis_key, count, ex=48 * 60 * 60)
        
        return count
        
    except Exception as e:
        logger.error(f"Failed to restore from DB: {e}")
        return 0

async def sync_all_dirty_users(redis: Redis):
    """
    Background task to sync usage from Redis to PostgreSQL for all 'dirty' users.
    Called by APScheduler every few minutes.
    """
    from ..db.session import engine
    from sqlmodel.ext.asyncio.session import AsyncSession
    from ..models.user_usage import UserUsage
    import uuid

    # 1. Get a batch of dirty user IDs
    # We use SPOP to atomically get and remove IDs from the set
    user_ids = await redis.spop("usage:dirty_users", 100)
    if not user_ids:
        return

    logger.info(f"Starting usage sync for {len(user_ids)} users")
    
    today = date.today()
    month_key = f"{today.year}-{today.month:02}"
    synced_count = 0

    async with AsyncSession(engine) as session:
        for user_id_str in user_ids:
            try:
                user_id = uuid.UUID(user_id_str)
                # Get the latest monthly counts from Redis
                # Keys: usage:user:{id}:{feature}:{month_key}
                identifier = f"user:{user_id}"
                
                search_count = int(await redis.get(f"usage:{identifier}:search:{month_key}") or 0)
                ai_chat_count = int(await redis.get(f"usage:{identifier}:ai_chat:{month_key}") or 0)

                # Get the DB record
                usage = await session.get(UserUsage, user_id)
                if not usage:
                    continue
                
                # Check if DB date is from current month
                is_current_month = (
                    usage.usage_reset_at.month == today.month and 
                    usage.usage_reset_at.year == today.year
                )

                if is_current_month:
                    # Same month: add the difference to lifetime totals
                    usage.total_searches += (search_count - usage.searches_count)
                else:
                    # New month in DB: simple override and add everything to total
                    usage.total_searches += search_count
                    usage.total_ai_chats += ai_chat_count
                    usage.usage_reset_at = datetime.now(timezone.utc)

                usage.searches_count = search_count
                usage.updated_at = datetime.now(timezone.utc)
                
                session.add(usage)
                synced_count += 1
            except Exception as e:
                logger.error(f"Failed to sync user {user_id_str}: {e}")
                # Put the ID back so we don't lose the data
                await redis.sadd("usage:dirty_users", user_id_str)

        await session.commit()
    
    if synced_count > 0:
        logger.success(f"Usage sync complete: {synced_count} records updated")


async def check_ai_credits(db: AsyncSession, user: User) -> Tuple[bool, Optional[str], int]:
    usage = await db.get(UserUsage, user.id)
    if not usage:
         return False, "Wallet not found", 0
         
    if usage.ai_credit_balance <= 0:
         return False, "Out of Sparks! Please upgrade your plan to continue chatting.", 0
         
    return True, None, usage.ai_credit_balance


async def deduct_ai_credits(db: AsyncSession, user: User, total_tokens_used: int) -> int:
    """
    Directly deducts tokens from the user's PostgreSQL wallet after a stream completes.
    Uses precise token counts from the Ghost Calculator.
    Bypasses Redis completely for financial data safety.
    Returns the new balance.
    """
    usage = await db.get(UserUsage, user.id)
    if not usage:
         return 0
         
    # Subtract tokens
    usage.ai_credit_balance -= total_tokens_used
    usage.updated_at = datetime.now(timezone.utc)
    usage.total_ai_chats += 1 # We still track the raw count of conversations for analytics
    
    db.add(usage)
    await db.commit()
    await db.refresh(usage)
    
    logger.info(f"Deducted {total_tokens_used} tokens from user {user.id}. New balance: {usage.ai_credit_balance}")
    
    return usage.ai_credit_balance
