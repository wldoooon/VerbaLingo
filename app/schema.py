from pydantic import BaseModel
from typing import List, Optional

class Category(BaseModel):
    """Category object structure."""
    type: str  # e.g., "Cartoon"
    title: str  # e.g., "SpongeBob"

class Word(BaseModel):
    text: str
    start: float
    end: float

class SearchHit(BaseModel):
    video_id: str
    sentence_text: Optional[str] = None
    start_time: Optional[float] = None
    end_time: Optional[float] = None
    category: Optional[Category] = None
    position: Optional[int] = None

class SearchResponse(BaseModel):
    total: int
    hits: List[SearchHit]

class TranscriptSentence(BaseModel):
    sentence_text: str
    start_time: float
    end_time: float
    words: List[Word] = []
    position: Optional[int] = None

class TranscriptResponse(BaseModel):
    video_id: str
    start_time: float
    end_time: float
    sentences: List[TranscriptSentence]