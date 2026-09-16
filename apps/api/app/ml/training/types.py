from dataclasses import dataclass
from typing import Mapping

from numpy.typing import NDArray


@dataclass(frozen=True)
class TrainingConfig:
    learning_rate: float
    epochs: int
    initial_weights: tuple[float, ...] | None = None
    initial_bias: float = 0.0


@dataclass(frozen=True)
class RegressionDataset:
    features: NDArray
    targets: NDArray
    name: str = "in-memory-regression"


@dataclass(frozen=True)
class ClassificationDataset:
    features: NDArray
    targets: NDArray
    name: str = "in-memory-classification"


@dataclass(frozen=True)
class RegressionMetrics:
    mean_squared_error: float


@dataclass(frozen=True)
class TrainingMetrics:
    mean_squared_error: float | None = None
    binary_cross_entropy: float | None = None
    accuracy: float | None = None


@dataclass(frozen=True)
class TrainingState:
    """Immutable model snapshot, including the pre-update state at step zero."""
    step: int
    weights: tuple[float, ...]
    bias: float
    loss: float
    gradients: tuple[float, ...]
    bias_gradient: float | None
    predictions: tuple[float, ...]
    metrics: TrainingMetrics | RegressionMetrics


@dataclass(frozen=True)
class TrainingRun:
    """Replayable record of one deterministic model-training execution."""
    id: str
    algorithm: str
    dataset_name: str
    configuration: TrainingConfig
    total_steps: int
    history: tuple[TrainingState, ...]
    markers: tuple[int, ...]
    metadata: Mapping[str, str]
