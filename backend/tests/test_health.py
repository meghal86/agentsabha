from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_endpoint_shape() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert set(data.keys()) == {"status", "db", "redis", "agents_active", "version"}

