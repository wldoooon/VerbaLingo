import manticoresearch
from typing import Optional
from app.core.config import get_settings
from app.core.logging import logger
import json
import asyncio

settings = get_settings()


class SearchService:
    def __init__(self, search_api: manticoresearch.SearchApi):
        self.search_api = search_api
        self.table_name = settings.TABLE_NAME

    async def search(self, q: str, language: str, category: Optional[str] = None, sub_category: Optional[str] = None) -> dict:
        # Default categories to mix
        MIX_CATEGORIES = ["Movies", "Podcasts", "Talks", "Cartoons"]
        
        # Resolve the table name dynamically based on language
        table_name = self._resolve_table(language)
        logger.debug(f"General search for {language} -> {table_name}")

        # 1. If user selected a specific category, just search that one normally
        if category:
            return await self._search_single_category(q, category, table_name, limit=20, sub_category=sub_category)

        # 2. General Search: Run parallel queries for each category to ensure diversity
        tasks = []
        for cat in MIX_CATEGORIES:
            tasks.append(self._search_single_category(q, cat, table_name, limit=10))
        
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

    def _resolve_table(self, language: str) -> str:
        """Determines the correct Manticore table based on language."""
        if not language:
            return self.table_name
            
        lang = language.lower().strip()
        # Convention: {language}_dataset
        # We only return the default table for "english" (the primary dataset)
        if lang in ["english", "general"]:
            return self.table_name
            
        return f"{lang}_dataset"

    async def _search_single_category(self, q: str, category: str, table_name: str, limit: int, sub_category: Optional[str] = None) -> dict:
        """Helper to run a search for one specific category"""
        query_string = f"@sentence_text {q}"
        
        must_conditions = [
            {"query_string": query_string},
            {"equals": {"category_title": category}}
        ]

        if sub_category:
            must_conditions.append({"equals": {"category_type": sub_category}})

        # Build strict boolean query for this category
        search_request = {
            "table": table_name,
            "query": {
                "bool": {
                    "must": must_conditions
                }
            },
            "limit": 20 # User requested to limit results to 20
        }

        if category:
            agg_field = "category_type"
            
        search_request["aggs"] = {
            "sub_category_counts": {
                "terms": {
                    "field": agg_field,
                    "size": 20
                }
            }
        }

        try:
            result = await self.search_api.search(search_request)
        except Exception as e:
            logger.error(f"Search error for category {category} in {table_name}: {e}")
            return {"hits": {"hits": [], "total": {"value": 0}}, "aggregations": {}}

        formatted_hits = []
        if result.hits and result.hits.hits:
            seen_videos = set()
            for hit in result.hits.hits:
                source = hit.source if hasattr(hit, 'source') else {}
                video_id = source.get('video_id')
                
                # Deduplication within specific category search
                # We want 1 clip per video to ensure variety
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
        
        aggregations = {}
        if hasattr(result, 'aggregations') and result.aggregations:
             # Manticore client might return aggregations as a dict or object
             aggs = result.aggregations
             if isinstance(aggs, dict) and 'sub_category_counts' in aggs:
                 buckets = aggs['sub_category_counts'].get('buckets', [])
                 # Convert buckets to simple dict {key: count}
                 aggregations = {b['key']: b['doc_count'] for b in buckets if b['key']}
        
        total = result.hits.total if result.hits else 0
        return {
            "hits": {
                "hits": formatted_hits,
                "total": {"value": total}
            },
            "aggregations": aggregations
        }

    async def get_transcript(self, video_id: str, language: str, center_position: Optional[int] = None) -> dict:
        window_size = 50
        per_page = 250
        table_name = self._resolve_table(language)
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
            "table": table_name,
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
            logger.error(f"Transcript fetch error in {table_name}: {e}")
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
