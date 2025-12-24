from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    MANTICORE_HOST: str = "localhost"
    MANTICORE_PORT: str = "9308"
    MANTICORE_PROTOCOL: str = "http"
    TABLE_NAME: str = "english_dataset"
    LIBRETRANSLATE_URL: str = "http://127.0.0.1:5000"
    GROQ_API_KEY: str = ""


    class Config:
        env_file = ".env"
        extra = "ignore"

    @property
    def manticore_url(self) -> str:
        return f"{self.MANTICORE_PROTOCOL}://{self.MANTICORE_HOST}:{self.MANTICORE_PORT}"


def get_settings():
    return Settings()
