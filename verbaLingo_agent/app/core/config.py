from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    OLLAMA_HOST: str = "http://127.0.0.1:11434"
    OLLAMA_DEFAULT_MODEL: str = "gemma3:4b"
    OLLAMA_REQUEST_TIMEOUT: int = 60 

    APP_NAME: str = "VerbaLingo Agent"
    APP_VERSION: str = "0.1.0"

settings = Settings()