from fastapi import APIRouter, Query, Depends, HTTPException, Request, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List

from .deps import get_search_service, get_current_user_optional, get_groq_service
from ..services.search_service import SearchService
from ..services.groq_service import GroqService
from ..schemas.search import SearchHit, SearchResponse, TranscriptSentence, TranscriptResponse, Word, Category
from ..core.limiter import feature_rate_limit
from ..models.user import User

router = APIRouter(
    prefix="/api/v1",
    tags=["Search"]
)

class CompletionRequest(BaseModel):
    prompt: str

@router.post("/completion")
async def completion(
    request: CompletionRequest,
    groq: GroqService = Depends(get_groq_service)
):
    """
    Direct link to the AI Brain.
    Streams tokens directly to the UI.
    """
    return StreamingResponse(
        groq.get_completion_stream(request.prompt),
        media_type="text/event-stream"
    )


@router.get("/search", response_model=SearchResponse)
@feature_rate_limit("search")
async def search(
    request: Request,
    response: Response,
    q: str = Query(..., min_length=2),
    language: str = Query("english"),
    category: Optional[str] = Query(None),
    sub_category: Optional[str] = Query(None),
    # Optional auth: sets request.state.user for rate limiter
    current_user: Optional[User] = Depends(get_current_user_optional),
    service: SearchService = Depends(get_search_service)
):
    raw_results = await service.search(q=q, language=language, category=category, sub_category=sub_category)

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
@feature_rate_limit("search")
async def get_transcript(
    request: Request,
    response: Response,
    video_id: str,
    language: str = Query("english"),
    center_position: Optional[int] = Query(None),
    # Optional auth: sets request.state.user for rate limiter
    current_user: Optional[User] = Depends(get_current_user_optional),
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
