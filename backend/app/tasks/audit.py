from app.celery_app import celery_app


@celery_app.task(name="app.tasks.run_weekly_audit")
def run_weekly_audit() -> dict:
    return {"status": "queued"}

