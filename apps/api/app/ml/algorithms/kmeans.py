from __future__ import annotations

import numpy as np
from numpy.typing import NDArray


def initialize_centroids(points: NDArray[np.float64], *, clusters: int, seed: int = 0) -> NDArray[np.float64]:
    if clusters <= 0:
        raise ValueError("clusters must be greater than zero")
    if points.shape[0] < clusters:
        raise ValueError("clusters cannot exceed the number of samples")
    rng = np.random.default_rng(seed)
    indices = rng.choice(points.shape[0], size=clusters, replace=False)
    return points[indices].astype(np.float64, copy=True)


def assign_clusters(points: NDArray[np.float64], centroids: NDArray[np.float64]) -> NDArray[np.int64]:
    if centroids.size == 0:
        raise ValueError("centroids must not be empty")
    distances = np.linalg.norm(points[:, np.newaxis, :] - centroids[np.newaxis, :, :], axis=2) ** 2
    return np.argmin(distances, axis=1).astype(np.int64)


def update_centroids(points: NDArray[np.float64], assignments: NDArray[np.int64], centroids: NDArray[np.float64]) -> NDArray[np.float64]:
    next_centroids = centroids.astype(np.float64, copy=True)
    for cluster_index in range(len(centroids)):
        members = points[assignments == cluster_index]
        if members.size == 0:
            continue
        next_centroids[cluster_index] = members.mean(axis=0)
    return next_centroids


def inertia(points: NDArray[np.float64], centroids: NDArray[np.float64], assignments: NDArray[np.int64]) -> float:
    deltas = points - centroids[assignments]
    return float(np.sum(np.einsum("ij,ij->i", deltas, deltas)))
