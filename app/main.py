from fastapi import FastAPI
from contextlib import asynccontextmanager
import manticoresearch
from .core.config import get_settings
from .core.manticore_client import get_manticore_configuration
from .api.routes import router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage Manticore Search client lifecycle.
    
    Creates async API client on startup, cleans up on shutdown.
    """
    app.state.api_client = None
    app.state.search_api = None
    
    try:
        # Create the API client configuration
        config = get_manticore_configuration()
        
        # Create the async API client
        api_client = manticoresearch.ApiClient(config)
        app.state.api_client = api_client
        
        # Create API instances
        app.state.search_api = manticoresearch.SearchApi(api_client)
        app.state.utils_api = manticoresearch.UtilsApi(api_client)
        
        # Health check - try to get server status
        try:
            status = await app.state.utils_api.sql("SHOW STATUS LIKE 'uptime'")
            print(f"✓ Connected to Manticore at {settings.manticore_url}")
        except Exception as health_err:
            print(f"⚠ Manticore health check failed: {health_err}")
            # Don't raise - allow app to start even if Manticore is down temporarily
        
    except Exception as e:
        print(f"✗ Failed to initialize Manticore client: {e}")
        # We don't raise to allow app to start

    yield

    # Cleanup on shutdown
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
