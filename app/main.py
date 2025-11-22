from fastapi import FastAPI
from contextlib import asynccontextmanager
from .core.config import get_settings
from .core.typesense_client import get_typesense_client
from .api.routes import router

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.typesense_client = None
    try:
        client = get_typesense_client()
        health = client.operations.is_healthy()
        
        if not health:
            raise ConnectionError("Typesense health check failed.")
        
        app.state.typesense_client = client
        print(f"Connected to Typesense at {settings.TYPESENSE_HOST}:{settings.TYPESENSE_PORT}")
        
    except Exception as e:
        app.state.typesense_client = None
        print(f"Failed to connect to Typesense: {str(e)}")
        raise

    yield

    if app.state.typesense_client:
        app.state.typesense_client = None

app = FastAPI(
    title="MiniYouGlish API",
    description="Search API powered by Typesense",
    version="2.0.0",
    lifespan=lifespan
)

app.include_router(router)
