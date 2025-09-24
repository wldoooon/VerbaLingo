from meilisearch_python_sdk import AsyncClient
from typing import Optional
from app.core.config import get_settings

settings = get_settings()

class SearchService:
    def __init__(self, client: AsyncClient):
        self.client = client
        self.index = client.index(settings.INDEX_NAME)
    
    async def search(self, q: str, category: Optional[str] = None) -> dict:
        # MeiliSearch search parameters
        search_params = {
            "limit": 20,
            "offset": 0
        }
        
        # Add filter for category if provided
        if category:
            search_params["filter"] = f"category = '{category}'"
        
        # Perform search using MeiliSearch
        result = await self.index.search(q, **search_params)
        
        # Convert MeiliSearch result to format expected by routes
        return {
            "hits": {
                "hits": [
                    {"_source": hit} for hit in result.hits
                ],
                "total": {"value": result.estimated_total_hits}
            }
        }

    async def get_full_transcript(self, video_id: str) -> dict:
        # Search for all sentences with specific video_id, sorted by position
        result = await self.index.search(
            "",  # Empty query to get all documents
            filter=f"video_id = '{video_id}'",
            sort=["position:asc"],
            limit=10000
        )
        
        # Convert to expected format
        return {
            "hits": {
                "hits": [
                    {"_source": hit} for hit in result.hits
                ]
            }
        }
