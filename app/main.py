from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from contextlib import asynccontextmanager
import manticoresearch
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from .core.redis import redis_client
from .services.usage_service import sync_all_dirty_users

from .core.config import get_settings
from .core.manticore_client import get_manticore_configuration
from .core.limiter import limiter
from .core.logging import logger, setup_logging
from .api.routes import router
from .api.auth import router as auth_router
from .db.init_db import init_db

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize logging first
    setup_logging()
    
    app.state.api_client = None
    app.state.search_api = None
    
    # 1. Initialize Database Tables
    try:
        await init_db()
    except Exception as db_err:
        logger.error(f"Database initialization failed: {db_err}")
    
    # 2. Initialize Manticore Search Client
    try:
        config = get_manticore_configuration()
        api_client = manticoresearch.ApiClient(config)
        app.state.api_client = api_client
        app.state.search_api = manticoresearch.SearchApi(api_client)
        app.state.utils_api = manticoresearch.UtilsApi(api_client)
        try:
            await app.state.utils_api.sql("SHOW STATUS LIKE 'uptime'")
            logger.success(f"Connected to Manticore at {settings.manticore_url}")
        except Exception as health_err:
            logger.warning(f"Manticore health check failed: {health_err}")
    except Exception as e:
        logger.error(f"Failed to initialize Manticore client: {e}")
    
    # 3. Initialize Background Scheduler
    try:
        scheduler = AsyncIOScheduler()
        # Use the dedicated redis_client singleton
        redis_conn = await redis_client.get_client()
        scheduler.add_job(
            sync_all_dirty_users, 
            "interval", 
            minutes=5, 
            args=[redis_conn],
            id="usage_sync",
            replace_existing=True
        )
        scheduler.start()
        app.state.scheduler = scheduler
        logger.success("Background scheduler started (AsyncIO)")
    except Exception as e:
        logger.error(f"Failed to start background scheduler: {e}")
    
    logger.info("Application startup complete")
    yield
    
    # Shutdown
    if hasattr(app.state, "scheduler"):
        app.state.scheduler.shutdown()
        logger.info("Background scheduler shut down")

    if app.state.api_client:
        await app.state.api_client.close()
        logger.info("Manticore client closed")
    logger.info("Application shutdown complete")


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
