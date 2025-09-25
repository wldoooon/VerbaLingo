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

class Word(BaseModel):
    text: str
    start: float
    end: float


class TranscriptSentence(BaseModel):
    sentence_text: str
    start_time: float
    end_time: float
    words: List[Word] = []

class TranscriptResponse(BaseModel):
    video_id: str
    start_time: float
    end_time: float
    sentences: List[TranscriptSentence]