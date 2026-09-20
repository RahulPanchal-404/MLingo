import numpy as np
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.ml.algorithms.neural_network import (
    backward,
    binary_cross_entropy,
    forward,
    initialize_network,
    stable_sigmoid,
)
from app.ml.training.trainer import train_neural_network
from app.ml.training.types import ClassificationDataset, TrainingConfig


client = TestClient(app)


def test_stable_sigmoid_bounds_and_no_overflow():
    """Verify stable sigmoid avoids overflow/underflow for large inputs."""
    assert stable_sigmoid(np.array([0.0]))[0] == pytest.approx(0.5, abs=1e-6)
    
    large_pos = stable_sigmoid(np.array([1000.0]))[0]
    assert np.isfinite(large_pos)
    assert large_pos == pytest.approx(1.0, abs=1e-5)
    
    large_neg = stable_sigmoid(np.array([-1000.0]))[0]
    assert np.isfinite(large_neg)
    assert large_neg == pytest.approx(0.0, abs=1e-5)


def test_binary_cross_entropy_stability():
    """Verify BCE produces finite loss for extreme probabilities."""
    y = np.array([1.0, 0.0])
    p_exact = np.array([1.0, 0.0])
    loss = binary_cross_entropy(p_exact, y)
    assert np.isfinite(loss)
    assert loss >= 0.0
    assert loss < 1e-4

    p_wrong = np.array([0.0, 1.0])
    loss_wrong = binary_cross_entropy(p_wrong, y)
    assert np.isfinite(loss_wrong)
    assert loss_wrong > 10.0


def test_initialize_network():
    """Verify network initialization produces expected shapes and deterministic values."""
    w1, b1, w2, b2 = initialize_network(input_dim=2, hidden_dim=3, seed=42)
    assert w1.shape == (2, 3)
    assert b1.shape == (3,)
    assert w2.shape == (3, 1)
    assert isinstance(b2, float)
    assert b2 == 0.0

    # Test seed determinism
    w1_again, _, _, _ = initialize_network(input_dim=2, hidden_dim=3, seed=42)
    np.testing.assert_array_equal(w1, w1_again)


def test_forward_pass_shapes():
    """Verify forward pass returns activations with valid probabilities."""
    X = np.array([[1.0, 2.0], [3.0, 4.0], [-1.0, -2.0]])
    w1, b1, w2, b2 = initialize_network(input_dim=2, hidden_dim=3, seed=0)
    z1, a1, z2, a2 = forward(X, w1, b1, w2, b2)
    
    assert z1.shape == (3, 3)
    assert a1.shape == (3, 3)
    assert z2.shape == (3, 1)
    assert a2.shape == (3, 1)
    assert np.all(a1 >= 0.0) and np.all(a1 <= 1.0)
    assert np.all(a2 >= 0.0) and np.all(a2 <= 1.0)


def test_backward_pass_finite_differences():
    """Verify analytical backpropagation gradients match numerical finite-difference gradients."""
    X = np.array([[0.5, -0.2], [-0.8, 0.9], [0.1, 0.4]])
    y = np.array([1.0, 0.0, 1.0])
    w1, b1, w2, b2 = initialize_network(input_dim=2, hidden_dim=3, seed=123)
    
    z1, a1, z2, a2 = forward(X, w1, b1, w2, b2)
    dw1, db1, dw2, db2 = backward(X, y, z1, a1, z2, a2, w2)
    
    # Numerical gradient check for W2
    eps = 1e-6
    for i in range(w2.shape[0]):
        w2_plus = w2.copy()
        w2_plus[i, 0] += eps
        _, _, _, a2_plus = forward(X, w1, b1, w2_plus, b2)
        loss_plus = binary_cross_entropy(a2_plus, y)
        
        w2_minus = w2.copy()
        w2_minus[i, 0] -= eps
        _, _, _, a2_minus = forward(X, w1, b1, w2_minus, b2)
        loss_minus = binary_cross_entropy(a2_minus, y)
        
        num_grad = (loss_plus - loss_minus) / (2 * eps)
        assert dw2[i, 0] == pytest.approx(num_grad, rel=1e-4, abs=1e-4)
        
    # Numerical gradient check for W1
    for r in range(w1.shape[0]):
        for c in range(w1.shape[1]):
            w1_plus = w1.copy()
            w1_plus[r, c] += eps
            _, _, _, a2_plus = forward(X, w1_plus, b1, w2, b2)
            loss_plus = binary_cross_entropy(a2_plus, y)
            
            w1_minus = w1.copy()
            w1_minus[r, c] -= eps
            _, _, _, a2_minus = forward(X, w1_minus, b1, w2, b2)
            loss_minus = binary_cross_entropy(a2_minus, y)
            
            num_grad = (loss_plus - loss_minus) / (2 * eps)
            assert dw1[r, c] == pytest.approx(num_grad, rel=1e-4, abs=1e-4)


def test_neural_network_training_convergence():
    """Verify neural network training decreases BCE loss and achieves high accuracy."""
    # Linearly separable clusters
    rng = np.random.default_rng(42)
    X0 = rng.normal(loc=[-1.5, -1.5], scale=0.3, size=(20, 2))
    X1 = rng.normal(loc=[1.5, 1.5], scale=0.3, size=(20, 2))
    features = np.vstack([X0, X1])
    targets = np.concatenate([np.zeros(20), np.ones(20)])
    
    dataset = ClassificationDataset(features=features, targets=targets, name="test-dataset")
    config = TrainingConfig(learning_rate=0.5, epochs=30, hidden_neurons=3, seed=42)
    
    run = train_neural_network(dataset, config)
    assert run.total_steps == 30
    assert len(run.history) == 31  # step 0 to step 30
    
    initial_loss = run.history[0].loss
    final_loss = run.history[-1].loss
    initial_acc = run.history[0].metrics.accuracy or 0.0
    final_acc = run.history[-1].metrics.accuracy or 0.0
    
    assert final_loss < initial_loss
    assert final_acc >= initial_acc
    assert final_acc >= 0.90


def test_neural_network_step_zero_untrained_state():
    """Verify step 0 is recorded before any gradient updates."""
    dataset = ClassificationDataset(
        features=np.array([[1.0, 1.0], [-1.0, -1.0]]),
        targets=np.array([1.0, 0.0]),
        name="test",
    )
    config = TrainingConfig(learning_rate=0.1, epochs=5, hidden_neurons=3, seed=0)
    run = train_neural_network(dataset, config)
    
    step0 = run.history[0]
    assert step0.step == 0
    assert step0.dw1 is None
    assert step0.dw2 is None
    assert step0.db2 is None
    assert step0.w1 is not None
    assert step0.w2 is not None
    assert len(step0.predictions) == 2


def test_api_neural_network_training_run():
    """Verify full FastAPI roundtrip for neural_network algorithm."""
    payload = {
        "algorithm": "neural_network",
        "dataset": {"samples": 30, "noise": 0.1, "seed": 42},
        "training": {"learning_rate": 0.2, "epochs": 10, "hidden_neurons": 3, "seed": 42},
    }
    response = client.post("/api/v1/training-runs", json=payload)
    assert response.status_code == 201
    
    data = response.json()
    assert data["algorithm"] == "neural_network"
    assert data["total_steps"] == 10
    assert len(data["history"]) == 11
    assert len(data["dataset_points"]) == 30
    
    final_state = data["history"][-1]
    assert final_state["step"] == 10
    assert "w1" in final_state and len(final_state["w1"]) == 2
    assert "w2" in final_state and len(final_state["w2"]) == 3
    assert "b1" in final_state and len(final_state["b1"]) == 3
    assert "b2" in final_state and isinstance(final_state["b2"], float)
    assert "hidden_activations" in final_state
    assert final_state["metrics"]["binary_cross_entropy"] is not None
    assert final_state["metrics"]["accuracy"] is not None
