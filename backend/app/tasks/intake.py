from __future__ import annotations

import asyncio

from app.celery_app import celery_app
from app.services.intake_pipeline import process_issue_intake_job


@celery_app.task(name="app.tasks.process_citizen_issue")
def process_citizen_issue(payload: dict) -> dict:
    issue_id = payload.get("issue_id")
    if not issue_id:
        return {"status": "ignored", "reason": "missing_issue_id"}
    return asyncio.run(process_issue_intake_job(issue_id))
