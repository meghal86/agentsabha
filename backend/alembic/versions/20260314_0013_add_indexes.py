from __future__ import annotations

from alembic import op

revision = "20260314_0013"
down_revision = "20260314_0012"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.execute(
        "CREATE INDEX ix_issues_constituency_issue_type_created_at ON issues (constituency_id, issue_type, created_at DESC)"
    )
    op.create_index("ix_issues_cluster_id", "issues", ["cluster_id"], unique=False)
    op.create_index("ix_issue_clusters_constituency_badge", "issue_clusters", ["constituency_id", "badge"], unique=False)
    op.execute("CREATE INDEX ix_agent_logs_agent_type_created_at ON agent_logs (agent_type, created_at DESC)")
    op.execute("CREATE INDEX ix_agent_logs_constituency_created_at ON agent_logs (constituency_id, created_at DESC)")
    op.execute(
        "CREATE INDEX ix_issues_embedding_ivfflat ON issues USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_issues_embedding_ivfflat")
    op.execute("DROP INDEX IF EXISTS ix_agent_logs_constituency_created_at")
    op.execute("DROP INDEX IF EXISTS ix_agent_logs_agent_type_created_at")
    op.drop_index("ix_issue_clusters_constituency_badge", table_name="issue_clusters")
    op.drop_index("ix_issues_cluster_id", table_name="issues")
    op.execute("DROP INDEX IF EXISTS ix_issues_constituency_issue_type_created_at")
