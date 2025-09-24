from fastapi import FastAPI
import asyncio
from .core.config import get_settings
from contextlib import asynccontextmanager
from meilisearch_python_sdk import AsyncClient
from .api.routes import router

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.meili_client = None
    try:
        client_config = {"url": settings.MEILISEARCH_URL}
        if settings.MEILISEARCH_API_KEY:
            client_config["api_key"] = settings.MEILISEARCH_API_KEY
        
        client = AsyncClient(**client_config)
        
        health = await client.health()
        if health == "status='available'":
            raise ConnectionError("MeiliSearch health check failed.")
        
        app.state.meili_client = client
        print(f"Connected to MeiliSearch at {settings.MEILISEARCH_URL}")
        
    except Exception as e:
        app.state.meili_client = None
        print(f"Failed to connect to MeiliSearch: {str(e)}")
        raise

    yield

    print("Shutting down the application...")
    if app.state.meili_client:
        app.state.meili_client = None
        print("MeiliSearch connection cleaned up.")


app = FastAPI(lifespan=lifespan)

app.include_router(router)





