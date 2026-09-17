from dataclasses import dataclass

import numpy as np
from numpy.typing import NDArray


@dataclass(frozen=True)
class ClusteringDataset:
    points: NDArray[np.float64]
    name: str = "in-memory-clustering"


def make_kmeans_dataset(*, samples: int = 60, noise: float = 0.1, seed: int = 0, clusters: int = 3) -> ClusteringDataset:
    if samples <= 0:
        raise ValueError("samples must be greater than zero")
    if noise < 0:
        raise ValueError("noise must be non-negative")
    if clusters <= 0:
        raise ValueError("clusters must be greater than zero")

    cluster_centers = np.array(
        [
            [-3.0, -2.0],
            [2.5, 2.0],
            [0.0, 3.5],
        ],
        dtype=np.float64,
    )[:clusters]
    if clusters > len(cluster_centers):
        extra = np.linspace(-1.0, 1.0, clusters - len(cluster_centers), dtype=np.float64)
        cluster_centers = np.vstack([cluster_centers, extra[:, None] * np.array([1.0, -1.0], dtype=np.float64)])

    rng = np.random.default_rng(seed)
    points: list[np.ndarray] = []
    base = samples // clusters
    remainder = samples % clusters
    for index in range(clusters):
        count = base + (1 if index < remainder else 0)
        points.append(cluster_centers[index] + rng.normal(0.0, noise, size=(count, 2)))

    dataset = np.vstack(points).astype(np.float64)
    if dataset.shape[0] != samples:
        raise ValueError("dataset shape does not match the requested sample count")
    return ClusteringDataset(dataset, name="synthetic-kmeans-clustering")
