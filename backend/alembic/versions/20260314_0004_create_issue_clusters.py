from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "20260314_0004"
down_revision = "20260314_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "issue_clusters",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("constituency_id", sa.Integer(), sa.ForeignKey("constituencies.id"), nullable=True),
        sa.Column("label", sa.Text(), nullable=True),
        sa.Column("category", sa.Text(), nullable=True),
        sa.Column("issue_count", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("severity_avg", sa.Numeric(3, 1), nullable=True),
        sa.Column("velocity", sa.Numeric(), nullable=True),
        sa.Column("badge", sa.Text(), nullable=True),
        sa.Column("first_seen", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("last_updated", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("national_flag", sa.Boolean(), nullable=False, server_default=sa.text("false")),
    )


def downgrade() -> None:
    op.drop_table("issue_clusters")

