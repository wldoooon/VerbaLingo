"""
Manticore Search async client configuration.

This module provides the async client setup for Manticore Search.
Uses the manticoresearch-async package for native asyncio support.
"""
import manticoresearch
from app.core.config import get_settings

settings = get_settings()


def get_manticore_configuration() -> manticoresearch.Configuration:
    """
    Creates and returns a Manticore Search configuration object.
    
    Returns:
        manticoresearch.Configuration: Configured for the Manticore server.
    """
    return manticoresearch.Configuration(
        host=settings.manticore_url
    )


async def get_manticore_api_client() -> manticoresearch.ApiClient:
    """
    Creates an async API client for Manticore Search.
    
    Note: This should be used with 'async with' context manager
    or manually closed when done.
    
    Returns:
        manticoresearch.ApiClient: The async API client.
    """
    config = get_manticore_configuration()
    return manticoresearch.ApiClient(config)
