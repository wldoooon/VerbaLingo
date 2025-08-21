from fastapi import FastAPI
from contextlib import asynccontextmanager
from verbaLingo_agent.app.api.routes import router as api_router
from verbaLingo_agent.app.core.config import settings
from verbaLingo_agent.app.clients.agent_client import ollama_client

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up...")
    await ollama_client.health_check()
    print("Successfully connected to Ollama.")
    yield
    print("Shutting down...")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

app.include_router(api_router, prefix="/api/v1", tags=["Generation"])

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": f"Welcome to {settings.APP_NAME}"}