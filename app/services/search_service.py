from elasticsearch import AsyncElasticsearch
from typing import Optional
from ..core.config import get_settings

settings = get_settings()

class SearchService:
    def __init__(self, client: AsyncElasticsearch):
        self.client = client
    
    async def search(self, q: str, category: Optional[str] = None) -> dict:
        query = {
            "query": {
                "bool": {
                    "must":[
                        {
                            "match": {
                                "sentence_text": {
                                    "query": q,
                                }
                            }
                        }
                    ],
                    "filter": []
                }
            }

        }

        if category:
            query['query']['bool']['filter'].append({
                "term": {
                    "category": category
                }
            })

        response = await self.client.search(index=settings.ALIAS_NAME, body=query)
        return response

    async def get_transcript_batch(self, video_id: str, from_position: int, size: int) -> dict:
        query = {
            "size": size,
            "sort": [
                {"position": "asc"}
            ],
            "query": {
                "bool": {
                    "filter": [
{"term": {"video_id": video_id}},
                        {"range": {"position": {"gte": from_position}}}
                    ]
                }
            }
        }
        
        response = await self.client.search(
            index=settings.ALIAS_NAME,
            body=query
        )
        return response