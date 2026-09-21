from fastapi import APIRouter

from app.api.v1.health import router as health_router
from app.api.v1.tutor import router as tutor_router
from app.api.v1.training_runs import router as training_runs_router

api_router = APIRouter()
api_router.include_router(health_router, tags=["health"])
api_router.include_router(training_runs_router, tags=["training-runs"])
api_router.include_router(tutor_router, tags=["tutor"])

