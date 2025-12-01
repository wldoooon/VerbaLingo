from fastapi import FastAPI
from contextlib import asynccontextmanager
import manticoresearch
from .core.config import get_settings
from .core.manticore_client import get_manticore_configuration
from .api.routes import router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.api_client = None
    app.state.search_api = None
    try:
        config = get_manticore_configuration()
        api_client = manticoresearch.ApiClient(config)
        app.state.api_client = api_client
        app.state.search_api = manticoresearch.SearchApi(api_client)
        app.state.utils_api = manticoresearch.UtilsApi(api_client)
        try:
            await app.state.utils_api.sql("SHOW STATUS LIKE 'uptime'")
            print(f"✓ Connected to Manticore at {settings.manticore_url}")
        except Exception as health_err:
            print(f"⚠ Manticore health check failed: {health_err}")
    except Exception as e:
        print(f"✗ Failed to initialize Manticore client: {e}")
    yield
    if app.state.api_client:
        await app.state.api_client.close()
        print("Manticore client closed")


app = FastAPI(
    title="Verbalingo API",
    description="Search API powered by Manticore Search",
    version="3.0.0",
    lifespan=lifespan
)

app.include_router(router)
