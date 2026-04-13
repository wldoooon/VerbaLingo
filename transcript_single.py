import json
import yt_dlp
import pysrt
import os
import time
import random

# Optional dependencies
try:
    from yt_dlp.networking.impersonate import ImpersonateTarget  # type: ignore
except Exception:
    ImpersonateTarget = None

try:
    import requests
except Exception:
    requests = None


# ─────────────────────────────────────────────
# Internal helpers (unchanged from your original)
# ─────────────────────────────────────────────

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


def _parse_json3_events(events: list) -> list:
    """Parse raw json3 events into clean sentence+word-level transcript."""
    transcript_sentences = []
    for ev in events or []:
        start_ms = ev.get('tStartMs', 0)
        dur_ms = ev.get('dDurationMs', 0)
        segs = ev.get('segs', []) or []
        sentence_text = "".join(seg.get('utf8', '') for seg in segs).strip()
        words = []
        default_word_ms = (dur_ms // max(1, len(segs))) if (dur_ms and len(segs) > 0) else 0
        running = 0
        for seg in segs:
            w = (seg.get('utf8') or '').strip()
            if not w:
                continue
            off = seg.get('tOffsetMs') if seg.get('tOffsetMs') is not None else running
            wd = seg.get('dDurationMs') if seg.get('dDurationMs') is not None else default_word_ms
            w_start = (start_ms + off) / 1000.0
            w_end = (start_ms + off + wd) / 1000.0 if wd else w_start
            words.append({"text": w, "start": round(w_start, 3), "end": round(w_end, 3)})
            running = off + wd
        if sentence_text:
            start_s = start_ms / 1000.0
            if words:
                end_s = words[-1]['end']
            elif dur_ms:
                end_s = (start_ms + dur_ms) / 1000.0
            else:
                end_s = start_s
            if end_s < start_s:
                end_s = start_s
            transcript_sentences.append({
                "sentence_text": sentence_text,
                "start": round(start_s, 3),
                "end": round(end_s, 3),
                "words": words,
            })
    return transcript_sentences


def _direct_json3_from_info(info: dict, lang: str, headers: dict):
    """Try to fetch json3 directly from yt-dlp info dict without downloading a file."""
    for cc_kind in ('automatic_captions', 'subtitles'):
        cc = info.get(cc_kind) or {}
        # Try exact lang first, then lang prefix (e.g. 'fr' matches 'fr-FR')
        keys_to_try = [k for k in cc.keys() if k and (k == lang or k.startswith(lang))]
        for lang_key in keys_to_try:
            formats = cc.get(lang_key) or []
            candidates = [f for f in formats if f.get('ext') in ('json3', 'srv3') and f.get('url')]
            if not candidates:
                continue
            data = _fetch_json3_with_requests(candidates[0]['url'], headers=headers, attempts=3)
            if not data:
                continue
            result = _parse_json3_events(data.get('events', []))
            if result:
                return result
    return None


# ─────────────────────────────────────────────
# Main public function
# ─────────────────────────────────────────────

def get_transcript(video_id: str, lang: str = 'en') -> dict | None:
    """
    Scrape the transcript of a single YouTube video.

    Args:
        video_id: YouTube video ID (e.g. 'dQw4w9WgXcQ')
        lang:     Language code (e.g. 'en', 'fr', 'ar', 'es', 'de')
                  Falls back to auto-generated captions if manual subtitles
                  are not available.

    Returns:
        A dict with keys:
            video_id, language, sentences
        where each sentence has:
            sentence_text, start, end, words (list of {text, start, end})

        Returns None if no transcript found.
    """
    time.sleep(random.uniform(0.3, 0.8))  # polite delay

    url = f'https://www.youtube.com/watch?v={video_id}'
    headers = {
        'User-Agent': (
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
            'AppleWebKit/537.36 (KHTML, like Gecko) '
            'Chrome/120.0.0.0 Safari/537.36'
        )
    }

    ydl_opts = {
        'skip_download': True,
        'writesubtitles': True,
        'writeautomaticsub': True,
        'subtitleslangs': [lang],
        'subtitlesformat': 'json3',
        'outtmpl': f'/tmp/{video_id}.%(ext)s',
        'quiet': True,
        'no_warnings': True,
        'no_color': True,
        'extractor_retries': 3,
        'ignoreerrors': True,
        'http_headers': headers,
    }

    imp = _get_impersonate_target()
    if imp:
        ydl_opts['impersonate'] = imp

    sentences = None

    # ── Strategy 1: extract info and try direct json3 URL fetch ──
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)

        if info:
            sentences = _direct_json3_from_info(info, lang=lang, headers=headers)

            # ── Strategy 2: download the json3 file ──
            if not sentences:
                subs_info = info.get('requested_subtitles') or {}
                if any(k == lang or k.startswith(lang) for k in subs_info):
                    try:
                        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                            ydl.download([url])
                    except Exception:
                        pass

                    json3_path = f'/tmp/{video_id}.{lang}.json3'
                    # also try lang prefix variant
                    if not os.path.exists(json3_path):
                        for fname in os.listdir('/tmp'):
                            if fname.startswith(video_id) and fname.endswith('.json3'):
                                json3_path = f'/tmp/{fname}'
                                break

                    if os.path.exists(json3_path):
                        try:
                            with open(json3_path, 'r', encoding='utf-8') as f:
                                data = json.load(f)
                            sentences = _parse_json3_events(data.get('events', []))
                        except Exception:
                            pass
                        finally:
                            try:
                                os.remove(json3_path)
                            except Exception:
                                pass
    except Exception:
        pass

    # ── Strategy 3: fallback to SRT (no word-level timestamps) ──
    if not sentences:
        srt_opts = ydl_opts.copy()
        srt_opts['subtitlesformat'] = 'srt'
        srt_opts['outtmpl'] = f'/tmp/{video_id}.%(ext)s'

        try:
            with yt_dlp.YoutubeDL(srt_opts) as ydl:
                ydl.download([url])
        except Exception:
            pass

        # find the srt file (name may include lang variant like 'en-US')
        srt_path = None
        for fname in os.listdir('/tmp'):
            if fname.startswith(video_id) and fname.endswith('.srt'):
                srt_path = f'/tmp/{fname}'
                break

        if srt_path and os.path.exists(srt_path):
            try:
                subs = pysrt.open(srt_path)
                sentences = []
                for sub in subs:
                    text = sub.text.replace('\n', ' ').strip()
                    if text:
                        sentences.append({
                            "sentence_text": text,
                            "start": round(sub.start.ordinal / 1000.0, 3),
                            "end": round(sub.end.ordinal / 1000.0, 3),
                            "words": []  # SRT has no word-level data
                        })
            except Exception:
                sentences = None
            finally:
                try:
                    os.remove(srt_path)
                except Exception:
                    pass

    if not sentences:
        return None

    return {
        "video_id": video_id,
        "language": lang,
        "sentences": sentences,
    }


# ─────────────────────────────────────────────
# CLI usage
# ─────────────────────────────────────────────

if __name__ == "__main__":
    import sys

    # Usage: python transcript_single.py <video_id> [lang]
    # Examples:
    #   python transcript_single.py dQw4w9WgXcQ
    #   python transcript_single.py dQw4w9WgXcQ fr
    #   python transcript_single.py dQw4w9WgXcQ ar

    if len(sys.argv) < 2:
        print("Usage: python transcript_single.py <video_id> [lang]")
        print("  lang defaults to 'en' if not provided")
        print("")
        print("Examples:")
        print("  python transcript_single.py dQw4w9WgXcQ")
        print("  python transcript_single.py dQw4w9WgXcQ fr")
        print("  python transcript_single.py dQw4w9WgXcQ ar")
        sys.exit(1)

    video_id = sys.argv[1]
    lang = sys.argv[2] if len(sys.argv) >= 3 else 'en'

    print(f"[INFO] Fetching transcript for video_id='{video_id}' lang='{lang}'...")

    result = get_transcript(video_id, lang=lang)

    if result is None:
        print(f"[WARN] No transcript found for '{video_id}' in language '{lang}'")
        sys.exit(1)

    sentence_count = len(result['sentences'])
    has_words = any(s.get('words') for s in result['sentences'])

    print(f"[OK] Got {sentence_count} sentences | word-level timestamps: {has_words}")
    print("")
    print(json.dumps(result, ensure_ascii=False, indent=2))
