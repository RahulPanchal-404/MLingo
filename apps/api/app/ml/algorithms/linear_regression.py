from numpy.typing import NDArray


def predict(features: NDArray, weights: NDArray, bias: float) -> NDArray:
    """Predict targets for a 2D feature matrix using a linear model."""
    return features @ weights + bias
