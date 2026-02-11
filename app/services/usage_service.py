"""
Usage Service
=============
Hybrid approach: Redis for real-time limiting, PostgreSQL for persistence.

Flow:
1. Check Redis counter (fast gate)
2. If Redis miss → restore from PostgreSQL
3. Increment Redis on success
4. Update PostgreSQL in background (async)
"""

from datetime import date, datetime, timezone
from typing import Optional, Tuple
from redis.asyncio import Redis
from sqlmodel.ext.asyncio.session import AsyncSession

from ..models.user import User, UserTier
from ..models.user_usage import UserUsage
from ..core.config import get_settings
from ..core.logging import logger

settings = get_settings()

# Feature limits per tier (daily)
FEATURE_LIMITS = {
    "search": {
        UserTier.FREE: 50,
        UserTier.PRO: -1,  # unlimited
        UserTier.UNLIMITED: -1,
    },
    "ai_chat": {
        UserTier.FREE: 15,
        UserTier.PRO: 100,
        UserTier.UNLIMITED: -1,
    },
    "export": {
        UserTier.FREE: 5,
        UserTier.PRO: -1,
        UserTier.UNLIMITED: -1,
    },
}

# Anonymous limits (by IP)
ANONYMOUS_LIMITS = {
    "search": 11,
    "ai_chat": 0,  # blocked
    "export": 0,   # blocked
}


def _get_redis_key(identifier: str, feature: str) -> str:
    """Generate Redis key with today's date for auto-reset."""
    today = date.today().isoformat()
    return f"usage:{identifier}:{feature}:{today}"


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
        return False, f"Daily {feature} limit reached ({limit}/day). Resets at midnight.", current_count, limit
    
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
        
        # Check if we need to reset daily counters
        if usage.usage_reset_date != today:
            usage.daily_searches_count = 0
            usage.daily_ai_chats_count = 0
            usage.daily_exports_count = 0
            usage.usage_reset_date = today
        
        # Increment the appropriate counter
        if feature == "search":
            usage.daily_searches_count += 1
            usage.total_searches += 1
        elif feature == "ai_chat":
            usage.daily_ai_chats_count += 1
            usage.total_ai_chats += 1
        elif feature == "export":
            usage.daily_exports_count += 1
            usage.total_exports += 1
        
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
    tier = user.tier
    today = date.today().isoformat()
    identifier = f"user:{user.id}"
    
    # Get current counts from Redis
    search_key = f"usage:{identifier}:search:{today}"
    ai_chat_key = f"usage:{identifier}:ai_chat:{today}"
    export_key = f"usage:{identifier}:export:{today}"
    
    search_count = await redis.get(search_key) or 0
    ai_chat_count = await redis.get(ai_chat_key) or 0
    export_count = await redis.get(export_key) or 0
    
    # Get lifetime stats from PostgreSQL
    usage = await db.get(UserUsage, user.id)
    
    return {
        "tier": tier.value,
        "daily": {
            "searches": {"used": int(search_count), "limit": _get_limit(tier, "search")},
            "ai_chats": {"used": int(ai_chat_count), "limit": _get_limit(tier, "ai_chat")},
            "exports": {"used": int(export_count), "limit": _get_limit(tier, "export")},
        },
        "lifetime": {
            "total_searches": usage.total_searches if usage else 0,
            "total_ai_chats": usage.total_ai_chats if usage else 0,
            "total_exports": usage.total_exports if usage else 0,
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
        
        # If the DB date is old, counts are effectively 0 for today
        if usage.usage_reset_date != today:
            return 0
        
        # Get the count from DB
        if feature == "search":
            count = usage.daily_searches_count
        elif feature == "ai_chat":
            count = usage.daily_ai_chats_count
        elif feature == "export":
            count = usage.daily_exports_count
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
    
    today = date.today().isoformat()
    synced_count = 0

    async with AsyncSession(engine) as session:
        for user_id_str in user_ids:
            try:
                user_id = uuid.UUID(user_id_str)
                # Get the latest daily counts from Redis
                # Keys: usage:user:{id}:{feature}:{today}
                identifier = f"user:{user_id}"
                
                search_count = int(await redis.get(f"usage:{identifier}:search:{today}") or 0)
                ai_chat_count = int(await redis.get(f"usage:{identifier}:ai_chat:{today}") or 0)
                export_count = int(await redis.get(f"usage:{identifier}:export:{today}") or 0)

                # Get the DB record
                usage = await session.get(UserUsage, user_id)
                if not usage:
                    continue
                
                # Update DB to match Redis source-of-truth
                # We also update lifetime totals by the delta
                if usage.usage_reset_date == date.today():
                    # Same day: add the difference to total
                    usage.total_searches += (search_count - usage.daily_searches_count)
                    usage.total_ai_chats += (ai_chat_count - usage.daily_ai_chats_count)
                    usage.total_exports += (export_count - usage.daily_exports_count)
                else:
                    # New day in DB: the Redis count is the new daily, and we add it all to total
                    usage.total_searches += search_count
                    usage.total_ai_chats += ai_chat_count
                    usage.total_exports += export_count
                    usage.usage_reset_date = date.today()

                usage.daily_searches_count = search_count
                usage.daily_ai_chats_count = ai_chat_count
                usage.daily_exports_count = export_count
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
