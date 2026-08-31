from fastapi import FastAPI

from app.api.v1.router import api_router
from app.core.config import get_settings


def create_app() -> FastAPI:
    settings = get_settings()
    application = FastAPI(
        title=settings.app_name,
        description="Backend API for the MLingo interactive ML learning platform.",
        version=settings.app_version,
    )
    application.include_router(api_router, prefix="/api/v1")
    return application


app = create_app()
