import os
import json
import redis.asyncio as redis
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

class CacheService:
    def __init__(self):
        self.redis_client = redis.from_url(REDIS_URL, decode_responses=True)

    async def get_cached_response(self, query: str) -> dict | None:
        """
        Check if we have a cached response for the exact user query.
        """
        cached = await self.redis_client.get(f"query:{query.lower().strip()}")
        if cached:
            return json.loads(cached)
        return None

    async def set_cached_response(self, query: str, response_data: dict, ttl_seconds: int = 3600):
        """
        Cache a response for a specific query for an hour by default.
        """
        await self.redis_client.set(
            f"query:{query.lower().strip()}",
            json.dumps(response_data),
            ex=ttl_seconds
        )

# Global singleton
cache_service = CacheService()
