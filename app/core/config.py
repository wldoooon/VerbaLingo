from urllib.parse import quote_plus
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    MANTICORE_HOST: str = "localhost"
    MANTICORE_PORT: str = "9308"
    MANTICORE_PROTOCOL: str = "http"
    TABLE_NAME: str = "english_dataset"
    LIBRETRANSLATE_URL: str = "http://127.0.0.1:5000"

    GROQ_API_KEY: str = ""

    POSTGRES_USER: str = ""
    POSTGRES_PASSWORD: str = ""
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = ""

    SECRET_KEY: str = "" 
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    COOKIE_NAME: str = "access_token"
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"

    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000"] 


    model_config = {
        "env_file": ".env",
        "extra": "ignore"
    }

    @property
    def manticore_url(self) -> str:
        return f"{self.MANTICORE_PROTOCOL}://{self.MANTICORE_HOST}:{self.MANTICORE_PORT}"

    @property
    def postgres_url(self) -> str:
        encoded_user = quote_plus(self.POSTGRES_USER)
        encoded_password = quote_plus(self.POSTGRES_PASSWORD)
        return f"postgresql+asyncpg://{encoded_user}:{encoded_password}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"


def get_settings():
    return Settings()
