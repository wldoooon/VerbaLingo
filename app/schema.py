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
    sentence_text: str
    start_time: float
    end_time: float

class TranscriptResponse(BaseModel):
    video_id: str
    start_time: float
    end_time: float
    sentences: List[TranscriptSentence]