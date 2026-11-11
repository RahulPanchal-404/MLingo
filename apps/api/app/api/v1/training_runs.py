from fastapi import APIRouter, HTTPException, status

from app.schemas.training_runs import CreateTrainingRunRequest, TrainingRunResponse
from app.services.training_runs import create_training_run

router = APIRouter(prefix="/training-runs")


@router.post("", response_model=TrainingRunResponse, status_code=status.HTTP_201_CREATED)
def create_run(request: CreateTrainingRunRequest) -> TrainingRunResponse:
    try:
        result = create_training_run(request)
    except ValueError as exc:
        # Domain validation in the ML engine (e.g. a non-finite initial state)
        # is a client input problem, not a server fault.
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
    return TrainingRunResponse.from_domain(result.run, request, result.dataset_points)
