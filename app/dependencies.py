from fastapi import Request, Depends
import manticoresearch
from app.services.search_service import SearchService


def get_search_api(request: Request) -> manticoresearch.SearchApi:
    if not hasattr(request.app.state, "search_api"):
        raise RuntimeError("SearchApi not initialized. Check app lifespan.")
    return request.app.state.search_api


def get_search_service(
    search_api: manticoresearch.SearchApi = Depends(get_search_api)
) -> SearchService:
    return SearchService(search_api=search_api)
