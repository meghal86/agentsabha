from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "20260314_0008"
down_revision = "20260314_0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "mp_briefs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("constituency_id", sa.Integer(), sa.ForeignKey("constituencies.id"), nullable=True),
        sa.Column("week_date", sa.Date(), nullable=False),
        sa.Column("brief_content", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("brief_pdf_url", sa.Text(), nullable=True),
        sa.Column("delivery_status", sa.Text(), nullable=True),
        sa.Column("delivered_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("mp_whatsapp", sa.Text(), nullable=True),
        sa.UniqueConstraint("constituency_id", "week_date", name="uq_mp_brief_constituency_week"),
    )


def downgrade() -> None:
    op.drop_table("mp_briefs")

