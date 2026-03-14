from __future__ import annotations

from app.utils.auth_tokens import sign_payload, verify_token


def test_sign_and_verify_token_round_trip() -> None:
    token = sign_payload({"purpose": "test", "citizen_id": "123"}, ttl_minutes=5)
    payload = verify_token(token)
    assert payload["purpose"] == "test"
    assert payload["citizen_id"] == "123"

