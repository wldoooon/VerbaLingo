import uuid
import uuid6
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship, Column
from sqlalchemy import DateTime

if TYPE_CHECKING:
    from .user import User


class Subscription(SQLModel, table=True):
    __tablename__ = "subscription"

    id: uuid.UUID = Field(
        default_factory=uuid6.uuid7,
        primary_key=True,
        index=True,
        nullable=False,
    )

    user_id: uuid.UUID = Field(
        foreign_key="user.id",
        nullable=False,
        index=True,
    )

    polar_subscription_id: str = Field(unique=True, index=True)
    polar_price_id: str = Field()
    polar_product_id: str = Field()

    status: str = Field(default="active", index=True)
    cancel_at_period_end: bool = Field(default=False)

    current_period_start: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True))
    )
    current_period_end: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True))
    )

    started_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True))
    )
    ended_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True))  # NULL while active
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), onupdate=lambda: datetime.now(timezone.utc))
    )

    user: Optional["User"] = Relationship(back_populates="subscriptions")


class SubscriptionRead(SQLModel):
    id: uuid.UUID
    polar_subscription_id: str
    polar_price_id: str
    status: str
    cancel_at_period_end: bool
    current_period_start: datetime | None
    current_period_end: datetime | None
    started_at: datetime | None
    ended_at: datetime | None
