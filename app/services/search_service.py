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

    async def get_full_transcript(self, video_id: str) -> dict:
        query = {
            "size": 10000,
            "sort": [
                {"position": "asc"}
            ],
            "query": {
                "term": {"video_id": video_id}
            }
        }
        
        response = await self.client.search(
            index=settings.ALIAS_NAME,
            body=query
        )
        return response