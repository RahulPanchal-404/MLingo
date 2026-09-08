from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuration loaded from environment variables and a local .env file."""

    app_name: str = "MLingo API"
    app_version: str = "0.1.0"
    environment: str = "development"
    database_url: str = "postgresql://mlingo:mlingo_dev_password@localhost:5432/mlingo"
    frontend_origin: str = "http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", env_prefix="MLINGO_", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
