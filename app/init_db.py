import asyncio
from sqlmodel import SQLModel
from app.db.session import engine

async def init_db():
    async with engine.begin() as conn:
        print(" Building tables in the official development database...")
        await conn.run_sync(SQLModel.metadata.create_all)
        print(" Success! Your tables exist. Refresh DBeaver and check!")

if __name__ == "__main__":
    asyncio.run(init_db())
