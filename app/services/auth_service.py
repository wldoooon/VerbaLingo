from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from ..models.user import User, UserCreate
from ..core.security import hash_password, verify_password
from fastapi import HTTPException, status

async def create_new_user(db: AsyncSession, user_data: UserCreate) -> User:
    """Register a new user in the database"""
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
    
    # 3. Save to database
    # Notice we don't pass the raw password here!
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_pwd
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

async def authenticate_user(db: AsyncSession, email: str, password: str) -> User | None:
    """Check credentials and return user if successful"""
    statement = select(User).where(User.email == email)
    result = await db.exec(statement)
    user = result.first()
    
    if not user:
        return None
    
    if not verify_password(password, user.hashed_password):
        return None
        
    return user
