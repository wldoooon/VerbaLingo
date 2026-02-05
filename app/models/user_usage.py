import uuid
from datetime import datetime, date, timezone
from sqlmodel import SQLModel, Field, Relationship, Column
from sqlalchemy import DateTime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .user import User


class UserUsage(SQLModel, table=True):
    """
    Stores usage counters for each user.
    
    Design:
    - One-to-One relationship with User
    - Daily counters reset at midnight UTC
    - Total counters are cumulative (for analytics)
    """
    __tablename__ = "user_usage"
    
    user_id: uuid.UUID = Field(
        foreign_key="user.id",
        primary_key=True,
        nullable=False,
        index=True
    )
    
    # Daily Counters (reset daily)
    daily_searches_count: int = Field(default=0)
    daily_ai_chats_count: int = Field(default=0)
    daily_exports_count: int = Field(default=0)
    usage_reset_date: date | None = Field(default=None)
    
    # Lifetime Counters (never reset, for analytics)
    total_searches: int = Field(default=0)
    total_ai_chats: int = Field(default=0)
    total_exports: int = Field(default=0)
    
    # Timestamps (with timezone support)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), onupdate=lambda: datetime.now(timezone.utc))
    )
    
    # Relationship back to User
    user: "User" = Relationship(back_populates="usage")


# API Schemas
class UserUsageRead(SQLModel):
    daily_searches_count: int = 0
    daily_ai_chats_count: int = 0
    daily_exports_count: int = 0
    total_searches: int = 0
    total_ai_chats: int = 0
