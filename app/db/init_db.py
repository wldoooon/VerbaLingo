"""
Database Initialization Module

This module handles the creation of database tables on application startup.
SQLModel's `metadata.create_all()` is idempotent for TABLES - it only creates
tables that don't already exist.

HOWEVER: PostgreSQL native ENUM types (created from Python Enum fields) are NOT
checked by create_all - it tries to CREATE TYPE every time, which fails on restart.
The fix: catch the duplicate type error and retry with checkfirst=True.
"""
from sqlmodel import SQLModel
from sqlalchemy.exc import IntegrityError, ProgrammingError
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

    Why the try/except?
    On first boot → creates tables AND PostgreSQL ENUM types (e.g. usertier).
    On restart    → tables already exist (skipped), but SQLAlchemy tries to
                    CREATE TYPE usertier again → PostgreSQL raises UniqueViolation
                    on pg_type_typname_nsp_index.
    The fix: catch that specific error and run again with checkfirst=True,
    which tells SQLAlchemy to verify each object before creating it.
    """
    async with engine.begin() as conn:
        try:
            await conn.run_sync(SQLModel.metadata.create_all)
        except (IntegrityError, ProgrammingError) as e:
            if "pg_type_typname_nsp_index" in str(e) or "already exists" in str(e):
                logger.warning(
                    "ENUM types already exist (normal on restart). "
                    "Re-running create_all with checkfirst=True..."
                )
                # checkfirst=True makes SQLAlchemy check before creating each object
                await conn.run_sync(
                    lambda sync_conn: SQLModel.metadata.create_all(sync_conn, checkfirst=True)
                )
            else:
                raise  # Re-raise unexpected errors
    logger.success("Database tables verified/created")
