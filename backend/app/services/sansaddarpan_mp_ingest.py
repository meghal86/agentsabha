from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any

import httpx
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.constituency import Constituency
from app.models.mp_identity import MpIdentity, MpParticipationScore
from app.models.sansaddarpan import SansadDarpanIngestionRun, SansadDarpanSourceSnapshot


DIGITAL_SANSAD_SOURCE_KEY = "digital_sansad_member_portal"
DIGITAL_SANSAD_MEMBERS_PAGE = "https://sansad.in/ls/members"
DIGITAL_SANSAD_MEMBERS_PAGE_HI = "https://sansad.in/ls/hi/members"
DIGITAL_SANSAD_LOKSABHA_API = "https://sansad.in/api_ls/business/AllLoksabhaAndSessionDates"
DIGITAL_SANSAD_MEMBER_API = "https://sansad.in/api_ls/member"
DIGITAL_SANSAD_USER_AGENT = "AgentSabha SansadDarpan/0.1 (+https://agentsabha.vercel.app)"
PAGE_SIZE = 100
HONORIFICS = (
    "shri",
    "smt",
    "smt.",
    "shrimat",
    "shrimati",
    "dr",
    "dr.",
    "prof",
    "prof.",
    "kumari",
    "adv",
    "adv.",
)

STATE_NAME_OVERRIDES = {
    "nct of delhi": "delhi",
    "orissa": "odisha",
    "pondicherry": "puducherry",
}

CONSTITUENCY_NAME_OVERRIDES = {
    "bangalore south": "bengaluru south",
    "bangalore rural": "bengaluru rural",
    "gurgaon": "gurugram",
    "nainital udham singh nagar": "nainital udhamsingh nagar",
}


@dataclass
class MpIdentitySyncResult:
    lok_sabha_no: int
    records_seen: int
    records_written: int
    matched_constituencies: int
    unmatched_constituencies: list[str]
    source_snapshot_id: str | None

    def as_dict(self) -> dict[str, Any]:
        return {
            "loksabha": self.lok_sabha_no,
            "records_seen": self.records_seen,
            "records_written": self.records_written,
            "matched_constituencies": self.matched_constituencies,
            "unmatched_constituencies": self.unmatched_constituencies,
            "source_snapshot_id": self.source_snapshot_id,
        }


def _clean_text(value: str | None) -> str:
    if not value:
        return ""
    return re.sub(r"\s+", " ", value.replace("\xa0", " ").strip())


def _normalize_token(value: str | None) -> str:
    text = _clean_text(value).lower()
    text = text.replace("&", " and ")
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def _normalize_state(value: str | None) -> str:
    normalized = _normalize_token(value)
    return STATE_NAME_OVERRIDES.get(normalized, normalized)


def _normalize_constituency(value: str | None) -> str:
    normalized = _normalize_token(value)
    return CONSTITUENCY_NAME_OVERRIDES.get(normalized, normalized)


def _slugify(value: str) -> str:
    slug = _normalize_person_name(value).replace(" ", "-")
    return slug or "member"


def _build_aliases(*values: str | None) -> list[str] | None:
    aliases: list[str] = []
    seen: set[str] = set()
    for value in values:
        cleaned = _clean_text(value)
        if not cleaned:
            continue
        key = cleaned.casefold()
        if key in seen:
            continue
        seen.add(key)
        aliases.append(cleaned)
    return aliases or None


def _normalize_person_name(value: str | None) -> str:
    tokens = [token for token in _normalize_token(value).split(" ") if token and token not in HONORIFICS]
    return " ".join(tokens).strip()


async def ensure_mp_identity_fresh(db: AsyncSession, max_age_hours: int = 24) -> bool:
    now = datetime.now(timezone.utc)
    result = await db.execute(select(func.count(MpIdentity.mp_id), func.max(MpIdentity.last_synced_at)))
    count, last_synced_at = result.one()
    if (count or 0) == 0:
        await sync_mp_identity_from_digital_sansad(db)
        return True
    if last_synced_at is None:
        await sync_mp_identity_from_digital_sansad(db)
        return True
    if now - last_synced_at >= timedelta(hours=max_age_hours):
        await sync_mp_identity_from_digital_sansad(db)
        return True
    return False


async def sync_mp_identity_from_digital_sansad(db: AsyncSession) -> MpIdentitySyncResult:
    run = SansadDarpanIngestionRun(
        pipeline_key="digital_sansad_mp_identity",
        source_key=DIGITAL_SANSAD_SOURCE_KEY,
        status="running",
    )
    db.add(run)
    await db.flush()

    try:
        timeout = httpx.Timeout(30.0, connect=10.0)
        async with httpx.AsyncClient(
            follow_redirects=True,
            timeout=timeout,
            headers={
                "User-Agent": DIGITAL_SANSAD_USER_AGENT,
                "Accept": "application/json, text/html;q=0.9,*/*;q=0.8",
            },
        ) as client:
            await client.get(DIGITAL_SANSAD_MEMBERS_PAGE)
            lok_sabha_no = await _fetch_latest_lok_sabha(client)
            english_rows = await _fetch_member_roster(client, lok_sabha_no, "en")
            hindi_rows = await _fetch_member_roster(client, lok_sabha_no, "hi")

        snapshot = await _record_source_snapshot(db, lok_sabha_no, english_rows, hindi_rows)
        constituency_index = await _load_constituency_index(db)
        existing_result = await db.execute(select(MpIdentity))
        existing_mps = existing_result.scalars().all()
        by_sansad_id = {mp.sansad_id: mp for mp in existing_mps if mp.sansad_id}
        by_slug = {mp.slug: mp for mp in existing_mps}
        by_name = {_normalize_person_name(mp.full_name_en): mp for mp in existing_mps if mp.full_name_en}
        reserved_slugs = {mp.slug for mp in existing_mps}
        hindi_by_id = {str(row["mpsno"]): row for row in hindi_rows if row.get("mpsno") is not None}

        matched_constituencies = 0
        unmatched_constituencies: set[str] = set()
        written = 0
        now = datetime.now(timezone.utc)
        touched_ids: set[str] = set()

        for row in english_rows:
            sansad_id = str(row["mpsno"])
            hindi_row = hindi_by_id.get(sansad_id)
            constituency = _match_constituency(constituency_index, row.get("constName"), row.get("stateName"))
            if constituency is not None:
                matched_constituencies += 1
            else:
                unmatched_constituencies.add(
                    f"{_clean_text(row.get('constName'))} ({_clean_text(row.get('stateName'))})".strip()
                )

            full_name_en = _clean_text(row.get("mpFirstLastName")) or _clean_text(row.get("mpLastFirstName"))
            canonical_name = _normalize_person_name(full_name_en)
            preferred_slug = _slugify(full_name_en or sansad_id)
            mp = by_sansad_id.get(sansad_id) or by_slug.get(preferred_slug) or by_name.get(canonical_name)
            if mp is None:
                slug = preferred_slug
                if slug in reserved_slugs:
                    slug = f"{slug}-{sansad_id.lower()}"
                mp = MpIdentity(slug=slug)
                db.add(mp)
                reserved_slugs.add(slug)
            else:
                slug = mp.slug

            mp.slug = slug
            mp.sansad_id = sansad_id
            mp.full_name_en = full_name_en
            mp.full_name_hi = _clean_text(hindi_row.get("mpFirstLastName") if hindi_row else None) or None
            mp.aliases = _build_aliases(
                row.get("mpLastFirstName"),
                row.get("mpFirstLastName"),
                hindi_row.get("mpFirstLastName") if hindi_row else None,
            )
            mp.constituency_id = constituency.id if constituency is not None else None
            mp.party_name = _clean_text(row.get("partyFname")) or None
            mp.lok_sabha_no = int(row.get("lastLoksabha") or lok_sabha_no)
            mp.biography_url = f"https://sansad.in/ls/members/biographyM/{sansad_id}?from=members"
            mp.image_url = _clean_text(row.get("imageUrl")) or None
            mp.profile_meta = {
                "initial": _clean_text(row.get("initial")) or None,
                "gender": _clean_text(row.get("gender")) or None,
                "date_of_birth": _clean_text(row.get("dob")) or None,
                "status": _clean_text(row.get("status")) or None,
                "profession_primary": _clean_text(row.get("profession")) or None,
                "profession_secondary": _clean_text(row.get("profession2")) or None,
                "qualification": _clean_text(row.get("qualification")) or None,
                "number_of_terms": row.get("noOfTerms"),
                "email": row.get("email") or [],
                "delhi_phone": _clean_text(row.get("delhiPhone")) or None,
                "personal_phone": _clean_text(row.get("personalPhone")) or None,
                "category_code": _clean_text(row.get("categoryCode")) or None,
                "raw_state_name": _clean_text(row.get("stateName")) or None,
                "raw_constituency_name": _clean_text(row.get("constName")) or None,
            }
            mp.last_synced_at = now

            if constituency is not None:
                constituency.mp_name = mp.full_name_en
                constituency.mp_party = mp.party_name

            by_sansad_id[sansad_id] = mp
            by_slug[mp.slug] = mp
            by_name[canonical_name] = mp
            touched_ids.add(str(mp.mp_id))
            written += 1

        await _prune_duplicate_identities(db)
        await _delete_stale_seed_identities(db, touched_ids)

        run.status = "completed"
        run.records_seen = len(english_rows)
        run.records_written = written
        run.summary = {
            "loksabha": lok_sabha_no,
            "matched_constituencies": matched_constituencies,
            "unmatched_constituencies": sorted(unmatched_constituencies),
            "snapshot_id": str(snapshot.id),
        }
        run.finished_at = now
        await db.commit()

        return MpIdentitySyncResult(
            lok_sabha_no=lok_sabha_no,
            records_seen=len(english_rows),
            records_written=written,
            matched_constituencies=matched_constituencies,
            unmatched_constituencies=sorted(unmatched_constituencies),
            source_snapshot_id=str(snapshot.id),
        )
    except Exception as exc:
        run.status = "failed"
        run.error_text = str(exc)
        run.finished_at = datetime.now(timezone.utc)
        await db.commit()
        raise


async def _fetch_latest_lok_sabha(client: httpx.AsyncClient) -> int:
    response = await client.get(DIGITAL_SANSAD_LOKSABHA_API, headers={"Referer": DIGITAL_SANSAD_MEMBERS_PAGE})
    response.raise_for_status()
    payload = response.json()
    if not isinstance(payload, list) or not payload:
        raise RuntimeError("Digital Sansad did not return Lok Sabha session metadata")
    latest = payload[-1].get("loksabha")
    if latest is None:
        raise RuntimeError("Digital Sansad latest Lok Sabha number missing")
    return int(latest)


async def _fetch_member_roster(client: httpx.AsyncClient, lok_sabha_no: int, locale: str) -> list[dict[str, Any]]:
    referer = DIGITAL_SANSAD_MEMBERS_PAGE if locale == "en" else DIGITAL_SANSAD_MEMBERS_PAGE_HI
    page = 1
    pages = 1
    rows: list[dict[str, Any]] = []

    while page <= pages:
        params = {
            "loksabha": str(lok_sabha_no),
            "state": "",
            "party": "",
            "gender": "",
            "maritalStatus": "",
            "ageFrom": "",
            "ageTo": "",
            "profession": "",
            "otherProfession": "",
            "qualification": "",
            "noOfTerms": "",
            "page": str(page),
            "size": str(PAGE_SIZE),
            "sitting": "1",
            "locale": locale,
        }
        response = await client.get(DIGITAL_SANSAD_MEMBER_API, params=params, headers={"Referer": referer})
        response.raise_for_status()
        payload = response.json()
        if payload.get("errorCode"):
            raise RuntimeError(f"Digital Sansad member roster returned {payload.get('errorMsg') or payload['errorCode']}")
        page_rows = payload.get("membersDtoList") or []
        meta = payload.get("metaDatasDto") or {}
        pages = int(meta.get("totalPages") or 1)
        rows.extend(page_rows)
        page += 1

    return rows


async def _record_source_snapshot(
    db: AsyncSession,
    lok_sabha_no: int,
    english_rows: list[dict[str, Any]],
    hindi_rows: list[dict[str, Any]],
) -> SansadDarpanSourceSnapshot:
    payload = json.dumps(
        {"loksabha": lok_sabha_no, "en": english_rows, "hi": hindi_rows},
        ensure_ascii=False,
        sort_keys=True,
    ).encode("utf-8")
    snapshot = SansadDarpanSourceSnapshot(
        source_key=DIGITAL_SANSAD_SOURCE_KEY,
        source_url=f"{DIGITAL_SANSAD_MEMBER_API}?loksabha={lok_sabha_no}&sitting=1&locale=en",
        snapshot_kind="json",
        fetch_status="ok",
        http_status=200,
        content_type="application/json",
        sha256=hashlib.sha256(payload).hexdigest(),
        snapshot_meta={
            "loksabha": lok_sabha_no,
            "records_en": len(english_rows),
            "records_hi": len(hindi_rows),
            "bytes": len(payload),
        },
    )
    db.add(snapshot)
    await db.flush()
    return snapshot


async def _load_constituency_index(db: AsyncSession) -> dict[tuple[str, str], Constituency]:
    result = await db.execute(select(Constituency))
    constituencies = result.scalars().all()
    index: dict[tuple[str, str], Constituency] = {}
    for constituency in constituencies:
        state_key = _normalize_state(constituency.state)
        constituency_key = _normalize_constituency(constituency.name)
        index[(state_key, constituency_key)] = constituency
    return index


def _match_constituency(
    index: dict[tuple[str, str], Constituency],
    constituency_name: str | None,
    state_name: str | None,
) -> Constituency | None:
    state_key = _normalize_state(state_name)
    constituency_key = _normalize_constituency(constituency_name)
    return index.get((state_key, constituency_key))


async def _prune_duplicate_identities(db: AsyncSession) -> None:
    result = await db.execute(select(MpIdentity).options(selectinload(MpIdentity.participation_scores)))
    identities = result.scalars().all()
    groups: dict[str, list[MpIdentity]] = {}
    for mp in identities:
        groups.setdefault(_normalize_person_name(mp.full_name_en), []).append(mp)

    for group in groups.values():
        if len(group) < 2:
            continue

        keeper = next((mp for mp in group if mp.participation_scores), None)
        if keeper is None:
            keeper = next((mp for mp in group if mp.sansad_id and mp.sansad_id.isdigit()), group[0])

        for candidate in group:
            if candidate is keeper:
                continue

            if not keeper.full_name_hi and candidate.full_name_hi:
                keeper.full_name_hi = candidate.full_name_hi
            if not keeper.sansad_id or keeper.sansad_id.startswith("LS"):
                keeper.sansad_id = candidate.sansad_id
            if not keeper.constituency_id and candidate.constituency_id:
                keeper.constituency_id = candidate.constituency_id
            if not keeper.party_name and candidate.party_name:
                keeper.party_name = candidate.party_name
            if not keeper.biography_url and candidate.biography_url:
                keeper.biography_url = candidate.biography_url
            if not keeper.image_url and candidate.image_url:
                keeper.image_url = candidate.image_url
            if not keeper.profile_meta and candidate.profile_meta:
                keeper.profile_meta = candidate.profile_meta

            for score in candidate.participation_scores:
                score.mp_id = keeper.mp_id

            await db.delete(candidate)


async def _delete_stale_seed_identities(db: AsyncSession, touched_ids: set[str]) -> None:
    result = await db.execute(select(MpIdentity).options(selectinload(MpIdentity.participation_scores)))
    identities = result.scalars().all()
    for mp in identities:
        if str(mp.mp_id) in touched_ids:
            continue
        if not mp.sansad_id or not mp.sansad_id.startswith("LS"):
            continue
        await db.delete(mp)
