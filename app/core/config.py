from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    MEILISEARCH_API_KEY: Optional[str] = None
    MEILISEARCH_URL: str = "http://localhost:7700"
    INDEX_NAME: str = "yt_data"
    LIBRETRANSLATE_URL: str = "http://127.0.0.1:5000"
    
    DATA_FILE_PATH: Optional[str] = None
    
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        extra="ignore"  
    )
@lru_cache
def get_settings() -> Settings:
    return Settings()
