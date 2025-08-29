from fastapi import Depends, Request
from verbaLingo_agent.app.clients.agent_client import OllamaClient
from verbaLingo_agent.app.services.ollama_service import GenerationService

def get_ollama_client(request: Request) -> OllamaClient:
    """
    Dependency provider for the OllamaClient.

    It retrieves the singleton instance from the application state,
    which was created and health-checked during startup.
    """
    client = request.app.state.ollama_client
    if client is None:
        raise RuntimeError("Ollama client is not available in the application state.")
    return client

def get_generation_service(
    client: OllamaClient = Depends(get_ollama_client)
) -> GenerationService:
    """
    Dependency provider for the GenerationService.

    This function creates a new instance of the service for each request,
    injecting the singleton OllamaClient into it. This is the core of
    our dependency injection pattern.
    """
    return GenerationService(ollama_client=client)