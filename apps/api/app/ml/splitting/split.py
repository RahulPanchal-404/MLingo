"""Deterministic, reproducible train/test splitting."""

from typing import Any, TypeVar
import numpy as np

T = TypeVar("T")


def train_test_split(
    data: list[T],
    train_ratio: float = 0.8,
    seed: int = 42,
) -> tuple[list[T], list[T]]:
    """Split data into disjoint train and test subsets deterministically.

    Guarantees:
    - Partition: train and test indices are disjoint and span the whole dataset.
    - Determinism: identical outputs given the same seed and ratio.
    """
    n = len(data)
    if n < 2:
        raise ValueError("Data must contain at least 2 samples to split into train and test")
    if not (0.0 < train_ratio < 1.0):
        raise ValueError(f"train_ratio must be strictly between 0.0 and 1.0, got {train_ratio}")

    rng = np.random.default_rng(seed)
    shuffled_indices = rng.permutation(n)

    train_count = int(round(train_ratio * n))
    # Ensure at least 1 sample in each partition
    train_count = max(1, min(n - 1, train_count))

    train_indices = set(shuffled_indices[:train_count])
    test_indices = set(shuffled_indices[train_count:])

    # Verify no overlap
    assert len(train_indices.intersection(test_indices)) == 0, "Train and test partitions overlap"

    train_data = [data[i] for i in shuffled_indices[:train_count]]
    test_data = [data[i] for i in shuffled_indices[train_count:]]

    return train_data, test_data
