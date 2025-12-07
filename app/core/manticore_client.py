import manticoresearch
from app.core.config import get_settings

settings = get_settings()


def get_manticore_configuration() -> manticoresearch.Configuration:
    return manticoresearch.Configuration(
        host=settings.manticore_url
    )


async def get_manticore_api_client() -> manticoresearch.ApiClient:
    config = get_manticore_configuration()
    return manticoresearch.ApiClient(config)
