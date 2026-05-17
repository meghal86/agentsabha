"""Create x_scraped_tweets table for Twitter/X constituency issue seeding.

Stores deduplicated tweet IDs alongside the Issue rows they created,
so the Celery scraper never imports the same tweet twice.

Revision ID: 20260517_0020
Revises: 20260407_0019
Create Date: 2026-05-17
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "20260517_0020"
down_revision = "20260407_0019"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "x_scraped_tweets",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        # The original X/Twitter tweet snowflake ID — unique constraint is the dedup key.
        sa.Column("tweet_id", sa.String(32), nullable=False),
        sa.Column("constituency_id", sa.Integer, sa.ForeignKey("constituencies.id"), nullable=True),
        # The Issue row that was created from this tweet (null until the issue is written).
        sa.Column("issue_id", UUID(as_uuid=True), sa.ForeignKey("issues.id"), nullable=True),
        # Anonymised text: @usernames stripped, URLs removed.
        sa.Column("raw_text", sa.Text, nullable=False),
        sa.Column("issue_type", sa.Text, nullable=True),
        # Engagement counts at scrape time — used for severity estimation.
        sa.Column("like_count", sa.Integer, server_default="0", nullable=False),
        sa.Column("retweet_count", sa.Integer, server_default="0", nullable=False),
        sa.Column("reply_count", sa.Integer, server_default="0", nullable=False),
        sa.Column("lang", sa.String(10), nullable=True),
        sa.Column(
            "scraped_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.create_unique_constraint("uq_x_scraped_tweets_tweet_id", "x_scraped_tweets", ["tweet_id"])
    op.create_index("ix_x_scraped_tweets_constituency_id", "x_scraped_tweets", ["constituency_id"])
    op.create_index("ix_x_scraped_tweets_scraped_at", "x_scraped_tweets", ["scraped_at"])


def downgrade() -> None:
    op.drop_index("ix_x_scraped_tweets_scraped_at", table_name="x_scraped_tweets")
    op.drop_index("ix_x_scraped_tweets_constituency_id", table_name="x_scraped_tweets")
    op.drop_constraint("uq_x_scraped_tweets_tweet_id", "x_scraped_tweets", type_="unique")
    op.drop_table("x_scraped_tweets")
