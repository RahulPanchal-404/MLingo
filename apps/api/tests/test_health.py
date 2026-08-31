from fastapi.testclient import TestClient

from app.main import create_app


def test_application_starts() -> None:
    app = create_app()
    assert app.title == "MLingo API"


def test_health_endpoint() -> None:
    client = TestClient(create_app())

    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "MLingo API"}
