"""
Database Reset Script

Drops ALL tables in the public schema and recreates an empty schema.
Use this for development when you need a clean slate.

Usage:
    python -m app.db.reset_db

WARNING: This is DESTRUCTIVE. All data will be lost.
"""
import asyncio
from sqlalchemy import text
from .session import engine
from ..core.logging import logger
from .init_db import init_database


async def reset_database():
    """
    Drops the public schema (and all tables within it),
    then recreates an empty public schema and recreates all tables.
    """
    async with engine.begin() as conn:
        logger.warning("Dropping all existing data...")
        # DROP CASCADE removes all tables, views, functions, types, etc.
        await conn.execute(text("DROP SCHEMA public CASCADE"))
        await conn.execute(text("CREATE SCHEMA public"))
        # Restore default grants for the public schema
        await conn.execute(text("GRANT ALL ON SCHEMA public TO public"))
    
    logger.success("Database schema wiped clean.")
    
    # Recreate the tables immediately
    await init_database()


if __name__ == "__main__":
    # Confirmation prompt to prevent accidents
    print("\n⚠️  WARNING: This will DELETE ALL DATA and RECREATE tables.")
    confirm = input("Type 'yes' to proceed: ")
    if confirm.lower() == "yes":
        asyncio.run(reset_database())
    else:
        logger.info("Database reset aborted by user.")

