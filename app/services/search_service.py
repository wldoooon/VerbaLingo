import manticoresearch
from typing import Optional
from collections import defaultdict, deque
from app.core.config import get_settings
from app.core.logging import logger
import json
import time

settings = get_settings()


class SearchService:
    def __init__(self, search_api: manticoresearch.SearchApi):
        self.search_api = search_api
        self.table_name = settings.TABLE_NAME

    # Max docs Manticore scores per query — caps the ranking heap.
    POOL_CAP = 500

    # Manticore stops scanning after this many candidates (passed via options.cutoff).
    # Prevents full posting-list traversal on high-frequency words (e.g. "ich bin" → 29k docs).
    CUTOFF = 2000

    # Shared aggs definition — embedded in every search request so aggregation
    # runs on the already-matched subset instead of a separate full scan.
    _AGGS = {
        "sub_category_counts": {
            "terms": {"field": "category_type", "size": 20}
        }
    }

    _ISO_TO_TABLE = {
        "es": "spanish",
        "fr": "french",
        "de": "german",
        "ja": "japanese",
        "zh": "chinese",
        "en": None,
    }

    async def search(self, q: str, language: str, category: Optional[str] = None, sub_category: Optional[str] = None, page: int = 1, limit: int = 30) -> dict:
        table_name = self._resolve_table(language)
        logger.debug(f"Search: q={q!r} lang={language} cat={category} page={page}")

        if category:
            offset = (page - 1) * limit
            return await self._search_single_category(q, category, table_name, limit=limit, offset=offset, sub_category=sub_category)
        else:
            return await self._search_unified(q, table_name, limit=limit, page=page)

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

    def _parse_aggs(self, result) -> dict:
        if hasattr(result, 'aggregations') and result.aggregations:
            aggs = result.aggregations
            if isinstance(aggs, dict) and 'sub_category_counts' in aggs:
                buckets = aggs['sub_category_counts'].get('buckets', [])
                return {b['key']: b['doc_count'] for b in buckets if b['key']}
        return {}

    async def _search_unified(self, q: str, table_name: str, limit: int, page: int) -> dict:
        """
        Single query across all categories with embedded aggs — one Manticore round-trip.
        cutoff + ranker=none via options: cutoff stops early, ranker skips BM25 scoring.
        Both are critical for high-frequency words with tens of thousands of matches.
        Python-side round-robin provides category diversity after the single fetch.
        """
        pool_size = min(self.POOL_CAP, max(page * limit * 3, limit * 3))

        search_request = {
            "table": table_name,
            "query": {
                "bool": {
                    "must": [{"query_string": f"@sentence_text {q}"}]
                }
            },
            "limit": pool_size,
            "max_matches": self.POOL_CAP,
            "options": {"cutoff": self.CUTOFF},
            "aggs": self._AGGS,
        }

        t0 = time.perf_counter()
        try:
            result = await self.search_api.search(search_request)
        except Exception as e:
            logger.error(f"Unified search error in {table_name}: {e}")
            return {"hits": {"hits": [], "total": {"value": 0}}, "aggregations": {}}
        t1 = time.perf_counter()
        logger.info(f"[PERF] manticore_query={round((t1-t0)*1000)}ms  q={q!r}  table={table_name}")

        all_hits = []
        if result.hits and result.hits.hits:
            for hit in result.hits.hits:
                source = hit.source if hasattr(hit, 'source') else {}
                if 'words' in source and isinstance(source['words'], str):
                    try:
                        source['words'] = json.loads(source['words'])
                    except json.JSONDecodeError:
                        source['words'] = []

                formatted_doc = source.copy()
                if hasattr(hit, 'highlight') and hit.highlight:
                    highlight_data = hit.highlight
                    if 'sentence_text' in highlight_data:
                        highlights = highlight_data['sentence_text']
                        if highlights:
                            formatted_doc['sentence_text'] = highlights[0]

                all_hits.append({"_source": source, "_formatted": formatted_doc})

        total = result.hits.total if result.hits else 0

        # Group by category_title for round-robin
        category_buckets: dict[str, deque] = defaultdict(deque)
        for hit in all_hits:
            cat = hit["_source"].get("category_title", "Unknown")
            category_buckets[cat].append(hit)

        seen_sentences: set[str] = set()
        seen_video_ids: set[str] = set()
        mixed_all: list = []

        active_cats = list(category_buckets.keys())
        while active_cats:
            for cat in active_cats[:]:
                q_cat = category_buckets[cat]
                if not q_cat:
                    active_cats.remove(cat)
                    continue

                candidate = q_cat[0]
                source = candidate.get("_source", {})
                sentence = candidate.get("_formatted", {}).get("sentence_text", "").strip().lower()
                video_id = source.get("video_id")

                if (video_id and video_id in seen_video_ids) or (sentence in seen_sentences):
                    q_cat.popleft()
                else:
                    seen_sentences.add(sentence)
                    if video_id:
                        seen_video_ids.add(video_id)
                    mixed_all.append(q_cat.popleft())

        start = (page - 1) * limit
        end = page * limit
        page_hits = mixed_all[start:end]
        t2 = time.perf_counter()
        logger.info(f"[PERF] python_processing={round((t2-t1)*1000)}ms  hits_returned={len(page_hits)}")

        return {
            "hits": {
                "hits": page_hits,
                "total": {"value": total}
            },
            "aggregations": self._parse_aggs(result)
        }

    async def _search_single_category(self, q: str, category: str, table_name: str, limit: int, offset: int = 0, sub_category: Optional[str] = None) -> dict:
        """
        Targeted single-category search with embedded aggs — one Manticore round-trip.
        """
        must_conditions = [
            {"query_string": f"@sentence_text {q}"},
            {"equals": {"category_title": category}}
        ]

        if sub_category:
            must_conditions.append({"equals": {"category_type": sub_category}})

        search_request = {
            "table": table_name,
            "query": {
                "bool": {
                    "must": must_conditions
                }
            },
            "limit": limit,
            "offset": offset,
            "max_matches": self.POOL_CAP,
            "options": {"cutoff": self.CUTOFF},
            "aggs": self._AGGS,
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

                if video_id in seen_videos:
                    continue
                seen_videos.add(video_id)

                if 'words' in source and isinstance(source['words'], str):
                    try:
                        source['words'] = json.loads(source['words'])
                    except json.JSONDecodeError:
                        source['words'] = []

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
            "aggregations": self._parse_aggs(result)
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
