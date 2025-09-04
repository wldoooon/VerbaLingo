from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from verbaLingo_agent.app.schemas.generation import GenerationRequest, GenerationResponse
from verbaLingo_agent.app.schemas.chat import ChatRequest
from verbaLingo_agent.app.services.ollama_service import GenerationService
from verbaLingo_agent.app.dependencies import get_generation_service
from typing import AsyncGenerator

router = APIRouter()


@router.post("/generate", response_model=GenerationResponse,
             summary="Generate Text",
             description="Generate text from a prompt using a specified model. Set 'stream' to true for a streaming response.")
async def generate_text(
    request: GenerationRequest,
    service: GenerationService = Depends(get_generation_service)
):

    if request.stream:
        try:
            stream = service.process_generation_stream(request)
            return StreamingResponse(stream, media_type="text/event-stream")
        except Exception as e:
            print(f"ERROR: Generation stream failed. Error: {e}")
            raise HTTPException(status_code=500, detail="Failed to generate text from the model.")
    else:
        try:
            return await service.process_generation(request)
        except Exception as e:
            print(f"ERROR: Generation failed. Error: {e}")
            raise HTTPException(status_code=500, detail="Failed to generate text from the model.")


@router.post("/chat",
             summary="Generate Chat Response",
             description="Generate a response from a series of messages. Set 'stream' to true for a streaming response.")
async def chat_text(
    request: ChatRequest,
    service: GenerationService = Depends(get_generation_service)
):
    """
    This endpoint is specifically for conversational chat.
    It accepts a list of messages and streams back a response.
    """
    if not request.messages:
        raise HTTPException(status_code=400, detail="Messages list cannot be empty.")

    try:
        stream = service.process_chat_generation_stream(request)
        return StreamingResponse(stream, media_type="text/event-stream")
    except Exception as e:
        print(f"ERROR: Chat stream failed. Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate chat response from the model.")