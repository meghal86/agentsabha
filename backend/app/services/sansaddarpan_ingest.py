from __future__ import annotations

import hashlib
from datetime import datetime, timezone

import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.sansaddarpan import SansadDarpanIngestionRun, SansadDarpanSourceSnapshot
from app.services.sansaddarpan_source_registry import OFFICIAL_SOURCES


USER_AGENT = "AgentSabha SansadDarpan/0.1 (+https://agentsabha.vercel.app)"


def list_source_keys() -> list[str]:
    return list(OFFICIAL_SOURCES.keys())


async def capture_source_snapshot(db: AsyncSession, source_key: str) -> SansadDarpanSourceSnapshot:
    source = OFFICIAL_SOURCES.get(source_key)
    if source is None:
        raise KeyError(f"Unknown SansadDarpan source key: {source_key}")

    run = SansadDarpanIngestionRun(
        pipeline_key="sansaddarpan_source_snapshot",
        source_key=source_key,
        status="running",
    )
    db.add(run)
    await db.flush()

    try:
        timeout = httpx.Timeout(20.0, connect=5.0)
        async with httpx.AsyncClient(
            follow_redirects=True,
            timeout=timeout,
            headers={"User-Agent": USER_AGENT},
        ) as client:
            response = await client.get(source.url)

        payload = response.content
        snapshot = SansadDarpanSourceSnapshot(
            source_key=source.key,
            source_url=str(response.url),
            snapshot_kind=_infer_snapshot_kind(response.headers.get("content-type"), payload),
            fetch_status="ok" if response.is_success else "http_error",
            http_status=response.status_code,
            content_type=response.headers.get("content-type"),
            sha256=hashlib.sha256(payload).hexdigest() if payload else None,
            snapshot_meta={
                "bytes": len(payload),
                "owner": source.owner,
                "title": source.title,
                "refresh": source.refresh,
                "acquisition": source.acquisition,
            },
        )
        db.add(snapshot)

        run.status = "completed" if response.is_success else "http_error"
        run.records_seen = 1
        run.records_written = 1 if response.is_success else 0
        run.summary = {
            "final_url": str(response.url),
            "http_status": response.status_code,
            "content_type": response.headers.get("content-type"),
            "bytes": len(payload),
        }
        run.finished_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(snapshot)
        return snapshot
    except Exception as exc:
        run.status = "failed"
        run.error_text = str(exc)
        run.finished_at = datetime.now(timezone.utc)
        await db.commit()
        raise


async def capture_core_source_snapshots(db: AsyncSession) -> list[SansadDarpanSourceSnapshot]:
    snapshots: list[SansadDarpanSourceSnapshot] = []
    for source_key in list_source_keys():
        snapshots.append(await capture_source_snapshot(db, source_key))
    return snapshots


def _infer_snapshot_kind(content_type: str | None, payload: bytes) -> str:
    normalized = (content_type or "").lower()
    if "pdf" in normalized:
        return "pdf"
    if "json" in normalized:
        return "json"
    if "csv" in normalized:
        return "csv"
    if "html" in normalized or payload.lstrip().startswith(b"<"):
        return "html"
    return "binary"
