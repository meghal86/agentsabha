from __future__ import annotations

import base64
import hashlib
import hmac
import json
from datetime import datetime, timedelta, timezone
from typing import Any

from app.config import get_settings


def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _b64decode(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(f"{value}{padding}".encode("utf-8"))


def sign_payload(payload: dict[str, Any], ttl_minutes: int) -> str:
    settings = get_settings()
    data = dict(payload)
    data["exp"] = int((datetime.now(timezone.utc) + timedelta(minutes=ttl_minutes)).timestamp())
    body = json.dumps(data, separators=(",", ":"), sort_keys=True).encode("utf-8")
    signature = hmac.new(settings.secret_key.encode("utf-8"), body, hashlib.sha256).digest()
    return f"{_b64encode(body)}.{_b64encode(signature)}"


def verify_token(token: str) -> dict[str, Any]:
    settings = get_settings()
    try:
      encoded_body, encoded_signature = token.split(".", 1)
    except ValueError as exc:
      raise ValueError("Invalid token format") from exc

    body = _b64decode(encoded_body)
    signature = _b64decode(encoded_signature)
    expected = hmac.new(settings.secret_key.encode("utf-8"), body, hashlib.sha256).digest()
    if not hmac.compare_digest(signature, expected):
      raise ValueError("Invalid token signature")

    payload = json.loads(body.decode("utf-8"))
    if int(payload["exp"]) < int(datetime.now(timezone.utc).timestamp()):
      raise ValueError("Token expired")
    return payload

