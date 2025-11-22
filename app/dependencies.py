from fastapi import Request, Depends
from app.services.search_service import SearchService
from app.core.typesense_client import get_typesense_client
import typesense

def get_typesense_client_from_app(request: Request) -> typesense.Client:
    if not hasattr(request.app.state, "typesense_client") or request.app.state.typesense_client is None:
        return get_typesense_client()
    return request.app.state.typesense_client

def get_search_service(
    client: typesense.Client = Depends(get_typesense_client_from_app)
) -> SearchService:
    return SearchService(client=client)
