import json
from elasticsearch import AsyncElasticsearch
from elasticsearch.helpers import async_bulk
from typing import AsyncGenerator, Dict, Any

class BulkIngestor:
    def __init__(self, client: AsyncElasticsearch):
        self.client = client

    async def _yield_actions(self, file_path: str, target_index: str) -> AsyncGenerator[Dict[str, Any], None]:
        with open(file_path, 'r') as f:
            for line in f:
                if not line.strip(): continue
                doc = json.loads(line)

                og_category = doc.get('category', 'unknown')
                doc['category'] = list({og_category, "general"})

                yield {
                    "_op_type": "index",
                    "_index": target_index,
                    "_id": f"{doc['video_id']}_{doc.get('position', 0)}",
                    "_source": doc,
                }

    async def ingest_from_file(self, file_path: str, target_index: str):
        print(f"Starting bulk ingestion from '{file_path}' into '{target_index}'...")
        success, failed = await async_bulk(self.client, self._yield_actions(file_path, target_index))
        if failed:
            raise RuntimeError(f"Bulk indexing failed for {len(failed)} documents.")
        print(f"Successfully indexed {success} documents.")