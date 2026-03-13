import json
import yt_dlp
import pysrt
import os
import time
import random
import concurrent.futures
import threading

# Optional dependencies for improved resilience
try:
    from yt_dlp.networking.impersonate import ImpersonateTarget  # type: ignore
except Exception:
    ImpersonateTarget = None

try:
    import requests
except Exception:
    requests = None

# Global lock for file writing (Architect Move: Thread Safety)
file_lock = threading.Lock()

def _get_impersonate_target():
    if ImpersonateTarget is None:
        return None
    try:
        return ImpersonateTarget('chrome', '116', 'windows', '10')
    except Exception:
        try:
            return ImpersonateTarget('chrome', '110', 'windows', '10')
        except Exception:
            return None

def _sleep_backoff(attempt: int):
    base = 2.0 * (2 ** (attempt - 1))
    jitter = random.uniform(0.25, 0.75)
    time.sleep(base + jitter)

def _fetch_json3_with_requests(url: str, headers: dict, attempts: int = 3):
    if not requests:
        return None
    for i in range(1, attempts + 1):
        try:
            resp = requests.get(url, headers=headers, timeout=15)
            if resp.status_code == 200:
                return resp.json()
            if resp.status_code == 429:
                _sleep_backoff(i)
                continue
            return None
        except Exception:
            _sleep_backoff(i)
    return None

def _direct_json3_from_info(info: dict, headers: dict):
    for cc_kind in ('automatic_captions', 'subtitles'):
        cc = info.get(cc_kind) or {}
        for lang_key in (k for k in cc.keys() if k and k.startswith('fr')):
            formats = cc.get(lang_key) or []
            candidates = [f for f in formats if (f.get('ext') in ('json3', 'srv3')) and f.get('url')]
            if not candidates:
                continue
            url = candidates[0]['url']
            data = _fetch_json3_with_requests(url, headers=headers, attempts=3)
            if not data:
                continue
            transcript_sentences = []
            for ev in data.get('events', []) or []:
                start_ms = ev.get('tStartMs', 0)
                dur_ms = ev.get('dDurationMs', 0)
                segs = ev.get('segs', []) or []
                sentence_text = "".join(seg.get('utf8', '') for seg in segs).strip()
                words = []
                default_word_ms = (dur_ms // max(1, len(segs))) if (dur_ms and len(segs) > 0) else 0
                running = 0
                for seg in segs:
                    w = (seg.get('utf8') or '').strip()
                    if not w: continue
                    off = seg.get('tOffsetMs') if seg.get('tOffsetMs') is not None else running
                    wd = seg.get('dDurationMs') if seg.get('dDurationMs') is not None else default_word_ms
                    w_start = (start_ms + off) / 1000.0
                    w_end = (start_ms + off + wd) / 1000.0 if wd else w_start
                    words.append({"text": w, "start": round(w_start, 3), "end": round(w_end, 3)})
                    running = off + wd
                if sentence_text:
                    start_s = start_ms / 1000.0
                    if words: end_s = words[-1]['end']
                    elif dur_ms: end_s = (start_ms + dur_ms) / 1000.0
                    else: end_s = start_s
                    if end_s < start_s: end_s = start_s
                    transcript_sentences.append({
                        "sentence_text": sentence_text,
                        "start": round(start_s, 3),
                        "end": round(end_s, 3),
                        "words": words,
                    })
            return transcript_sentences or None
    return None

def download_transcript(video_id):
    time.sleep(random.uniform(0.5, 1.5))

    json3_opts = {
        'skip_download': True,
        'writesubtitles': True,
        'writeautomaticsub': True,
        'subtitleslangs': ['fr'],
        'subtitlesformat': 'json3',
        'outtmpl': f'{video_id}.%(ext)s',
        'quiet': True,
        'no_warnings': True,
        'no_color': True,
        'extractor_retries': 3,
        'ignoreerrors': True,
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    }
    imp = _get_impersonate_target()
    if imp: json3_opts['impersonate'] = imp

    url = f'https://www.youtube.com/watch?v={video_id}'

    try:
        with yt_dlp.YoutubeDL(json3_opts) as ydl:
            try:
                info = ydl.extract_info(url, download=False)
            except Exception:
                return None

            subs_info = info.get('requested_subtitles')
            if not subs_info or 'fr' not in subs_info:
                direct = _direct_json3_from_info(info, headers=json3_opts.get('http_headers', {}))
                if direct: return direct
                return None

            try:
                ydl.download([url])
            except Exception:
                return None
    except Exception:
        pass
    else:
        json3_path = f'{video_id}.fr.json3'
        if os.path.exists(json3_path):
            try:
                with open(json3_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                transcript_sentences = []
                for ev in data.get('events', []):
                    start_ms = ev.get('tStartMs', 0)
                    dur_ms = ev.get('dDurationMs', 0)
                    segs = ev.get('segs', []) or []
                    sentence_text = "".join(seg.get('utf8', '') for seg in segs).strip()
                    words = []
                    default_word_ms = (dur_ms // max(1, len(segs))) if (dur_ms and len(segs) > 0) else 0
                    running = 0
                    for seg in segs:
                        w = (seg.get('utf8') or '').strip()
                        if not w: continue
                        off = seg.get('tOffsetMs') if seg.get('tOffsetMs') is not None else running
                        wd = seg.get('dDurationMs') if seg.get('dDurationMs') is not None else default_word_ms
                        w_start = (start_ms + off) / 1000.0
                        w_end = (start_ms + off + wd) / 1000.0 if wd else w_start
                        words.append({"text": w, "start": round(w_start, 3), "end": round(w_end, 3)})
                        running = off + wd
                    if sentence_text:
                        start_s = start_ms / 1000.0
                        if words: end_s = words[-1]['end']
                        elif dur_ms: end_s = (start_ms + dur_ms) / 1000.0
                        else: end_s = start_s
                        if end_s < start_s: end_s = start_s
                        transcript_sentences.append({
                            "sentence_text": sentence_text,
                            "start": round(start_s, 3),
                            "end": round(end_s, 3),
                            "words": words,
                        })
                os.remove(json3_path)
                return transcript_sentences
            except Exception:
                pass
            finally:
                if os.path.exists(json3_path): os.remove(json3_path)

    srt_opts = json3_opts.copy()
    srt_opts['subtitlesformat'] = 'srt'
    with yt_dlp.YoutubeDL(srt_opts) as ydl:
        try:
            ydl.download([url])
        except Exception:
            return None
    
    subtitle_file = f'{video_id}.fr.srt'
    if not os.path.exists(subtitle_file): return None
    
    try:
        subs = pysrt.open(subtitle_file)
        transcript_sentences = []
        for sub in subs:
            start = sub.start.ordinal / 1000.0
            end = sub.end.ordinal / 1000.0
            sentence = sub.text.replace('\n', ' ').strip()
            transcript_sentences.append({
                "sentence_text": sentence,
                "start": round(start, 3),
                "end": round(end, 3)
            })
        os.remove(subtitle_file)
        return transcript_sentences
    except Exception:
        if os.path.exists(subtitle_file): os.remove(subtitle_file)
        return None

def process_single_video(line, output_path, processed_ids):
    try:
        data = json.loads(line)
        video_id = data.get('video_id')
        
        if not video_id or video_id in processed_ids:
            return "skipped"

        print(f"[INFO] Processing: {video_id}")
        transcript = download_transcript(video_id)
        
        if not transcript:
            print(f"[WARN] No transcript for {video_id}")
            return "failed"

        out_record = {
            "video_id": video_id,
            "title": data.get('video_title', 'N/A'),
            "channel": data.get('channel_name', 'N/A'),
            "category": data.get('category'),
            "movie_name": data.get('movie_name'),
            "language": "fr",
            "sentences": transcript
        }

        with file_lock:
            with open(output_path, 'a', encoding='utf-8') as outfile:
                outfile.write(json.dumps(out_record, ensure_ascii=False) + "\n")
        
        print(f"[SUCCESS] Saved: {video_id}")
        return "success"

    except Exception as e:
        print(f"[ERROR] Failed processing line: {e}")
        return "error"

def process_jsonl(input_path, output_path, max_workers=5):
    print(f"Starting Architected Processor (Workers: {max_workers})")
    
    # 1. Load Checkpoint (Optimized)
    processed_ids = set()
    if os.path.exists(output_path):
        print("Loading existing progress...")
        with open(output_path, 'r', encoding='utf-8') as f:
            for line in f:
                # Architect Optimization: Don't parse full JSON. Just find the ID.
                # This is 10x faster than json.loads() for large files.
                try:
                    idx = line.find('"video_id": "')
                    if idx != -1:
                        start = idx + 13  # len('"video_id": "')
                        end = line.find('"', start)
                        if end != -1:
                            vid = line[start:end]
                            processed_ids.add(vid)
                except:
                    pass
    print(f"Found {len(processed_ids)} already processed videos. Resuming...")

    # 2. Read Input
    with open(input_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # 3. Execute
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(process_single_video, line, output_path, processed_ids) for line in lines]
        
        completed = 0
        total = len(lines)
        for future in concurrent.futures.as_completed(futures):
            completed += 1
            if completed % 10 == 0:
                print(f"Progress: {completed}/{total} videos...")

    print("\n==== Processing Complete ====")

if __name__ == "__main__":
    import csv
    
    csv_file = 'Channels_Dataset.csv'
    
    try:
        with open(csv_file, mode='r', newline='', encoding='utf-8-sig') as f:
            channels = list(csv.DictReader(f))
            
        print(f"Found {len(channels)} channels in {csv_file}")
        
        for channel in channels:
            title = channel.get('Channel Title', '').strip()
            if not title:
                continue
                
            # Generic filenames based on channel title
            # Assuming main.py produced: {Title}_metadata.jsonl
            input_jsonl = f"{title}_metadata.jsonl"
            output_jsonl = f"{title}_transcripts.jsonl"
            
            # Check if input file exists before running
            if os.path.exists(input_jsonl):
                print(f"\nProcessing channel: {title}")
                print(f"Input: {input_jsonl}")
                print(f"Output: {output_jsonl}")
                process_jsonl(input_jsonl, output_jsonl, max_workers=5)
            else:
                print(f"\n[SKIP] Metadata file not found for {title}: {input_jsonl}")
                
    except FileNotFoundError:
        print(f"Error: {csv_file} not found.")
    except Exception as e:
        print(f"An error occurred: {e}")
