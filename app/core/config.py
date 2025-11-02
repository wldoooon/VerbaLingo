from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    MEILISEARCH_API_KEY: Optional[str] = None
    MEILISEARCH_URL: str = "http://localhost:7700"
    INDEX_NAME: str = "yt_data"
    # LibreTranslate base URL. When running FastAPI locally, default to localhost:5000.
    # In Docker Compose, override to the service name, e.g., http://libretranslate01:5000
    LIBRETRANSLATE_URL: str = "http://127.0.0.1:5000"
    
    # Optional: Keep DATA_FILE_PATH for compatibility with data pipeline
    DATA_FILE_PATH: Optional[str] = None
    
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        extra="ignore"  # Ignore extra fields instead of raising an error
    )
@lru_cache
def get_settings() -> Settings:
    return Settings()
