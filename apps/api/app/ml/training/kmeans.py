from __future__ import annotations

from app.ml.algorithms.kmeans import assign_clusters, inertia, initialize_centroids, update_centroids
from app.ml.training.types import ClusteringDataset, TrainingConfig, TrainingRun, TrainingState


def train_kmeans(dataset: ClusteringDataset, configuration: TrainingConfig, *, run_id: str | None = None) -> TrainingRun:
    raise NotImplementedError
