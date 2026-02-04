from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Response, Body, Request
from fastapi.responses import HTMLResponse
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from redis.asyncio import Redis

from ...db.session import get_session
from ...models.user import UserCreate, UserRead, User
from ...models.user_usage import UserUsage
from ...services.auth_service import create_new_user, authenticate_user
from ...services.oauth_service import oauth
from ...services.email import email_service
from ...core.security import create_access_token, generate_otp, get_password_hash
from ...core.config import get_settings
from ...core.redis import get_redis
from ...core.limiter import security_rate_limit
from ...core.logging import logger
from ..deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])
settings = get_settings()


# =============================================================================
# SIGNUP + EMAIL VERIFICATION
# =============================================================================

@router.post("/signup", status_code=status.HTTP_201_CREATED)
@security_rate_limit()
async def signup(
    request: Request,
    user_data: UserCreate,
    db: AsyncSession = Depends(get_session),
    redis: Redis = Depends(get_redis)
):
    user = await create_new_user(db, user_data)
    
    # Generate verification OTP
    otp = generate_otp(settings.OTP_LENGTH)
    await redis.set(f"verify:{user.email}", otp, ex=settings.VERIFY_OTP_EXPIRE_SECONDS)
    await redis.set(f"verify_attempts:{user.email}", "0", ex=settings.VERIFY_OTP_EXPIRE_SECONDS)
    
    # Send verification email
    await email_service.send_verification_otp([user.email], otp)
    logger.info(f"New user signup: {user.email}")
    
    return {
        "message": "Account created. Please check your email for verification code.",
        "email": user.email
    }


@router.post("/verify-email")
@security_rate_limit()
async def verify_email(
    request: Request,
    email: str = Body(...),
    otp: str = Body(...),
    response: Response = None,
    db: AsyncSession = Depends(get_session),
    redis: Redis = Depends(get_redis)
):
    # Check attempt count
    attempts = await redis.get(f"verify_attempts:{email}")
    if attempts and int(attempts) >= settings.VERIFY_MAX_ATTEMPTS:
        await redis.delete(f"verify:{email}")
        await redis.delete(f"verify_attempts:{email}")
        raise HTTPException(status_code=429, detail="Too many attempts. Please request a new code.")
    
    # Validate OTP
    stored_otp = await redis.get(f"verify:{email}")
    if not stored_otp or stored_otp != otp:
        await redis.incr(f"verify_attempts:{email}")
        raise HTTPException(status_code=400, detail="Invalid or expired code")
    
    # Get user and mark as verified
    statement = select(User).where(User.email == email)
    result = await db.exec(statement)
    user = result.first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.is_email_verified:
        return {"message": "Email already verified"}
    
    user.is_email_verified = True
    db.add(user)
    await db.commit()
    
    # Cleanup Redis
    await redis.delete(f"verify:{email}")
    await redis.delete(f"verify_attempts:{email}")
    
    # Auto-login after verification
    access_token = create_access_token(data={"sub": str(user.id)})
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite=settings.COOKIE_SAMESITE,
        secure=settings.COOKIE_SECURE,
    )
    
    logger.info(f"Email verified: {email}")
    return {
        "message": "Email verified successfully",
        "user": {"id": str(user.id), "email": user.email, "tier": user.tier.value}
    }


@router.post("/resend-verification")
@security_rate_limit()
async def resend_verification(
    request: Request,
    email: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_session),
    redis: Redis = Depends(get_redis)
):
    # Check cooldown
    cooldown = await redis.get(f"verify_cooldown:{email}")
    if cooldown:
        raise HTTPException(status_code=429, detail="Please wait before requesting another code")
    
    # Check hourly rate limit
    resend_count = await redis.get(f"verify_resends:{email}")
    if resend_count and int(resend_count) >= settings.VERIFY_MAX_RESENDS_PER_HOUR:
        raise HTTPException(status_code=429, detail="Too many resend requests. Try again later.")
    
    # Verify user exists and is not verified
    statement = select(User).where(User.email == email)
    result = await db.exec(statement)
    user = result.first()
    
    if not user:
        return {"message": "If that email exists, we sent a code."}
    
    if user.is_email_verified:
        return {"message": "Email already verified"}
    
    # Generate new OTP
    otp = generate_otp(settings.OTP_LENGTH)
    await redis.set(f"verify:{email}", otp, ex=settings.VERIFY_OTP_EXPIRE_SECONDS)
    await redis.set(f"verify_attempts:{email}", "0", ex=settings.VERIFY_OTP_EXPIRE_SECONDS)
    
    # Set cooldown
    await redis.set(f"verify_cooldown:{email}", "1", ex=settings.VERIFY_RESEND_COOLDOWN)
    
    # Increment hourly resend counter
    await redis.incr(f"verify_resends:{email}")
    await redis.expire(f"verify_resends:{email}", 3600)
    
    # Send email
    await email_service.send_verification_otp([email], otp)
    
    return {"message": "Verification code sent"}


# =============================================================================
# LOGIN / LOGOUT / ME
# =============================================================================

@router.post("/login")
@security_rate_limit()
async def login(
    request: Request,
    response: Response,
    login_data: UserCreate, 
    db: AsyncSession = Depends(get_session)
):
    user = await authenticate_user(db, login_data.email, login_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    # Block unverified users
    if not user.is_email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in."
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
    return current_user


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(
        key=settings.COOKIE_NAME,
        samesite=settings.COOKIE_SAMESITE,
        secure=settings.COOKIE_SECURE,
    )
    return {"message": "Logged out"}


# =============================================================================
# PASSWORD RESET
# =============================================================================

@router.post("/forgot-password")
@security_rate_limit()
async def forgot_password(
    request: Request,
    email: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_session),
    redis: Redis = Depends(get_redis)
):
    statement = select(User).where(User.email == email)
    result = await db.exec(statement)
    user = result.first()
    
    if not user:
        return {"message": "If that email exists, we sent a code."}

    otp = generate_otp(settings.OTP_LENGTH)
    await redis.set(f"reset:{email}", otp, ex=settings.OTP_EXPIRE_SECONDS)
    await email_service.send_otp([email], otp)
    
    return {"message": "If that email exists, we sent a code."}


@router.post("/verify-reset-otp")
@security_rate_limit()
async def verify_reset_otp(
    request: Request,
    email: str = Body(...),
    otp: str = Body(...),
    redis: Redis = Depends(get_redis)
):
    stored_otp = await redis.get(f"reset:{email}")
    
    if not stored_otp or stored_otp != otp:
        raise HTTPException(status_code=400, detail="Invalid or expired code")
        
    return {"message": "Code valid"}


@router.post("/reset-password")
@security_rate_limit()
async def reset_password(
    request: Request,
    email: str = Body(...),
    otp: str = Body(...),
    new_password: str = Body(...),
    db: AsyncSession = Depends(get_session),
    redis: Redis = Depends(get_redis)
):
    stored_otp = await redis.get(f"reset:{email}")
    if not stored_otp or stored_otp != otp:
        raise HTTPException(status_code=400, detail="Invalid or expired code")
    
    statement = select(User).where(User.email == email)
    result = await db.exec(statement)
    user = result.first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.hashed_password = get_password_hash(new_password)
    db.add(user)
    await db.commit()
    await redis.delete(f"reset:{email}")
    
    return {"message": "Password updated successfully"}


# =============================================================================
# GOOGLE OAUTH
# =============================================================================

@router.get("/google/login")
async def google_login(request: Request):
    redirect_uri = request.url_for('google_callback')
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback", response_class=HTMLResponse)
async def google_callback(
    request: Request,
    db: AsyncSession = Depends(get_session)
):
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')
        
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to get user info from Google")
        
        email = user_info.get('email')
        google_id = user_info.get('sub')
        
        if not email:
            raise HTTPException(status_code=400, detail="Email not provided by Google")
        
        statement = select(User).where(User.email == email)
        result = await db.exec(statement)
        user = result.first()
        
        if user:
            if not user.oauth_provider:
                user.oauth_provider = "google"
                user.oauth_id = google_id
            user.last_login_at = datetime.now(timezone.utc)
            db.add(user)
            await db.commit()
            await db.refresh(user)
        else:
            user = User(
                email=email,
                hashed_password=None,
                oauth_provider="google",
                oauth_id=google_id,
                is_email_verified=True,
            )
            db.add(user)
            await db.flush()
            
            user_usage = UserUsage(user_id=user.id)
            db.add(user_usage)
            
            await db.commit()
            await db.refresh(user)
        
        access_token = create_access_token(data={"sub": str(user.id)})
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head><title>Authentication Successful</title></head>
        <body>
            <p>Authentication successful! This window will close automatically.</p>
            <script>
                if (window.opener) {{
                    window.opener.postMessage({{
                        type: 'oauth-success',
                        user: {{
                            id: '{user.id}',
                            email: '{user.email}',
                            tier: '{user.tier.value}'
                        }}
                    }}, '{settings.FRONTEND_URL}');
                }}
                window.close();
            </script>
        </body>
        </html>
        """
        
        response = HTMLResponse(content=html_content)
        response.set_cookie(
            key=settings.COOKIE_NAME,
            value=access_token,
            httponly=True,
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            samesite=settings.COOKIE_SAMESITE,
            secure=settings.COOKIE_SECURE,
        )
        
        return response
        
    except Exception as e:
        error_html = f"""
        <!DOCTYPE html>
        <html>
        <head><title>Authentication Failed</title></head>
        <body>
            <p>Authentication failed: {str(e)}</p>
            <script>
                if (window.opener) {{
                    window.opener.postMessage({{
                        type: 'oauth-error',
                        error: '{str(e)}'
                    }}, '{settings.FRONTEND_URL}');
                }}
                setTimeout(() => window.close(), 3000);
            </script>
        </body>
        </html>
        """
        return HTMLResponse(content=error_html, status_code=400)
