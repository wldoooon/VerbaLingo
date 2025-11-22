import json
import typesense
import sys
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

def create_collection_schema(reset=False):
    if reset:
        delete_collection()

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
        client.collections.create(schema)
        print(f"Created collection: {COLLECTION_NAME}")
    except typesense.exceptions.ObjectAlreadyExists:
        print(f"Collection {COLLECTION_NAME} already exists.")

def delete_collection():
    try:
        client.collections[COLLECTION_NAME].delete()
        print(f"Deleted collection: {COLLECTION_NAME}")
    except typesense.exceptions.ObjectNotFound:
        print(f"Collection {COLLECTION_NAME} not found, nothing to delete.")

def get_stats():
    try:
        stats = client.collections[COLLECTION_NAME].retrieve()
        print(f"\nCollection Stats for '{COLLECTION_NAME}':")
        print(f"   - Documents: {stats.get('num_documents', 0)}")
        print(f"   - Created At: {stats.get('created_at', 'Unknown')}")
        print(f"   - Memory Usage: {stats.get('memory_usage_bytes', 0) / 1024 / 1024:.2f} MB")
    except typesense.exceptions.ObjectNotFound:
        print(f"Collection {COLLECTION_NAME} does not exist.")

def test_search(query="hello"):
    print(f"\nTesting search for: '{query}'")
    search_params = {
        'q': query,
        'query_by': 'sentence_text',
        'per_page': 3
    }
    try:
        results = client.collections[COLLECTION_NAME].documents.search(search_params)
        hits = results.get('hits', [])
        print(f"   - Found {results.get('found', 0)} results.")
        for i, hit in enumerate(hits):
            doc = hit['document']
            print(f"   {i+1}. [{doc['start']:.2f}s] {doc['sentence_text']} (Video: {doc['video_id']})")
    except Exception as e:
        print(f"Search failed: {e}")

def flatten_video_to_sentences(video_doc):
    sentences = video_doc.get('sentences', [])
    video_id = video_doc.get('video_id')
    
    cat_title = "Unknown"
    cat_type = "Cartoon" 
    
    if isinstance(video_doc.get('category'), dict):
        cat_title = video_doc['category'].get('title', 'Unknown')
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

def process_documents_in_batches(reset=False):
    create_collection_schema(reset=reset)
    
    batch = []
    batch_count = 0
    total_sentences = 0
    
    print("\nStarting indexing process...")
    
    for video_doc in read_jsonl_lines():
        sentence_docs = flatten_video_to_sentences(video_doc)
        batch.extend(sentence_docs)
        
        if len(batch) >= 5000:
            batch_count += 1
            try:
                send_batch_to_typesense(batch)
                total_sentences += len(batch)
                print(f"   Batch {batch_count}: Indexed {len(batch)} sentences. Total: {total_sentences}")
            except Exception as e:
                print(f"   Failed batch {batch_count}: {e}")
            
            batch = []
            
    if batch:
        batch_count += 1
        send_batch_to_typesense(batch)
        total_sentences += len(batch)
        print(f"   Final Batch {batch_count}: Indexed {len(batch)} sentences.")
        
    print(f"\nComplete! Indexed {total_sentences} sentences.")

def main():
    print("\n--- Typesense Batch Processor Manager ---")
    print("1. Index Data (Append to existing)")
    print("2. Reset & Re-index (Delete all data first)")
    print("3. Delete Collection Only")
    print("4. View Collection Stats")
    print("5. Test Search")
    print("0. Exit")
    
    choice = input("\nEnter choice (0-5): ").strip()
    
    if choice == '1':
        process_documents_in_batches(reset=False)
    elif choice == '2':
        confirm = input("Are you sure you want to DELETE ALL DATA? (y/n): ")
        if confirm.lower() == 'y':
            process_documents_in_batches(reset=True)
    elif choice == '3':
        confirm = input("Are you sure you want to DELETE the collection? (y/n): ")
        if confirm.lower() == 'y':
            delete_collection()
    elif choice == '4':
        get_stats()
    elif choice == '5':
        q = input("Enter search query: ")
        test_search(q)
    elif choice == '0':
        print("Exiting.")
        sys.exit(0)
    else:
        print("Invalid choice.")

if __name__ == "__main__":
    main()
