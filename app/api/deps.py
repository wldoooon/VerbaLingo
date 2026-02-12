from typing import TYPE_CHECKING, Optional
from fastapi import Depends, HTTPException, status, Request
from jose import jwt, JWTError
from sqlmodel.ext.asyncio.session import AsyncSession
from ..core.config import get_settings
from ..db.session import get_session
from ..models.user import User
from ..core.logging import logger

if TYPE_CHECKING:
    import manticoresearch
    from ..services.search_service import SearchService

settings = get_settings()


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_session)
) -> User:
    """
    The 'Guard' that protects our routes. 
    It reads the HTTPOnly cookie, validates the JWT, and returns the User.
    
    IMPORTANT: Also sets user on request.state for rate limiting!
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
    import time
    db_start = time.time()
    logger.info(f"DEBUG: get_current_user - fetching user {user_id}")
    try:
        user = await db.get(User, user_id)
        logger.info(f"DEBUG: get_current_user - DB fetch took {time.time() - db_start:.4f}s")
    except Exception as e:
        logger.error(f"DEBUG: get_current_user - DB fetch failed: {e}")
        raise
    
    if not user:
        logger.warning(f"DEBUG: get_current_user - user {user_id} not found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists.",
        )
    
    # 4. Set on request.state for rate limiter access
    # This allows feature/security rate limiters to identify the user
    request.state.user = user
    
    return user


async def get_current_user_optional(
    request: Request,
    db: AsyncSession = Depends(get_session)
) -> Optional[User]:
    """
    Like get_current_user, but returns None instead of raising.
    
    Use this for endpoints that work for both anonymous and authenticated users,
    but want different rate limits based on auth status.
    
    Usage:
        @router.get("/search")
        @feature_rate_limit("search")
        async def search(
            request: Request,
            current_user: Optional[User] = Depends(get_current_user_optional)
        ):
            # Rate limiter will use user_id if authenticated, IP if not
            ...
    """
    token = request.cookies.get(settings.COOKIE_NAME)
    if not token:
        return None
    
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        user_id = payload.get("sub")
        if user_id is None:
            return None
    except JWTError:
        return None
    
    user = await db.get(User, user_id)
    if user:
        # Set on request.state for rate limiter
        request.state.user = user
    
    return user


# =============================================================================
# SEARCH DEPENDENCIES
# =============================================================================

def get_search_api(request: Request) -> "manticoresearch.SearchApi":
    if not hasattr(request.app.state, "search_api"):
        raise RuntimeError("SearchApi not initialized. Check app lifespan.")
    return request.app.state.search_api


def get_search_service(
    search_api = Depends(get_search_api)
) -> "SearchService":
    from ..services.search_service import SearchService
    return SearchService(search_api=search_api)
