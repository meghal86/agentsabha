from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Constituency(Base):
    __tablename__ = "constituencies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    state: Mapped[str] = mapped_column(Text, nullable=False)
    region: Mapped[str | None] = mapped_column(Text)
    population: Mapped[int | None] = mapped_column(Integer)
    area_km2: Mapped[Decimal | None] = mapped_column(Numeric)
    mp_name: Mapped[str | None] = mapped_column(Text)
    mp_party: Mapped[str | None] = mapped_column(Text)
    mp_party_govt: Mapped[bool | None] = mapped_column(Boolean)
    lat: Mapped[Decimal | None] = mapped_column(Numeric)
    lng: Mapped[Decimal | None] = mapped_column(Numeric)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    citizens = relationship("Citizen", back_populates="constituency")
    issues = relationship("Issue", back_populates="constituency")
    clusters = relationship("IssueCluster", back_populates="constituency")
    actions = relationship("ParliamentaryAction", back_populates="constituency")
    briefs = relationship("MPBrief", back_populates="constituency")
