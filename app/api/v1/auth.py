from fastapi import APIRouter, Depends, HTTPException, status, Response, Body
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from ...db.session import get_session
from ...models.user import UserCreate, UserRead, User
from ...services.auth_service import create_new_user, authenticate_user
from ...core.security import create_access_token, generate_otp, get_password_hash
from ...core.config import get_settings
from ..deps import get_current_user
from ...core.redis import get_redis
from ...services.email import email_service
from redis.asyncio import Redis

router = APIRouter(prefix="/auth", tags=["Authentication"])
settings = get_settings()

@router.post("/signup", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate, db: AsyncSession = Depends(get_session)):
    """The entry point for new users. Starts them at the 'FREE' tier."""
    return await create_new_user(db, user_data)

@router.post("/login")
async def login(
    response: Response,
    login_data: UserCreate, 
    db: AsyncSession = Depends(get_session)
):
    """Verifies credentials and issues a secure HTTPOnly Cookie."""
    user = await authenticate_user(db, login_data.email, login_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    
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

# --- PASSWORD RESET FLOW ---

@router.post("/forgot-password")
async def forgot_password(
    email: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_session),
    redis: Redis = Depends(get_redis)
):
    """
    1. Check if user exists.
    2. Generate OTP.
    3. Store in Redis (10m TTL).
    4. Send Email.
    """
    # 1. Check User
    statement = select(User).where(User.email == email)
    result = await db.exec(statement)
    user = result.first()
    
    if not user:
        # Security: Don't reveal if email exists. Fake success.
        return {"message": "If that email exists, we sent a code."}

    # 2. Generate OTP
    otp = generate_otp()
    
    # 3. Store in Redis
    # Key: "reset:alice@example.com" -> Value: "123456"
    await redis.set(f"reset:{email}", otp, ex=600)
    
    # 4. Send Email
    await email_service.send_otp([email], otp)
    
    return {"message": "If that email exists, we sent a code."}


@router.post("/verify-otp")
async def verify_otp(
    email: str = Body(...),
    otp: str = Body(...),
    redis: Redis = Depends(get_redis)
):
    """
    UI helper: Just validates the code is correct so frontend can show next step.
    Does NOT reset the password.
    """
    stored_otp = await redis.get(f"reset:{email}")
    
    if not stored_otp or stored_otp != otp:
        raise HTTPException(status_code=400, detail="Invalid or expired code")
        
    return {"message": "Code valid"}


@router.post("/reset-password")
async def reset_password(
    email: str = Body(...),
    otp: str = Body(...),
    new_password: str = Body(...),
    db: AsyncSession = Depends(get_session),
    redis: Redis = Depends(get_redis)
):
    """
    The final action. Verifies specific OTP again, then updates Postgres.
    """
    # 1. Verify OTP again (Critical)
    stored_otp = await redis.get(f"reset:{email}")
    if not stored_otp or stored_otp != otp:
        raise HTTPException(status_code=400, detail="Invalid or expired code")
    
    # 2. Get User
    statement = select(User).where(User.email == email)
    result = await db.exec(statement)
    user = result.first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # 3. Update Password
    user.hashed_password = get_password_hash(new_password)
    db.add(user)
    await db.commit()
    
    # 4. Burn the OTP (Prevent replay)
    await redis.delete(f"reset:{email}")
    
    return {"message": "Password updated successfully"}
