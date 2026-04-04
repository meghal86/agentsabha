from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.constituency import Constituency
from app.models.sansaddarpan import ConstituencyWelfareProfile, RuleDeviationCase
from app.schemas.weekly_briefs import (
    WeeklyBriefAuditHook,
    WeeklyBriefCard,
    WeeklyBriefDetail,
    WeeklyBriefGap,
    WeeklyBriefListResponse,
    WeeklyBriefNarrativeBlock,
    WeeklyBriefParliamentaryMove,
    WeeklyBriefSource,
)

router = APIRouter(prefix="/api/briefs", tags=["briefs"])

DISPLAY_NAME_OVERRIDES = {
    "Bangalore South": "Bengaluru South",
    "Gurgaon": "Gurugram",
}


def _slugify(value: str) -> str:
    return value.lower().replace("&", "and").replace(".", "").replace(",", "").replace(" ", "-")


def _display_constituency_name(name: str | None) -> str:
    if not name:
        return "Unknown constituency"
    return DISPLAY_NAME_OVERRIDES.get(name, name)


def _build_brief_slug(constituency_name: str, top_gap: str) -> str:
    first_phrase = top_gap.split(".", 1)[0].split(",", 1)[0].strip().lower()
    short_topic = first_phrase.replace(" ", "-")[:36].strip("-")
    return f"{_slugify(_display_constituency_name(constituency_name))}-{short_topic or 'weekly-brief'}"


def _why_it_matters(status: str, metric_label: str) -> str:
    if status == "positive":
        return f"{metric_label} is a relative strength. The priority is to protect it through continued ministerial and administrative follow-through."
    if status == "pending":
        return f"{metric_label} is not yet resolved. It should move from observation to formal parliamentary follow-up before the next brief cycle."
    return f"{metric_label} is the type of delivery gap that can be translated into a parliamentary question or ministry response this week."


async def _reviewed_case_count(db: AsyncSession) -> int:
    return (
        await db.scalar(select(func.count(RuleDeviationCase.id)).where(RuleDeviationCase.status == "human-verified"))
    ) or 0


def _build_card(profile: ConstituencyWelfareProfile, constituency: Constituency) -> WeeklyBriefCard:
    constituency_name = _display_constituency_name(constituency.name)
    publish_date = (profile.last_refreshed_at or datetime.now(timezone.utc)).strftime("%B %Y")
    slug = _build_brief_slug(constituency_name, profile.top_gap)
    mp_name = constituency.mp_name or "Constituency MP"
    mp_party = constituency.mp_party or "Independent"
    headline = f"AI found a constituency brief for {constituency_name} that could help {mp_name} act this week."
    summary = (
        f"This weekly brief is generated from the current welfare evidence layer for {constituency_name}, "
        f"translating delivery gaps into one brief, one parliamentary move, and one public narrative."
    )
    return WeeklyBriefCard(
        slug=slug,
        constituency_slug=_slugify(constituency_name),
        week_label="Current week",
        publish_date=publish_date,
        constituency=constituency_name,
        state=constituency.state,
        mp_name=mp_name,
        mp_party=mp_party,
        headline=headline,
        summary=summary,
    )


def _question_text(constituency_name: str, state: str, metric_label: str) -> str:
    return (
        f"Will the concerned Minister be pleased to state whether the Government has reviewed the current "
        f"{metric_label.lower()} signal in {constituency_name}, {state}, and the steps proposed to address the identified delivery gap?"
    )


def _build_detail(profile: ConstituencyWelfareProfile, constituency: Constituency, reviewed_cases: int) -> WeeklyBriefDetail:
    card = _build_card(profile, constituency)
    metrics = sorted(profile.metrics, key=lambda item: item.display_order)
    welfare_gaps = [
        WeeklyBriefGap(
            title=metric.label,
            detail=f"{metric.value_text} against {metric.benchmark_text}. {profile.top_gap}",
            why_it_matters=_why_it_matters(metric.status, metric.label),
        )
        for metric in metrics[:3]
    ]
    lead_metric = metrics[0] if metrics else None
    constituency_name = card.constituency

    audit_hook = WeeklyBriefAuditHook(
        title="Audit hook for this week",
        body=(
            f"AI should pair {profile.top_gap.lower()} with a documentary question: are the administrative reasons for this gap "
            f"being recorded clearly enough for ministry follow-through and public review?"
        ),
        source_label="Constituency welfare evidence + public audit framing",
    )

    parliamentary_move = WeeklyBriefParliamentaryMove(
        title="One parliamentary move AI would hand to the MP",
        body=(
            "The point is not to accuse. It is to convert one constituency signal into one precise parliamentary move that can force a ministry response on record."
        ),
        draft_question=_question_text(constituency_name, card.state, lead_metric.label if lead_metric else "welfare delivery gap"),
    )

    anomaly = WeeklyBriefNarrativeBlock(
        title="Delivery anomaly",
        body=(
            f"The anomaly is not merely that {profile.top_gap.lower()} The anomaly is that this gap is visible enough in the public evidence layer "
            "to justify immediate parliamentary follow-up rather than waiting for another reporting cycle."
        ),
    )
    sdg_trend = WeeklyBriefNarrativeBlock(
        title="Trend to track next",
        body=(
            "The weekly brief should preserve a cumulative line of sight on livelihood reliability, housing/security delivery, and whether each visible gap reaches a formal question or response."
        ),
    )

    mp_summary = [
        f"This week’s highest-value move is to surface {lead_metric.label.lower() if lead_metric else 'the visible welfare gap'} through one formal parliamentary question.",
        "Keep the framing administrative and solution-oriented so the constituency issue enters the record without becoming performative accusation.",
        "Use the public brief as proof that AI can translate constituency evidence into immediate parliamentary utility.",
    ]

    video_segments = [
        WeeklyBriefNarrativeBlock(
            title="Opening",
            body=f"This week we looked at {constituency_name}. Not to grade the MP, but to show what AI can uncover for one constituency in a single working cycle.",
        ),
        WeeklyBriefNarrativeBlock(
            title="What AI found",
            body=profile.top_gap,
        ),
        WeeklyBriefNarrativeBlock(
            title="What the MP could do next",
            body=parliamentary_move.draft_question,
        ),
        WeeklyBriefNarrativeBlock(
            title="Why this matters",
            body=f"This brief is published on top of an evidence layer that currently includes {reviewed_cases} reviewed parliamentary cases and live constituency metrics.",
        ),
    ]

    source_trail = [
        WeeklyBriefSource(label="Constituency welfare profile", note=profile.top_gap),
        *[
            WeeklyBriefSource(label=metric.label, note=f"{metric.value_text} · benchmark {metric.benchmark_text}")
            for metric in metrics[:3]
        ],
    ]
    if profile.source_notes:
        source_trail.extend(WeeklyBriefSource(label="Source note", note=note) for note in profile.source_notes[:3])

    return WeeklyBriefDetail(
        **card.model_dump(),
        hero_note="This is a weekly constituency research brief demonstrating what AI can discover and package for an MP within one working cycle.",
        welfare_gaps=welfare_gaps,
        audit_hook=audit_hook,
        parliamentary_move=parliamentary_move,
        anomaly=anomaly,
        sdg_trend=sdg_trend,
        mp_summary=mp_summary,
        video_segments=video_segments,
        source_trail=source_trail,
    )


async def _load_profiles(db: AsyncSession) -> list[ConstituencyWelfareProfile]:
    result = await db.execute(
        select(ConstituencyWelfareProfile)
        .options(
            selectinload(ConstituencyWelfareProfile.constituency),
            selectinload(ConstituencyWelfareProfile.metrics),
        )
        .order_by(desc(ConstituencyWelfareProfile.last_refreshed_at), ConstituencyWelfareProfile.constituency_id)
    )
    return result.scalars().all()


@router.get("", response_model=WeeklyBriefListResponse)
async def list_weekly_briefs(db: AsyncSession = Depends(get_db)) -> WeeklyBriefListResponse:
    profiles = await _load_profiles(db)
    briefs = [
        _build_card(profile, profile.constituency)
        for profile in profiles
        if profile.constituency is not None
    ]
    return WeeklyBriefListResponse(briefs=briefs)


@router.get("/{slug}", response_model=WeeklyBriefDetail)
async def get_weekly_brief(slug: str, db: AsyncSession = Depends(get_db)) -> WeeklyBriefDetail:
    profiles = await _load_profiles(db)
    reviewed_cases = await _reviewed_case_count(db)

    for profile in profiles:
        constituency = profile.constituency
        if constituency is None:
            continue
        if _build_brief_slug(_display_constituency_name(constituency.name), profile.top_gap) == slug:
            return _build_detail(profile, constituency, reviewed_cases)

    raise HTTPException(status_code=404, detail="Weekly brief not found")
