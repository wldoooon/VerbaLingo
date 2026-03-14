"""
Database Initialization Script

Creates all tables defined in SQLModel meta-registry.
Used for initial setup or when adding new tables.

Usage:
    python -m app.db.init_db
"""
import asyncio
from sqlmodel import SQLModel
from .session import engine
from ..core.logging import logger
# Import all models so they are registered with SQLModel.metadata
from ..models import User, UserUsage, Subscription

async def init_database():
    """
    Creates all tables in the database based on SQLModel models.
    """
    logger.info("Initializing database...")
    async with engine.begin() as conn:
        # This will create tables if they do not exist
        await conn.run_sync(SQLModel.metadata.create_all)
    
    logger.success("Database initialization complete. Tables created.")

if __name__ == "__main__":
    asyncio.run(init_database())
