import subprocess
import json

def get_video_metadata(channel_url: str) -> list[dict]:
    command = [
        "yt-dlp",
        "--dump-json",      # The key change: get structured JSON output
        "--flat-playlist",
        "--playlist-items", "1:10000", # We'll keep this small for testing
        channel_url
    ]
    try:
        process = subprocess.run(
            command,
            capture_output=True,
            text=True,
            check=True,
            encoding='utf-8'
        )
        
        # The output is a sequence of JSON objects, one per line.
        # We parse each line into a dictionary.
        video_metadata = [json.loads(line) for line in process.stdout.strip().split('\n')]
        return video_metadata

    except (subprocess.CalledProcessError, json.JSONDecodeError) as e:
        # Re-raise the original exception for the caller to handle.
        raise



