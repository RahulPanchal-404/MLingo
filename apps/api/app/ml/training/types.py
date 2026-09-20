from dataclasses import dataclass
from typing import Mapping

from numpy.typing import NDArray


@dataclass(frozen=True)
class TrainingConfig:
    learning_rate: float = 0.1
    epochs: int = 10
    initial_weights: tuple[float, ...] | None = None
    initial_bias: float = 0.0
    clusters: int | None = None
    iterations: int | None = None
    seed: int = 0
    hidden_neurons: int = 3


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
class ClusteringDataset:
    points: NDArray
    name: str = "in-memory-clustering"


@dataclass(frozen=True)
class RegressionMetrics:
    mean_squared_error: float


@dataclass(frozen=True)
class ClusteringMetrics:
    inertia: float


@dataclass(frozen=True)
class TrainingMetrics:
    mean_squared_error: float | None = None
    binary_cross_entropy: float | None = None
    accuracy: float | None = None
    inertia: float | None = None


@dataclass(frozen=True)
class TrainingState:
    """Immutable model snapshot, including the pre-update state at step zero."""
    step: int
    weights: tuple[float, ...] = ()
    bias: float = 0.0
    loss: float = 0.0
    gradients: tuple[float, ...] = ()
    bias_gradient: float | None = None
    predictions: tuple[float, ...] = ()
    metrics: TrainingMetrics | RegressionMetrics | ClusteringMetrics = TrainingMetrics()
    centroids: tuple[tuple[float, float], ...] | None = None
    cluster_assignments: tuple[int, ...] | None = None
    inertia: float | None = None
    centroid_movement: tuple[float, ...] | None = None
    w1: tuple[tuple[float, ...], ...] | None = None
    b1: tuple[float, ...] | None = None
    w2: tuple[tuple[float, ...], ...] | None = None
    b2: float | None = None
    dw1: tuple[tuple[float, ...], ...] | None = None
    db1: tuple[float, ...] | None = None
    dw2: tuple[tuple[float, ...], ...] | None = None
    db2: float | None = None
    hidden_activations: tuple[tuple[float, ...], ...] | None = None


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
