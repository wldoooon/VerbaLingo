from fastapi import FastAPI
import asyncio
from .core.config import get_settings
from contextlib import asynccontextmanager
from meilisearch import Client
from app.api.routes import router


settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.meili_client = None
    try: 
        client = Client(url=settings.MEILISEARCH_URL)
        health = await asyncio.to_thread(client.health)
        if health.get("status") != "available":
            raise ConnectionError("MeiliSearch health check failed.")
        app.state.meili_client = client
        print("Connected to MeiliSearch successfully.")
    except Exception as e:
        app.state.meili_client = None
        raise ConnectionError(f"An error occurred while connecting to MeiliSearch: {str(e)}")

    yield

    print("Shutting down the application...")
    if app.state.meili_client:
        app.state.meili_client = None
        print("MeiliSearch connection cleaned up.")


app = FastAPI(lifespan=lifespan)

app.include_router(router)





