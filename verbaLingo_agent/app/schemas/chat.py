from pydantic import BaseModel
from typing import List, Optional

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: Optional[str] = 'gemma2:9b'
    stream: Optional[bool] = True
    transcript: Optional[str] = None
