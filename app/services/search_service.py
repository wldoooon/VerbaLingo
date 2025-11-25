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

    async def get_full_transcript(self, video_id: str) -> dict:
        # Step 1: Fetch the first page (limit 250)
        per_page = 250
        search_params = {
            'q': '*',
            'query_by': 'sentence_text',
            'filter_by': f'video_id:={video_id}',
            'sort_by': 'position:asc',
            'per_page': per_page,
            'page': 1
        }
        
        try:
            # We run the first request in a thread to avoid blocking the event loop
            loop = asyncio.get_running_loop()
            first_result = await loop.run_in_executor(
                None, 
                partial(self.client.collections[self.collection_name].documents.search, search_params)
            )
        except typesense.exceptions.ObjectNotFound:
            return {"hits": {"hits": []}}

        all_hits = first_result.get('hits', [])
        total_found = first_result.get('found', 0)
        
        # Step 2: Calculate if we need more pages
        if total_found > per_page:
            total_pages = math.ceil(total_found / per_page)
            tasks = []
            
            # Create tasks for remaining pages
            for page in range(2, total_pages + 1):
                params = search_params.copy()
                params['page'] = page
                
                # Schedule search in thread pool
                func = partial(self.client.collections[self.collection_name].documents.search, params)
                tasks.append(loop.run_in_executor(None, func))
            
            # Step 3: Run all requests in parallel
            if tasks:
                results = await asyncio.gather(*tasks)
                for res in results:
                    all_hits.extend(res.get('hits', []))
        
        # Step 4: Parse 'words' JSON for all hits
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
                "hits": parsed_hits
            }
        }
