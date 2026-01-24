from fastapi import Depends, HTTPException, status, Request
from jose import jwt, JWTError
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from ..core.config import get_settings
from ..db.session import get_session
from ..models.user import User

settings = get_settings()

async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_session)
) -> User:
    """
    The 'Guard' that protects our routes. 
    It reads the HTTPOnly cookie, validates the JWT, and returns the User.
    """
    # 1. Extraction
    token = request.cookies.get(settings.COOKIE_NAME)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or not logged in.",
        )
    
    try:
        # 2. Validation
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token invalid.",
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
        )
    
    # 3. Fulfillment
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists.",
        )
    
    return user
