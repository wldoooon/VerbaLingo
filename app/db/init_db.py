"""
Database Initialization Module

This module handles the creation of database tables on application startup.
SQLModel's `metadata.create_all()` is idempotent - it only creates tables
that don't already exist, so it's safe to run on every startup.
"""
from sqlmodel import SQLModel
from ..core.logging import logger

# CRITICAL: Import all models here so SQLModel registers them in its metadata
# If you add new models (e.g., Transcript, Subscription), import them here
from ..models.user import User  # noqa: F401
from ..models.user_usage import UserUsage  # noqa: F401

from .session import engine


async def init_db():
    """
    Create all database tables that don't exist yet.
    
    Uses SQLAlchemy's run_sync to execute the synchronous create_all
    method within the async engine context.
    """
    async with engine.begin() as conn:
        # run_sync allows us to run synchronous SQLAlchemy methods
        # inside an async transaction
        await conn.run_sync(SQLModel.metadata.create_all)
    logger.success("Database tables verified/created")
