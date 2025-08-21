from pydantic import BaseModel
from typing import List

class SearchHit(BaseModel):
    video_id: str
    sentence_text: str
    start_time: float
    end_time: float
    position: int

class SearchResponse(BaseModel):
    total: int
    hits: List[SearchHit]


class TranscriptSentence(BaseModel):
    video_id: str
    sentence_text: str
    start_time: float
    end_time: float
    position: int

class TranscriptResponse(BaseModel):
    sentences: List[TranscriptSentence]

