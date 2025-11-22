from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    TYPESENSE_HOST: str = "localhost"
    TYPESENSE_PORT: str = "8108"
    TYPESENSE_PROTOCOL: str = "http"
    TYPESENSE_API_KEY: str = "xyz123"
    
    INDEX_NAME: str = "yt_data"
    COLLECTION_NAME: str = "yt_sentences"
    
    LIBRETRANSLATE_URL: str = "http://127.0.0.1:5000"

    class Config:
        env_file = ".env"
        extra = "ignore"

def get_settings():
    return Settings()
