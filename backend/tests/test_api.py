from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_public_constituency_endpoint() -> None:
    response = client.get("/api/constituency/1")
    assert response.status_code == 200
    assert response.json()["id"] == 1


def test_citizen_issue_requires_auth() -> None:
    response = client.get("/api/citizen/issue/example-issue")
    assert response.status_code == 401

