import numpy as np
from numpy.typing import NDArray


def stable_sigmoid(z: NDArray[np.float64]) -> NDArray[np.float64]:
    """Compute numerically stabilized sigmoid activation with input clipping."""
    clipped = np.clip(z, -25.0, 25.0)
    return 1.0 / (1.0 + np.exp(-clipped))


def binary_cross_entropy(probabilities: NDArray[np.float64], targets: NDArray[np.float64], epsilon: float = 1e-15) -> float:
    """Compute binary cross-entropy loss with probability clipping."""
    probs = np.clip(probabilities, epsilon, 1.0 - epsilon)
    y = targets.reshape(-1, 1) if targets.ndim == 1 else targets
    p = probs.reshape(-1, 1) if probs.ndim == 1 else probs
    loss = -np.mean(y * np.log(p) + (1.0 - y) * np.log(1.0 - p))
    return float(loss)


def initialize_network(input_dim: int = 2, hidden_dim: int = 3, seed: int = 0) -> tuple[NDArray[np.float64], NDArray[np.float64], NDArray[np.float64], float]:
    """Initialize network parameters with deterministic Glorot/Gaussian values."""
    rng = np.random.default_rng(seed)
    # Glorot/Xavier scale for W1 and W2
    scale1 = np.sqrt(2.0 / (input_dim + hidden_dim))
    scale2 = np.sqrt(2.0 / (hidden_dim + 1))
    
    w1 = rng.normal(loc=0.0, scale=scale1, size=(input_dim, hidden_dim)).astype(np.float64)
    b1 = np.zeros(hidden_dim, dtype=np.float64)
    w2 = rng.normal(loc=0.0, scale=scale2, size=(hidden_dim, 1)).astype(np.float64)
    b2 = 0.0
    return w1, b1, w2, b2


def forward(
    X: NDArray[np.float64],
    w1: NDArray[np.float64],
    b1: NDArray[np.float64],
    w2: NDArray[np.float64],
    b2: float,
) -> tuple[NDArray[np.float64], NDArray[np.float64], NDArray[np.float64], NDArray[np.float64]]:
    """
    Execute forward pass:
    Z1 = X @ W1 + b1
    A1 = sigmoid(Z1)
    Z2 = A1 @ W2 + b2
    A2 = sigmoid(Z2)
    """
    z1 = X @ w1 + b1
    a1 = stable_sigmoid(z1)
    z2 = a1 @ w2 + b2
    a2 = stable_sigmoid(z2)
    return z1, a1, z2, a2


def backward(
    X: NDArray[np.float64],
    y: NDArray[np.float64],
    z1: NDArray[np.float64],
    a1: NDArray[np.float64],
    z2: NDArray[np.float64],
    a2: NDArray[np.float64],
    w2: NDArray[np.float64],
) -> tuple[NDArray[np.float64], NDArray[np.float64], NDArray[np.float64], float]:
    """
    Execute backward pass (backpropagation):
    dZ2 = A2 - y
    dW2 = (A1^T @ dZ2) / n
    db2 = mean(dZ2)
    dA1 = dZ2 @ W2^T
    dZ1 = dA1 * A1 * (1 - A1)
    dW1 = (X^T @ dZ1) / n
    db1 = mean(dZ1, axis=0)
    """
    n = X.shape[0]
    targets = y.reshape(-1, 1) if y.ndim == 1 else y
    
    # Output layer gradients
    dz2 = a2 - targets
    dw2 = (a1.T @ dz2) / n
    db2 = float(np.mean(dz2))
    
    # Hidden layer gradients
    da1 = dz2 @ w2.T
    sigmoid_deriv = a1 * (1.0 - a1)
    dz1 = da1 * sigmoid_deriv
    dw1 = (X.T @ dz1) / n
    db1 = np.mean(dz1, axis=0)
    
    return dw1, db1, dw2, db2
