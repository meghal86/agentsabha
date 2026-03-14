from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from pgvector.sqlalchemy import Vector
from sqlalchemy.dialects import postgresql

revision = "20260314_0003"
down_revision = "20260314_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # The vector extension is created here as a prerequisite for the schema's required vector column.
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.create_table(
        "issues",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("citizen_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("citizens.id"), nullable=True),
        sa.Column("constituency_id", sa.Integer(), sa.ForeignKey("constituencies.id"), nullable=True),
        sa.Column("raw_text", sa.Text(), nullable=False),
        sa.Column("translated_text", sa.Text(), nullable=True),
        sa.Column("source_language", sa.Text(), nullable=True),
        sa.Column("source_channel", sa.Text(), nullable=True),
        sa.Column("issue_type", sa.Text(), nullable=True),
        sa.Column("severity_score", sa.Numeric(3, 1), nullable=True),
        sa.Column("urgency_flag", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("location_district", sa.Text(), nullable=True),
        sa.Column("location_ward", sa.Text(), nullable=True),
        sa.Column("affected_estimate", sa.Integer(), nullable=True),
        sa.Column("embedding", Vector(1536), nullable=True),
        sa.Column("ministry_mapped", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
    )


def downgrade() -> None:
    op.drop_table("issues")
