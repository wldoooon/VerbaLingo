import manticoresearch
from typing import Optional
from collections import defaultdict, deque
from app.core.config import get_settings
from app.core.logging import logger
import json
import asyncio

settings = get_settings()


class SearchService:
    def __init__(self, search_api: manticoresearch.SearchApi):
        self.search_api = search_api
        self.table_name = settings.TABLE_NAME

    # Max docs Manticore ever scores per query — caps the work for common words.
    # High-frequency words may match 30,000 docs but we never score more than this.
    POOL_CAP = 500

    async def search(self, q: str, language: str, category: Optional[str] = None, sub_category: Optional[str] = None, page: int = 1, limit: int = 30) -> dict:
        table_name = self._resolve_table(language)
        logger.debug(f"Search: q={q!r} lang={language} cat={category} page={page}")

        # Always run aggregation in parallel — capped at POOL_CAP so it's cheap
        agg_task = self._fetch_aggregations(q, table_name, category=category, sub_category=sub_category)

        if category:
            # User picked a specific category: single targeted query
            offset = (page - 1) * limit
            search_task = self._search_single_category(q, category, table_name, limit=limit, offset=offset, sub_category=sub_category)
        else:
            # General search: 1 unified query instead of 6 parallel ones.
            # Python-side round-robin provides the same category diversity.
            search_task = self._search_unified(q, table_name, limit=limit, page=page)

        search_result, aggregations = await asyncio.gather(search_task, agg_task)
        search_result["aggregations"] = aggregations
        return search_result

    def _resolve_table(self, language: str) -> str:
        """Determines the correct Manticore table based on language."""
        if not language:
            return self.table_name

        lang = language.lower().strip()
        if lang in ["english", "general"]:
            return self.table_name

        return f"{lang}_dataset"

    async def _search_unified(self, q: str, table_name: str, limit: int, page: int) -> dict:
        """
        Single query across all categories — replaces 6 parallel category queries.

        Pool size grows with the page number so later pages always have enough
        candidates. Capped at POOL_CAP so Manticore never scores more than that
        many documents regardless of how many actually match the query.

        After fetching, we reproduce the same round-robin category diversity
        entirely in Python — no extra network round trips needed.
        """
        # Pool must cover (page * limit) items after dedup. Use a 3× oversample
        # buffer to absorb duplicates, capped at POOL_CAP.
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
        }

        try:
            result = await self.search_api.search(search_request)
        except Exception as e:
            logger.error(f"Unified search error in {table_name}: {e}")
            return {"hits": {"hits": [], "total": {"value": 0}}}

        # Format hits — same logic as _search_single_category
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

        # Round-robin across categories with deduplication
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

        # Slice the correct page out of the fully mixed list
        start = (page - 1) * limit
        end = page * limit
        page_hits = mixed_all[start:end]

        return {
            "hits": {
                "hits": page_hits,
                "total": {"value": total}
            }
        }

    async def _fetch_aggregations(self, q: str, table_name: str, category: Optional[str] = None, sub_category: Optional[str] = None) -> dict:
        """
        Dedicated aggregation-only query — limit: 0 means no documents are fetched or scored,
        just bucket counts. Runs once in parallel with the search queries instead of
        being duplicated across all 6 category queries.
        """
        query_string = f"@sentence_text {q}"

        must_conditions = [{"query_string": query_string}]
        if category:
            must_conditions.append({"equals": {"category_title": category}})
        if sub_category:
            must_conditions.append({"equals": {"category_type": sub_category}})

        search_request = {
            "table": table_name,
            "query": {
                "bool": {
                    "must": must_conditions
                }
            },
            "limit": 0,
            # Cap the aggregation scan — without this Manticore walks every matching
            # document (up to 30,000) just to build category bucket counts.
            "max_matches": self.POOL_CAP,
            "aggs": {
                "sub_category_counts": {
                    "terms": {
                        "field": "category_type",
                        "size": 20
                    }
                }
            }
        }

        try:
            result = await self.search_api.search(search_request)
        except Exception as e:
            logger.error(f"Aggregation error in {table_name}: {e}")
            return {}

        if hasattr(result, 'aggregations') and result.aggregations:
            aggs = result.aggregations
            if isinstance(aggs, dict) and 'sub_category_counts' in aggs:
                buckets = aggs['sub_category_counts'].get('buckets', [])
                return {b['key']: b['doc_count'] for b in buckets if b['key']}

        return {}

    async def _search_single_category(self, q: str, category: str, table_name: str, limit: int, offset: int = 0, sub_category: Optional[str] = None) -> dict:
        """
        Lightweight search for one category — no aggregations.
        max_matches caps the scoring heap so Manticore stops at N candidates
        instead of scoring every matching document (critical for high-frequency words).
        """
        query_string = f"@sentence_text {q}"

        must_conditions = [
            {"query_string": query_string},
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
            # Was 100 — too low for pages 9+ where offset > 96.
            # 500 covers all realistic pagination depths (page 1–16 at limit=30).
            "max_matches": self.POOL_CAP,
        }

        try:
            result = await self.search_api.search(search_request)
        except Exception as e:
            logger.error(f"Search error for category {category} in {table_name}: {e}")
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
                    except json.JSONDecodeError:
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
