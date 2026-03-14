from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "20260314_0002"
down_revision = "20260314_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")
    op.create_table(
        "citizens",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("mobile_hash", sa.Text(), nullable=False, unique=True),
        sa.Column("aadhaar_vid", sa.Text(), nullable=True),
        sa.Column("constituency_id", sa.Integer(), sa.ForeignKey("constituencies.id"), nullable=True),
        sa.Column("verified", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("consent_flags", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("age_verified", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("blocked", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("last_active", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("citizens")

