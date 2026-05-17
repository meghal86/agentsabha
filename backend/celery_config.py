from celery.schedules import crontab


timezone = "Asia/Kolkata"

beat_schedule = {
    "clustering-every-15-min": {
        "task": "app.tasks.run_clustering",
        "schedule": crontab(minute="*/15"),
    },
    "cluster-snapshot-weekly": {
        "task": "app.tasks.take_cluster_snapshot",
        "schedule": crontab(day_of_week="sunday", hour=0, minute=0),
    },
    "draft-questions-daily": {
        "task": "app.tasks.generate_draft_questions",
        "schedule": crontab(hour=1, minute=30),
    },
    "zero-hour-overnight-watch": {
        "task": "app.tasks.generate_zero_hour_notices",
        "schedule": crontab(hour="20,21,22,23,0,1,2,3,4,5,6,7,8", minute=15),
    },
    "mp-brief-generation": {
        "task": "app.tasks.generate_mp_briefs",
        "schedule": crontab(day_of_week="friday", hour=2, minute=30),
    },
    "mp-brief-delivery": {
        "task": "app.tasks.deliver_mp_briefs",
        "schedule": crontab(day_of_week="friday", hour=3, minute=30),
    },
    "parliamentary-response-monitor": {
        "task": "app.tasks.check_parliamentary_responses",
        "schedule": crontab(hour=4, minute=30),
    },
    "weekly-audit": {
        "task": "app.tasks.run_weekly_audit",
        "schedule": crontab(day_of_week="friday", hour=14, minute=30),
    },
    # ── Sprint 1: X/Twitter constituency issue seeding ────────────────────────
    # Runs at :45 past the hour (offset from other tasks) so DB connections
    # don't spike. Skips silently when TWITTER_BEARER_TOKEN is not configured.
    "scrape-x-issues-every-6-hours": {
        "task": "app.tasks.scrape_x_constituency_issues",
        "schedule": crontab(hour="*/6", minute=45),
    },
}
