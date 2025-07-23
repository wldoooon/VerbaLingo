from fastapi import APIRouter, Query, Depends, HTTPException
from typing import Optional, List

from app.dependencies import get_search_service
from app.services.search_service import SearchService
from app.schema import SearchHit, SearchResponse, TranscriptSentence, TranscriptResponse


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
    from_position: int = Query(0, ge=0, description="The starting position of the sentences to fetch."),
    size: int = Query(50, ge=1, le=100, description="The number of sentences to fetch."),
    service: SearchService = Depends(get_search_service)
):
    raw_results = await service.get_transcript_batch(
        video_id=video_id,
        from_position=from_position,
        size=size
    )

    sentences: List[TranscriptSentence] = []
    raw_hits = raw_results.get("hits", {}).get("hits", [])
    for hit in raw_hits:
        source = hit.get("_source", {})
        sentence = TranscriptSentence(
            video_id=source.get("video_id"),
            sentence_text=source.get("sentence_text"),
            start_time=source.get("start"),
            end_time=source.get("end"),
            position=source.get("position")
        )
        sentences.append(sentence)

    return TranscriptResponse(sentences=sentences)