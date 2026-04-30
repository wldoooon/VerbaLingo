import manticoresearch
from typing import Optional
from app.core.config import get_settings
from app.core.logging import logger
import json
import time

settings = get_settings()


class SearchService:
    def __init__(self, search_api: manticoresearch.SearchApi):
        self.search_api = search_api
        self.table_name = settings.TABLE_NAME

    CUTOFF = 200

    _ISO_TO_TABLE = {
        "es": "spanish",
        "fr": "french",
        "de": "germany",
        "ja": "japanese",
        "zh": "chinese",
        "en": None,
    }


    async def search(self, q: str, language: str, category: Optional[str] = None, sub_category: Optional[str] = None, page: int = 1, limit: int = 30) -> dict:
        table_name = self._resolve_table(language)
        effective_category = category or "Podcasts"
        offset = (page - 1) * limit
        logger.debug(f"Search: q={q!r} lang={language} cat={effective_category} page={page}")
        category_id = 1 if table_name == "germany_dataset" else None
        return await self._search_single_category(q, effective_category, table_name, limit=limit, offset=offset, sub_category=sub_category, category_id=category_id)

    def _resolve_table(self, language: str) -> str:
        if not language:
            return self.table_name
        lang = language.lower().strip()
        if lang in ["english", "general", "en"]:
            return self.table_name
        lang = self._ISO_TO_TABLE.get(lang, lang)
        if lang is None:
            return self.table_name
        return f"{lang}_dataset"

    async def _search_single_category(self, q: str, category: str, table_name: str, limit: int, offset: int = 0, sub_category: Optional[str] = None, category_id: Optional[int] = None) -> dict:
        must_conditions = [
            {"query_string": f"@sentence_text {q}"},
            {"equals": {"category_id": category_id}} if category_id is not None else {"equals": {"category_title": category}}
        ]

        if sub_category:
            must_conditions.append({"equals": {"category_type": sub_category}})

        search_request = {
            "table": table_name,
            "query": {"bool": {"must": must_conditions}},
            "limit": limit,
            "offset": offset,
            "options": {"cutoff": self.CUTOFF, "ranker": "none"},
            "profile": True,
        }

        t0 = time.perf_counter()
        try:
            result = await self.search_api.search(search_request)
        except Exception as e:
            logger.error(f"Search error for category {category} in {table_name}: {e}")
            return {"hits": {"hits": [], "total": {"value": 0}}, "aggregations": {}}
        t1 = time.perf_counter()
        logger.info(f"[PERF] manticore_query={round((t1-t0)*1000)}ms  q={q!r}  cat={category}  table={table_name}")
        if hasattr(result, 'profile') and result.profile:
            logger.debug(f"[PROFILE] {result.profile}")

        formatted_hits = []
        if result.hits and result.hits.hits:
            seen_videos = set()
            for hit in result.hits.hits:
                source = hit.source if hasattr(hit, 'source') else {}
                video_id = source.get('video_id')

                if video_id in seen_videos:
                    continue
                seen_videos.add(video_id)

                source.pop('words', None)

                formatted_doc = source.copy()
                if hasattr(hit, 'highlight') and hit.highlight:
                    highlight_data = hit.highlight
                    if 'sentence_text' in highlight_data:
                        highlights = highlight_data['sentence_text']
                        if highlights:
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
            },
            "aggregations": {}
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
            "query": {"bool": {"must": filter_conditions}},
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
                    except json.JSONDecodeError:
                        source['words'] = []
                parsed_hits.append({"_source": source})
        total = result.hits.total if result.hits else 0
        return {
            "hits": {
                "hits": parsed_hits,
                "total": {"value": total}
            }
        }
