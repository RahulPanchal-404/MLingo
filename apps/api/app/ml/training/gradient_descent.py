import numpy as np
from numpy.typing import NDArray


def gradients(features: NDArray, errors: NDArray) -> tuple[NDArray, float]:
    """Calculate MSE gradients for a linear regression model."""
    sample_count = features.shape[0]
    return (2.0 / sample_count) * (features.T @ errors), float(2.0 * np.mean(errors))
