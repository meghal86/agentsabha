from app.celery_app import celery_app


@celery_app.task(name="app.tasks.generate_draft_questions")
def generate_draft_questions() -> dict:
    return {"status": "queued"}

