import json
from meilisearch import Client
from jsonl_reader import read_jsonl_lines


def calculate_json_size(data):
    """Calculate the approximate size of a JSON-serialized object in bytes."""
    return len(json.dumps(data, ensure_ascii=False).encode('utf-8'))


def transform_category(document):
    """
    Transform the category field from a string to an object with type and title.
    
    Args:
        document: Document dictionary that may contain a 'category' field
        
    Returns:
        Document with transformed category field
    """
    if 'category' in document and document['category'] is not None:
        original_category = document['category']
        document['category'] = {
            "type": "Cartoons",
            "title": original_category
        }
    return document


def send_batch_to_meilisearch(batch, client, index_name):
    """Send a batch of documents to MeiliSearch."""
    index = client.index(index_name)
    task = index.add_documents(batch, primary_key="id")
    return task

def delete_index():
    """Delete an index."""
    client = Client("http://localhost:7700")
    index_name = "yt_data"
    client.index(index_name).delete()
    print(f"Index {index_name} deleted.") 
    

def setup_index_settings(client, index_name):
    """Configure index settings for search optimization."""
    index = client.index(index_name)
    
    index.update_searchable_attributes([
        'sentence_text',            # top-level sentence
        'words.text',               # sub-attribute from words[] array
        'sentences.sentence_text'   # sub-attribute from sentences[] array
    ])
    
    index.update_filterable_attributes([
        'category',
        'category.type',
        'category.title',
        'language',
        'video_id'
    ])
    
    index.update_sortable_attributes([
        'start_time'
    ])
    
    print(f"Index settings configured for {index_name}")
    print("- Searchable attributes: sentence_text")
    print("- Filterable attributes: category, category.type, category.title, language, video_id")
    print("- Sortable attributes: start_time")


def quick_search(query: str, category: str | None = None, limit: int = 10):
   """Run a quick search and print ONLY the sentence(s) that matched.

   We use Meilisearch highlighting on nested attributes and then extract the
   specific sentence_text values that contain the highlight tags.
   """
   client = Client("http://localhost:7700")
   index_name = "yt_data"
   index = client.index(index_name)

   params = {
       "limit": limit,
       # Only retrieve minimal fields; rely on _formatted for highlighted text
       "attributesToRetrieve": ["video_id", "position", "sentence_text", "sentences.sentence_text"],
       "attributesToHighlight": ["sentence_text", "sentences.sentence_text"],
       "highlightPreTag": "<em>",
       "highlightPostTag": "</em>",
       "showMatchesPosition": True,
   }
   if category:
       # Filter by category.title since category is now an object
       params["filter"] = f"category.title = '{category}'"

   result = index.search(query, params)
   hits = result.get("hits", [])

   def extract_matched_sentences(hit: dict) -> list[str]:
       matched: list[str] = []
       formatted = hit.get("_formatted", {})

       # 1) If top-level sentence_text exists and got highlighted
       st = formatted.get("sentence_text")
       if isinstance(st, str) and "<em>" in st:
           matched.append(st)

       # 2) If sentences is an array of objects with sentence_text
       sentences_fmt = formatted.get("sentences")
       if isinstance(sentences_fmt, list):
           for item in sentences_fmt:
               s = item.get("sentence_text") if isinstance(item, dict) else None
               if isinstance(s, str) and "<em>" in s:
                   matched.append(s)

       return matched

   line_no = 1
   flattened_results: list[dict] = []
   for hit in hits:
       matched_sentences = extract_matched_sentences(hit)
       if not matched_sentences:
           # Fallback: just show raw sentence_text if present
           fallback = hit.get("sentence_text")
           if isinstance(fallback, str):
               matched_sentences = [fallback]

       for s in matched_sentences:
           print(f"{line_no:02d}. vid={hit.get('video_id')} pos={hit.get('position')} sentence={s}")
           flattened_results.append({
               "video_id": hit.get("video_id"),
               "position": hit.get("position"),
               "sentence_formatted": s,  # may include <em> ... </em>
           })
           line_no += 1

   return flattened_results


def process_documents_in_batches(max_batch_size_mb=90):
    """
    Process documents in batches based on payload size to avoid Meilisearch 100MB limit.
    
    Args:
        max_batch_size_mb: Maximum batch size in MB (default 90MB for safety margin)
    """
    
    client = Client("http://localhost:7700")
    index_name = "yt_data"
    max_batch_size_bytes = max_batch_size_mb * 1024 * 1024  # Convert MB to bytes
    
    print("Configuring index settings...")
    setup_index_settings(client, index_name)
    print()
    
    batch = []
    batch_size_bytes = 0
    total_processed = 0
    batch_count = 0
    doc_id_counter = 0  
    
    print(f"Starting batch processing with max batch size: {max_batch_size_mb}MB ({max_batch_size_bytes:,} bytes)...")
    print()
    
    for document in read_jsonl_lines():
        document['id'] = f"yt_{document['video_id']}_{doc_id_counter}"
        doc_id_counter += 1
        
        # Transform category field to object structure
        document = transform_category(document)
        
        # Calculate the size of this document when serialized (after transformation)
        doc_size = calculate_json_size(document)
        
        # Warn if a single document is very large (but still process it)
        if doc_size > max_batch_size_bytes * 0.8:  # 80% of max batch size
            print(f"⚠ Warning: Document {doc_id_counter} is very large ({doc_size / (1024*1024):.2f}MB)")
        
        # Check if adding this document would exceed the batch size limit
        if batch and (batch_size_bytes + doc_size) > max_batch_size_bytes:
            # Send current batch before adding this document
            batch_count += 1
            batch_size_mb = batch_size_bytes / (1024 * 1024)
            try:
                task = send_batch_to_meilisearch(batch, client, index_name)
                print(f"✓ Sent batch {batch_count} ({len(batch)} docs, {batch_size_mb:.2f}MB) - Total processed: {total_processed}")
                batch = []
                batch_size_bytes = 0
            except Exception as e:
                print(f"✗ Failed to send batch {batch_count}: {e}")
                batch = []
                batch_size_bytes = 0
        
        # Add document to batch
        batch.append(document)
        batch_size_bytes += doc_size
        total_processed += 1

    # Send remaining documents in final batch
    if batch:
        batch_count += 1
        batch_size_mb = batch_size_bytes / (1024 * 1024)
        try:
            task = send_batch_to_meilisearch(batch, client, index_name)
            print(f"✓ Sent final batch {batch_count} ({len(batch)} docs, {batch_size_mb:.2f}MB) - Total processed: {total_processed}")
        except Exception as e:
            print(f"✗ Failed to send final batch: {e}")

    print(f"\n{'='*60}")
    print(f"Processing complete!")
    print(f"  - Total batches sent: {batch_count}")
    print(f"  - Total documents processed: {total_processed}")
    print(f"{'='*60}")


def configure_index_only():
    """Configure index settings without processing documents."""
    client = Client("http://localhost:7700")
    index_name = "yt_data"
    
    print("Configuring index settings only...")
    setup_index_settings(client, index_name)
    print("Index configuration complete!")


if __name__ == "__main__":
    # quick_search("hello")
    process_documents_in_batches()  # Process documents and configure settings
    # configure_index_only()  # Only configure settings without processing
    # delete_index()
