from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, Numeric, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class IssueCluster(Base):
    __tablename__ = "issue_clusters"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    constituency_id: Mapped[Optional[int]] = mapped_column(ForeignKey("constituencies.id"))
    label: Mapped[Optional[str]] = mapped_column(Text)
    category: Mapped[Optional[str]] = mapped_column(Text)
    issue_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    severity_avg: Mapped[Optional[Decimal]] = mapped_column(Numeric(3, 1))
    velocity: Mapped[Optional[Decimal]] = mapped_column(Numeric)
    badge: Mapped[Optional[str]] = mapped_column(Text)
    first_seen: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_updated: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    national_flag: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    constituency = relationship("Constituency", back_populates="clusters")
    issues = relationship("Issue", back_populates="cluster")
    snapshots = relationship("ClusterSnapshot", back_populates="cluster")
    actions = relationship("ParliamentaryAction", back_populates="cluster")


class ClusterSnapshot(Base):
    __tablename__ = "cluster_snapshots"
    __table_args__ = (UniqueConstraint("cluster_id", "snapshot_date", name="uq_cluster_snapshot"),)

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    cluster_id: Mapped[Optional[UUID]] = mapped_column(ForeignKey("issue_clusters.id"))
    snapshot_date: Mapped[date] = mapped_column(Date, nullable=False)
    issue_count: Mapped[Optional[int]] = mapped_column(Integer)
    severity_avg: Mapped[Optional[Decimal]] = mapped_column(Numeric(3, 1))

    cluster = relationship("IssueCluster", back_populates="snapshots")
