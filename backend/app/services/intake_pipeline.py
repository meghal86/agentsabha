from __future__ import annotations

from time import perf_counter
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.intake import IntakeAgent
from app.database import AsyncSessionLocal
from app.models.agent_log import AgentLog
from app.models.issue import Issue
from app.services.embedding import EmbeddingService
from app.services.translation import TranslationService
from app.utils.audit_logger import AuditEntry, build_audit_payload
from app.utils.hashing import sha256_hex


async def process_issue_intake(db: AsyncSession, issue_id: UUID | str) -> Issue:
    issue_uuid = UUID(str(issue_id))
    issue = await db.scalar(select(Issue).where(Issue.id == issue_uuid))
    if issue is None:
        raise ValueError(f"Issue {issue_uuid} not found")

    started_at = perf_counter()
    translation = await TranslationService().translate_to_english(issue.raw_text, source_language=issue.source_language)
    translated_text = translation["translated_text"]
    source_language = translation["source_language"]

    intake = await IntakeAgent().run(
        translated_text,
        {
            "language": source_language,
            "channel": issue.source_channel,
            "issue_id": str(issue.id),
            "constituency_id": issue.constituency_id,
            "location": issue.location_ward,
            "category_hint": issue.issue_type,
        },
    )
    embedding = await EmbeddingService().embed_text(translated_text)

    issue.translated_text = translated_text
    issue.source_language = source_language
    issue.issue_type = intake.get("issue_type") or issue.issue_type
    issue.severity_score = intake.get("severity_score")
    issue.urgency_flag = bool(intake.get("urgency_flag"))
    issue.location_district = intake.get("location_district")
    issue.location_ward = intake.get("location_ward")
    issue.affected_estimate = intake.get("affected_estimate")
    issue.embedding = embedding
    issue.ministry_mapped = intake.get("ministry_mapped")

    latency_ms = int((perf_counter() - started_at) * 1000)
    audit_payload = build_audit_payload(
        AuditEntry(
            agent_type="intake",
            constituency_id=issue.constituency_id,
            action="issue_processed",
            input_hash=sha256_hex(issue.raw_text),
            output_hash=sha256_hex(f"{issue.id}:{issue.issue_type}:{issue.severity_score}:{issue.ministry_mapped}"),
            model_version=IntakeAgent.model,
            tokens_used=0,
            latency_ms=latency_ms,
            error_code=None,
        )
    )
    db.add(AgentLog(**audit_payload))
    await db.commit()
    await db.refresh(issue)
    return issue


async def process_issue_intake_job(issue_id: UUID | str) -> dict[str, str]:
    async with AsyncSessionLocal() as session:
        issue = await process_issue_intake(session, issue_id)
        return {"status": "processed", "issue_id": str(issue.id)}
