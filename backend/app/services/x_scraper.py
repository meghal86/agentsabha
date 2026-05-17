"""X (Twitter) constituency issue scraper.

Pulls recent public tweets matching constituency-specific civic queries and
writes them into the ``issues`` table as ``source_channel='x_scraped'``.
The ``x_scraped_tweets`` table acts as a dedup registry so the same tweet is
never imported twice, even across Celery retries.

Requires: TWITTER_BEARER_TOKEN environment variable.
Twitter API tier: Basic ($100 / month) — provides search_recent_tweets.
Rate limits: 10 requests / 15 min per app (search endpoint).
              We run one query per constituency per scrape cycle.

Privacy policy:
  - @usernames are stripped before storage — we do not record who tweeted.
  - URLs are removed.
  - Text is truncated to 480 chars.
  - No author ID, no profile data, no DMs.
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass
from decimal import Decimal
from typing import Optional

logger = logging.getLogger(__name__)

# ─── Constituency configuration ──────────────────────────────────────────────
#
# Each entry maps a constituency DB id to:
#   - display_name: human-readable label
#   - queries: list of Twitter search query strings (one is chosen per run in
#     round-robin to stay within the 10 req / 15 min rate limit)
#
# Queries use Twitter v2 operators:
#   lang:en OR lang:hi   – English or Hindi tweets
#   -is:retweet          – exclude retweets (original posts only)
#   min_faves:1          – at least 1 like (removes most bots / pure spam)
#
CONSTITUENCY_CONFIG: dict[int, dict] = {
    502: {  # Thiruvananthapuram, Kerala
        "display_name": "Thiruvananthapuram",
        "queries": [
            "(Thiruvananthapuram OR Trivandrum) (road OR pothole OR traffic OR flyover) -is:retweet min_faves:1",
            "(Thiruvananthapuram OR Trivandrum) (water OR pipeline OR sewage OR flooding) -is:retweet min_faves:1",
            "(Thiruvananthapuram OR Trivandrum) (power cut OR electricity OR blackout OR voltage) -is:retweet min_faves:1",
            "(Thiruvananthapuram OR Trivandrum) (hospital OR doctor OR ambulance OR health) -is:retweet min_faves:1",
            "(Pettah OR Kowdiar OR Vanchiyoor OR Karamana) (problem OR issue OR broken OR repair) -is:retweet min_faves:1",
        ],
    },
    477: {  # Bengaluru South, Karnataka
        "display_name": "Bengaluru South",
        "queries": [
            "(Bengaluru South OR Bangalore South OR Jayanagar OR JP Nagar OR BTM) (road OR pothole OR traffic) -is:retweet min_faves:1",
            "(Bengaluru South OR Koramangala OR Banashankari) (water OR pipeline OR sewage OR flooding) -is:retweet min_faves:1",
            "(Bengaluru South OR BTM Layout OR Jayanagar) (power cut OR electricity OR BESCOM) -is:retweet min_faves:1",
            "(Bengaluru South OR Bangalore South) (hospital OR BBMP OR garbage OR waste) -is:retweet min_faves:1",
            "(Jayanagar OR JP Nagar OR Koramangala OR Banashankari) (problem OR repair OR broken OR infrastructure) -is:retweet min_faves:1",
        ],
    },
    38: {  # Gurugram, Haryana
        "display_name": "Gurugram",
        "queries": [
            "(Gurugram OR Gurgaon) (road OR pothole OR traffic OR flyover OR highway) -is:retweet min_faves:1",
            "(Gurugram OR Gurgaon) (water OR pipeline OR sewage OR waterlogging OR flooding) -is:retweet min_faves:1",
            "(Gurugram OR Gurgaon) (power cut OR electricity OR DHBVN OR outage) -is:retweet min_faves:1",
            "(Gurugram OR Gurgaon) (hospital OR pollution OR garbage OR MCG) -is:retweet min_faves:1",
            "(DLF OR Sohna Road OR Golf Course OR Sector 14 OR Sector 56) (problem OR repair OR issue OR broken) -is:retweet min_faves:1",
        ],
    },
}

# ─── Category keyword detection ───────────────────────────────────────────────
#
# Maps issue_type values (matching the existing Issue.issue_type enum) to
# keyword lists. First match wins; keywords are matched case-insensitively.
#
CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "road": [
        "pothole", "road", "highway", "flyover", "footpath", "pavement",
        "traffic", "signal", "divider", "street", "bridge", "underpass",
    ],
    "water": [
        "water", "pipeline", "sewage", "drain", "flood", "waterlog",
        "borewel", "tap", "supply", "leakage", "borewell",
    ],
    "power": [
        "power cut", "electricity", "blackout", "voltage", "transformer",
        "outage", "bescom", "dhbvn", "kseb", "tripping",
    ],
    "health": [
        "hospital", "doctor", "ambulance", "medicine", "health", "dispensary",
        "clinic", "icu", "emergency", "covid", "vaccination",
    ],
    "education": [
        "school", "college", "education", "teacher", "classroom",
        "syllabus", "university", "tuition", "fee",
    ],
    "environment": [
        "garbage", "waste", "pollution", "dust", "noise", "smog",
        "tree", "park", "open defecation", "dumping",
    ],
    "housing": [
        "housing", "flat", "slum", "eviction", "building", "construction",
        "encroachment", "illegal",
    ],
}

# ─── Dataclass returned by the scraper ───────────────────────────────────────

@dataclass
class ScrapedIssue:
    tweet_id: str
    constituency_id: int
    anonymised_text: str
    issue_type: Optional[str]
    severity: Decimal
    lang: Optional[str]
    like_count: int
    retweet_count: int
    reply_count: int


# ─── Text helpers ─────────────────────────────────────────────────────────────

_URL_RE = re.compile(r"https?://\S+")
_HANDLE_RE = re.compile(r"@\w+")
_WHITESPACE_RE = re.compile(r"\s+")


def _anonymise(text: str) -> str:
    """Remove URLs and @handles; collapse whitespace; truncate to 480 chars."""
    text = _URL_RE.sub("", text)
    text = _HANDLE_RE.sub("[user]", text)
    text = _WHITESPACE_RE.sub(" ", text).strip()
    return text[:480]


def _detect_issue_type(text: str) -> Optional[str]:
    """Return the first matching issue category or None."""
    lower = text.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in lower for kw in keywords):
            return category
    return None


def _estimate_severity(like_count: int, retweet_count: int, reply_count: int) -> Decimal:
    """Map engagement to a severity score on the 1–10 scale.

    Retweets are weighted double (signal amplification) and replies single
    (discussion indicator). Likes are the base signal.
    """
    engagement = like_count + (retweet_count * 2) + reply_count
    if engagement >= 500:
        return Decimal("9.0")
    if engagement >= 200:
        return Decimal("8.0")
    if engagement >= 100:
        return Decimal("7.0")
    if engagement >= 50:
        return Decimal("6.0")
    if engagement >= 20:
        return Decimal("5.0")
    if engagement >= 5:
        return Decimal("4.0")
    return Decimal("3.0")


# ─── Query state (round-robin per constituency) ───────────────────────────────

# In-memory counter; resets on worker restart (intentional — fine for MVP).
_query_index: dict[int, int] = {}


def _next_query(constituency_id: int) -> str:
    queries = CONSTITUENCY_CONFIG[constituency_id]["queries"]
    idx = _query_index.get(constituency_id, 0)
    _query_index[constituency_id] = (idx + 1) % len(queries)
    return queries[idx]


# ─── Main scraper ─────────────────────────────────────────────────────────────

def scrape_constituency(constituency_id: int, bearer_token: str, max_results: int = 50) -> list[ScrapedIssue]:
    """Fetch recent public tweets for one constituency and return ScrapedIssue list.

    Caller is responsible for dedup checking and DB writes.
    Raises tweepy.TweepyException on API / auth errors — let the Celery task
    handle retry logic.
    """
    try:
        import tweepy  # lazy import — not everyone installs tweepy in dev
    except ImportError:
        logger.error("tweepy is not installed. Run: pip install tweepy")
        return []

    if constituency_id not in CONSTITUENCY_CONFIG:
        logger.warning("x_scraper: unknown constituency_id=%s, skipping", constituency_id)
        return []

    query = _next_query(constituency_id)
    client = tweepy.Client(bearer_token=bearer_token, wait_on_rate_limit=True)

    logger.info(
        "x_scraper: scraping constituency=%s query='%s'",
        CONSTITUENCY_CONFIG[constituency_id]["display_name"],
        query[:80],
    )

    try:
        response = client.search_recent_tweets(
            query=query,
            max_results=min(max_results, 100),
            tweet_fields=["created_at", "public_metrics", "lang"],
        )
    except tweepy.TweepyException as exc:
        logger.error("x_scraper: Twitter API error constituency=%s: %s", constituency_id, exc)
        raise

    if not response.data:
        logger.info("x_scraper: no results for constituency=%s", constituency_id)
        return []

    results: list[ScrapedIssue] = []
    for tweet in response.data:
        metrics = tweet.public_metrics or {}
        like_count = metrics.get("like_count", 0)
        retweet_count = metrics.get("retweet_count", 0)
        reply_count = metrics.get("reply_count", 0)

        anonymised = _anonymise(tweet.text)
        if len(anonymised.split()) < 4:
            # Skip very short / empty-after-anonymisation tweets
            continue

        results.append(
            ScrapedIssue(
                tweet_id=str(tweet.id),
                constituency_id=constituency_id,
                anonymised_text=anonymised,
                issue_type=_detect_issue_type(anonymised),
                severity=_estimate_severity(like_count, retweet_count, reply_count),
                lang=tweet.lang,
                like_count=like_count,
                retweet_count=retweet_count,
                reply_count=reply_count,
            )
        )

    logger.info(
        "x_scraper: found %d usable tweets for constituency=%s",
        len(results),
        constituency_id,
    )
    return results
