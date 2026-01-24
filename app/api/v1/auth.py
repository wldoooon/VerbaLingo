from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlmodel.ext.asyncio.session import AsyncSession
from ...db.session import get_session
from ...models.user import UserCreate, UserRead
from ...services.auth_service import create_new_user, authenticate_user
from ...core.security import create_access_token, create_refresh_token
from ...core.config import get_settings
from ..deps import get_current_user
from ...models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])
settings = get_settings()

@router.post("/signup", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate, db: AsyncSession = Depends(get_session)):
    """The entry point for new users. Starts them at the 'FREE' tier."""
    return await create_new_user(db, user_data)

@router.post("/login")
async def login(
    response: Response,
    login_data: UserCreate, # Using same structure as Create for simplicity
    db: AsyncSession = Depends(get_session)
):
    """Verifies credentials and issues a secure HTTPOnly Cookie."""
    user = await authenticate_user(db, login_data.email, login_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    # 1. Generate the Stateless Token
    # We use 'sub' (Subject) to store the User ID
    access_token = create_access_token(data={"sub": str(user.id)})
    
    # 2. Secure Cookie Implementation
    # This prevents JavaScript from ever seeing the token (Anti-XSS)
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite=settings.COOKIE_SAMESITE,
        secure=settings.COOKIE_SECURE,
    )
    
    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "email": user.email,
            "tier": user.tier
        }
    }


@router.get("/me", response_model=UserRead)
async def me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user (based on HTTPOnly cookie)."""
    return current_user


@router.post("/logout")
async def logout(response: Response):
    """Clear the auth cookie."""
    response.delete_cookie(
        key=settings.COOKIE_NAME,
        samesite=settings.COOKIE_SAMESITE,
        secure=settings.COOKIE_SECURE,
    )
    return {"message": "Logged out"}
