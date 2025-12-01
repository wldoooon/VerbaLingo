from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Manticore Search settings
    MANTICORE_HOST: str = "localhost"
    MANTICORE_PORT: str = "9308"
    MANTICORE_PROTOCOL: str = "http"
    
    # Table name for search index
    TABLE_NAME: str = "english_dataset"
    
    # LibreTranslate settings
    LIBRETRANSLATE_URL: str = "http://127.0.0.1:5000"

    class Config:
        env_file = ".env"
        extra = "ignore"
    
    @property
    def manticore_url(self) -> str:
        """Returns the full Manticore Search URL."""
        return f"{self.MANTICORE_PROTOCOL}://{self.MANTICORE_HOST}:{self.MANTICORE_PORT}"

def get_settings():
    return Settings()
