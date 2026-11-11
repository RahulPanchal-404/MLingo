"""Regression tests for API hardening: divergence, input validation, and size limits."""

from math import isfinite

from fastapi.testclient import TestClient

from app.main import create_app
from app.schemas.training_runs import MAX_SAMPLE_STEPS
from app.schemas.tutor import MAX_MESSAGE_CHARS
from app.services.tutor import external

client = TestClient(create_app())


def _linear(**training: object) -> dict[str, object]:
    return {
        "algorithm": "linear_regression",
        "dataset": {"samples": 16, "slope": 2.0, "intercept": 1.0, "noise": 0.0, "seed": 0},
        "training": {"learning_rate": 0.1, "epochs": 20, "initial_weight": 0.0, "initial_bias": 0.0, **training},
    }


def _kmeans(**overrides: object) -> dict[str, object]:
    payload: dict[str, object] = {
        "algorithm": "kmeans",
        "dataset": {"samples": 10, "noise": 0.1, "seed": 0},
        "training": {"learning_rate": 0.1, "epochs": 5, "clusters": 3, "iterations": 5, "seed": 0},
    }
    payload.update(overrides)
    return payload


# --- Divergence (Break Mode) -------------------------------------------------


def test_diverging_run_returns_201_with_truncated_finite_history() -> None:
    response = client.post("/api/v1/training-runs", json=_linear(learning_rate=1e100, epochs=50))

    assert response.status_code == 201
    body = response.json()
    diverged_at = int(body["metadata"]["diverged_at_step"])
    assert body["metadata"]["stopped_reason"] == "diverged"
    assert 1 <= diverged_at <= 50
    # History stops before the first non-finite frame and stays self-consistent.
    assert len(body["history"]) == diverged_at
    assert body["total_steps"] == body["history"][-1]["step"] == diverged_at - 1
    for state in body["history"]:
        assert isfinite(state["loss"])
        assert all(isfinite(value) for value in state["weights"])


def test_stable_run_has_no_divergence_metadata() -> None:
    body = client.post("/api/v1/training-runs", json=_linear()).json()

    assert "diverged_at_step" not in body["metadata"]
    assert body["total_steps"] == 20
    assert len(body["history"]) == 21


def test_non_finite_initial_state_returns_422_not_500() -> None:
    payload = _linear()
    payload["dataset"] = {"samples": 16, "slope": 1e308, "intercept": 1e308, "noise": 0.0, "seed": 0}

    response = client.post("/api/v1/training-runs", json=payload)

    assert response.status_code == 422
    assert isinstance(response.json()["detail"], str)


# --- Input validation ----------------------------------------------------------


def test_kmeans_more_clusters_than_samples_returns_422() -> None:
    payload = _kmeans(training={"learning_rate": 0.1, "epochs": 5, "clusters": 11, "iterations": 5})

    assert client.post("/api/v1/training-runs", json=payload).status_code == 422


def test_negative_seeds_return_422() -> None:
    bad_dataset_seed = _linear()
    bad_dataset_seed["dataset"] = {**bad_dataset_seed["dataset"], "seed": -1}  # type: ignore[dict-item]
    bad_training_seed = _linear(seed=-1)

    for payload in (bad_dataset_seed, bad_training_seed):
        assert client.post("/api/v1/training-runs", json=payload).status_code == 422


def test_hidden_neurons_outside_supported_range_returns_422() -> None:
    payload = {
        "algorithm": "neural_network",
        "dataset": {"samples": 16, "noise": 0.1, "seed": 0},
        "training": {"learning_rate": 0.3, "epochs": 5, "hidden_neurons": 16},
    }

    assert client.post("/api/v1/training-runs", json=payload).status_code == 422


# --- Size limits -----------------------------------------------------------------


def test_samples_times_epochs_over_budget_returns_422() -> None:
    payload = _linear(epochs=10_000)
    payload["dataset"] = {**payload["dataset"], "samples": 10_000}  # type: ignore[dict-item]

    assert 10_000 * 10_000 > MAX_SAMPLE_STEPS
    assert client.post("/api/v1/training-runs", json=payload).status_code == 422


def test_largest_ui_configuration_is_still_accepted() -> None:
    payload = _linear(epochs=300)
    payload["dataset"] = {**payload["dataset"], "samples": 200}  # type: ignore[dict-item]

    assert client.post("/api/v1/training-runs", json=payload).status_code == 201


def test_tutor_rejects_oversized_and_empty_messages() -> None:
    too_long = {"message": "x" * (MAX_MESSAGE_CHARS + 1)}
    empty = {"message": ""}

    for payload in (too_long, empty):
        assert client.post("/api/v1/tutor/respond", json=payload).status_code == 422


def test_tutor_rejects_oversized_conversation_history() -> None:
    history = [{"role": "user", "content": "hi"}] * 51

    response = client.post("/api/v1/tutor/respond", json={"message": "hi", "conversation_history": history})

    assert response.status_code == 422


def test_external_call_limiter_caps_calls_per_window() -> None:
    limiter = external._SlidingWindowLimiter()

    assert [limiter.try_acquire(limit=2) for _ in range(3)] == [True, True, False]
    assert limiter.try_acquire(limit=0) is False


# --- Follow-up fixes -------------------------------------------------------------


def test_training_run_without_dataset_block_returns_201() -> None:
    response = client.post("/api/v1/training-runs", json={"algorithm": "linear_regression", "training": {"epochs": 5}})

    assert response.status_code == 201
    assert response.json()["dataset"]["samples"] == 32


def test_openai_provider_setting_never_uses_the_gemini_client() -> None:
    from app.core.config import Settings
    from app.services.tutor.factory import get_tutor_provider
    from app.services.tutor.fallback import DeterministicFallbackProvider

    provider = get_tutor_provider(Settings(tutor_provider="openai", tutor_api_key="sk-test"))

    assert isinstance(provider, DeterministicFallbackProvider)


def test_history_is_mapped_to_gemini_roles_without_duplicating_current_question() -> None:
    from app.schemas.tutor import TutorRequest

    request = TutorRequest(
        message="and now?",
        conversation_history=[
            {"role": "system", "content": "ignored"},
            {"role": "user", "content": "why did loss drop?"},
            {"role": "assistant", "content": "Because the gradient was large."},
            {"role": "user", "content": "and now?"},
        ],
    )

    turns = external._history_to_gemini(request)

    assert [turn["role"] for turn in turns] == ["user", "model"]
    assert turns[1]["parts"][0]["text"] == "Because the gradient was large."


def test_gemini_key_is_sent_in_header_not_url(monkeypatch) -> None:
    import asyncio

    from app.core.config import Settings
    from app.schemas.tutor import TutorRequest

    captured: dict[str, object] = {}

    class FakeResponse:
        status_code = 200
        text = ""

        def json(self) -> dict[str, object]:
            return {"candidates": [{"content": {"parts": [{"text": '{"answer": "ok", "evidence": []}'}]}}]}

    class FakeClient:
        def __init__(self, *args: object, **kwargs: object) -> None: ...
        async def __aenter__(self) -> "FakeClient":
            return self
        async def __aexit__(self, *args: object) -> None: ...
        async def post(self, url: str, json: object, headers: dict[str, str]) -> FakeResponse:
            captured.update(url=url, headers=headers)
            return FakeResponse()

    monkeypatch.setattr(external.httpx, "AsyncClient", FakeClient)
    provider = external.ExternalLLMProvider(Settings(tutor_provider="gemini", tutor_api_key="secret-key"))

    result = asyncio.run(provider.generate_response(TutorRequest(message="hi")))

    assert result.provider == "external_llm"
    assert "secret-key" not in str(captured["url"])
    assert captured["headers"] == {"x-goog-api-key": "secret-key"}
