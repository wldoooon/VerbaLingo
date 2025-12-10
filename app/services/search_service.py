import manticoresearch
from typing import Optional
from app.core.config import get_settings
import json
import asyncio

settings = get_settings()


class SearchService:
    def __init__(self, search_api: manticoresearch.SearchApi):
        self.search_api = search_api
        self.table_name = settings.TABLE_NAME

    async def search(self, q: str, category: Optional[str] = None) -> dict:
        # Default categories to mix - ensure these match your database 'category_type' values exactly
        MIX_CATEGORIES = ["Movies", "Podcasts", "Talks", "Cartoons"]
        
        # 1. If user selected a specific category, just search that one normally
        if category:
            return await self._search_single_category(q, category, limit=50)

        # 2. General Search: Run parallel queries for each category to ensure diversity
        tasks = []
        for cat in MIX_CATEGORIES:
            tasks.append(self._search_single_category(q, cat, limit=10))
        
        # Run all DB queries in parallel
        results_list = await asyncio.gather(*tasks)
        
        # 3. Interleave/Merge Results (Round Robin)
        # results_list is a list of dicts: [{"hits": {"hits": [...]}}, ...]
        mixed_hits = []
        
        # Extract the hit lists
        category_hit_queues = []
        total_hits_found = 0
        
        for res in results_list:
            hits = res.get("hits", {}).get("hits", [])
            total_hits_found += res.get("hits", {}).get("total", {}).get("value", 0)
            if hits:
                category_hit_queues.append(list(hits))
        
        # Round Robin Merge
        seen_sentences = set()
        seen_video_ids = set()
        
        while category_hit_queues:
            for i in range(len(category_hit_queues) - 1, -1, -1): # Iterate backwards to safely pop
                queue = category_hit_queues[i]
                if not queue:
                    category_hit_queues.pop(i)
                    continue

                # Peek at the top item
                candidate = queue[0]
                source = candidate.get("_source", {})
                sentence = candidate.get("_formatted", {}).get("sentence_text", "").strip().lower()
                video_id = source.get("video_id")

                # Deduplication Check (Block same sentence OR same video)
                if (video_id and video_id in seen_video_ids) or (sentence in seen_sentences):
                    # Duplicate found - discard it
                    queue.pop(0) 
                else:
                    # New unique item - accept it
                    seen_sentences.add(sentence)
                    if video_id:
                        seen_video_ids.add(video_id)
                    mixed_hits.append(queue.pop(0))
        
        return {
            "hits": {
                "hits": mixed_hits,
                "total": {"value": total_hits_found}
            }
        }

    async def _search_single_category(self, q: str, category: str, limit: int) -> dict:
        """Helper to run a search for one specific category"""
        query_string = f"@sentence_text {q}"
        
        # Build strict boolean query for this category
        search_request = {
            "table": self.table_name,
            "query": {
                "bool": {
                    "must": [
                        {"query_string": query_string},
                        {"equals": {"category_title": category}}
                    ]
                }
            },
            "limit": limit
        }

        try:
            result = await self.search_api.search(search_request)
        except Exception as e:
            print(f"Search error for category {category}: {e}")
            return {"hits": {"hits": [], "total": {"value": 0}}}

        formatted_hits = []
        if result.hits and result.hits.hits:
            seen_videos = set()
            for hit in result.hits.hits:
                source = hit.source if hasattr(hit, 'source') else {}
                video_id = source.get('video_id')
                
                # Deduplicate within this single category list
                if video_id in seen_videos: 
                    continue
                seen_videos.add(video_id)
                
                if 'words' in source and isinstance(source['words'], str):
                    try:
                        source['words'] = json.loads(source['words'])
                    except:
                        source['words'] = []
                
                formatted_doc = source.copy()
                if hasattr(hit, 'highlight') and hit.highlight:
                    highlight_data = hit.highlight
                    if 'sentence_text' in highlight_data:
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
        window_size = 50
        per_page = 250
        filter_conditions = [{"equals": {"video_id": video_id}}]
        if center_position is not None:
            start_pos = max(0, int(center_position) - window_size)
            end_pos = int(center_position) + window_size
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
