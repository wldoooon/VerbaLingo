import json
import typesense
from jsonl_reader import read_jsonl_lines

client = typesense.Client({
    'nodes': [{
        'host': 'localhost',
        'port': '8108',
        'protocol': 'http'
    }],
    'api_key': 'xyz123',
    'connection_timeout_seconds': 10
})

COLLECTION_NAME = "yt_sentences"

def create_collection_schema():
    schema = {
        'name': COLLECTION_NAME,
        'fields': [
            {'name': 'sentence_text', 'type': 'string', 'infix': True},
            {'name': 'video_id', 'type': 'string', 'facet': True},
            {'name': 'channel', 'type': 'string', 'facet': True, 'optional': True},
            {'name': 'category_title', 'type': 'string', 'facet': True, 'optional': True},
            {'name': 'category_type', 'type': 'string', 'facet': True, 'optional': True},
            {'name': 'language', 'type': 'string', 'facet': True, 'optional': True},
            {'name': 'start', 'type': 'float'},
            {'name': 'end', 'type': 'float'},
            {'name': 'position', 'type': 'int32'},
            {'name': 'video_title', 'type': 'string', 'optional': True, 'index': False},
            {'name': 'words', 'type': 'string', 'optional': True, 'index': False},
        ],
        'default_sorting_field': 'position'
    }
    
    try:
        client.collections[COLLECTION_NAME].delete()
    except typesense.exceptions.ObjectNotFound:
        pass
    
    client.collections.create(schema)

def flatten_video_to_sentences(video_doc):
    sentences = video_doc.get('sentences', [])
    video_id = video_doc.get('video_id')
    
    cat_title = "Unknown"
    cat_type = "Cartoon" # Default type set to Cartoon as requested
    
    if isinstance(video_doc.get('category'), dict):
        cat_title = video_doc['category'].get('title', 'Unknown')
        # You can uncomment this if your dataset has 'type' in category
        # cat_type = video_doc['category'].get('type', 'Cartoon')
    elif isinstance(video_doc.get('category'), str):
        cat_title = video_doc['category']

    flat_docs = []
    for i, sent in enumerate(sentences):
        doc_id = f"{video_id}_{i}"
        words_json = json.dumps(sent.get('words', []), ensure_ascii=False)
        
        flat_doc = {
            'id': doc_id,
            'video_id': video_id,
            'video_title': video_doc.get('title', ''),
            'channel': video_doc.get('channel', ''),
            'category_title': cat_title,
            'category_type': cat_type,
            'language': video_doc.get('language', 'en'),
            'sentence_text': sent.get('sentence_text', ''),
            'start': sent.get('start', 0.0),
            'end': sent.get('end', 0.0),
            'position': i,
            'words': words_json
        }
        flat_docs.append(flat_doc)
        
    return flat_docs

def send_batch_to_typesense(batch):
    jsonl_data = '\n'.join([json.dumps(doc) for doc in batch])
    return client.collections[COLLECTION_NAME].documents.import_(
        jsonl_data,
        {'action': 'upsert'}
    )

def process_documents_in_batches(max_batch_size_mb=5):
    create_collection_schema()
    
    batch = []
    batch_count = 0
    total_sentences = 0
    
    print("Starting processing...")
    
    for video_doc in read_jsonl_lines():
        sentence_docs = flatten_video_to_sentences(video_doc)
        batch.extend(sentence_docs)
        
        if len(batch) >= 5000:
            batch_count += 1
            try:
                send_batch_to_typesense(batch)
                total_sentences += len(batch)
                print(f"Batch {batch_count}: Indexed {len(batch)} sentences. Total: {total_sentences}")
            except Exception as e:
                print(f"Failed batch {batch_count}: {e}")
            
            batch = []
            
    if batch:
        batch_count += 1
        send_batch_to_typesense(batch)
        total_sentences += len(batch)
        print(f"Final Batch {batch_count}: Indexed {len(batch)} sentences.")
        
    print(f"Complete! Indexed {total_sentences} sentences.")

if __name__ == "__main__":
    process_documents_in_batches()
