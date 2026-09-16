from math import isfinite
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator

from app.ml.training.types import TrainingRun


class SyntheticDatasetRequest(BaseModel):
    samples: int = Field(default=32, gt=0, le=10_000)
    slope: float = 2.0
    intercept: float = 1.0
    noise: float = Field(default=0.0, ge=0)
    seed: int = 0

    @field_validator("slope", "intercept", "noise")
    @classmethod
    def values_must_be_finite(cls, value: float) -> float:
        if not isfinite(value):
            raise ValueError("value must be finite")
        return value


class TrainingConfigurationRequest(BaseModel):
    learning_rate: float = Field(default=0.1, gt=0)
    epochs: int = Field(default=50, gt=0, le=10_000)
    initial_weight: float = 0.0
    initial_bias: float = 0.0

    @field_validator("learning_rate", "initial_weight", "initial_bias")
    @classmethod
    def values_must_be_finite(cls, value: float) -> float:
        if not isfinite(value):
            raise ValueError("value must be finite")
        return value


class CreateTrainingRunRequest(BaseModel):
    algorithm: Literal["linear_regression", "logistic_regression"] = "linear_regression"
    dataset: SyntheticDatasetRequest = Field(default_factory=SyntheticDatasetRequest)
    training: TrainingConfigurationRequest = Field(default_factory=TrainingConfigurationRequest)

    @model_validator(mode="after")
    def validate_algorithm_dataset(self) -> "CreateTrainingRunRequest":
        if self.algorithm == "logistic_regression" and self.dataset.samples <= 1:
            raise ValueError("logistic_regression requires at least two samples")
        return self


class DatasetConfigurationResponse(BaseModel):
    samples: int
    slope: float
    intercept: float
    noise: float
    seed: int


class DatasetPointResponse(BaseModel):
    feature: float | None = None
    target: float | None = None
    x1: float | None = None
    x2: float | None = None
    label: int | None = None


class TrainingConfigurationResponse(BaseModel):
    learning_rate: float
    epochs: int
    initial_weight: float
    initial_bias: float


class RegressionMetricsResponse(BaseModel):
    mean_squared_error: float | None = None
    binary_cross_entropy: float | None = None
    accuracy: float | None = None


class TrainingStateResponse(BaseModel):
    step: int
    weights: list[float]
    bias: float
    loss: float
    gradients: list[float]
    bias_gradient: float | None
    predictions: list[float]
    metrics: RegressionMetricsResponse


class TrainingRunResponse(BaseModel):
    id: str
    algorithm: str
    dataset: DatasetConfigurationResponse
    dataset_points: list[dict[str, float | int]]
    training: TrainingConfigurationResponse
    total_steps: int
    history: list[TrainingStateResponse]
    markers: list[int]
    metadata: dict[str, str]

    @classmethod
    def from_domain(
        cls,
        run: TrainingRun,
        request: CreateTrainingRunRequest,
        dataset_points: tuple[dict[str, float | int], ...],
    ) -> "TrainingRunResponse":
        return cls(
            id=run.id,
            algorithm=run.algorithm,
            dataset=DatasetConfigurationResponse(**request.dataset.model_dump()),
            dataset_points=list(dataset_points),
            training=TrainingConfigurationResponse(**request.training.model_dump()),
            total_steps=run.total_steps,
            history=[
                TrainingStateResponse(
                    step=state.step,
                    weights=list(state.weights),
                    bias=state.bias,
                    loss=state.loss,
                    gradients=list(state.gradients),
                    bias_gradient=state.bias_gradient,
                    predictions=list(state.predictions),
                    metrics=RegressionMetricsResponse(mean_squared_error=getattr(state.metrics, "mean_squared_error", None), binary_cross_entropy=getattr(state.metrics, "binary_cross_entropy", None), accuracy=getattr(state.metrics, "accuracy", None)),
                )
                for state in run.history
            ],
            markers=list(run.markers),
            metadata=dict(run.metadata),
        )
