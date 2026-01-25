from redis import asyncio as aioredis
from app.core.config import get_settings

settings = get_settings()

class RedisClient:
    _instance = None
    
    def __init__(self):
        self.redis = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = RedisClient()
        return cls._instance

    async def connect(self):
        if not self.redis:
            self.redis = aioredis.from_url(
                settings.redis_url, 
                encoding="utf-8", 
                decode_responses=True
            )
            # Test connection
            await self.redis.ping()
            print("Message: Connected to Redis")

    async def close(self):
        if self.redis:
            await self.redis.close()
            
    async def get_client(self):
        if not self.redis:
            await self.connect()
        return self.redis

redis_client = RedisClient()

async def get_redis():
    """Dependency for injecting Redis into routes"""
    return await redis_client.get_client()
