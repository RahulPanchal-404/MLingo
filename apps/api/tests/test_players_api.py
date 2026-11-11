import os
from datetime import date, datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.players.progress import level_for_xp, streaks, xp_for_result
from app.players.store import PlayerStore
from app.services import players as service

TODAY = datetime.now(timezone.utc).date()


POSTGRES_TEST_URL = os.environ.get("MLINGO_TEST_POSTGRES_URL")


def _make_store(kind: str):
    if kind == "sqlite":
        return PlayerStore(":memory:")
    if not POSTGRES_TEST_URL:
        pytest.skip("set MLINGO_TEST_POSTGRES_URL to run the Postgres store tests")
    import psycopg

    from app.players.pg_store import PostgresPlayerStore

    with psycopg.connect(POSTGRES_TEST_URL, autocommit=True) as conn:
        conn.execute("DROP SCHEMA IF EXISTS mlingo CASCADE")  # isolate each test
    return PostgresPlayerStore(POSTGRES_TEST_URL)


@pytest.fixture(params=["sqlite", "postgres"])
def client(request: pytest.FixtureRequest) -> TestClient:
    app = create_app()
    store = _make_store(request.param)
    app.dependency_overrides[service.get_player_store] = lambda: store
    return TestClient(app)


def _signup(client: TestClient, email: str = "ada@example.com") -> str:
    response = client.post(
        "/api/v1/auth/signup", json={"email": email, "display_name": "Ada", "password": "correct-horse"}
    )
    assert response.status_code == 201
    return response.json()["token"]


def _auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_signup_login_me_logout(client: TestClient) -> None:
    token = _signup(client)
    assert client.get("/api/v1/auth/me", headers=_auth(token)).json()["display_name"] == "Ada"

    login = client.post("/api/v1/auth/login", json={"email": "ADA@example.com ", "password": "correct-horse"})
    assert login.status_code == 200

    assert client.post("/api/v1/auth/logout", headers=_auth(token)).status_code == 204
    assert client.get("/api/v1/auth/me", headers=_auth(token)).status_code == 401


def test_duplicate_email_and_bad_password(client: TestClient) -> None:
    _signup(client)
    dup = client.post(
        "/api/v1/auth/signup", json={"email": "ada@example.com", "display_name": "Ada2", "password": "another-pass"}
    )
    assert dup.status_code == 409
    bad = client.post("/api/v1/auth/login", json={"email": "ada@example.com", "password": "nope-nope"})
    assert bad.status_code == 401


def test_signup_validation(client: TestClient) -> None:
    short = client.post("/api/v1/auth/signup", json={"email": "a@b.co", "display_name": "Al", "password": "short"})
    assert short.status_code == 422
    email = client.post("/api/v1/auth/signup", json={"email": "nope", "display_name": "Al", "password": "longenough"})
    assert email.status_code == 422


def test_progress_requires_auth(client: TestClient) -> None:
    assert client.get(f"/api/v1/players/me/progress?local_date={TODAY}").status_code == 401


def test_recording_results_updates_xp_streak_and_badges(client: TestClient) -> None:
    token = _signup(client)
    result = client.post(
        "/api/v1/players/me/results",
        headers=_auth(token),
        json={"game": "golf", "level_id": "bowl", "stars": 3, "score": 900, "meta": {"strokes": 1}, "local_date": str(TODAY)},
    )
    assert result.status_code == 201
    body = result.json()
    assert body["xp_gained"] == 10 + 45 + 60
    assert body["streak_extended"] is True
    earned = {b["id"] for b in body["new_badges"]}
    assert {"first-steps", "hole-in-one"} <= earned

    again = client.post(
        "/api/v1/players/me/results",
        headers=_auth(token),
        json={"game": "golf", "level_id": "bowl", "stars": 3, "score": 950, "meta": {"strokes": 1}, "local_date": str(TODAY)},
    ).json()
    assert again["xp_gained"] == 55
    assert again["new_badges"] == []

    progress = client.get(f"/api/v1/players/me/progress?local_date={TODAY}", headers=_auth(token)).json()
    assert progress["current_streak"] == 1
    assert progress["games"]["golf"]["bowl"] == {"stars": 3, "best_score": 950, "plays": 2}
    assert progress["calendar"][-1] == {"date": str(TODAY), "active": True}


def test_players_are_isolated(client: TestClient) -> None:
    a = _signup(client, "a@example.com")
    b = _signup(client, "b@example.com")
    client.post(
        "/api/v1/players/me/results",
        headers=_auth(a),
        json={"game": "rewind", "level_id": "overshoot", "stars": 2, "score": 500, "local_date": str(TODAY)},
    )
    progress_b = client.get(f"/api/v1/players/me/progress?local_date={TODAY}", headers=_auth(b)).json()
    assert progress_b["xp"] == 0 and progress_b["games_played"] == 0


def test_rejects_unknown_level_and_far_dates(client: TestClient) -> None:
    token = _signup(client)
    unknown = client.post(
        "/api/v1/players/me/results",
        headers=_auth(token),
        json={"game": "golf", "level_id": "moon", "stars": 1, "score": 1, "local_date": str(TODAY)},
    )
    assert unknown.status_code == 422
    future = client.post(
        "/api/v1/players/me/results",
        headers=_auth(token),
        json={"game": "golf", "level_id": "bowl", "stars": 1, "score": 1, "local_date": str(TODAY + timedelta(days=5))},
    )
    assert future.status_code == 422


def test_streak_rules() -> None:
    today = date(2026, 11, 3)
    days = {today - timedelta(days=i) for i in (1, 2, 3, 6, 7)}
    assert streaks(days, today) == (3, 3)
    assert streaks(days | {today}, today) == (4, 4)
    assert streaks({today - timedelta(days=2)}, today) == (0, 1)
    assert streaks(set(), today) == (0, 0)


def test_levels_and_xp() -> None:
    assert level_for_xp(0) == (1, 0, 100)
    assert level_for_xp(100) == (2, 0, 200)
    assert level_for_xp(299) == (2, 199, 200)
    assert level_for_xp(300) == (3, 0, 300)
    assert xp_for_result(0, 0) == 10
    assert xp_for_result(2, 1) == 60
