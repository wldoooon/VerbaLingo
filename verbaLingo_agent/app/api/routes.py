from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from verbaLingo_agent.app.schemas.generation import GenerationRequest, GenerationResponse
from verbaLingo_agent.app.services.ollama_service import GenerationService, generation_service
from typing import AsyncGenerator

router = APIRouter()

def get_generation_service() -> GenerationService:
    return generation_service

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
            return StreamingResponse(stream, media_type="text/plain")
        except Exception as e:
            print(f"ERROR: Generation stream failed. Error: {e}")
            raise HTTPException(status_code=500, detail="Failed to generate text from the model.")
    else:
        try:
            return await service.process_generation(request)
        except Exception as e:
            print(f"ERROR: Generation failed. Error: {e}")
            raise HTTPException(status_code=500, detail="Failed to generate text from the model.")