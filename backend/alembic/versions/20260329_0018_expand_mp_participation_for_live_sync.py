"""expand mp participation for live sync

Revision ID: 20260329_0018
Revises: 20260328_0017
Create Date: 2026-03-29 11:40:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260329_0018"
down_revision = "20260328_0017"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column("mp_participation_scores", "voting_participation", existing_type=sa.Float(), nullable=True)
    op.add_column("mp_participation_scores", sa.Column("last_synced_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("mp_participation_scores", "last_synced_at")
    op.alter_column("mp_participation_scores", "voting_participation", existing_type=sa.Float(), nullable=False)
