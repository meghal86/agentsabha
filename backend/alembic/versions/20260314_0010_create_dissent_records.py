from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "20260314_0010"
down_revision = "20260314_0009"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "dissent_records",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("citizen_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("citizens.id"), nullable=True),
        sa.Column("action_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("parliamentary_actions.id"), nullable=True),
        sa.Column("objection_text", sa.Text(), nullable=False),
        sa.Column("status", sa.Text(), nullable=False, server_default=sa.text("'open'")),
        sa.Column("resolution_text", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
    )


def downgrade() -> None:
    op.drop_table("dissent_records")

