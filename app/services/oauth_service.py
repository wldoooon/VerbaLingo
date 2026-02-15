"""
Google OAuth Service

This module sets up the OAuth client using Authlib for Google authentication.
It handles the OAuth flow (redirect to Google, callback processing).
"""

from authlib.integrations.starlette_client import OAuth
from app.core.config import get_settings

settings = get_settings()


oauth = OAuth()


oauth.register(
    name='google',
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    
    client_kwargs={
        'scope': 'openid email profile',
        'prompt': 'consent',  # Force consent screen so user sees permissions
    }
)


def get_oauth() -> OAuth:
    """Dependency to get the OAuth client instance."""
    return oauth
