"""Celery task: scrape X (Twitter) for constituency civic issues.

Runs every 6 hours via Celery beat. For each pilot constituency:
  1. Calls the X scraper service to fetch recent tweets.
  2. Skips any tweet_id already in x_scraped_tweets (dedup).
  3. Writes a new Issue row (source_channel='x_scraped').
  4. Writes the XScrapedTweet dedup record linked to the Issue.

Gracefully skips if TWITTER_BEARER_TOKEN is not configured.
On rate-limit errors (tweepy.TooManyRequests), retries with Celery's
exponential backoff (max 3 retries, 5-min initial delay).
"""

from __future__ import annotations

import asyncio
import logging

from sqlalchemy import exists, select

from app.celery_app import celery_app
from app.config import get_settings
from app.database import AsyncSessionLocal, engine
from app.models.issue import Issue
from app.models.x_scraped_tweet import XScrapedTweet
from app.services.x_scraper import CONSTITUENCY_CONFIG, scrape_constituency

logger = logging.getLogger(__name__)

# ─── Pilot constituencies to scrape ──────────────────────────────────────────
PILOT_CONSTITUENCY_IDS = list(CONSTITUENCY_CONFIG.keys())  # [502, 477, 38]


async def _write_scraped_issues(scraped_issues: list) -> dict:
    """Persist scraped issues to DB, skipping already-seen tweet IDs."""
    await engine.dispose()
    written = 0
    skipped_dedup = 0

    async with AsyncSessionLocal() as db:
        for item in scraped_issues:
            # ── Dedup check ──────────────────────────────────────────────────
            already_seen = await db.scalar(
                select(exists().where(XScrapedTweet.tweet_id == item.tweet_id))
            )
            if already_seen:
                skipped_dedup += 1
                continue

            # ── Write Issue row ───────────────────────────────────────────────
            issue = Issue(
                constituency_id=item.constituency_id,
                raw_text=item.anonymised_text,
                source_channel="x_scraped",
                issue_type=item.issue_type,
                severity_score=item.severity,
                source_language=item.lang,
                # No citizen_id — public tweet, no user to associate
                citizen_id=None,
            )
            db.add(issue)
            await db.flush()  # get issue.id before writing the dedup record

            # ── Write dedup record ────────────────────────────────────────────
            dedup = XScrapedTweet(
                tweet_id=item.tweet_id,
                constituency_id=item.constituency_id,
                issue_id=issue.id,
                raw_text=item.anonymised_text,
                issue_type=item.issue_type,
                like_count=item.like_count,
                retweet_count=item.retweet_count,
                reply_count=item.reply_count,
                lang=item.lang,
            )
            db.add(dedup)
            written += 1

        await db.commit()

    await engine.dispose()
    return {"written": written, "skipped_dedup": skipped_dedup}


@celery_app.task(
    name="app.tasks.scrape_x_constituency_issues",
    bind=True,
    max_retries=3,
    default_retry_delay=300,  # 5 minutes initial, doubles on retry
)
def scrape_x_constituency_issues(self) -> dict:
    """Scrape X for civic issues in pilot constituencies and seed the issues table."""
    settings = get_settings()

    bearer_token = getattr(settings, "twitter_bearer_token", "")
    if not bearer_token:
        logger.info("x_scraper_task: TWITTER_BEARER_TOKEN not set — skipping scrape")
        return {"status": "skipped", "reason": "no_bearer_token"}

    summary: dict[str, dict] = {}

    for constituency_id in PILOT_CONSTITUENCY_IDS:
        try:
            scraped = scrape_constituency(constituency_id, bearer_token, max_results=50)
            result = asyncio.run(_write_scraped_issues(scraped))
            summary[str(constituency_id)] = {
                "fetched": len(scraped),
                **result,
            }
        except Exception as exc:
            # Check if it's a rate-limit error from tweepy
            exc_name = type(exc).__name__
            if exc_name in ("TooManyRequests", "TwitterServerError"):
                logger.warning(
                    "x_scraper_task: rate limit / server error for constituency=%s, retrying: %s",
                    constituency_id,
                    exc,
                )
                raise self.retry(exc=exc)

            logger.error(
                "x_scraper_task: unrecoverable error constituency=%s: %s",
                constituency_id,
                exc,
                exc_info=True,
            )
            summary[str(constituency_id)] = {"error": str(exc)}

    total_written = sum(v.get("written", 0) for v in summary.values())
    logger.info(
        "x_scraper_task: complete — %d new issues written across %d constituencies",
        total_written,
        len(PILOT_CONSTITUENCY_IDS),
    )
    return {"status": "completed", "constituencies": summary, "total_written": total_written}
