from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ConstituencyWelfareProfile(Base):
    __tablename__ = "constituency_welfare_profiles"
    __table_args__ = (UniqueConstraint("constituency_id", name="uq_constituency_welfare_profile"),)

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    constituency_id: Mapped[int] = mapped_column(ForeignKey("constituencies.id"), nullable=False)
    top_gap: Mapped[str] = mapped_column(Text, nullable=False)
    raised_in_parliament: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=func.false())
    refresh_cadence: Mapped[str] = mapped_column(Text, nullable=False, server_default="Daily scheme refresh")
    source_notes: Mapped[Optional[list[str]]] = mapped_column(JSONB)
    last_refreshed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    constituency = relationship("Constituency")
    metrics = relationship("ConstituencyWelfareMetric", back_populates="profile", cascade="all, delete-orphan")


class ConstituencyWelfareMetric(Base):
    __tablename__ = "constituency_welfare_metrics"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    profile_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("constituency_welfare_profiles.id"), nullable=False)
    metric_key: Mapped[str] = mapped_column(Text, nullable=False)
    label: Mapped[str] = mapped_column(Text, nullable=False)
    value_text: Mapped[str] = mapped_column(Text, nullable=False)
    benchmark_text: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(Text, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")

    profile = relationship("ConstituencyWelfareProfile", back_populates="metrics")


class RuleDeviationCase(Base):
    __tablename__ = "rule_deviation_cases"

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    session_label: Mapped[str] = mapped_column(Text, nullable=False)
    rule_reference: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(Text, nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    analysis: Mapped[str] = mapped_column(Text, nullable=False)
    primary_sources: Mapped[list[str]] = mapped_column(JSONB, nullable=False)
    review_notes: Mapped[list[str]] = mapped_column(JSONB, nullable=False)
    human_review_required: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=func.true())
    last_reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


class SansadDarpanSourceSnapshot(Base):
    __tablename__ = "sansaddarpan_source_snapshots"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    source_key: Mapped[str] = mapped_column(Text, nullable=False)
    source_url: Mapped[str] = mapped_column(Text, nullable=False)
    snapshot_kind: Mapped[str] = mapped_column(Text, nullable=False)
    fetch_status: Mapped[str] = mapped_column(Text, nullable=False)
    http_status: Mapped[Optional[int]] = mapped_column(Integer)
    content_type: Mapped[Optional[str]] = mapped_column(Text)
    sha256: Mapped[Optional[str]] = mapped_column(Text)
    storage_path: Mapped[Optional[str]] = mapped_column(Text)
    snapshot_meta: Mapped[Optional[dict]] = mapped_column(JSONB)
    captured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


class SansadDarpanIngestionRun(Base):
    __tablename__ = "sansaddarpan_ingestion_runs"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    pipeline_key: Mapped[str] = mapped_column(Text, nullable=False)
    source_key: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[str] = mapped_column(Text, nullable=False)
    records_seen: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    records_written: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    summary: Mapped[Optional[dict]] = mapped_column(JSONB)
    error_text: Mapped[Optional[str]] = mapped_column(Text)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
