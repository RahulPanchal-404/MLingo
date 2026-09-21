from fastapi import APIRouter, status

from app.schemas.tutor import TutorRequest, TutorResponse
from app.services.tutor import get_tutor_provider

router = APIRouter(prefix="/tutor", tags=["tutor"])


@router.post("/respond", response_model=TutorResponse, status_code=status.HTTP_200_OK)
async def respond_to_learner(request: TutorRequest) -> TutorResponse:
    """Answer learner queries grounded strictly in MLingo telemetry and domain context."""
    provider = get_tutor_provider()
    return await provider.generate_response(request)
