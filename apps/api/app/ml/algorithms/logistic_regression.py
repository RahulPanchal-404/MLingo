import numpy as np
from numpy.typing import NDArray


def sigmoid(logits: NDArray) -> NDArray:
    """Compute sigmoid probabilities without overflow for extreme logits."""
    result = np.empty_like(logits, dtype=np.float64)
    positive = logits >= 0
    result[positive] = 1.0 / (1.0 + np.exp(-logits[positive]))
    exp_logits = np.exp(logits[~positive])
    result[~positive] = exp_logits / (1.0 + exp_logits)
    return result


def predict_proba(features: NDArray, weights: NDArray, bias: float) -> NDArray:
    return sigmoid(features @ weights + bias)


def binary_cross_entropy(probabilities: NDArray, targets: NDArray) -> float:
    clipped = np.clip(probabilities, np.finfo(np.float64).eps, 1.0 - np.finfo(np.float64).eps)
    return float(-np.mean(targets * np.log(clipped) + (1.0 - targets) * np.log1p(-clipped)))