from app.celery_app import celery_app


@celery_app.task(name="app.tasks.process_citizen_issue")
def process_citizen_issue(payload: dict) -> dict:
    return {"status": "queued", "payload_keys": sorted(payload.keys())}

