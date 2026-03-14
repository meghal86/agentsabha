from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from sqlalchemy import Boolean, DateTime, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Citizen(Base):
    __tablename__ = "citizens"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    mobile_hash: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    aadhaar_vid: Mapped[str | None] = mapped_column(Text)
    constituency_id: Mapped[int | None] = mapped_column(ForeignKey("constituencies.id"))
    verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    consent_flags: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    age_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    blocked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_active: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    constituency = relationship("Constituency", back_populates="citizens")
    issues = relationship("Issue", back_populates="citizen")
    dissents = relationship("DissentRecord", back_populates="citizen")
