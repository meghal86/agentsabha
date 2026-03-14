from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "20260314_0012"
down_revision = "20260314_0011"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "blockchain_anchors",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("content_type", sa.Text(), nullable=True),
        sa.Column("content_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("content_hash", sa.Text(), nullable=False),
        sa.Column("tx_hash", sa.Text(), nullable=True),
        sa.Column("block_number", sa.BigInteger(), nullable=True),
        sa.Column("anchored_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("takedown_notice", sa.Boolean(), nullable=False, server_default=sa.text("false")),
    )


def downgrade() -> None:
    op.drop_table("blockchain_anchors")

