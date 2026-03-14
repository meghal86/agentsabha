from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "20260314_0007"
down_revision = "20260314_0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "parliamentary_actions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("constituency_id", sa.Integer(), sa.ForeignKey("constituencies.id"), nullable=True),
        sa.Column("cluster_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("issue_clusters.id"), nullable=True),
        sa.Column("action_type", sa.Text(), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("source_citations", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("ministry", sa.Text(), nullable=True),
        sa.Column("lok_sabha_rule", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default=sa.text("'draft'")),
        sa.Column("mp_approved", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("filed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("session_reference", sa.Text(), nullable=True),
        sa.Column("response_text", sa.Text(), nullable=True),
        sa.Column("response_received", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
    )


def downgrade() -> None:
    op.drop_table("parliamentary_actions")

