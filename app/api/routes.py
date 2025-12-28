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
    q: str = Query(..., min_length=2),
    language: str = Query("english"),
    category: Optional[str] = Query(None),
    service: SearchService = Depends(get_search_service)
):
    raw_results = await service.search(q=q, language=language, category=category)

    hits: List[SearchHit] = []
    raw_hits = raw_results.get("hits", {}).get("hits", [])
    
    for hit in raw_hits:
        source = hit.get("_source", {})
        formatted = hit.get("_formatted", {})
        
        if not source.get("video_id"):
            continue
        
        category_title = source.get("category_title", "Unknown")
        category_type = source.get("category_type", "Cartoon")
        category_obj = Category(type=category_type, title=category_title)
        
        sentence_text = formatted.get("sentence_text", source.get("sentence_text", ""))
        start_time = source.get("start", 0.0)
        end_time = source.get("end_time", 0.0)
        
        words_data = source.get("words", [])
        words = [
            Word(text=w.get("text"), start=w.get("start"), end=w.get("end"))
            for w in words_data if isinstance(w, dict)
        ] if words_data else []

        transcript_sentence = TranscriptSentence(
            sentence_text=sentence_text,
            start_time=start_time,
            end_time=end_time,
            words=words,
            position=source.get("position")
        )
        
        search_hit = SearchHit(
            video_id=source.get("video_id"),
            title=source.get("video_title", ""),
            channel=source.get("channel", ""),
            category=category_obj,
            sentence_text=sentence_text,
            start_time=start_time,
            end_time=end_time,
            position=source.get("position"),
            transcript=[transcript_sentence] 
        )
        hits.append(search_hit)

    total = raw_results.get("hits", {}).get("total", {}).get("value", 0)

    aggregations = raw_results.get("aggregations", {})
    return SearchResponse(total=total, hits=hits, aggregations=aggregations)

@router.get("/videos/{video_id}/transcript", response_model=TranscriptResponse)
async def get_transcript(
    video_id: str,
    language: str = Query("english"),
    center_position: Optional[int] = Query(None),
    service: SearchService = Depends(get_search_service)
):
    raw_results = await service.get_transcript(video_id=video_id, language=language, center_position=center_position)

    sentences: List[TranscriptSentence] = []
    raw_hits = raw_results.get("hits", {}).get("hits", [])
    
    for hit in raw_hits:
        source = hit.get("_source", {})
        
        words_src = source.get("words", [])
        if isinstance(words_src, str):
            import json
            try:
                words_src = json.loads(words_src)
            except:
                words_src = []
                
        words = [
            Word(text=w.get("text"), start=w.get("start"), end=w.get("end"))
            for w in words_src if isinstance(w, dict)
        ]
        
        sentence = TranscriptSentence(
            sentence_text=source.get("sentence_text", ""),
            start_time=source.get("start", 0.0),
            end_time=source.get("end_time", 0.0),
            words=words,
            position=source.get("position")
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
    text: str = Query(..., min_length=1),
    source: str = Query("en"),
    target: str = Query("ar"),
    translator: TranslationService = Depends(get_translation_service)
):
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
    languages = translator.get_supported_languages()
    if not languages:
        raise HTTPException(status_code=503, detail="Translation service unavailable")
    return {"languages": languages}

@router.get("/translate/health")
async def translation_health(
    translator: TranslationService = Depends(get_translation_service)
):
    is_healthy = translator.health_check()
    if not is_healthy:
        raise HTTPException(status_code=503, detail="Translation service unavailable")
    return {"status": "healthy"}

from fastapi.responses import StreamingResponse
from app.services.groq_service import get_groq_service, GroqService
from pydantic import BaseModel

class CompletionRequest(BaseModel):
    prompt: str

@router.post("/completion")
async def completion(
    request: CompletionRequest,
    service: GroqService = Depends(get_groq_service)
):
    return StreamingResponse(
        service.get_completion_stream(request.prompt),
        media_type="text/plain"
    )