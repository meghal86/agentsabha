from __future__ import annotations

from dataclasses import asdict, dataclass


@dataclass
class AuditEntry:
    agent_type: str
    constituency_id: int | None
    action: str
    input_hash: str
    output_hash: str
    model_version: str
    tokens_used: int | None = None
    latency_ms: int | None = None
    error_code: str | None = None


def build_audit_payload(entry: AuditEntry) -> dict:
    return asdict(entry)
