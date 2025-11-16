from fastapi import APIRouter, Query, Depends, HTTPException
from typing import Optional, List

from app.dependencies import get_search_service
from app.services.search_service import SearchService
from app.services.translation_service import get_translation_service, TranslationService
from app.schema import SearchHit, SearchResponse, TranscriptSentence, TranscriptResponse, Word, Category


router = APIRouter(
    prefix="/api/v1",
    tags=["Search"]
)


@router.get("/search", response_model=SearchResponse)
async def search(
    q: str = Query(..., min_length=2, description="The search query text"),
    category: Optional[str] = Query(None, description="Filter result by a specific category."),
    service: SearchService = Depends(get_search_service)
):
    raw_results = await service.search(q=q, category=category)

    hits: List[SearchHit] = []
    raw_hits = raw_results.get("hits", {}).get("hits", [])
    for hit in raw_hits:
        source = hit.get("_source", {})
        formatted = hit.get("_formatted", {})
        
        # Skip if no video_id (invalid document)
        if not source.get("video_id"):
            continue
        
        # Handle category object structure
        category_obj = None
        if "category" in source and source["category"] is not None:
            if isinstance(source["category"], dict):
                category_obj = Category(
                    type=source["category"].get("type", ""),
                    title=source["category"].get("title", "")
                )
        
        # Extract sentence data - handle both flattened and nested structures
        sentence_text = source.get("sentence_text")
        start_time = source.get("start")
        end_time = source.get("end")
        words = None
        
        # Check if top-level sentence_text exists and has highlighting (matched)
        formatted_sentence_text = formatted.get("sentence_text")
        if formatted_sentence_text and isinstance(formatted_sentence_text, str) and "<em>" in formatted_sentence_text:
            # Top-level sentence matched - use it
            sentence_text = source.get("sentence_text")
            start_time = source.get("start")
            end_time = source.get("end")
            if "words" in source and source["words"]:
                words = [
                    Word(text=w.get("text"), start=w.get("start"), end=w.get("end"))
                    for w in source["words"] if isinstance(w, dict)
                ]
        elif "sentences" in source and isinstance(source["sentences"], list):
            # Check nested sentences array for matches using highlighting
            formatted_sentences = formatted.get("sentences", [])
            matched_sentence = None
            
            # Find the sentence that has highlighting (contains <em> tags)
            if isinstance(formatted_sentences, list):
                for idx, formatted_sent in enumerate(formatted_sentences):
                    if isinstance(formatted_sent, dict):
                        sent_text = formatted_sent.get("sentence_text")
                        if isinstance(sent_text, str) and "<em>" in sent_text:
                            # Found the matched sentence - get its data from source
                            if idx < len(source["sentences"]):
                                matched_sentence = source["sentences"][idx]
                                break
            
            # If we found a matched sentence, use it; otherwise fall back to first sentence
            if matched_sentence and isinstance(matched_sentence, dict):
                sentence_text = matched_sentence.get("sentence_text")
                start_time = matched_sentence.get("start")
                end_time = matched_sentence.get("end")
                if "words" in matched_sentence and matched_sentence["words"]:
                    words = [
                        Word(text=w.get("text"), start=w.get("start"), end=w.get("end"))
                        for w in matched_sentence["words"] if isinstance(w, dict)
                    ]
            elif source["sentences"] and len(source["sentences"]) > 0:
                # Fallback: use first sentence if no match found via highlighting
                first_sentence = source["sentences"][0]
                if isinstance(first_sentence, dict):
                    sentence_text = first_sentence.get("sentence_text")
                    start_time = first_sentence.get("start")
                    end_time = first_sentence.get("end")
                    if "words" in first_sentence and first_sentence["words"]:
                        words = [
                            Word(text=w.get("text"), start=w.get("start"), end=w.get("end"))
                            for w in first_sentence["words"] if isinstance(w, dict)
                        ]
        
        search_hit = SearchHit(
            video_id=source.get("video_id"),
            sentence_text=sentence_text,
            start_time=start_time,
            end_time=end_time,
            title=source.get("title"),
            channel=source.get("channel"),
            category=category_obj,
            language=source.get("language"),
            words=words
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