import manticoresearch
from typing import Optional
from app.core.config import get_settings
import json

settings = get_settings()


class SearchService:
    def __init__(self, search_api: manticoresearch.SearchApi):
        self.search_api = search_api
        self.table_name = settings.TABLE_NAME

    async def search(self, q: str, category: Optional[str] = None) -> dict:
        query_string = f"@sentence_text *{q}*"
        search_request = {
            "table": self.table_name,
            "query": {"query_string": query_string},
            "limit": 50
        }
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
        formatted_hits = []
        if result.hits and result.hits.hits:
            seen_videos = set()
            for hit in result.hits.hits:
                source = hit.source if hasattr(hit, 'source') else {}
                video_id = source.get('video_id')
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
