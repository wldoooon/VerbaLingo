import json
from typing import AsyncGenerator
from verbaLingo_agent.app.clients.agent_client import OllamaClient
from verbaLingo_agent.app.schemas.generation import GenerationRequest
from verbaLingo_agent.app.schemas.streaming import StreamingData

class GenerationService:
    """
    This service contains the core business logic for generating text.
    It orchestrates the clients and schemas.
    """
    def __init__(self, ollama_client: OllamaClient):
        self.ollama_client = ollama_client

    async def process_generation_stream(
        self, request: GenerationRequest
    ) -> AsyncGenerator[str, None]:
        """
        Processes a generation request and streams the response as Server-Sent Events.
        This is the "adapter" that converts the raw Ollama stream into our standard format.
        """
        raw_stream_iterator = self.ollama_client.generate_stream(
            model=request.model, prompt=request.prompt
        )

        try:
            async for chunk in raw_stream_iterator:
                # 1. Create the structured data object
                data_event = StreamingData(type="chunk", content=chunk)
                
                # 2. Convert to JSON and format as SSE
                sse_formatted_event = f"data: {data_event.model_dump_json()}\n\n"
                
                # 3. Yield the event
                yield sse_formatted_event

        except Exception as e:
            # Handle potential errors during streaming
            error_event = StreamingData(type="error", content=str(e))
            sse_formatted_error = f"data: {error_event.model_dump_json()}\n\n"
            yield sse_formatted_error
        
        finally:
            # Signal the end of the stream
            end_event = StreamingData(type="end", content="Stream ended.")
            sse_formatted_end = f"data: {end_event.model_dump_json()}\n\n"
            yield sse_formatted_end