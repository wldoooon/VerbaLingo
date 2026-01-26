from fastapi import APIRouter, Depends, HTTPException, status, Response, Body
from fastapi.responses import HTMLResponse
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from starlette.requests import Request
from redis.asyncio import Redis

from ...db.session import get_session
from ...models.user import UserCreate, UserRead, User
from ...services.auth_service import create_new_user, authenticate_user
from ...services.oauth_service import oauth
from ...services.email import email_service
from ...core.security import create_access_token, generate_otp, get_password_hash
from ...core.config import get_settings
from ...core.redis import get_redis
from ..deps import get_current_user

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


# --- GOOGLE OAUTH FLOW ---
# 
# These routes handle the "popup" OAuth flow:
# 1. User clicks "Continue with Google" → Opens popup to /google/login
# 2. User authenticates with Google in popup
# 3. Google redirects popup to /google/callback
# 4. Callback sets auth cookie, returns HTML that closes popup
# 5. Parent window detects success, refreshes auth state


@router.get("/google/login")
async def google_login(request: Request):
    """
    Step 1: Initiate Google OAuth flow.
    
    This endpoint redirects the user to Google's consent screen.
    After approval, Google redirects back to /google/callback.
    
    Authlib automatically:
    - Generates a secure 'state' parameter (CSRF protection)
    - Stores state in session for validation in callback
    - Builds the correct authorization URL
    """
    # Build the callback URL dynamically
    redirect_uri = request.url_for('google_callback')
    
    # Redirect to Google's OAuth consent page
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback", response_class=HTMLResponse)
async def google_callback(
    request: Request,
    db: AsyncSession = Depends(get_session)
):
    """
    Step 2: Handle Google's OAuth callback.
    
    This is where Google sends the user AFTER they click "Allow".
    The URL contains an authorization code that we exchange for tokens.
    
    Authlib automatically:
    - Validates the 'state' parameter (CSRF check)
    - Exchanges the code for access/ID tokens
    - Verifies the ID token signature using Google's public keys
    - Extracts user info from the verified token
    
    We then:
    1. Find or create the user in our database
    2. Generate our own JWT
    3. Set the auth cookie
    4. Return HTML that closes the popup and notifies the parent window
    """
    try:
        # Exchange authorization code for tokens
        # This is the secure server-to-server exchange
        token = await oauth.google.authorize_access_token(request)
        
        # Extract user info from the verified ID token
        # 'userinfo' contains claims like email, name, picture, sub (Google's user ID)
        user_info = token.get('userinfo')
        
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to get user info from Google")
        
        email = user_info.get('email')
        google_id = user_info.get('sub')  # Google's unique ID for this user
        # name = user_info.get('name', '')  # Available if you want to store it
        
        if not email:
            raise HTTPException(status_code=400, detail="Email not provided by Google")
        
        # Check if user already exists (by email)
        statement = select(User).where(User.email == email)
        result = await db.exec(statement)
        user = result.first()
        
        if user:
            # Existing user - update OAuth info if needed
            if not user.oauth_provider:
                # User registered with email/password, linking Google account
                user.oauth_provider = "google"
                user.oauth_id = google_id
                db.add(user)
                await db.commit()
        else:
            # New user - create account (no password needed for OAuth)
            user = User(
                email=email,
                hashed_password=None,  # OAuth users don't have passwords
                oauth_provider="google",
                oauth_id=google_id,
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        
        # Generate our own JWT for the user
        access_token = create_access_token(data={"sub": str(user.id)})
        
        # Build the success response HTML
        # This HTML runs in the popup and:
        # 1. Sends a message to the parent window with user info
        # 2. Closes itself
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Authentication Successful</title>
        </head>
        <body>
            <p>Authentication successful! This window will close automatically.</p>
            <script>
                // Send success message to parent window (your React app)
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
                // Close this popup
                window.close();
            </script>
        </body>
        </html>
        """
        
        # Create response with the HTML
        response = HTMLResponse(content=html_content)
        
        # Set the auth cookie (this is the key part!)
        # The cookie will be sent with subsequent requests to authenticate
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
        # On error, show error message and close popup
        error_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Authentication Failed</title>
        </head>
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

