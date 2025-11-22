import typesense
from app.core.config import get_settings

settings = get_settings()

def get_typesense_client() -> typesense.Client:
    return typesense.Client({
        'nodes': [{
            'host': settings.TYPESENSE_HOST,
            'port': settings.TYPESENSE_PORT,
            'protocol': settings.TYPESENSE_PROTOCOL
        }],
        'api_key': settings.TYPESENSE_API_KEY,
        'connection_timeout_seconds': 2
    })
