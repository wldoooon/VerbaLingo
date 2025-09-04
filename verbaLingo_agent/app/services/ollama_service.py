import json
from typing import AsyncGenerator
from verbaLingo_agent.app.clients.agent_client import OllamaClient
from verbaLingo_agent.app.schemas.chat import ChatRequest
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

    async def process_generation(self, request: GenerationRequest):
        """
        Processes a generation request and returns the complete response.
        """
        return await self.ollama_client.generate(
            model=request.model, prompt=request.prompt
        )

    async def process_chat_generation_stream(
        self, request: ChatRequest
    ) -> AsyncGenerator[str, None]:
        """
        Processes a chat request, constructs a prompt from the last message,
        and streams the response in the Vercel AI SDK Data Protocol format.
        """
        # For now, we'll use the content of the last message as the prompt.
        # In Phase 3, we will enhance this to be context-aware.
        last_message = request.messages[-1].content if request.messages else ""
        
        # Here we will add the context logic later.
        if request.transcript:
            # Basic prompt engineering for context-awareness
            prompt = f"""You are a helpful AI assistant for VerbaLingo.
            A user is watching a video with the following transcript:
            ---
            TRANSCRIPT:
            {request.transcript}
            ---
            Based on that transcript, please answer the user's question.
            
            USER'S QUESTION: {last_message}
            """
        else:
            prompt = last_message

        raw_stream_iterator = self.ollama_client.generate_stream(
            model=request.model, prompt=prompt
        )

        # Unique ID for this text stream
        id = f"chatcmpl-{(prompt[:10] + str(request.model)).encode('utf-8').hex()}"

        try:
            # Yield the initial 'text-start' event
            start_event = {"type": "text-start", "id": id}
            yield f"data: {json.dumps(start_event)}\\n\\n"

            async for chunk in raw_stream_iterator:
                if chunk:
                    # Format the chunk into a 'text-delta' event
                    delta_event = {"type": "text-delta", "id": id, "delta": chunk}
                    yield f"data: {json.dumps(delta_event)}\\n\\n"

        except Exception as e:
            print(f"[CHAT_STREAM_ERROR] {e}")
            error_event = {"type": "error", "error": str(e)}
            yield f"data: {json.dumps(error_event)}\\n\\n"
        
        finally:
            # Yield the final 'text-end' event
            end_event = {"type": "text-end", "id": id}
            yield f"data: {json.dumps(end_event)}\\n\\n"
            # Signal the end of the entire stream to the SDK
            yield "data: [DONE]\\n\\n"