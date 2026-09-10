from copy import deepcopy

from fastapi.testclient import TestClient

from app.main import create_app


client = TestClient(create_app())


def _payload() -> dict[str, object]:
    return {
        "algorithm": "linear_regression",
        "dataset": {"samples": 8, "slope": 2.0, "intercept": 1.0, "noise": 0.0, "seed": 4},
        "training": {"learning_rate": 0.1, "epochs": 5, "initial_weight": 0.0, "initial_bias": 0.0},
    }


def test_create_training_run_returns_serializable_history() -> None:
    response = client.post("/api/v1/training-runs", json=_payload())

    assert response.status_code == 201
    body = response.json()
    assert body["id"]
    assert body["algorithm"] == "linear_regression.gradient_descent"
    assert body["dataset"] == _payload()["dataset"]
    assert len(body["dataset_points"]) == 8
    assert body["training"] == _payload()["training"]
    assert body["total_steps"] == 5
    assert len(body["history"]) == 6
    assert body["history"][0]["step"] == 0
    assert body["history"][0]["bias_gradient"] is None
    assert body["history"][0]["gradients"] == []
    assert isinstance(body["history"][0]["weights"][0], float)
    assert isinstance(body["history"][0]["predictions"], list)
    assert body["metadata"] == {"feature_count": "1", "sample_count": "8"}


def test_deterministic_request_has_same_output_except_run_id() -> None:
    first = client.post("/api/v1/training-runs", json=_payload()).json()
    second = client.post("/api/v1/training-runs", json=_payload()).json()
    first_without_id = deepcopy(first)
    second_without_id = deepcopy(second)
    first_without_id.pop("id")
    second_without_id.pop("id")

    assert first["id"] != second["id"]
    assert first_without_id == second_without_id


def test_invalid_training_and_dataset_input_returns_validation_error() -> None:
    invalid_learning_rate = _payload()
    invalid_learning_rate["training"] = {"learning_rate": 0, "epochs": 5}
    invalid_epochs = _payload()
    invalid_epochs["training"] = {"learning_rate": 0.1, "epochs": 0}
    invalid_dataset = _payload()
    invalid_dataset["dataset"] = {"samples": 0}

    for payload in (invalid_learning_rate, invalid_epochs, invalid_dataset):
        assert client.post("/api/v1/training-runs", json=payload).status_code == 422


def test_training_runs_cors_allows_only_configured_frontend_origin() -> None:
    response = client.options(
        "/api/v1/training-runs",
        headers={"Origin": "http://localhost:3000", "Access-Control-Request-Method": "POST"},
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
