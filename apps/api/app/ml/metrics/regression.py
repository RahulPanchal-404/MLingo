import numpy as np
from numpy.typing import NDArray


def mean_squared_error(predictions: NDArray, targets: NDArray) -> float:
    if predictions.shape != targets.shape:
        raise ValueError("predictions and targets must have the same shape")
    if predictions.size == 0:
        raise ValueError("mean squared error requires at least one value")
    return float(np.mean(np.square(predictions - targets)))
