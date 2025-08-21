import ollama
from verbaLingo_agent.app.core.config import settings
from typing import AsyncIterator

class OllamaClient:
    """
    An async client to interact with the Ollama API.
    This is the only part of the application that should directly communicate
    with the ollama library.
    """
    def __init__(self):
        try:
            self.client = ollama.AsyncClient(
                host=settings.OLLAMA_HOST,
                timeout=settings.OLLAMA_REQUEST_TIMEOUT
            )
        except Exception as e:
            print(f"FATAL: Could not initialize Ollama client. Error: {e}")
            raise

    async def health_check(self):
        """Checks if the client can connect to the Ollama server."""
        try:
            await self.client.ps()
        except Exception as e:
            print(f"FATAL: Could not connect to Ollama at {settings.OLLAMA_HOST}. Error: {e}")
            raise

    async def generate(self, model: str, prompt: str) -> str:
        """Generates a single response from the model."""
        try:
            response = await self.client.chat(
                model=model,
                messages=[{'role': 'user', 'content': prompt}]
            )
            return response['message']['content']
        except Exception as e:
            print(f"ERROR: Ollama API call failed. Error: {e}")
            raise

    async def generate_stream(self, model: str, prompt: str) -> AsyncIterator[str]:
        """Generates a streaming response from the model."""
        try:
            stream = await self.client.chat(
                model=model,
                messages=[{'role': 'user', 'content': prompt}],
                stream=True
            )
            async for chunk in stream:
                yield chunk['message']['content']
        except Exception as e:
            print(f"ERROR: Ollama API stream call failed. Error: {e}")
            raise

ollama_client = OllamaClient()