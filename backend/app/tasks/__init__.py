"""Celery tasks for AgentSabha."""

# Import all task modules so Celery autodiscover registers them.
from app.tasks import x_scraper_task  # noqa: F401

