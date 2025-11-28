import typesense
from typing import Optional
from app.core.config import get_settings
import json
import asyncio
import math
from functools import partial

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

    async def get_transcript(self, video_id: str, center_position: Optional[int] = None) -> dict:
        # Window size (e.g., 50 before and 50 after)
        WINDOW_SIZE = 50
        per_page = 250
        
        search_params = {
            'q': '*',
            'query_by': 'sentence_text',
            'filter_by': f'video_id:={video_id}',
            'sort_by': 'position:asc',
            'per_page': per_page,
            'page': 1
        }
        
        # If a center position is provided, fetch a window around it
        if center_position is not None:
            start_pos = max(0, int(center_position) - WINDOW_SIZE)
            end_pos = int(center_position) + WINDOW_SIZE
            search_params['filter_by'] += f' && position:=[{start_pos}..{end_pos}]'
        
        try:
            # Run in thread pool to avoid blocking
            loop = asyncio.get_running_loop()
            result = await loop.run_in_executor(
                None, 
                partial(self.client.collections[self.collection_name].documents.search, search_params)
            )
        except typesense.exceptions.ObjectNotFound:
            return {"hits": {"hits": []}}

        all_hits = result.get('hits', [])
        
        # If no center position was provided (fallback), we might want to fetch more pages
        # But for now, let's stick to the first page (250 sentences is a lot of context)
        # If the user needs more, they should request a specific window.
        
        parsed_hits = []
        for hit in all_hits:
            doc = hit.get('document', {})
            if 'words' in doc and isinstance(doc['words'], str):
                try:
                    doc['words'] = json.loads(doc['words'])
                except:
                    doc['words'] = []
            parsed_hits.append({"_source": doc})

        return {
            "hits": {
                "hits": parsed_hits,
                "total": {"value": result.get('found', 0)}
            }
        }
