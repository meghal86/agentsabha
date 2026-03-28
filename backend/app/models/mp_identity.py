from __future__ import annotations

from datetime import date
from typing import Any, Optional
from uuid import UUID

from sqlalchemy import Date, ForeignKey, Integer, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class MpIdentity(Base):
    __tablename__ = "mp_identity"

    mp_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    slug: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    sansad_id: Mapped[Optional[str]] = mapped_column(Text)
    eci_id: Mapped[Optional[str]] = mapped_column(Text)
    full_name_en: Mapped[str] = mapped_column(Text, nullable=False)
    full_name_hi: Mapped[Optional[str]] = mapped_column(Text)
    aliases: Mapped[Optional[list[str]]] = mapped_column(JSONB)
    constituency_id: Mapped[Optional[int]] = mapped_column(ForeignKey("constituencies.id"))
    party_name: Mapped[Optional[str]] = mapped_column(Text)
    term_start: Mapped[Optional[date]] = mapped_column(Date)
    term_end: Mapped[Optional[date]] = mapped_column(Date)
    lok_sabha_no: Mapped[Optional[int]] = mapped_column(Integer)

    constituency = relationship("Constituency")
    participation_scores = relationship("MpParticipationScore", back_populates="mp", cascade="all, delete-orphan")


class MpParticipationScore(Base):
    __tablename__ = "mp_participation_scores"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    mp_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("mp_identity.mp_id"), nullable=False)
    attendance_rate: Mapped[float] = mapped_column(nullable=False)
    questions_asked: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    debates_participated: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    zero_hour_mentions: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    private_member_bills: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    voting_participation: Mapped[float] = mapped_column(nullable=False)
    participation_score: Mapped[int] = mapped_column(Integer, nullable=False)
    national_rank: Mapped[int] = mapped_column(Integer, nullable=False)
    state_rank: Mapped[Optional[int]] = mapped_column(Integer)
    party_rank: Mapped[Optional[int]] = mapped_column(Integer)
    score_breakdown: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB)
    summary: Mapped[Optional[str]] = mapped_column(Text)
    narrative: Mapped[Optional[str]] = mapped_column(Text)
    sources: Mapped[Optional[list[str]]] = mapped_column(JSONB)
    og_ready: Mapped[bool] = mapped_column(default=True, nullable=False)

    mp = relationship("MpIdentity", back_populates="participation_scores")
