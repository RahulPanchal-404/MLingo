import numpy as np
from numpy.typing import NDArray


def mean_squared_error(predictions: NDArray, targets: NDArray) -> float:
    if predictions.shape != targets.shape:
        raise ValueError("predictions and targets must have the same shape")
    if predictions.size == 0:
        raise ValueError("mean squared error requires at least one value")
    return float(np.mean(np.square(predictions - targets)))


def mean_absolute_error(predictions: NDArray, targets: NDArray) -> float:
    if predictions.shape != targets.shape:
        raise ValueError("predictions and targets must have the same shape")
    if predictions.size == 0:
        raise ValueError("mean absolute error requires at least one value")
    return float(np.mean(np.abs(predictions - targets)))


def r2_score(predictions: NDArray, targets: NDArray) -> float:
    if predictions.shape != targets.shape:
        raise ValueError("predictions and targets must have the same shape")
    if predictions.size == 0:
        raise ValueError("r2 score requires at least one value")
    sse = float(np.sum(np.square(targets - predictions)))
    sst = float(np.sum(np.square(targets - np.mean(targets))))
    if sst == 0.0:
        return 1.0 if sse == 0.0 else 0.0
    return float(1.0 - (sse / sst))

