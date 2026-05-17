from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pgvector.sqlalchemy import Vector
from sqlalchemy import Boolean, Computed, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Issue(Base):
    __tablename__ = "issues"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    citizen_id: Mapped[Optional[UUID]] = mapped_column(ForeignKey("citizens.id"))
    constituency_id: Mapped[Optional[int]] = mapped_column(ForeignKey("constituencies.id"))
    raw_text: Mapped[str] = mapped_column(Text, nullable=False)
    translated_text: Mapped[Optional[str]] = mapped_column(Text)
    source_language: Mapped[Optional[str]] = mapped_column(Text)
    source_channel: Mapped[Optional[str]] = mapped_column(Text)
    issue_type: Mapped[Optional[str]] = mapped_column(Text)
    severity_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(3, 1))
    urgency_flag: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    location_district: Mapped[Optional[str]] = mapped_column(Text)
    location_ward: Mapped[Optional[str]] = mapped_column(Text)
    affected_estimate: Mapped[Optional[int]] = mapped_column(Integer)
    embedding: Mapped[Optional[list[float]]] = mapped_column(Vector(1536))
    cluster_id: Mapped[Optional[UUID]] = mapped_column(ForeignKey("issue_clusters.id"))
    ministry_mapped: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    ip_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    submitted_at_bucket: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        Computed(
            "to_timestamp(floor(extract(epoch from created_at) / 21600.0) * 21600)",
            persisted=True,
        ),
    )

    citizen = relationship("Citizen", back_populates="issues")
    constituency = relationship("Constituency", back_populates="issues")
    cluster = relationship("IssueCluster", back_populates="issues")
