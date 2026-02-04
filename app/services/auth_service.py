"""
Auth Service

Handles user registration and authentication logic.
Creates both User and UserUsage records atomically.
"""
from datetime import datetime, timezone
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from fastapi import HTTPException, status

from ..models.user import User, UserCreate
from ..models.user_usage import UserUsage
from ..core.security import hash_password, verify_password


async def create_new_user(db: AsyncSession, user_data: UserCreate) -> User:
    """
    Register a new user in the database.
    
    Creates both User and UserUsage in a single transaction.
    If either fails, both are rolled back (atomic).
    """
    # 1. Check for duplicates
    statement = select(User).where(User.email == user_data.email)
    result = await db.exec(statement)
    if result.first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )
    
    # 2. Secure the password
    hashed_pwd = hash_password(user_data.password)
    
    # 3. Create User
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_pwd,
        full_name=user_data.full_name
    )
    db.add(new_user)
    await db.flush()  # Get user.id without committing
    
    # 4. Create UserUsage (linked to new user)
    user_usage = UserUsage(user_id=new_user.id)
    db.add(user_usage)
    
    # 5. Commit BOTH in one transaction
    await db.commit()
    await db.refresh(new_user)
    return new_user


async def authenticate_user(db: AsyncSession, email: str, password: str) -> User | None:
    """
    Check credentials and return user if successful.
    Updates last_login_at timestamp on success.
    """
    statement = select(User).where(User.email == email)
    result = await db.exec(statement)
    user = result.first()
    
    if not user:
        return None
    
    # Check if user has a password (OAuth users don't)
    if not user.hashed_password:
        return None
    
    if not verify_password(password, user.hashed_password):
        return None
    
    # Update last login timestamp
    user.last_login_at = datetime.now(timezone.utc)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return user
