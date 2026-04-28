import html
import httpx
import asyncio
from typing import List
import logging

logger = logging.getLogger(__name__)

GOOGLE_API_KEY = "AIzaSyATBXajvzQLTDHEQbcpq0Ihe0vWDHmO520"
SEPARATOR = " ||| "
ENDPOINT_B_CHAR_LIMIT = 4500


class TranslationService:
    # Shared persistent client — one TCP+TLS connection reused across all requests.
    # Saves ~150ms per call vs creating a new client every time.
    _client: httpx.AsyncClient | None = None

    @classmethod
    def get_client(cls) -> httpx.AsyncClient:
        if cls._client is None or cls._client.is_closed:
            cls._client = httpx.AsyncClient(timeout=10.0, http2=True)
        return cls._client

    @classmethod
    async def close(cls) -> None:
        if cls._client and not cls._client.is_closed:
            await cls._client.aclose()
            cls._client = None

    async def translate_batch(
        self,
        sentences: List[str],
        target_lang: str,
        source_lang: str = "auto",
    ) -> List[str]:
        if not sentences:
            return []

        joined = SEPARATOR.join(sentences)

        # Endpoint A — fastest, best quality, no rate limits
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

        # Endpoint B — chunked to respect 5000 char limit, still one round-trip per chunk
        try:
            return await self._endpoint_b_chunked(sentences, target_lang, source_lang)
        except Exception as e:
            logger.warning(f"Endpoint B failed ({e}). Translating individually.")

        # Last resort — all sentences in parallel, not sequential
        return await self._parallel_fallback(sentences, target_lang, source_lang)

    async def _parallel_fallback(
        self, sentences: List[str], target_lang: str, source_lang: str
    ) -> List[str]:
        """Translate all sentences concurrently instead of one-by-one."""
        async def translate_one(sentence: str) -> str:
            try:
                return await self._endpoint_a(sentence, target_lang, source_lang)
            except Exception:
                try:
                    return await self._endpoint_b_single(sentence, target_lang, source_lang)
                except Exception:
                    return sentence  # return original if everything fails

        return list(await asyncio.gather(*[translate_one(s) for s in sentences]))

    async def _endpoint_b_chunked(
        self, sentences: List[str], target_lang: str, source_lang: str
    ) -> List[str]:
        """
        Split sentences into chunks under ENDPOINT_B_CHAR_LIMIT, translate each chunk,
        then reassemble. Chunks that fit in one request are still a single round-trip.
        """
        chunks: List[List[str]] = []
        current_chunk: List[str] = []
        current_len = 0

        for s in sentences:
            # +len(SEPARATOR) accounts for the separator between sentences
            addition = len(s) + (len(SEPARATOR) if current_chunk else 0)
            if current_len + addition > ENDPOINT_B_CHAR_LIMIT and current_chunk:
                chunks.append(current_chunk)
                current_chunk = [s]
                current_len = len(s)
            else:
                current_chunk.append(s)
                current_len += addition

        if current_chunk:
            chunks.append(current_chunk)

        # Translate all chunks in parallel
        chunk_results = await asyncio.gather(
            *[self._translate_chunk_b(chunk, target_lang, source_lang) for chunk in chunks]
        )

        # Flatten back to a flat list matching the original sentence order
        results: List[str] = []
        for chunk, translations in zip(chunks, chunk_results):
            if len(translations) == len(chunk):
                results.extend(translations)
            else:
                # Separator mangled in this chunk — fall back per-sentence for this chunk only
                logger.warning(
                    f"Endpoint B chunk separator mismatch ({len(chunk)} sentences, {len(translations)} parts). "
                    "Falling back individually for this chunk."
                )
                chunk_fallback = await asyncio.gather(
                    *[self._translate_one_b_safe(s, target_lang, source_lang) for s in chunk]
                )
                results.extend(chunk_fallback)

        return results

    async def _translate_chunk_b(
        self, sentences: List[str], target_lang: str, source_lang: str
    ) -> List[str]:
        joined = SEPARATOR.join(sentences)
        translated = await self._endpoint_b_single(joined, target_lang, source_lang)
        return [p.strip() for p in translated.split(SEPARATOR)]

    async def _translate_one_b_safe(self, sentence: str, target_lang: str, source_lang: str) -> str:
        try:
            return await self._endpoint_b_single(sentence, target_lang, source_lang)
        except Exception:
            return sentence

    async def _endpoint_a(self, text: str, target_lang: str, source_lang: str = "auto") -> str:
        """translate-pa.googleapis.com — ~40ms, no rate limits, requires HTML unescape."""
        client = self.get_client()
        res = await client.post(
            "https://translate-pa.googleapis.com/v1/translateHtml",
            headers={
                "Content-Type": "application/json+protobuf",
                "X-Goog-API-Key": GOOGLE_API_KEY,
            },
            json=[[[text], source_lang, target_lang], "wt_lib"],
        )
        res.raise_for_status()
        data = res.json()
        return html.unescape(data[0][0])

    async def _endpoint_b_single(self, text: str, target_lang: str, source_lang: str = "auto") -> str:
        """translate.googleapis.com — no auth, join all chunks, ~400 req before IP block."""
        client = self.get_client()
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
        )
        res.raise_for_status()
        data = res.json()
        return "".join(chunk[0] for chunk in data[0] if chunk[0])


_translation_service: TranslationService | None = None


def get_translation_service() -> TranslationService:
    global _translation_service
    if _translation_service is None:
        _translation_service = TranslationService()
    return _translation_service
