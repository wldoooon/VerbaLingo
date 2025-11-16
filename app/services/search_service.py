from meilisearch_python_sdk import AsyncClient
from typing import Optional
import random
from app.core.config import get_settings

settings = get_settings()

class SearchService:
    def __init__(self, client: AsyncClient):
        self.client = client
        self.index = client.index(settings.INDEX_NAME)
    
    async def search(self, q: str, category: Optional[str] = None, randomize: bool = True) -> dict:
        if randomize:
            # First, get total count to calculate random offset
            count_result = await self.index.search(
                q, 
                filter=f"category.title = '{category}'" if category else None,
                limit=0  # Just get count
            )
            total_hits = count_result.estimated_total_hits
            
            if total_hits > 20:
                # Use random offset for variety
                max_offset = min(total_hits - 20, 1000)  # Limit offset to avoid deep pagination issues
                random_offset = random.randint(0, max_offset)
            else:
                random_offset = 0
            
            # MeiliSearch search parameters with random offset
            search_params = {
                "limit": 100,  # Get more results for better randomization
                "offset": random_offset
            }
        else:
            # Regular search without randomization
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
        
        # Randomize results if requested
        hits = result.hits
        if randomize and hits:
            random.shuffle(hits)
            # Take only the first 20 after shuffling
            hits = hits[:20]
        
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
