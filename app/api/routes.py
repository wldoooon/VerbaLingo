from fastapi import APIRouter, Query, Depends, HTTPException
from typing import Optional, List

from app.dependencies import get_search_service
from app.services.search_service import SearchService
from app.services.translation_service import get_translation_service, TranslationService
from app.schema import SearchHit, SearchResponse, TranscriptSentence, TranscriptResponse, Word


router = APIRouter(
    prefix="/api/v1",
    tags=["Search"]
)


@router.get("/search", response_model=SearchResponse)
async def search(
    q: str = Query(..., min_length=2, description="The search query text"),
    category: Optional[str] = Query(None, description="Filter result by a specific category."),
    randomize: bool = Query(True, description="Randomize the order of search results"),
    service: SearchService = Depends(get_search_service)
):
    raw_results = await service.search(q=q, category=category, randomize=randomize)

    hits: List[SearchHit] = []
    raw_hits = raw_results.get("hits", {}).get("hits", [])
    for hit in raw_hits:
        source = hit.get("_source", {})
        search_hit = SearchHit(
            video_id=source.get("video_id"),
            sentence_text=source.get("sentence_text"),
            start_time=source.get("start"),
            end_time=source.get("end"),
            position=source.get("position"),
        )
        hits.append(search_hit)

    total = raw_results.get("hits", {}).get("total", {}).get("value", 0)

    return SearchResponse(total=total, hits=hits)


@router.get("/videos/{video_id}/transcript", response_model=TranscriptResponse)
async def get_transcript(
    video_id: str,
    service: SearchService = Depends(get_search_service)
):
    raw_results = await service.get_full_transcript(
        video_id=video_id,
    )

    sentences: List[TranscriptSentence] = []
    raw_hits = raw_results.get("hits", {}).get("hits", [])
    for hit in raw_hits:
        source = hit.get("_source", {})
        words_src = source.get("words") or []
        words = [
            Word(text=w.get("text"), start=w.get("start"), end=w.get("end"))
            for w in words_src if isinstance(w, dict)
        ]
        sentence = TranscriptSentence(
            sentence_text=source.get("sentence_text"),
            start_time=source.get("start"),
            end_time=source.get("end"),
            words=words
        )
        sentences.append(sentence)

    if not sentences:
        raise HTTPException(status_code=404, detail="Transcript not found")

    video_start_time = sentences[0].start_time
    video_end_time = sentences[-1].end_time

    return TranscriptResponse(
        video_id=video_id,
        start_time=video_start_time,
        end_time=video_end_time,
        sentences=sentences
    )


@router.get("/translate")
async def translate_text(
    text: str = Query(..., min_length=1, description="Text to translate"),
    source: str = Query("en", description="Source language code (e.g., 'en', 'fr')"),
    target: str = Query("ar", description="Target language code (e.g., 'ar', 'es')"),
    translator: TranslationService = Depends(get_translation_service)
):
    """
    Translate a single text using LibreTranslate
    
    Example: /api/v1/translate?text=Hello&source=en&target=ar
    """
    translated = translator.translate_text(text, source, target)
    if translated is None:
        raise HTTPException(status_code=500, detail="Translation failed")
    
    return {
        "original": text,
        "translated": translated,
        "source": source,
        "target": target
    }


@router.get("/translate/languages")
async def get_supported_languages(
    translator: TranslationService = Depends(get_translation_service)
):
    """Get list of supported languages from LibreTranslate"""
    languages = translator.get_supported_languages()
    if not languages:
        raise HTTPException(status_code=503, detail="Translation service unavailable")
    return {"languages": languages}


@router.get("/translate/health")
async def translation_health(
    translator: TranslationService = Depends(get_translation_service)
):
    """Check if translation service is healthy"""
    is_healthy = translator.health_check()
    if not is_healthy:
        raise HTTPException(status_code=503, detail="Translation service unavailable")
    return {"status": "healthy"}