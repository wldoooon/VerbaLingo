"""
Simple streaming batch processor for MeiliSearch
"""

from meilisearch import Client
from jsonl_reader import read_jsonl_lines


def send_batch_to_meilisearch(batch, client, index_name):
    """Send a batch of documents to MeiliSearch."""
    index = client.index(index_name)
    task = index.add_documents(batch, primary_key="id")
    return task


def setup_index_settings(client, index_name):
    """Configure index settings for search optimization."""
    index = client.index(index_name)
    
    index.update_searchable_attributes([
        'sentence_text'
    ])
    
    index.update_filterable_attributes([
        'category',
        'lang'
    ])
    
    index.update_sortable_attributes([
        'position',
        'start_time'
    ])
    
    print(f"Index settings configured for {index_name}")
    print("- Searchable attributes: sentence_text")
    print("- Filterable attributes: category, lang")
    print("- Sortable attributes: position, start_time")


def process_documents_in_batches():
    """Process documents in batches of 100."""
    
    client = Client("http://localhost:7700")
    index_name = "yt_data"
    batch_size = 100
    
    print("Configuring index settings...")
    setup_index_settings(client, index_name)
    print()
    
    batch = []
    total_processed = 0
    batch_count = 0
    doc_id_counter = 0  
    
    print("Starting batch processing...")
    
    for document in read_jsonl_lines():
        document['id'] = f"yt_{doc_id_counter}"
        doc_id_counter += 1
        
        batch.append(document)
        total_processed += 1

        if len(batch) >= batch_size:
            batch_count += 1
            try:
                task = send_batch_to_meilisearch(batch, client, index_name)
                print(f"Sent batch {batch_count} ({len(batch)} docs) - Total: {total_processed}")
                batch = []  
            except Exception as e:
                print(f"Failed to send batch {batch_count}: {e}")
                batch = []  

    if batch:
        batch_count += 1
        try:
            task = send_batch_to_meilisearch(batch, client, index_name)
            print(f"Sent final batch {batch_count} ({len(batch)} docs) - Total: {total_processed}")
        except Exception as e:
            print(f"Failed to send final batch: {e}")

    print(f"\nProcessing complete! Sent {batch_count} batches, {total_processed} documents total.")


def configure_index_only():
    """Configure index settings without processing documents."""
    client = Client("http://localhost:7700")
    index_name = "yt_data"
    
    print("Configuring index settings only...")
    setup_index_settings(client, index_name)
    print("Index configuration complete!")


if __name__ == "__main__":
    # process_documents_in_batches()  # Process documents and configure settings
    configure_index_only()  # Only configure settings without processing
