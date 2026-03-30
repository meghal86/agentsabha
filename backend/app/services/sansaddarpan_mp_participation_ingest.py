from __future__ import annotations

import asyncio
import hashlib
import json
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from typing import Any, Optional

import httpx
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.mp_identity import MpIdentity, MpParticipationScore
from app.models.sansaddarpan import SansadDarpanIngestionRun, SansadDarpanSourceSnapshot
from app.services.sansaddarpan_mp_ingest import (
    DIGITAL_SANSAD_MEMBERS_PAGE,
    DIGITAL_SANSAD_SOURCE_KEY,
    DIGITAL_SANSAD_USER_AGENT,
    _fetch_latest_lok_sabha,
    ensure_mp_identity_fresh,
)


DIGITAL_SANSAD_QUESTION_API = "https://sansad.in/api_ls/question/participation"
DIGITAL_SANSAD_DEBATE_API = "https://sansad.in/api_ls/debate/participation"
DIGITAL_SANSAD_BILLS_API = "https://sansad.in/api_ls/debate/participationInBills"
DIGITAL_SANSAD_SPECIAL_MENTION_API = "https://sansad.in/api_ls/debate/participationInSpecialMention"
DIGITAL_SANSAD_COMMITTEE_API = "https://sansad.in/api_ls/committee/participation"
DIGITAL_SANSAD_ASSURANCE_API = "https://sansad.in/api_ls/govtAssurance/participation"
DIGITAL_SANSAD_ATTENDANCE_SESSIONS_API = "https://sansad.in/api_ls/member/members-loksabha-session"
DIGITAL_SANSAD_ATTENDANCE_API = "https://sansad.in/api_ls/member/getMemberAttendanceByMpsno"
DIGITAL_SANSAD_REQUEST_TIMEOUT = httpx.Timeout(12.0, connect=5.0)
PRESENT_ATTENDANCE_TYPES = {"S", "S*", "S#", "NS", "NS@"}


@dataclass
class MpParticipationSnapshot:
    lok_sabha_no: int
    mp_id: Any
    slug: str
    full_name_en: str
    constituency_id: Optional[int]
    constituency_name: Optional[str]
    state_name: Optional[str]
    party_name: Optional[str]
    sansad_id: str
    attendance_rate: float
    attendance_days_present: int
    attendance_days_total: int
    questions_asked: int
    debates_participated: int
    zero_hour_mentions: int
    private_member_bills: int
    committee_participation: int
    assurances_participated: int


@dataclass
class MpParticipationSyncResult:
    lok_sabha_no: int
    records_seen: int
    records_written: int
    source_snapshot_id: Optional[str]

    def as_dict(self) -> dict[str, Any]:
        return {
            "loksabha": self.lok_sabha_no,
            "records_seen": self.records_seen,
            "records_written": self.records_written,
            "source_snapshot_id": self.source_snapshot_id,
        }


async def ensure_mp_participation_fresh(db: AsyncSession, max_age_hours: int = 24) -> bool:
    await ensure_mp_identity_fresh(db)
    lok_sabha_no = await _current_lok_sabha_no(db)
    identity_count = await db.scalar(
        select(func.count(MpIdentity.mp_id)).where(MpIdentity.lok_sabha_no == lok_sabha_no, MpIdentity.sansad_id.is_not(None))
    ) or 0
    score_count, last_synced_at = (
        await db.execute(select(func.count(MpParticipationScore.id), func.max(MpParticipationScore.last_synced_at)))
    ).one()

    now = datetime.now(timezone.utc)
    if identity_count == 0:
        return False
    if (score_count or 0) == 0:
        await sync_mp_participation_from_digital_sansad(db, lok_sabha_no=lok_sabha_no)
        return True
    if last_synced_at is None:
        return False
    if now - last_synced_at >= timedelta(hours=max_age_hours) and (score_count or 0) >= identity_count:
        await sync_mp_participation_from_digital_sansad(db, lok_sabha_no=lok_sabha_no)
        return True
    return False


async def sync_mp_participation_from_digital_sansad(
    db: AsyncSession,
    *,
    lok_sabha_no: Optional[int] = None,
    max_members: Optional[int] = None,
) -> MpParticipationSyncResult:
    await ensure_mp_identity_fresh(db)
    lok_sabha_no = lok_sabha_no or await _current_lok_sabha_no(db)
    run = SansadDarpanIngestionRun(
        pipeline_key="digital_sansad_mp_participation",
        source_key=DIGITAL_SANSAD_SOURCE_KEY,
        status="running",
    )
    db.add(run)
    await db.flush()

    try:
        identities = (
            await db.execute(
                select(MpIdentity)
                .where(MpIdentity.lok_sabha_no == lok_sabha_no, MpIdentity.sansad_id.is_not(None))
                .order_by(MpIdentity.full_name_en)
            )
        ).scalars().all()
        if max_members is not None:
            existing_score_ids = {
                row[0]
                for row in (
                    await db.execute(select(MpParticipationScore.mp_id))
                ).all()
            }
            identities.sort(key=lambda item: (item.mp_id in existing_score_ids, item.full_name_en))
        if max_members is not None:
            identities = identities[:max_members]

        request_semaphore = asyncio.Semaphore(20)
        async with httpx.AsyncClient(
            follow_redirects=True,
            timeout=DIGITAL_SANSAD_REQUEST_TIMEOUT,
            headers={
                "User-Agent": DIGITAL_SANSAD_USER_AGENT,
                "Accept": "application/json, text/html;q=0.9,*/*;q=0.8",
            },
        ) as client:
            await client.get(DIGITAL_SANSAD_MEMBERS_PAGE)
            snapshot_results = await asyncio.gather(
                *[
                    _fetch_mp_snapshot(client, request_semaphore, lok_sabha_no, identity)
                    for identity in identities
                ]
            )
            snapshots = [item for item in snapshot_results if item is not None]

        score_map = {
            score.mp_id: score
            for score in (
                await db.execute(select(MpParticipationScore).where(MpParticipationScore.mp_id.in_([mp.mp_id for mp in identities])))
            ).scalars().all()
        }
        now = datetime.now(timezone.utc)
        ranked = _rank_snapshots(snapshots)

        for item in ranked:
            score = score_map.get(item["snapshot"].mp_id)
            if score is None:
                score = MpParticipationScore(mp_id=item["snapshot"].mp_id)
                db.add(score)

            snapshot = item["snapshot"]
            score.attendance_rate = snapshot.attendance_rate
            score.questions_asked = snapshot.questions_asked
            score.debates_participated = snapshot.debates_participated
            score.zero_hour_mentions = snapshot.zero_hour_mentions
            score.private_member_bills = snapshot.private_member_bills
            score.voting_participation = None
            score.participation_score = item["participation_score"]
            score.national_rank = item["national_rank"]
            score.state_rank = item["state_rank"]
            score.party_rank = item["party_rank"]
            score.score_breakdown = item["score_breakdown"]
            score.summary = item["summary"]
            score.narrative = item["narrative"]
            score.sources = item["sources"]
            score.og_ready = True
            score.last_synced_at = now

        source_snapshot = await _record_participation_snapshot(db, lok_sabha_no, ranked)
        run.status = "completed"
        run.records_seen = len(identities)
        run.records_written = len(ranked)
        run.summary = {
            "loksabha": lok_sabha_no,
            "snapshot_id": str(source_snapshot.id),
        }
        run.finished_at = now
        await db.commit()

        return MpParticipationSyncResult(
            lok_sabha_no=lok_sabha_no,
            records_seen=len(identities),
            records_written=len(ranked),
            source_snapshot_id=str(source_snapshot.id),
        )
    except Exception as exc:
        run.status = "failed"
        run.error_text = str(exc)
        run.finished_at = datetime.now(timezone.utc)
        await db.commit()
        raise


async def _current_lok_sabha_no(db: AsyncSession) -> int:
    lok_sabha_no = await db.scalar(select(func.max(MpIdentity.lok_sabha_no)))
    if lok_sabha_no is None:
        raise RuntimeError("Current Lok Sabha number unavailable for participation sync")
    return int(lok_sabha_no)


async def _fetch_mp_snapshot(
    client: httpx.AsyncClient,
    request_semaphore: asyncio.Semaphore,
    lok_sabha_no: int,
    mp: MpIdentity,
) -> Optional[MpParticipationSnapshot]:
    assert mp.sansad_id is not None
    referer = mp.biography_url or f"https://sansad.in/ls/members/biographyM/{mp.sansad_id}?from=members"
    try:
        questions = _fetch_participation_count(
            client,
            request_semaphore,
            DIGITAL_SANSAD_QUESTION_API,
            {"mpsno": mp.sansad_id, "loksabha": lok_sabha_no},
            referer,
        )
        debates = _fetch_participation_count(
            client,
            request_semaphore,
            DIGITAL_SANSAD_DEBATE_API,
            {"mpsno": mp.sansad_id, "loksabha": lok_sabha_no, "house": "LS"},
            referer,
        )
        bills = _fetch_participation_count(
            client,
            request_semaphore,
            DIGITAL_SANSAD_BILLS_API,
            {"mpsno": mp.sansad_id, "loksabha": lok_sabha_no, "house": "LS"},
            referer,
        )
        special_mentions = _fetch_participation_count(
            client,
            request_semaphore,
            DIGITAL_SANSAD_SPECIAL_MENTION_API,
            {"mpsno": mp.sansad_id, "loksabha": lok_sabha_no, "house": "LS"},
            referer,
        )
        committee = _fetch_participation_count(
            client,
            request_semaphore,
            DIGITAL_SANSAD_COMMITTEE_API,
            {"mpsno": mp.sansad_id, "loksabha": lok_sabha_no},
            referer,
        )
        assurances = _fetch_participation_count(
            client,
            request_semaphore,
            DIGITAL_SANSAD_ASSURANCE_API,
            {"mpsno": mp.sansad_id, "loksabha": lok_sabha_no},
            referer,
        )
        attendance = _fetch_attendance_summary(client, request_semaphore, lok_sabha_no, mp.sansad_id, referer)

        (
            questions_asked,
            debates_participated,
            private_member_bills,
            zero_hour_mentions,
            committee_participation,
            assurances_participated,
            attendance_summary,
        ) = await asyncio.gather(
            questions,
            debates,
            bills,
            special_mentions,
            committee,
            assurances,
            attendance,
        )

        return MpParticipationSnapshot(
            lok_sabha_no=lok_sabha_no,
            mp_id=mp.mp_id,
            slug=mp.slug,
            full_name_en=mp.full_name_en,
            constituency_id=mp.constituency_id,
            constituency_name=(
                (mp.profile_meta or {}).get("raw_constituency_name")
                if isinstance(mp.profile_meta, dict)
                else None
            ),
            state_name=((mp.profile_meta or {}).get("raw_state_name") if isinstance(mp.profile_meta, dict) else None),
            party_name=mp.party_name,
            sansad_id=mp.sansad_id,
            attendance_rate=attendance_summary["attendance_rate"],
            attendance_days_present=attendance_summary["attendance_days_present"],
            attendance_days_total=attendance_summary["attendance_days_total"],
            questions_asked=questions_asked,
            debates_participated=debates_participated,
            zero_hour_mentions=zero_hour_mentions,
            private_member_bills=private_member_bills,
            committee_participation=committee_participation,
            assurances_participated=assurances_participated,
        )
    except Exception:
        return None


async def _fetch_participation_count(
    client: httpx.AsyncClient,
    request_semaphore: asyncio.Semaphore,
    url: str,
    params: dict[str, Any],
    referer: str,
) -> int:
    payload = await _get_json(client, request_semaphore, url, params, referer)
    return int(payload.get("participation") or 0)


async def _fetch_attendance_summary(
    client: httpx.AsyncClient,
    request_semaphore: asyncio.Semaphore,
    lok_sabha_no: int,
    mpsno: str,
    referer: str,
) -> dict[str, Any]:
    payload = await _get_json(
        client,
        request_semaphore,
        DIGITAL_SANSAD_ATTENDANCE_SESSIONS_API,
        {"mpCode": mpsno},
        referer,
    )
    today = date.today()
    current = next((item for item in payload if int(item.get("loksabha") or 0) == lok_sabha_no), None)
    if not current:
        return {"attendance_rate": 0.0, "attendance_days_present": 0, "attendance_days_total": 0}

    sessions = current.get("sessions") or []
    attendance_payloads = await asyncio.gather(
        *[
            _get_json(
                client,
                request_semaphore,
                DIGITAL_SANSAD_ATTENDANCE_API,
                {"loksabha": lok_sabha_no, "session": session.get("sessionNo"), "mpsno": mpsno},
                referer,
            )
            for session in sessions
        ]
    )

    total_days = 0
    present_days = 0
    for session, attendance_payload in zip(sessions, attendance_payloads):
        scheduled_dates = {
            _parse_session_date(value)
            for value in (session.get("dates") or [])
            if _parse_session_date(value) is not None and _parse_session_date(value) <= today
        }
        if not scheduled_dates:
            continue
        total_days += len(scheduled_dates)
        attendance_dates: set[date] = set()
        for item in attendance_payload or []:
            if (item.get("attendanceType") or "").strip() not in PRESENT_ATTENDANCE_TYPES:
                continue
            for value in item.get("dates") or []:
                parsed = _parse_attendance_date(value)
                if parsed is not None and parsed in scheduled_dates:
                    attendance_dates.add(parsed)
        present_days += len(attendance_dates)

    attendance_rate = round((present_days / total_days) * 100, 1) if total_days else 0.0
    return {
        "attendance_rate": attendance_rate,
        "attendance_days_present": present_days,
        "attendance_days_total": total_days,
    }


async def _get_json(
    client: httpx.AsyncClient,
    request_semaphore: asyncio.Semaphore,
    url: str,
    params: dict[str, Any],
    referer: str,
) -> Any:
    last_error: Optional[Exception] = None
    for attempt in range(2):
        try:
            async with request_semaphore:
                response = await client.get(url, params=params, headers={"Referer": referer})
                response.raise_for_status()
                return response.json()
        except Exception as exc:  # pragma: no cover - network retry path
            last_error = exc
            await asyncio.sleep(0.15 * (attempt + 1))
    assert last_error is not None
    raise last_error


def _parse_session_date(value: str) -> Optional[date]:
    try:
        return datetime.strptime(value.strip(), "%d/%m/%Y").date()
    except Exception:
        return None


def _parse_attendance_date(value: str) -> Optional[date]:
    value = value.strip()
    for fmt in ("%Y-%m-%d %H:%M:%S", "%d/%m/%Y", "%d.%m.%Y"):
        try:
            return datetime.strptime(value, fmt).date()
        except Exception:
            continue
    return None


def _rank_snapshots(snapshots: list[MpParticipationSnapshot]) -> list[dict[str, Any]]:
    max_questions = max((item.questions_asked for item in snapshots), default=0)
    max_debates = max((item.debates_participated for item in snapshots), default=0)
    max_bonus = max((item.zero_hour_mentions + item.private_member_bills for item in snapshots), default=0)

    ranked: list[dict[str, Any]] = []
    for snapshot in snapshots:
        attendance_component = round((snapshot.attendance_rate / 100.0) * 30.0, 1)
        questions_component = round(_relative_score(snapshot.questions_asked, max_questions, 35.0), 1)
        debates_component = round(_relative_score(snapshot.debates_participated, max_debates, 25.0), 1)
        bonus_component = round(
            _relative_score(snapshot.zero_hour_mentions + snapshot.private_member_bills, max_bonus, 10.0),
            1,
        )
        participation_score = int(round(min(100.0, attendance_component + questions_component + debates_component + bonus_component)))

        ranked.append(
            {
                "snapshot": snapshot,
                "participation_score": participation_score,
                "score_breakdown": {
                    "attendance": attendance_component,
                    "questions": questions_component,
                    "debates": debates_component,
                    "bonus": bonus_component,
                },
            }
        )

    ranked.sort(
        key=lambda item: (
            -item["participation_score"],
            -item["snapshot"].attendance_rate,
            -item["snapshot"].questions_asked,
            -item["snapshot"].debates_participated,
            item["snapshot"].full_name_en,
        )
    )

    state_ranks = _partition_ranks(ranked, lambda item: item["snapshot"].state_name or "")
    party_ranks = _partition_ranks(ranked, lambda item: item["snapshot"].party_name or "")

    for index, item in enumerate(ranked, start=1):
        snapshot = item["snapshot"]
        item["national_rank"] = index
        item["state_rank"] = state_ranks.get(snapshot.slug)
        item["party_rank"] = party_ranks.get(snapshot.slug)
        item["summary"] = _build_summary(item)
        item["narrative"] = _build_narrative(item)
        item["sources"] = _build_sources(snapshot)

    return ranked


def _relative_score(value: int, max_value: int, weight: float) -> float:
    if max_value <= 0:
        return 0.0
    return (value / max_value) * weight


def _partition_ranks(items: list[dict[str, Any]], key_fn) -> dict[str, int]:
    grouped: dict[str, list[dict[str, Any]]] = {}
    for item in items:
        key = key_fn(item)
        if not key:
            continue
        grouped.setdefault(key, []).append(item)
    ranks: dict[str, int] = {}
    for group in grouped.values():
        for index, item in enumerate(group, start=1):
            ranks[item["snapshot"].slug] = index
    return ranks


def _build_summary(item: dict[str, Any]) -> str:
    snapshot: MpParticipationSnapshot = item["snapshot"]
    strengths: list[str] = []
    if snapshot.attendance_rate >= 85:
        strengths.append("strong attendance")
    if snapshot.questions_asked >= 40:
        strengths.append("high question volume")
    if snapshot.debates_participated >= 12:
        strengths.append("visible debate participation")
    if snapshot.zero_hour_mentions >= 4:
        strengths.append("active floor interventions")
    if not strengths:
        return "Live Digital Sansad scorecard with a lower-visibility participation profile so far."
    return "Live Digital Sansad scorecard showing " + ", ".join(strengths[:2]) + "."


def _build_narrative(item: dict[str, Any]) -> str:
    snapshot: MpParticipationSnapshot = item["snapshot"]
    components = item["score_breakdown"]
    strongest = max(components, key=components.get)
    strongest_label = {
        "attendance": "attendance discipline",
        "questions": "question activity",
        "debates": "debate participation",
        "bonus": "floor interventions",
    }[strongest]
    return (
        f"Current Lok Sabha records show {snapshot.attendance_rate:.1f}% attendance, "
        f"{snapshot.questions_asked} questions, {snapshot.debates_participated} debates, "
        f"and {snapshot.zero_hour_mentions} Special Mention interventions. "
        f"This score is driven most by {strongest_label}, with private member bills treated as a capped bonus."
    )


def _build_sources(snapshot: MpParticipationSnapshot) -> list[str]:
    mpsno = snapshot.sansad_id
    lok_sabha_no = snapshot.lok_sabha_no
    biography_url = f"https://sansad.in/ls/members/biographyM/{mpsno}?from=members"
    return [
        biography_url,
        f"{DIGITAL_SANSAD_QUESTION_API}?mpsno={mpsno}&loksabha={lok_sabha_no}",
        f"{DIGITAL_SANSAD_DEBATE_API}?mpsno={mpsno}&loksabha={lok_sabha_no}&house=LS",
        f"{DIGITAL_SANSAD_BILLS_API}?mpsno={mpsno}&loksabha={lok_sabha_no}&house=LS",
        f"{DIGITAL_SANSAD_SPECIAL_MENTION_API}?mpsno={mpsno}&loksabha={lok_sabha_no}&house=LS",
        f"{DIGITAL_SANSAD_ATTENDANCE_SESSIONS_API}?mpCode={mpsno}",
        "Voting participation is not yet exposed as a stable public Digital Sansad feed and is intentionally left undisclosed here.",
    ]


async def _record_participation_snapshot(
    db: AsyncSession,
    lok_sabha_no: int,
    ranked: list[dict[str, Any]],
) -> SansadDarpanSourceSnapshot:
    summary_rows = [
        {
            "slug": item["snapshot"].slug,
            "score": item["participation_score"],
            "attendance": item["snapshot"].attendance_rate,
            "questions": item["snapshot"].questions_asked,
            "debates": item["snapshot"].debates_participated,
            "special_mentions": item["snapshot"].zero_hour_mentions,
            "private_member_bills": item["snapshot"].private_member_bills,
        }
        for item in ranked
    ]
    payload = json.dumps({"loksabha": lok_sabha_no, "rows": summary_rows}, sort_keys=True).encode("utf-8")
    snapshot = SansadDarpanSourceSnapshot(
        source_key=DIGITAL_SANSAD_SOURCE_KEY,
        source_url=DIGITAL_SANSAD_QUESTION_API,
        snapshot_kind="json",
        fetch_status="ok",
        http_status=200,
        content_type="application/json",
        sha256=hashlib.sha256(payload).hexdigest(),
        snapshot_meta={
            "loksabha": lok_sabha_no,
            "records": len(summary_rows),
            "bytes": len(payload),
        },
    )
    db.add(snapshot)
    await db.flush()
    return snapshot
