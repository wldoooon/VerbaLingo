import typesense
from typing import Optional
from app.core.config import get_settings
import json

settings = get_settings()

class SearchService:
    def __init__(self, client: typesense.Client):
        self.client = client
        self.collection_name = settings.COLLECTION_NAME
    
    async def search(self, q: str, category: Optional[str] = None) -> dict:
        search_params = {
            'q': q,
            'query_by': 'sentence_text',
            'infix': 'always',
            'per_page': 50,
            'page': 1,
            'highlight_fields': 'sentence_text',
            'group_by': 'video_id',
            'group_limit': 1
        }
        
        if category:
            search_params['filter_by'] = f'category_title:={category}'
        
        try:
            result = self.client.collections[self.collection_name].documents.search(search_params)
        except typesense.exceptions.ObjectNotFound:
            return {"hits": {"hits": [], "total": {"value": 0}}}
        
        formatted_hits = []
        grouped_hits = result.get('grouped_hits', [])
        
        for group in grouped_hits:
            hits = group.get('hits', [])
            if not hits: continue
            
            hit = hits[0]
            document = hit.get('document', {})
            highlights = hit.get('highlights', [])
            
            if 'words' in document and isinstance(document['words'], str):
                try:
                    document['words'] = json.loads(document['words'])
                except:
                    document['words'] = []
            
            formatted_doc = document.copy()
            for highlight in highlights:
                field = highlight.get('field')
                snippet = highlight.get('snippet')
                if field and snippet:
                    formatted_doc[field] = snippet
            
            formatted_hits.append({
                "_source": document,
                "_formatted": formatted_doc
            })
        
        return {
            "hits": {
                "hits": formatted_hits,
                "total": {"value": result.get('found', 0)}
            }
        }

    async def get_full_transcript(self, video_id: str) -> dict:
        search_params = {
            'q': '*',
            'query_by': 'sentence_text',
            'filter_by': f'video_id:={video_id}',
            'sort_by': 'position:asc',
            'per_page': 250
        }
        
        try:
            result = self.client.collections[self.collection_name].documents.search(search_params)
        except typesense.exceptions.ObjectNotFound:
            return {"hits": {"hits": []}}
        
        return {
            "hits": {
                "hits": [
                    {"_source": hit.get('document', {})} 
                    for hit in result.get('hits', [])
                ]
            }
        }
