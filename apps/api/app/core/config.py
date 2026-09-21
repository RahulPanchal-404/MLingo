from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuration loaded from environment variables and a local .env file."""

    app_name: str = "MLingo API"
    app_version: str = "0.1.0"
    environment: str = "development"
    database_url: str = "postgresql://mlingo:mlingo_dev_password@localhost:5432/mlingo"
    frontend_origin: str = "http://localhost:3000"
    tutor_provider: str = "fallback"
    tutor_api_key: str | None = None
    tutor_model: str = "gemini-2.5-flash"

    model_config = SettingsConfigDict(env_file=".env", env_prefix="MLINGO_", extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        configured_origins = [
            origin.strip().rstrip("/")
            for origin in self.frontend_origin.split(",")
            if origin.strip()
        ]
        origins = list(configured_origins)
        if self.environment == "development":
            origins.extend(
                [
                    "http://localhost:3000",
                    "http://127.0.0.1:3000",
                    "http://localhost:3001",
                    "http://127.0.0.1:3001",
                ]
            )
        return list(dict.fromkeys(origins))


@lru_cache
def get_settings() -> Settings:
    return Settings()
