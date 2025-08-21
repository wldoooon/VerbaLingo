from verbaLingo_agent.app.clients.agent_client import ollama_client
from verbaLingo_agent.app.schemas.generation import GenerationRequest, GenerationResponse
from typing import AsyncIterator

class GenerationService:
    """
    This service contains the core business logic for generating text.
    It orchestrates the clients and schemas.
    """
    async def process_generation(self, request: GenerationRequest) -> GenerationResponse:
        """Processes a generation request."""
        generated_text = await ollama_client.generate(
            model=request.model,
            prompt=request.prompt
        )

        response = GenerationResponse(
            text=generated_text,
            model_used=request.model
        )

        return response

    def process_generation_stream(self, request: GenerationRequest) -> AsyncIterator[str]:
        """Processes a generation request and streams the response."""
        return ollama_client.generate_stream(
            model=request.model,
            prompt=request.prompt
        )

generation_service = GenerationService()