from __future__ import annotations

from datetime import datetime
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class DissentRecord(Base):
    __tablename__ = "dissent_records"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    citizen_id: Mapped[UUID | None] = mapped_column(ForeignKey("citizens.id"))
    action_id: Mapped[UUID | None] = mapped_column(ForeignKey("parliamentary_actions.id"))
    objection_text: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(Text, default="open", nullable=False)
    resolution_text: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    citizen = relationship("Citizen", back_populates="dissents")
    action = relationship("ParliamentaryAction", back_populates="dissents")
