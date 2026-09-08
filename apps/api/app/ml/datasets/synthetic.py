from dataclasses import dataclass

import numpy as np
from numpy.typing import NDArray


@dataclass(frozen=True)
class SyntheticRegressionDataset:
    features: NDArray[np.float64]
    targets: NDArray[np.float64]
    slope: float
    intercept: float


def make_linear_regression_dataset(*, samples: int = 32, slope: float = 2.0, intercept: float = 1.0, noise: float = 0.0, seed: int = 0) -> SyntheticRegressionDataset:
    """Create a deterministic, one-feature dataset for regression lessons."""
    if samples <= 0:
        raise ValueError("samples must be greater than zero")
    if noise < 0:
        raise ValueError("noise must be non-negative")
    features = np.linspace(-1.0, 1.0, samples, dtype=np.float64)
    random_noise = np.random.default_rng(seed).normal(0.0, noise, samples)
    return SyntheticRegressionDataset(features, slope * features + intercept + random_noise, slope, intercept)
