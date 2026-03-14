from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "20260314_0006"
down_revision = "20260314_0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "cluster_snapshots",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("cluster_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("issue_clusters.id"), nullable=True),
        sa.Column("snapshot_date", sa.Date(), nullable=False),
        sa.Column("issue_count", sa.Integer(), nullable=True),
        sa.Column("severity_avg", sa.Numeric(3, 1), nullable=True),
        sa.UniqueConstraint("cluster_id", "snapshot_date", name="uq_cluster_snapshot"),
    )


def downgrade() -> None:
    op.drop_table("cluster_snapshots")

