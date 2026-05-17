from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class XScrapedTweet(Base):
    """Dedup registry for tweets imported as Issues via the X scraping pipeline.

    One row per unique tweet_id. The corresponding Issue row is linked via
    issue_id once it has been written. The unique constraint on tweet_id is the
    primary anti-duplicate guard — the Celery task also does an application-level
    check before the DB write, but the constraint is the authoritative gate.
    """

    __tablename__ = "x_scraped_tweets"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid()
    )
    tweet_id: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    constituency_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("constituencies.id"), nullable=True
    )
    issue_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("issues.id"), nullable=True
    )
    # Anonymised: @usernames and URLs stripped before storage.
    raw_text: Mapped[str] = mapped_column(Text, nullable=False)
    issue_type: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    like_count: Mapped[int] = mapped_column(Integer, server_default="0", nullable=False)
    retweet_count: Mapped[int] = mapped_column(Integer, server_default="0", nullable=False)
    reply_count: Mapped[int] = mapped_column(Integer, server_default="0", nullable=False)
    lang: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    scraped_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
