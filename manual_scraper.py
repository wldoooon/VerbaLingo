import json
import yt_dlp
import pysrt
import os
import time
import re
import random

try:
    from yt_dlp.networking.impersonate import ImpersonateTarget
except Exception:
    ImpersonateTarget = None

try:
    import requests
except ImportError:
    requests = None

def _get_impersonate_target():
    if ImpersonateTarget is None: return None
    try: return ImpersonateTarget('chrome', '116', 'windows', '10')
    except: return None

def _sleep_backoff(attempt: int):
    base = 2.0 * (2 ** (attempt - 1))
    jitter = random.uniform(0.25, 0.75)
    time.sleep(base + jitter)

def _http_get_with_backoff(url: str, headers: dict, attempts: int = 6):
    """Fetch a URL with basic retry/backoff for YouTube rate limits."""
    if requests is None:
        raise RuntimeError("requests is not available")

    session = requests.Session()
    last_status = None
    last_text = None
    for i in range(1, attempts + 1):
        try:
            resp = session.get(url, headers=headers, timeout=20)
            last_status = resp.status_code
            if resp.status_code == 200:
                return resp

            # YouTube/Google rate limiting / transient edge errors
            if resp.status_code in (429, 500, 502, 503, 504):
                last_text = resp.text[:200] if getattr(resp, "text", None) else None
                _sleep_backoff(i)
                continue

            last_text = resp.text[:200] if getattr(resp, "text", None) else None
            return resp
        except Exception as e:
            last_text = str(e)
            _sleep_backoff(i)

    raise RuntimeError(f"HTTP failed after retries (last_status={last_status}, last={last_text})")

# --- RESTORED JSON3 PROCESSOR ---
def process_events(data):
    transcript_sentences = []
    for ev in data.get('events', []) or []:
        start_ms = ev.get('tStartMs', 0)
        dur_ms = ev.get('dDurationMs', 0)
        segs = ev.get('segs', []) or []
        sentence_text = "".join(seg.get('utf8', '') for seg in segs).strip()
        if sentence_text:
            start_s = start_ms / 1000.0
            if dur_ms:
                end_s = (start_ms + dur_ms) / 1000.0
            else:
                end_s = start_s
            if end_s < start_s: end_s = start_s
            transcript_sentences.append({
                "sentence_text": sentence_text,
                "start": round(start_s, 3),
                "end": round(end_s, 3),
            })
    return transcript_sentences

# --- NEW SRT PROCESSOR ---
def process_srt(file_path):
    print(f"⚙️ Parsing SRT: {file_path}")
    try:
        subs = pysrt.open(file_path)
    except Exception as e:
        print(f"❌ SRT Parsing Failed: {e}")
        return []

    transcript_sentences = []
    for sub in subs:
        start_s = sub.start.ordinal / 1000.0
        end_s = sub.end.ordinal / 1000.0
        text = sub.text.replace('\n', ' ').strip()
        transcript_sentences.append({
            "sentence_text": text,
            "start": round(start_s, 3),
            "end": round(end_s, 3),
        })
    return transcript_sentences

def _vtt_to_srt_file(vtt_path: str) -> str | None:
    """Best-effort VTT->SRT conversion for pysrt.

    Keeps cue text and timings; drops styling/settings.
    """
    try:
        with open(vtt_path, "r", encoding="utf-8", errors="ignore") as f:
            raw = f.read().splitlines()
    except Exception:
        return None

    out_lines: list[str] = []
    cue_index = 0
    i = 0

    def is_timestamp_line(line: str) -> bool:
        return "-->" in line

    while i < len(raw):
        line = raw[i].strip("\ufeff").rstrip()

        if not line:
            i += 1
            continue

        if line.startswith("WEBVTT"):
            i += 1
            continue

        if line.startswith("NOTE"):
            i += 1
            while i < len(raw) and raw[i].strip():
                i += 1
            continue

        if is_timestamp_line(line):
            cue_index += 1
            out_lines.append(str(cue_index))

            left, right = line.split("-->", 1)
            left = left.strip().replace(".", ",")
            right = right.strip()
            right = right.split()[0].replace(".", ",")
            out_lines.append(f"{left} --> {right}")

            i += 1
            while i < len(raw):
                text_line = raw[i].rstrip()
                if not text_line.strip():
                    break
                if re.match(r"^\d+$", text_line.strip()):
                    break
                if is_timestamp_line(text_line.strip()):
                    break
                out_lines.append(text_line)
                i += 1

            out_lines.append("")
            while i < len(raw) and not raw[i].strip():
                i += 1
            continue

        i += 1

    if not out_lines:
        return None

    srt_path = os.path.splitext(vtt_path)[0] + ".srt"
    try:
        with open(srt_path, "w", encoding="utf-8") as f:
            f.write("\n".join(out_lines).strip() + "\n")
        return srt_path
    except Exception:
        return None

def run_manual_sniper_srt(video_id):
    print(f"\n🎯 Targeting Video (SRT Mode): {video_id}")
    
    # 1. Fetch Metadata
    opts = {
        'skip_download': True,
        'writesubtitles': True, # Manual
        'writeautomaticsub': True, # Auto
        'subtitleslangs': ['all'], 
        'quiet': True,
        'no_warnings': True,
    }
    
    imp = _get_impersonate_target()
    if imp: opts['impersonate'] = imp

    url = f'https://www.youtube.com/watch?v={video_id}'
    found_tracks = []

    print("⏳ Fetching caption list...")
    with yt_dlp.YoutubeDL(opts) as ydl:
        try:
            info = ydl.extract_info(url, download=False)
        except Exception as e:
            print(f"❌ Error: {e}")
            return
        
        # Helper to extract available formats
        def check_formats(source, label):
            for lang, formats in source.items():
                # We prefer 'vtt' or 'srt' or 'srv1'
                for fmt in formats:
                    ext = fmt.get('ext')
                    if ext in ['vtt', 'json3', 'srt']:
                        track_url = fmt.get('url')
                        if not track_url:
                            continue
                        found_tracks.append({
                            "type": label,
                            "lang": lang,
                            "name": fmt.get('name', 'Unknown'),
                            "ext": ext,
                            "url": track_url,
                        })
                        # Break after finding one valid format per language to avoid duplicates
                        break

        check_formats(info.get('subtitles') or {}, "📝 Manual")
        check_formats(info.get('automatic_captions') or {}, "🤖 AI-Auto")

    # 2. Display Menu
    if not found_tracks:
        print("❌ No captions found.")
        return

    print(f"\n✅ Found {len(found_tracks)} tracks:")
    print("-" * 60)
    print(f"{'#':<4} | {'Type':<10} | {'Lang':<6} | {'Original Fmt'}")
    print("-" * 60)
    for i, track in enumerate(found_tracks):
        print(f"{i:<4} | {track['type']:<10} | {track['lang']:<6} | {track['ext']}")
    print("-" * 60)

    # 3. User Selection
    while True:
        try:
            selection = input("\n👉 Select track # (or 'q'): ")
            if selection.lower() == 'q': return
            idx = int(selection)
            if 0 <= idx < len(found_tracks):
                target = found_tracks[idx]
                break
        except: pass

    # 4. Download Manually (Bypass yt-dlp.download)
    print(f"\n📥 Downloading '{target['lang']}' from URL...")
    
    # We found the URL in step 1, let's use it directly!
    target_url = target.get('url')
    if not target_url:
        print("❌ valid URL not found in metadata.")
        return

    if requests is None:
        print("❌ 'requests' is not installed, can't fetch caption URL directly.")
        print("   Install it with: pip install requests")
        return

    # Use the same headers that beat 403 last time
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': url,
        'Origin': 'https://www.youtube.com',
    }

    try:
        resp = _http_get_with_backoff(target_url, headers=headers, attempts=6)
        if resp.status_code != 200:
            if resp.status_code == 429:
                print("❌ HTTP Error 429: rate-limited by YouTube/Google.")
                print("   Fix: wait a few minutes, reduce requests, or use cookies (logged-in session).")
                print(f"   Response: {resp.text[:120]}")
            else:
                print(f"❌ HTTP Error {resp.status_code}: {resp.text[:120]}")
            return
        
        # Save raw content to temp file
        temp_file = f"temp_{video_id}.{target['ext']}"
        with open(temp_file, "wb") as f:
            f.write(resp.content)
            
        # 5. Convert (if needed) & Process
        # If it's pure SRT, parse it.
        # If it's 'srv1', 'srv2', 'srv3', 'json3', we need to parse differently or ask yt-dlp to convert (but that might trigger ban).
        # For this test, let's hope it's a standard format like vtt/srt or that pysrt can handle it.
        # Note: pysrt natively only supports SRT.
        
        if target['ext'] == 'json3':
            try:
                data = resp.json()
            except Exception as e:
                print(f"❌ JSON3 parse failed: {e}")
                return
            clean_transcript = process_events(data)
        elif target['ext'] == 'vtt':
            srt_path = _vtt_to_srt_file(temp_file)
            if not srt_path:
                print("❌ VTT conversion failed.")
                return
            try:
                clean_transcript = process_srt(srt_path)
            finally:
                try:
                    os.remove(srt_path)
                except Exception:
                    pass
        elif target['ext'] == 'srt':
            clean_transcript = process_srt(temp_file)
        else:
            print(f"❌ Format {target['ext']} not supported by this simple script yet.")
            return

    except Exception as e:
        print(f"❌ Manual Download Failed: {e}")
        return

    expected_filename = temp_file # For cleanup

    # 5. Process
    if not os.path.exists(expected_filename):
        # Sometimes header/auto-subs have slightly different naming (e.g. en-orig)
        # Check current dir for any .srt file
        print("⚠️ Exact match file not found. Searching directory...")
        for f in os.listdir("."):
            if f.startswith(f"temp_{video_id}") and f.endswith(".srt"):
                expected_filename = f
                break
        else:
            print("❌ Start file was not created.")
            return

    if target['ext'] == 'srt':
        clean_transcript = process_srt(expected_filename)
    
    # 6. Save & Cleanup
    filename = f"transcript_{video_id}_{target['lang']}.json"
    final_output = {
        "video_id": video_id,
        "language": target['lang'],
        "type": target['type'],
        "transcript": clean_transcript
    }
    
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(final_output, f, ensure_ascii=False, indent=2)
    
    # Delete temp download
    try:
        os.remove(expected_filename)
    except Exception:
        pass
    
    print(f"\n✅ SUCCESS! Saved to: {filename}")
    print(f"   Captured {len(clean_transcript)} sentences.")

if __name__ == "__main__":
    TARGET_ID = input("Enter YouTube Video ID: ").strip()
    if TARGET_ID:
        run_manual_sniper_srt(TARGET_ID)
