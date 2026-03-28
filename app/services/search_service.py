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

    async def search(self, q: str, language: str, category: Optional[str] = None, sub_category: Optional[str] = None, page: int = 1, limit: int = 30) -> dict:
        # Default categories to mix
        MIX_CATEGORIES = ["Movies", "Podcasts", "Talks", "Cartoons", "Shows", "News"]

        # Resolve the table name dynamically based on language
        table_name = self._resolve_table(language)
        logger.debug(f"Optimized search for {language} -> {table_name}")

        # 1. If user selected a specific category, search that one + separate agg query
        if category:
            offset = (page - 1) * limit
            search_task = self._search_single_category(q, category, table_name, limit=limit, offset=offset, sub_category=sub_category)
            agg_task = self._fetch_aggregations(q, table_name, category=category, sub_category=sub_category)

            search_result, aggregations = await asyncio.gather(search_task, agg_task)
            search_result["aggregations"] = aggregations
            return search_result

        # 2. General Search: Optimized Parallel Diversification
        limit_per_cat = max(int(limit * 0.4), 12)
        offset_per_cat = (page - 1) * limit_per_cat

        # Build 6 lightweight search tasks (no aggregations) + 1 dedicated agg task
        tasks = []
        for cat in MIX_CATEGORIES:
            tasks.append(self._search_single_category(q, cat, table_name, limit=limit_per_cat, offset=offset_per_cat))

        # 7th task: single aggregation-only query, runs in parallel with the searches
        tasks.append(self._fetch_aggregations(q, table_name))

        all_results = await asyncio.gather(*tasks)

        # Last result is the aggregation dict, first 6 are search results
        aggregations = all_results[-1]
        results_list = all_results[:-1]

        # 3. Interleave/Merge Results (Round Robin)
        mixed_hits = []
        category_hit_queues = []
        total_hits_found = 0

        for res in results_list:
            hits = res.get("hits", {}).get("hits", [])
            total_hits_found += res.get("hits", {}).get("total", {}).get("value", 0)
            if hits:
                category_hit_queues.append(list(hits))

        # Round Robin Merge with Deduplication
        seen_sentences = set()
        seen_video_ids = set()

        while category_hit_queues:
            for i in range(len(category_hit_queues) - 1, -1, -1):
                queue = category_hit_queues[i]
                if not queue:
                    category_hit_queues.pop(i)
                    continue

                candidate = queue[0]
                source = candidate.get("_source", {})
                sentence = candidate.get("_formatted", {}).get("sentence_text", "").strip().lower()
                video_id = source.get("video_id")

                if (video_id and video_id in seen_video_ids) or (sentence in seen_sentences):
                    queue.pop(0)
                else:
                    seen_sentences.add(sentence)
                    if video_id:
                        seen_video_ids.add(video_id)
                    mixed_hits.append(queue.pop(0))

                    if len(mixed_hits) >= limit:
                        category_hit_queues = []
                        break

        return {
            "hits": {
                "hits": mixed_hits,
                "total": {"value": total_hits_found}
            },
            "aggregations": aggregations
        }

    def _resolve_table(self, language: str) -> str:
        """Determines the correct Manticore table based on language."""
        if not language:
            return self.table_name

        lang = language.lower().strip()
        if lang in ["english", "general"]:
            return self.table_name

        return f"{lang}_dataset"

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
            "max_matches": 100,
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
