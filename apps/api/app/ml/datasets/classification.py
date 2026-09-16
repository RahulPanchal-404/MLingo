from dataclasses import dataclass

import numpy as np
from numpy.typing import NDArray


@dataclass(frozen=True)
class SyntheticClassificationDataset:
    features: NDArray[np.float64]
    targets: NDArray[np.float64]


def make_logistic_regression_dataset(*, samples: int = 64, noise: float = 0.1, seed: int = 0) -> SyntheticClassificationDataset:
    """Create two deterministic, linearly separable Gaussian clusters."""
    if samples <= 1:
        raise ValueError("samples must be greater than one")
    if noise < 0:
        raise ValueError("noise must be non-negative")
    rng = np.random.default_rng(seed)
    class_count = samples // 2
    remainder = samples - class_count
    class_zero = rng.normal(loc=(-1.0, -1.0), scale=max(noise, 1e-9), size=(class_count, 2))
    class_one = rng.normal(loc=(1.0, 1.0), scale=max(noise, 1e-9), size=(remainder, 2))
    features = np.vstack((class_zero, class_one)).astype(np.float64)
    targets = np.concatenate((np.zeros(class_count), np.ones(remainder))).astype(np.float64)
    return SyntheticClassificationDataset(features=features, targets=targets)