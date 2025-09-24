from fastapi import Request, Depends
from app.services.search_service import SearchService
from meilisearch_python_sdk import AsyncClient

def get_meili_client(request: Request) -> AsyncClient:
    return request.app.state.meili_client

def get_search_service(client: AsyncClient = Depends(get_meili_client)) -> SearchService:
    return SearchService(client=client)
