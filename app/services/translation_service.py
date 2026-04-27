import html
import httpx
from typing import List
import logging

logger = logging.getLogger(__name__)

GOOGLE_API_KEY = "AIzaSyATBXajvzQLTDHEQbcpq0Ihe0vWDHmO520"
SEPARATOR = " ||| "


class TranslationService:

    async def translate_batch(
        self,
        sentences: List[str],
        target_lang: str,
        source_lang: str = "auto",
    ) -> List[str]:
        """
        Translate a list of sentences in one API call using the separator trick.
        Waterfall: Endpoint A → Endpoint B → per-sentence fallback.
        If the separator gets mangled by either endpoint, falls back to individual translation.
        """
        if not sentences:
            return []

        joined = SEPARATOR.join(sentences)

        # --- Endpoint A (translate-pa) — fastest, best quality, no observed rate limits ---
        try:
            translated_joined = await self._endpoint_a(joined, target_lang, source_lang)
            parts = translated_joined.split(SEPARATOR)
            if len(parts) == len(sentences):
                return [p.strip() for p in parts]
            logger.warning(
                f"Endpoint A separator mismatch: expected {len(sentences)}, got {len(parts)}. Falling back to B."
            )
        except Exception as e:
            logger.warning(f"Endpoint A failed ({e}). Falling back to B.")

        # --- Endpoint B (translate_a/single) — reliable fallback, no auth required ---
        try:
            translated_joined = await self._endpoint_b(joined, target_lang, source_lang)
            parts = translated_joined.split(SEPARATOR)
            if len(parts) == len(sentences):
                return [p.strip() for p in parts]
            logger.warning(
                f"Endpoint B separator mismatch: expected {len(sentences)}, got {len(parts)}. Translating individually."
            )
        except Exception as e:
            logger.warning(f"Endpoint B failed ({e}). Translating individually.")

        # --- Last resort: translate one sentence at a time ---
        results = []
        for sentence in sentences:
            try:
                results.append(await self._endpoint_a(sentence, target_lang, source_lang))
            except Exception:
                try:
                    results.append(await self._endpoint_b(sentence, target_lang, source_lang))
                except Exception:
                    results.append(sentence)  # return original if everything fails
        return results

    async def _endpoint_a(self, text: str, target_lang: str, source_lang: str = "auto") -> str:
        """translate-pa.googleapis.com — ~40ms, no rate limits, requires HTML unescape."""
        async with httpx.AsyncClient() as client:
            res = await client.post(
                "https://translate-pa.googleapis.com/v1/translateHtml",
                headers={
                    "Content-Type": "application/json+protobuf",
                    "X-Goog-API-Key": GOOGLE_API_KEY,
                },
                json=[[[text], source_lang, target_lang], "wt_lib"],
                timeout=10.0,
            )
            res.raise_for_status()
            data = res.json()
            return html.unescape(data[0][0])

    async def _endpoint_b(self, text: str, target_lang: str, source_lang: str = "auto") -> str:
        """translate.googleapis.com — no auth, join all chunks, ~400 req before IP block."""
        async with httpx.AsyncClient() as client:
            res = await client.get(
                "https://translate.googleapis.com/translate_a/single",
                params={
                    "client": "gtx",
                    "dt": "t",
                    "sl": source_lang,
                    "tl": target_lang,
                    "q": text,
                },
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                },
                timeout=10.0,
            )
            res.raise_for_status()
            data = res.json()
            # Always join all chunks — Google splits long text at punctuation
            return "".join(chunk[0] for chunk in data[0] if chunk[0])


_translation_service: TranslationService | None = None


def get_translation_service() -> TranslationService:
    global _translation_service
    if _translation_service is None:
        _translation_service = TranslationService()
    return _translation_service
