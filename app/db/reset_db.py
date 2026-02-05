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


async def reset_database():
    """
    Drops the public schema (and all tables within it),
    then recreates an empty public schema.
    """
    async with engine.begin() as conn:
        # DROP CASCADE removes all tables, views, functions, types, etc.
        await conn.execute(text("DROP SCHEMA public CASCADE"))
        await conn.execute(text("CREATE SCHEMA public"))
        # Restore default grants for the public schema
        await conn.execute(text("GRANT ALL ON SCHEMA public TO public"))
    
    logger.success("Database reset complete. All tables dropped.")


if __name__ == "__main__":
    # Confirmation prompt to prevent accidents
    confirm = input("⚠️  This will DELETE ALL DATA. Type 'yes' to confirm: ")
    if confirm.lower() == "yes":
        asyncio.run(reset_database())
    else:
        logger.info("Database reset aborted by user.")

