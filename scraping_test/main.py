import asyncio
import subprocess
import csv
import json
from ids import get_video_metadata 

def read_channels_from_csv(filepath: str) -> list[dict]:
    """Reads channel data from the CSV file."""
    try:
        with open(filepath, mode='r', newline='', encoding='utf-8-sig') as file:
            return list(csv.DictReader(file))
    except FileNotFoundError:
        print(f"Error: The file '{filepath}' was not found.")
        return []

async def main():
    """Main function to run the data pipeline."""
    input_csv = 'Channels_Dataset.csv'
    
    channels = read_channels_from_csv(input_csv)
    if not channels:
        print("No channels to process. Exiting.")
        return

    print(f"--- Processing {len(channels)} channels from '{input_csv}' ---")

    # Process each channel individually
    for channel in channels:
        title = channel.get('Channel Title', '').strip()
        url = channel.get('URL', '').strip()
        category = channel.get('Category', '').strip()
        
        if not title or not url:
            continue
            
        output_file = f"{title}_metadata.jsonl"
        print(f"\nFetching metadata for: {title}")
        print(f"Output: {output_file}")
        
        try:
            # Run in thread since get_video_metadata is blocking
            video_metadata = await asyncio.to_thread(get_video_metadata, url)
            
            if not video_metadata:
                print(f"[WARNING] No videos found for {title}")
                continue
                
            with open(output_file, 'w', encoding='utf-8') as f:
                for video in video_metadata:
                    output_record = {
                        'channel_name': title,
                        'category': category,
                        'video_id': video.get('id'),
                        'video_title': video.get('title')
                    }
                    f.write(json.dumps(output_record, ensure_ascii=False) + '\n')
            
            print(f"[SUCCESS] Saved {len(video_metadata)} videos to {output_file}")
            
        except Exception as e:
            print(f"[FAILED] Error processing {title}: {e}")

if __name__ == "__main__":
    asyncio.run(main())