import json
import os
import sys
import re
import time
import lmstudio as lms
from itertools import islice

# Setup paths
INPUT_FILE = r"C:\Users\Acer aspire\Desktop\MiniYouGlish\dataset\BoxofficeMoviesScenes_dataset.jsonl"
OUTPUT_FILE = r"C:\Users\Acer aspire\Desktop\MiniYouGlish\BoxofficeMoviesScenes_ENG.jsonl"
BATCH_SIZE = 10
MODEL_NAME = "qwen/qwen3-4b"
MAX_CONSECUTIVE_FAILURES = 5

# Initialize LM Studio model
print(f"Loading model: {MODEL_NAME}...")
try:
    model = lms.llm(MODEL_NAME)
except Exception as e:
    print(f"Error loading model {MODEL_NAME}: {e}")
    sys.exit(1)

def get_processed_ids(output_file):
    """
    CHECKPOINT: Load IDs of videos already processed to avoid duplicates and resume work.
    """
    processed_ids = set()
    if os.path.exists(output_file):
        with open(output_file, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    data = json.loads(line)
                    if "video_id" in data:
                        processed_ids.add(data["video_id"])
                except:
                    continue
    return processed_ids

def clean_ai_response(response):
    """
    DEFENSIVE ENGINEERING: Strip AI thoughts and markdown formatting.
    """
    if hasattr(response, 'content'):
        content = response.content
    else:
        content = str(response)
    
    # Remove Qwen's <think> blocks
    content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL)
    
    # Remove markdown code snippets
    clean = content.strip()
    if clean.startswith("```"):
        clean = re.sub(r'^```json\s*', '', clean)
        clean = re.sub(r'\s*```$', '', clean)
    
    return clean

def classify_batch_movies(titles):
    """
    INFERENCE LOGIC: Identify the movie based on AI knowledge, not just extraction.
    """
    prompt = f"""
    Analyze these video titles and identify the Movie, Series, or Cartoon they belong to.
    
    INSTRUCTIONS:
    1. USE YOUR KNOWLEDGE: Sometimes the video title describes a scene or a character but doesn't name the movie. Use your internal knowledge to identify the correct movie.
    2. NORMALIZE: Return only the canonical movie name in lowercase with spaces. No symbols (-, :, !, .).
    3. REMOVE NOISE: Strip years, "part 1", or "full movie" tags.
    4. If it is impossible to identify a specific movie/series, return "unknown".
    5. Return ONLY a JSON array of strings. No markdown. No thinking.

    EXAMPLES:
    "The scene where he fights the green goblin" -> "spider man"
    "Why the ring must be destroyed in the volcano" -> "lord of the rings"
    "THE MATRIX: Revolutions [4K]" -> "the matrix revolutions"
    "Daily Vlogs #45" -> "unknown"

    INPUT TITLES:
    {json.dumps(titles)}

    OUTPUT JSON ARRAY:
    """
    
    full_prompt = prompt + " /no_think"

    try:
        response = model.respond(full_prompt)
        clean_json = clean_ai_response(response)
        return json.loads(clean_json)
    except Exception as e:
        print(f"  [AI Error] {e}")
        return None

def process_file():
    print(f"\n--- MOVIE DATA FACTORY STARTING ---")
    processed_ids = get_processed_ids(OUTPUT_FILE)
    print(f"Found {len(processed_ids)} existing records. Resuming...")

    if not os.path.exists(INPUT_FILE):
        print(f"Error: Input file {INPUT_FILE} not found.")
        return

    consecutive_failures = 0
    stats = {"success": 0, "failed": 0, "skipped": len(processed_ids)}

    with open(INPUT_FILE, 'r', encoding='utf-8') as f_in, \
         open(OUTPUT_FILE, 'a', encoding='utf-8') as f_out: # APPEND for reliability
        
        while True:
            # STREAMING: Conveyor belt approach (islice)
            batch_lines = list(islice(f_in, BATCH_SIZE))
            if not batch_lines:
                break

            batch_data = []
            titles_to_process = []
            
            for line in batch_lines:
                try:
                    item = json.loads(line)
                    if item.get("video_id") in processed_ids:
                        continue
                    
                    batch_data.append(item)
                    titles_to_process.append(item.get("video_title", ""))
                except: continue

            if not titles_to_process:
                continue

            print(f"Processing {len(titles_to_process)} titles...")
            
            # AI Magic
            movie_names = classify_batch_movies(titles_to_process)

            if movie_names is None or len(movie_names) != len(titles_to_process):
                # CIRCUIT BREAKER
                consecutive_failures += 1
                stats["failed"] += len(titles_to_process)
                print(f"  [!] Fail {consecutive_failures}/{MAX_CONSECUTIVE_FAILURES}")
                if consecutive_failures >= MAX_CONSECUTIVE_FAILURES:
                    print("CRITICAL: Circuit breaker triggered. Stopping for safety.")
                    break
                continue
            
            consecutive_failures = 0 # Reset on success

            # Save results
            for j, data in enumerate(batch_data):
                data['movie_name'] = movie_names[j]
                f_out.write(json.dumps(data) + "\n")
                stats["success"] += 1
            
            # Force write to disk (Atomic-like safety)
            f_out.flush()
            os.fsync(f_out.fileno())

    print("\n--- FINAL AUDIT ---")
    print(f"Skipped (Already Done): {stats['skipped']}")
    print(f"Processed Successfully: {stats['success']}")
    print(f"Errors/Gaps: {stats['failed']}")
    print(f"Total entries in output: {len(get_processed_ids(OUTPUT_FILE))}")
    print("-------------------\n")

if __name__ == "__main__":
    process_file()
