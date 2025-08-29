from pydantic import BaseModel, Field
from typing import Optional

class GenerationRequest(BaseModel):
    """
    The request model for the generation endpoint.
    Defines the data the client needs to send.
    """
    prompt: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="The text prompt to send to the language model."
    )
    model: str = Field(
        default="gemma3:4b",
        description="The name of the model to use for generation (e.g., 'gemma:2b', 'llama3')."
    )
    stream: bool = Field(
        default=False,
        description="Whether to stream the response back token by token."
    )

class GenerationResponse(BaseModel):
    """
    The response model for the generation endpoint.
    Defines the data the API will send back.
    """
    text: str = Field(description="The generated text from the language model.")
    model_used: str = Field(description="The name of the model that was used for generation.")
    request_id: Optional[str] = Field(
        default=None,
        description="A unique identifier for the request, useful for logging and tracing."
    )