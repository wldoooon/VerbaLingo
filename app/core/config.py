from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional

class EnvironmentSettings(BaseSettings):
    MEILISEARCH_API_KEY: Optional[str] = None
    MEILISEARCH_URL: str
    DATA_FILE_PATH: str 


    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


class AppConstants:
    ALIAS_NAME: str = "youtube_transcripts_prod"
    INDEX_NAME_PREFIX: str = "youtube_transcript_v"
    CLEANUP_OLD_INDICES: bool = True


class Settings:
    def __init__(self, eviromentSettings: EnvironmentSettings):
        self.MEILISEARCH_API_KEY = eviromentSettings.MEILISEARCH_API_KEY
        self.MEILISEARCH_URL = eviromentSettings.MEILISEARCH_URL
        self.DATA_FILE_PATH = eviromentSettings.DATA_FILE_PATH

        self.ALIAS_NAME = AppConstants.ALIAS_NAME
        self.INDEX_NAME_PREFIX = AppConstants.INDEX_NAME_PREFIX
        self.CLEANUP_OLD_INDICES = AppConstants.CLEANUP_OLD_INDICES




@lru_cache
def get_settings() -> Settings:
    env_settings = EnvironmentSettings()
    return Settings(env_settings)
