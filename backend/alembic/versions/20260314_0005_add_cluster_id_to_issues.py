from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "20260314_0005"
down_revision = "20260314_0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("issues", sa.Column("cluster_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key("fk_issues_cluster_id", "issues", "issue_clusters", ["cluster_id"], ["id"])


def downgrade() -> None:
    op.drop_constraint("fk_issues_cluster_id", "issues", type_="foreignkey")
    op.drop_column("issues", "cluster_id")

