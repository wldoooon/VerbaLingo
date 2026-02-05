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


async def get_or_create_oauth_user(
    db: AsyncSession,
    email: str,
    oauth_provider: str,
    oauth_id: str,
    avatar_url: str | None = None
) -> User:
    """
    Get existing user or create new one for OAuth login.
    
    Handles three cases:
    1. User exists with same OAuth provider → update last_login, return
    2. User exists with password (no OAuth) → link OAuth to existing account
    3. User doesn't exist → create new OAuth user
    
    Returns the user (existing or newly created).
    """
    # Try to find existing user by email
    statement = select(User).where(User.email == email)
    result = await db.exec(statement)
    user = result.first()
    
    if user:
        # Case 1 & 2: User exists
        if not user.oauth_provider:
            # Link OAuth to existing password account
            user.oauth_provider = oauth_provider
            user.oauth_id = oauth_id
            if avatar_url:
                user.oauth_avatar_url = avatar_url
        
        # Update last login
        user.last_login_at = datetime.now(timezone.utc)
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user
    
    # Case 3: Create new OAuth user
    new_user = User(
        email=email,
        hashed_password=None,  # OAuth users don't have passwords
        oauth_provider=oauth_provider,
        oauth_id=oauth_id,
        oauth_avatar_url=avatar_url,
        is_email_verified=True,  # OAuth emails are pre-verified
    )
    db.add(new_user)
    await db.flush()
    
    # Create UserUsage record
    user_usage = UserUsage(user_id=new_user.id)
    db.add(user_usage)
    
    await db.commit()
    await db.refresh(new_user)
    
    return new_user
