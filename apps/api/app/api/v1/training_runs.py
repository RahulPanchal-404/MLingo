from fastapi import APIRouter, status

from app.schemas.training_runs import CreateTrainingRunRequest, TrainingRunResponse
from app.services.training_runs import create_training_run

router = APIRouter(prefix="/training-runs")


@router.post("", response_model=TrainingRunResponse, status_code=status.HTTP_201_CREATED)
def create_run(request: CreateTrainingRunRequest) -> TrainingRunResponse:
    result = create_training_run(request)
    return TrainingRunResponse.from_domain(result.run, request, result.dataset_points)
