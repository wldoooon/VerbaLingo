"""
Search service using Manticore Search async client.

This service handles all search operations against the Manticore Search engine.
Response format is normalized to maintain compatibility with existing API routes.
"""
import manticoresearch
from typing import Optional
from app.core.config import get_settings
import json

settings = get_settings()


class SearchService:
    """
    Async search service for Manticore Search.
    
    Provides full-text search and transcript retrieval functionality.
    Uses native async methods for optimal performance with FastAPI.
    """
    
    def __init__(self, search_api: manticoresearch.SearchApi):
        """
        Initialize the search service.
        
        Args:
            search_api: Manticore SearchApi instance for executing searches.
        """
        self.search_api = search_api
        self.table_name = settings.TABLE_NAME
    
    async def search(self, q: str, category: Optional[str] = None) -> dict:
        """
        Perform a full-text search on sentence transcripts.
        
        Args:
            q: Search query string.
            category: Optional category filter (e.g., "SpongeBob").
            
        Returns:
            Normalized response dict with hits and total count.
        """
        # Build the search query
        # Using query_string with infix matching (table has min_infix_len='2')
        query_string = f"@sentence_text *{q}*"
        
        # Build the search request
        search_request = {
            "table": self.table_name,
            "query": {"query_string": query_string},
            "limit": 50
        }
        
        # Add category filter if provided
        if category:
            search_request["query"] = {
                "bool": {
                    "must": [
                        {"query_string": query_string},
                        {"equals": {"category_title": category}}
                    ]
                }
            }
        
        try:
            result = await self.search_api.search(search_request)
        except Exception as e:
            print(f"Search error: {e}")
            return {"hits": {"hits": [], "total": {"value": 0}}}
        
        # Format response to match expected structure
        formatted_hits = []
        
        if result.hits and result.hits.hits:
            # Track seen video_ids for grouping (1 result per video)
            seen_videos = set()
            
            for hit in result.hits.hits:
                source = hit.source if hasattr(hit, 'source') else {}
                
                # Skip if we've already seen this video (group by video_id)
                video_id = source.get('video_id')
                if video_id in seen_videos:
                    continue
                seen_videos.add(video_id)
                
                # Parse words JSON if it's a string
                if 'words' in source and isinstance(source['words'], str):
                    try:
                        source['words'] = json.loads(source['words'])
                    except:
                        source['words'] = []
                
                # Build formatted document with highlights
                formatted_doc = source.copy()
                if hasattr(hit, 'highlight') and hit.highlight:
                    highlight_data = hit.highlight
                    if 'sentence_text' in highlight_data:
                        # Manticore returns highlights as a list
                        highlights = highlight_data['sentence_text']
                        if highlights and len(highlights) > 0:
                            formatted_doc['sentence_text'] = highlights[0]
                
                formatted_hits.append({
                    "_source": source,
                    "_formatted": formatted_doc
                })
        
        total = result.hits.total if result.hits else 0
        
        return {
            "hits": {
                "hits": formatted_hits,
                "total": {"value": total}
            }
        }

    async def get_transcript(self, video_id: str, center_position: Optional[int] = None) -> dict:
        """
        Retrieve transcript sentences for a specific video.
        
        Args:
            video_id: The YouTube video ID.
            center_position: Optional center position for windowed retrieval.
            
        Returns:
            Normalized response dict with transcript sentences.
        """
        WINDOW_SIZE = 50
        per_page = 250
        
        # Build filter conditions
        filter_conditions = [{"equals": {"video_id": video_id}}]
        
        # Add position window filter if center_position provided
        if center_position is not None:
            start_pos = max(0, int(center_position) - WINDOW_SIZE)
            end_pos = int(center_position) + WINDOW_SIZE
            filter_conditions.append({
                "range": {
                    "position": {
                        "gte": start_pos,
                        "lte": end_pos
                    }
                }
            })
        
        search_request = {
            "table": self.table_name,
            "query": {
                "bool": {
                    "must": filter_conditions
                }
            },
            "limit": per_page,
            "sort": [{"position": "asc"}]
        }
        
        try:
            result = await self.search_api.search(search_request)
        except Exception as e:
            print(f"Transcript fetch error: {e}")
            return {"hits": {"hits": []}}
        
        parsed_hits = []
        
        if result.hits and result.hits.hits:
            for hit in result.hits.hits:
                source = hit.source if hasattr(hit, 'source') else {}
                
                # Parse words JSON if it's a string
                if 'words' in source and isinstance(source['words'], str):
                    try:
                        source['words'] = json.loads(source['words'])
                    except:
                        source['words'] = []
                
                parsed_hits.append({"_source": source})
        
        total = result.hits.total if result.hits else 0
        
        return {
            "hits": {
                "hits": parsed_hits,
                "total": {"value": total}
            }
        }
