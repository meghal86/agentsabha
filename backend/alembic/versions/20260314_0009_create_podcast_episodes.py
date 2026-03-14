from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "20260314_0009"
down_revision = "20260314_0008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "podcast_episodes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("week_date", sa.Date(), nullable=False),
        sa.Column("script_text", sa.Text(), nullable=True),
        sa.Column("audio_url", sa.Text(), nullable=True),
        sa.Column("video_url", sa.Text(), nullable=True),
        sa.Column("fact_check_report", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("perspective_data", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
    )


def downgrade() -> None:
    op.drop_table("podcast_episodes")

