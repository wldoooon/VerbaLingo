from fastapi import Request, Depends
from app.services.search_service import SearchService
from elasticsearch import AsyncElasticsearch

def get_es_client(request: Request) -> AsyncElasticsearch:
    return request.app.state.es_client 

def get_search_service(client: AsyncElasticsearch = Depends(get_es_client)):
    return SearchService(client=client)