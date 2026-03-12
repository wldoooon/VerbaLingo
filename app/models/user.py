import uuid
import uuid6 
from datetime import datetime, timezone
from enum import Enum
from typing import Optional, TYPE_CHECKING, Dict, Any
from sqlmodel import SQLModel, Field, Relationship, Column
from sqlalchemy import DateTime, String

if TYPE_CHECKING:
    from .user_usage import UserUsage
    from .subscription import Subscription


class UserTier(str, Enum):
    FREE = "free"
    BASIC = "basic"
    PRO = "pro"
    PREMIUM = "premium"
    MAX = "max"


class UserBase(SQLModel):
    email: str = Field(unique=True, index=True, nullable=False)
    full_name: str | None = Field(default=None, max_length=255)
    is_active: bool = Field(default=True)
    tier: UserTier = Field(
        default=UserTier.FREE,
        sa_column=Column(String, nullable=False, server_default="free")
    )

class User(UserBase, table=True):
    id: uuid.UUID = Field(
        default_factory=uuid6.uuid7, 
        primary_key=True,
        index=True,
        nullable=False
    )
    hashed_password: str | None = Field(default=None)

    # OAuth fields
    oauth_provider: str | None = Field(default=None, index=True)
    oauth_id: str | None = Field(default=None, index=True)
    oauth_avatar_url: str | None = Field(default=None)

    # Email verification
    is_email_verified: bool = Field(default=False)

    # Login tracking & security
    last_login_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True))
    )
    failed_login_attempts: int = Field(default=0)
    locked_until: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True))
    )
    password_changed_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True))
    )

    # Tier management
    tier_updated_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True))
    )
    tier_expires_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True))
    )

    # Polar billing — customer identity only (permanent, survives cancellation/resubscription)
    polar_customer_id: str | None = Field(default=None, index=True, unique=True)

    # Timestamps (with timezone support)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    updated_at: datetime | None = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), onupdate=lambda: datetime.now(timezone.utc))
    )

    usage: Optional["UserUsage"] = Relationship(back_populates="user")

    subscriptions: list["Subscription"] = Relationship(back_populates="user")


# API Schemas
class UserCreate(SQLModel):
    """What the user sends when registering"""
    email: str
    password: Optional[str] | None = None
    full_name: Optional[str] | None = None


class UserRead(UserBase):
    """What the API returns to the frontend"""
    id: uuid.UUID
    is_email_verified: bool
    oauth_provider: str | None = None
    oauth_avatar_url: str | None = None
    last_login_at: datetime | None = None
    tier_expires_at: datetime | None = None
    created_at: datetime
    # Real-time usage data (not persisted in User table)
    usage: Optional[Dict[str, Any]] = None