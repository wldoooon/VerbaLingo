from pydantic import BaseModel, Field
from typing import Literal

class StreamingData(BaseModel):
    """
    The data model for a single chunk in a streaming response.
    """
    type: Literal["chunk", "error", "end"] = Field(
        ..., description="The type of the event."
    )
    content: str = Field(
        ..., description="The content of the event, can be a text chunk, an error message, or a final metadata string."
    )
