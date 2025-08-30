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
        Processes a generation request and streams the response as Server-Sent Events
        in the Vercel AI SDK Data Protocol format.
        """
        raw_stream_iterator = self.ollama_client.generate_stream(
            model=request.model, prompt=request.prompt
        )

        # Unique ID for this text stream
        id = f"chatcmpl-{(request.prompt[:10] + str(request.model)).encode('utf-8').hex()}"

        try:
            # Yield the initial 'text-start' event
            start_event = {"type": "text-start", "id": id}
            yield f"data: {json.dumps(start_event)}\n\n"

            async for chunk in raw_stream_iterator:
                # --- DEBUG LINE ---
                print(f"RAW CHUNK FROM OLLAMA: {chunk}")
                # ------------------

                if chunk:
                    # Format the chunk into a 'text-delta' event
                    delta_event = {"type": "text-delta", "id": id, "delta": chunk}
                    yield f"data: {json.dumps(delta_event)}\n\n"

        except Exception as e:
            print(f"[STREAM_ERROR] {e}")
            error_event = {"type": "error", "error": str(e)}
            yield f"data: {json.dumps(error_event)}\n\n"
        
        finally:
            # Yield the final 'text-end' event
            end_event = {"type": "text-end", "id": id}
            yield f"data: {json.dumps(end_event)}\n\n"
            # Signal the end of the entire stream to the SDK
            yield "data: [DONE]\n\n"