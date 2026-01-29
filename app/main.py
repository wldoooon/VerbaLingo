from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from contextlib import asynccontextmanager
import manticoresearch

from .core.config import get_settings
from .core.manticore_client import get_manticore_configuration
from .core.limiter import limiter
from .api.routes import router
from .api.v1.auth import router as auth_router

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

# Rate limiting setup
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 1. CORS Middleware - Required for Next.js to talk to the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Session Middleware - Required for OAuth state management
# Authlib stores the 'state' parameter in session to prevent CSRF attacks
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

app.include_router(auth_router)
app.include_router(router)
