"""Feature scaling algorithms with strict train-fit and test-transform isolation."""

import numpy as np
from numpy.typing import NDArray


class StandardScaler:
    """Standardize features by removing the mean and scaling to unit variance.

    z = (x - u) / s
    """

    def __init__(self) -> None:
        self.mean_: NDArray[np.float64] | None = None
        self.scale_: NDArray[np.float64] | None = None

    def fit(self, X: NDArray[np.float64]) -> "StandardScaler":
        if X.size == 0:
            raise ValueError("Cannot fit on empty array")
        self.mean_ = np.mean(X, axis=0)
        std = np.std(X, axis=0)
        # Avoid division by zero for constant features
        self.scale_ = np.where(std == 0.0, 1.0, std)
        return self

    def transform(self, X: NDArray[np.float64]) -> NDArray[np.float64]:
        if self.mean_ is None or self.scale_ is None:
            raise RuntimeError("StandardScaler must be fit before transform")
        return (X - self.mean_) / self.scale_

    def fit_transform(self, X: NDArray[np.float64]) -> NDArray[np.float64]:
        return self.fit(X).transform(X)


class MinMaxScaler:
    """Transform features by scaling each feature to a given range [0, 1].

    x' = (x - x_min) / (x_max - x_min)
    """

    def __init__(self, feature_range: tuple[float, float] = (0.0, 1.0)) -> None:
        self.feature_range = feature_range
        self.data_min_: NDArray[np.float64] | None = None
        self.data_max_: NDArray[np.float64] | None = None

    def fit(self, X: NDArray[np.float64]) -> "MinMaxScaler":
        if X.size == 0:
            raise ValueError("Cannot fit on empty array")
        self.data_min_ = np.min(X, axis=0)
        self.data_max_ = np.max(X, axis=0)
        return self

    def transform(self, X: NDArray[np.float64]) -> NDArray[np.float64]:
        if self.data_min_ is None or self.data_max_ is None:
            raise RuntimeError("MinMaxScaler must be fit before transform")
        diff = self.data_max_ - self.data_min_
        # Avoid division by zero for constant features
        denom = np.where(diff == 0.0, 1.0, diff)
        scale = self.feature_range[1] - self.feature_range[0]
        return self.feature_range[0] + (X - self.data_min_) / denom * scale

    def fit_transform(self, X: NDArray[np.float64]) -> NDArray[np.float64]:
        return self.fit(X).transform(X)
