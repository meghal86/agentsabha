from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "20260328_0017"
down_revision = "20260328_0016"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("mp_identity", sa.Column("biography_url", sa.Text(), nullable=True))
    op.add_column("mp_identity", sa.Column("image_url", sa.Text(), nullable=True))
    op.add_column("mp_identity", sa.Column("profile_meta", postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column("mp_identity", sa.Column("last_synced_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("mp_identity", "last_synced_at")
    op.drop_column("mp_identity", "profile_meta")
    op.drop_column("mp_identity", "image_url")
    op.drop_column("mp_identity", "biography_url")
