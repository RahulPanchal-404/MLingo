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


class KMeansDatasetRequest(BaseModel):
    samples: int = Field(default=60, gt=0, le=10_000)
    noise: float = Field(default=0.1, ge=0)
    seed: int = 0


class TrainingConfigurationRequest(BaseModel):
    learning_rate: float = Field(default=0.1, gt=0)
    epochs: int = Field(default=50, gt=0, le=10_000)
    initial_weight: float = 0.0
    initial_bias: float = 0.0
    clusters: int | None = Field(default=None, gt=0, le=10_000)
    iterations: int | None = Field(default=None, gt=0, le=10_000)
    hidden_neurons: int | None = Field(default=3, gt=0, le=16)
    seed: int = 0

    @field_validator("learning_rate", "initial_weight", "initial_bias")
    @classmethod
    def values_must_be_finite(cls, value: float) -> float:
        if not isfinite(value):
            raise ValueError("value must be finite")
        return value


class CreateTrainingRunRequest(BaseModel):
    algorithm: Literal["linear_regression", "logistic_regression", "kmeans", "neural_network"] = "linear_regression"
    dataset: SyntheticDatasetRequest | KMeansDatasetRequest = Field(default_factory=SyntheticDatasetRequest)
    training: TrainingConfigurationRequest = Field(default_factory=TrainingConfigurationRequest)

    @model_validator(mode="after")
    def validate_algorithm_dataset(self) -> "CreateTrainingRunRequest":
        if self.algorithm in ("logistic_regression", "neural_network") and self.dataset.samples <= 1:
            raise ValueError(f"{self.algorithm} requires at least two samples")
        if self.algorithm == "kmeans":
            if not hasattr(self.dataset, "samples") or self.dataset.samples <= 1:
                raise ValueError("kmeans requires at least two samples")
            if self.training.clusters is None or self.training.clusters <= 0:
                raise ValueError("kmeans requires a positive cluster count")
            if self.training.iterations is None or self.training.iterations <= 0:
                raise ValueError("kmeans requires a positive iteration count")
        return self


class DatasetConfigurationResponse(BaseModel):
    samples: int
    slope: float | None = None
    intercept: float | None = None
    noise: float | None = None
    seed: int = 0


class DatasetPointResponse(BaseModel):
    feature: float | None = None
    target: float | None = None
    x1: float | None = None
    x2: float | None = None
    label: int | None = None
    x: float | None = None
    y: float | None = None


class TrainingConfigurationResponse(BaseModel):
    learning_rate: float | None = None
    epochs: int | None = None
    initial_weight: float | None = None
    initial_bias: float | None = None
    clusters: int | None = None
    iterations: int | None = None
    hidden_neurons: int | None = None
    seed: int | None = None


class RegressionMetricsResponse(BaseModel):
    mean_squared_error: float | None = None
    binary_cross_entropy: float | None = None
    accuracy: float | None = None
    inertia: float | None = None


class TrainingStateResponse(BaseModel):
    step: int
    weights: list[float] = []
    bias: float = 0.0
    loss: float = 0.0
    gradients: list[float] = []
    bias_gradient: float | None = None
    predictions: list[float] = []
    metrics: RegressionMetricsResponse = Field(default_factory=RegressionMetricsResponse)
    centroids: list[list[float]] | None = None
    cluster_assignments: list[int] | None = None
    inertia: float | None = None
    centroid_movement: list[float] | None = None
    w1: list[list[float]] | None = None
    b1: list[float] | None = None
    w2: list[list[float]] | None = None
    b2: float | None = None
    dw1: list[list[float]] | None = None
    db1: list[float] | None = None
    dw2: list[list[float]] | None = None
    db2: float | None = None
    hidden_activations: list[list[float]] | None = None


class TrainingRunResponse(BaseModel):
    id: str
    algorithm: str
    dataset: DatasetConfigurationResponse
    dataset_points: list[dict[str, float | int]]
    training: dict[str, float | int]
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
        dataset_payload = request.dataset.model_dump(include=request.dataset.model_fields_set)
        training_payload = request.training.model_dump(include=request.training.model_fields_set)
        return cls(
            id=run.id,
            algorithm=run.algorithm,
            dataset=DatasetConfigurationResponse(**dataset_payload),
            dataset_points=list(dataset_points),
            training={key: value for key, value in training_payload.items() if value is not None},
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
                    metrics=RegressionMetricsResponse(
                        mean_squared_error=getattr(state.metrics, "mean_squared_error", None),
                        binary_cross_entropy=getattr(state.metrics, "binary_cross_entropy", None),
                        accuracy=getattr(state.metrics, "accuracy", None),
                        inertia=getattr(state.metrics, "inertia", None),
                    ),
                    centroids=[list(map(float, centroid)) for centroid in state.centroids] if state.centroids else None,
                    cluster_assignments=list(state.cluster_assignments) if state.cluster_assignments else None,
                    inertia=state.inertia,
                    centroid_movement=list(state.centroid_movement) if state.centroid_movement else None,
                    w1=[list(map(float, row)) for row in state.w1] if state.w1 else None,
                    b1=list(map(float, state.b1)) if state.b1 else None,
                    w2=[list(map(float, row)) for row in state.w2] if state.w2 else None,
                    b2=state.b2,
                    dw1=[list(map(float, row)) for row in state.dw1] if state.dw1 else None,
                    db1=list(map(float, state.db1)) if state.db1 else None,
                    dw2=[list(map(float, row)) for row in state.dw2] if state.dw2 else None,
                    db2=state.db2,
                    hidden_activations=[list(map(float, row)) for row in state.hidden_activations] if state.hidden_activations else None,
                )
                for state in run.history
            ],
            markers=list(run.markers),
            metadata=dict(run.metadata),
        )
