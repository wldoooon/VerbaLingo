from meilisearch_python_sdk import AsyncClient
from typing import Optional
from app.core.config import get_settings

settings = get_settings()

class SearchService:
    def __init__(self, client: AsyncClient):
        self.client = client
        self.index = client.index(settings.INDEX_NAME)
    
    async def search(self, q: str, category: Optional[str] = None) -> dict:
        # Search parameters
        search_params = {
            "limit": 20,
            "offset": 0
        }
        
        # Add filter for category if provided (using category.title since category is now an object)
        if category:
            search_params["filter"] = f"category.title = '{category}'"
        
        # Specify which attributes to retrieve to ensure we get all needed fields
        search_params["attributes_to_retrieve"] = [
            "video_id",
            "sentence_text",
            "start",
            "end",
            "position",
            "title",
            "channel",
            "category",
            "language",
            "words",
            "sentences"  # Include sentences array in case structure is nested
        ]
        
        # Enable highlighting to identify which sentence matched
        search_params["attributes_to_highlight"] = ["sentence_text", "sentences.sentence_text"]
        search_params["highlight_pre_tag"] = "<em>"
        search_params["highlight_post_tag"] = "</em>"
        search_params["show_matches_position"] = True
        
        # Perform search using MeiliSearch
        result = await self.index.search(q, **search_params)
        
        # Get hits from result
        hits = result.hits
        
        # Convert MeiliSearch result to format expected by routes
        # Meilisearch returns hits as dictionaries with _formatted field when highlighting is enabled
        formatted_hits = []
        for hit in hits:
            # Meilisearch hits are typically dictionaries
            hit_dict = hit if isinstance(hit, dict) else dict(hit)
            # Extract _formatted if it exists (Meilisearch adds this when highlighting is enabled)
            formatted_data = hit_dict.get("_formatted") if isinstance(hit_dict, dict) else None
            # Create a copy without _formatted for _source
            source_dict = {k: v for k, v in hit_dict.items() if k != "_formatted"} if isinstance(hit_dict, dict) else hit_dict
            formatted_hits.append({
                "_source": source_dict,  # Original document without _formatted
                "_formatted": formatted_data  # Highlighted version
            })
        
        return {
            "hits": {
                "hits": formatted_hits,
                "total": {"value": result.estimated_total_hits}
            }
        }

    async def get_full_transcript(self, video_id: str) -> dict:
        # Search for all sentences with specific video_id, sorted by position
        result = await self.index.search(
            "",  # Empty query to get all documents
            filter=f"video_id = '{video_id}'",
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
