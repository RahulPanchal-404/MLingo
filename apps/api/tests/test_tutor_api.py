from fastapi.testclient import TestClient
import pytest

from app.core.config import Settings
from app.main import create_app
from app.schemas.tutor import (
    ExperimentContext,
    ProjectContext,
    TrainingContext,
    TutorContext,
    TutorRequest,
)
from app.services.tutor.factory import get_tutor_provider
from app.services.tutor.mock import MockTutorProvider


@pytest.fixture
def client() -> TestClient:
    return TestClient(create_app())


def test_tutor_respond_fallback_explain(client: TestClient) -> None:
    payload = {
        "message": "What is happening here?",
        "context": {
            "training": {
                "algorithm": "logistic_regression",
                "selected_step": 14,
                "total_steps": 50,
                "loss": 0.3241,
                "previous_loss": 0.3450,
                "weights": [0.45, -0.22],
                "bias": 0.12,
                "learning_rate": 0.1,
            }
        },
        "mode": "explain",
    }

    response = client.post("/api/v1/tutor/respond", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "Logistic Regression" in data["answer"]
    assert "Step 15" in data["answer"]
    assert len(data["evidence"]) >= 3
    assert data["anchors"]["math_anchor_id"] == "math-mode-panel"
    assert data["anchors"]["code_anchor_id"] == "code-mode-panel"
    assert data["anchors"]["model_xray_anchor_id"] == "model-x-ray-panel"
    assert data["anchors"]["timeline_step"] == 14
    assert data["provider"] == "deterministic_fallback"


def test_tutor_why_mode_loss_increase(client: TestClient) -> None:
    payload = {
        "message": "Why did the loss increase here?",
        "context": {
            "training": {
                "algorithm": "linear_regression",
                "selected_step": 5,
                "total_steps": 40,
                "loss": 1.4500,
                "previous_loss": 1.1200,
                "learning_rate": 0.5,
                "gradients": [1.2, -0.8],
            }
        },
        "mode": "why",
    }

    response = client.post("/api/v1/tutor/respond", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "increased" in data["answer"].lower()
    assert "overshoot" in data["answer"].lower() or "overshoot" in data["why"].lower()
    assert data["mode"] == "why"


def test_tutor_math_mode(client: TestClient) -> None:
    payload = {
        "message": "Show the formula and explain the mathematics",
        "context": {
            "training": {
                "algorithm": "logistic_regression",
                "selected_step": 10,
                "total_steps": 50,
                "weights": [0.5, -0.3],
                "bias": 0.1,
                "loss": 0.28,
            }
        },
        "mode": "math",
    }

    response = client.post("/api/v1/tutor/respond", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "sigmoid" in data["answer"].lower() or "σ" in data["answer"]
    assert "cross-entropy" in data["why"].lower()
    assert data["anchors"]["math_anchor_id"] == "math-mode-panel"


def test_tutor_code_mode(client: TestClient) -> None:
    payload = {
        "message": "What is this code line doing?",
        "context": {
            "training": {
                "algorithm": "linear_regression",
                "selected_step": 3,
                "total_steps": 30,
            }
        },
        "mode": "code",
    }

    response = client.post("/api/v1/tutor/respond", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "```python" in data["answer"]
    assert "X.T" in data["answer"] or "predictions" in data["answer"]
    assert data["anchors"]["code_anchor_id"] == "code-mode-panel"


def test_tutor_experiment_mode(client: TestClient) -> None:
    payload = {
        "message": "Why did changing the learning rate change the result?",
        "context": {
            "experiment": {
                "run_a_title": "Run A (LR=0.05)",
                "run_b_title": "Run B (LR=0.50)",
                "param_changed": "learning_rate",
                "run_a_val": "0.05",
                "run_b_val": "0.50",
                "run_a_metric": "MSE: 0.042",
                "run_b_metric": "MSE: 0.289",
            }
        },
        "mode": "experiment",
    }

    response = client.post("/api/v1/tutor/respond", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "Run A" in data["answer"]
    assert "Run B" in data["answer"]
    assert "learning_rate" in data["answer"]


def test_tutor_project_mode(client: TestClient) -> None:
    payload = {
        "message": "What should I focus on in this project milestone?",
        "context": {
            "project": {
                "project_id": "salary-prediction",
                "project_title": "Salary Prediction",
                "milestone_id": "preprocess",
                "milestone_order": 4,
                "milestone_title": "Prepare the Data",
                "educational_goal": "Configure imputation and scaling without leakage.",
                "dataset_name": "Experience & Education Salary",
                "model_name": "Linear Regression",
                "completed_milestones": ["problem", "explore", "quality"],
            }
        },
        "mode": "project",
    }

    response = client.post("/api/v1/tutor/respond", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "Salary Prediction" in data["answer"]
    assert "Prepare the Data" in data["answer"]
    assert "3 of 11 milestones" in data["answer"]


def test_tutor_challenge_hints(client: TestClient) -> None:
    payload = {
        "message": "Can you give me a hint for this challenge?",
        "context": {
            "diagnostic": {
                "type": "possible_instability",
                "title": "Possible Gradient Instability",
                "step": 8,
            }
        },
        "mode": "challenge",
    }

    response = client.post("/api/v1/tutor/respond", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "hint" in data["answer"].lower()
    assert "learning rate" in data["answer"].lower()


def test_tutor_off_topic_redirection(client: TestClient) -> None:
    payload = {
        "message": "Write me a short poem about the winter snow.",
        "context": {},
    }

    response = client.post("/api/v1/tutor/respond", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["mode"] == "off_topic"
    assert "mlingo" in data["answer"].lower()
    assert "telemetry" in data["answer"].lower() or "machine learning" in data["answer"].lower()


def test_tutor_factory_mock_provider() -> None:
    settings = Settings(tutor_provider="mock")
    provider = get_tutor_provider(settings)
    assert isinstance(provider, MockTutorProvider)


def test_tutor_request_validation(client: TestClient) -> None:
    # Missing required message field
    response = client.post("/api/v1/tutor/respond", json={"context": {}})
    assert response.status_code == 422
