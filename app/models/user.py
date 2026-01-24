import uuid
import uuid6 # type: ignore
from datetime import datetime
from enum import Enum
from sqlmodel import SQLModel, Field

class UserTier(str, Enum):
    FREE = "free"
    PRO = "pro"

class UserBase(SQLModel):
    email: str = Field(unique=True, index=True, nullable=False)
    is_active: bool = Field(default=True)
    tier: UserTier = Field(default=UserTier.FREE)

class User(UserBase, table=True):
    id: uuid.UUID = Field(
        default_factory=uuid6.uuid7, 
        primary_key=True,
        index=True,
        nullable=False
    )
    hashed_password: str = Field(nullable=False)
    created_at: datetime = Field(
        default_factory=datetime.utcnow
    )

# 4. API Schemas
class UserCreate(SQLModel):
    """What the user sends when registering"""
    email: str
    password: str

class UserRead(UserBase):
    """What the API returns to the frontend"""
    id: uuid.UUID
    created_at: datetime
