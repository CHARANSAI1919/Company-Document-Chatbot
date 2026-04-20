import asyncio
from app.db.base import engine, Base
from app.models import Document, ChatHistory

async def init_db():
    async with engine.begin() as conn:
        # Create tables
        await conn.run_sync(Base.metadata.create_all)

if __name__ == "__main__":
    asyncio.run(init_db())
