from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "MedLens AI API"
    app_version: str = "1.0.0"
    tavily_api_key: str | None = Field(default=None, alias="TAVILY_API_KEY")
    pubmed_email: str | None = Field(default=None, alias="PUBMED_EMAIL")

    model_config = {
        "env_file": ".env",
        "extra": "ignore",
        "populate_by_name": True,
    }


@lru_cache
def get_settings() -> Settings:
    return Settings()
