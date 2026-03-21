from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone
from typing import Any
from urllib.parse import urlparse

import httpx


SOURCE_CATALOG: dict[str, list[dict[str, str]]] = {
    "road": [
        {
            "title": "CAG audit reports on construction and maintenance of roads",
            "url": "https://cag.gov.in/en/audit-report?page=13&report_type%5B0%5D=54&title=highway+audit&ts=allwords",
            "type": "cag_audit_report",
            "keywords": "road transport highway bridge flyover accident corridor bypass audit cag",
        },
        {
            "title": "National Highways Authority of India official portal",
            "url": "https://nhai.gov.in/",
            "type": "government_record",
            "keywords": "national highway toll nhai expressway corridor bridge",
        },
        {
            "title": "PMGSY rural roads programme portal",
            "url": "https://pmgsy.nic.in/",
            "type": "scheme_guideline",
            "keywords": "rural village road school approach muddy road panchayat pmgsy",
        },
    ],
    "water": [
        {
            "title": "CAG performance audits on rural and urban water supply schemes",
            "url": "https://cag.gov.in/en/audit-report?title=maintenance",
            "type": "cag_audit_report",
            "keywords": "tap water drinking water pipeline household connection supply jal audit cag",
        },
        {
            "title": "Department of Water Resources official portal",
            "url": "https://jalshakti-dowr.gov.in/",
            "type": "government_record",
            "keywords": "drainage flood canal irrigation embankment stormwater river",
        },
        {
            "title": "Swachh Bharat Mission Grameen official portal",
            "url": "https://swachhbharatmission.ddws.gov.in/",
            "type": "scheme_guideline",
            "keywords": "drain blocked sewer sanitation waste water stagnation",
        },
    ],
    "power": [
        {
            "title": "CAG compliance audits of energy and power clusters",
            "url": "https://cag.gov.in/en/audit-report?title=govt+of+maharashtra",
            "type": "cag_audit_report",
            "keywords": "power electricity outage transformer voltage load shedding audit cag energy",
        },
        {
            "title": "National Power Portal",
            "url": "https://npp.gov.in/",
            "type": "government_record",
            "keywords": "power electricity feeder outage transformer generation substation",
        },
    ],
    "health": [
        {
            "title": "CAG reports on public health infrastructure and health services",
            "url": "https://cag.gov.in/en/audit-report?title=public+health+infrastructure",
            "type": "cag_audit_report",
            "keywords": "phc hospital clinic ambulance medicine nurse doctor nhm audit cag health",
        },
        {
            "title": "Ministry of Health and Family Welfare official portal",
            "url": "https://main.mohfw.gov.in/",
            "type": "ministry_record",
            "keywords": "health hospital medicine vaccination doctor public health mohfw",
        },
    ],
    "education": [
        {
            "title": "CAG reports covering Samagra Shiksha and school education delivery",
            "url": "https://cag.gov.in/en/audit-report?title=samagra+shiksha",
            "type": "cag_audit_report",
            "keywords": "school education teacher classroom student textbook scholarship audit cag",
        },
        {
            "title": "Samagra Shiksha programme portal",
            "url": "https://samagra.education.gov.in/",
            "type": "scheme_guideline",
            "keywords": "school teacher classroom toilet scholarship dropout samagra",
        },
    ],
    "employment": [
        {
            "title": "CAG audit reports on a decade of MGNREGS implementation",
            "url": "https://cag.gov.in/en/audit-report?title=A+decade+of+MGNREGS",
            "type": "cag_audit_report",
            "keywords": "employment wage job mgnrega work card payment labour audit cag",
        },
        {
            "title": "Ministry of Rural Development official portal",
            "url": "https://rural.nic.in/",
            "type": "ministry_record",
            "keywords": "employment livelihood rural development self help",
        },
    ],
    "housing": [
        {
            "title": "CAG audit reports on housing and urban development implementation",
            "url": "https://cag.gov.in/en/audit-report?title=pmay",
            "type": "cag_audit_report",
            "keywords": "housing house home shelter roof slum pmay urban audit cag",
        },
        {
            "title": "Ministry of Housing and Urban Affairs official portal",
            "url": "https://mohua.gov.in/",
            "type": "ministry_record",
            "keywords": "housing urban shelter slum pmay mohua",
        },
    ],
    "environment": [
        {
            "title": "CAG audit reports on environment and pollution control",
            "url": "https://cag.gov.in/en/audit-report?title=pollution",
            "type": "cag_audit_report",
            "keywords": "air pollution waste sewage garbage contamination cpcb audit cag",
        },
        {
            "title": "Ministry of Environment, Forest and Climate Change official portal",
            "url": "https://moef.gov.in/",
            "type": "ministry_record",
            "keywords": "environment pollution forest climate waste sewage",
        },
    ],
    "other": [
        {
            "title": "Government of India national portal",
            "url": "https://www.india.gov.in/",
            "type": "government_record",
            "keywords": "government citizen grievance public service scheme",
        }
    ],
}

TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.IGNORECASE | re.DOTALL)
META_OG_TITLE_RE = re.compile(
    r'<meta[^>]+property=["\']og:title["\'][^>]+content=["\'](.*?)["\']', re.IGNORECASE | re.DOTALL
)


class SourceRetrievalService:
    _cache: dict[str, dict[str, Any]] = {}
    _ttl = timedelta(hours=12)

    async def retrieve_primary_source(
        self,
        *,
        category: str | None,
        ministry: str | None = None,
        label: str | None = None,
        issue_text: str | None = None,
        issue_texts: list[str] | None = None,
    ) -> dict[str, str]:
        normalized_category = (category or "other").strip().lower()
        candidates = self._rank_candidates(
            SOURCE_CATALOG.get(normalized_category, SOURCE_CATALOG["other"]),
            ministry=ministry,
            label=label,
            issue_text=issue_text,
            issue_texts=issue_texts,
        )

        for candidate in candidates:
            metadata = await self._fetch_metadata(candidate["url"])
            if metadata["retrieval_status"] == "live":
                return {
                    "title": self._build_title(
                        metadata.get("title") or candidate["title"],
                        ministry=ministry,
                        label=label,
                    ),
                    "url": metadata["resolved_url"],
                    "type": candidate["type"],
                    "date": metadata["retrieved_at"][:10],
                    "retrieval_status": "live",
                    "source_domain": metadata["source_domain"],
                }

        fallback = candidates[0]
        parsed = urlparse(fallback["url"])
        return {
            "title": self._build_title(fallback["title"], ministry=ministry, label=label),
            "url": fallback["url"],
            "type": fallback["type"],
            "date": datetime.now(timezone.utc).date().isoformat(),
            "retrieval_status": "fallback",
            "source_domain": parsed.netloc,
        }

    def _rank_candidates(
        self,
        candidates: list[dict[str, str]],
        *,
        ministry: str | None,
        label: str | None,
        issue_text: str | None,
        issue_texts: list[str] | None,
    ) -> list[dict[str, str]]:
        query = " ".join(
            part.strip().lower()
            for part in [ministry or "", label or "", issue_text or "", *(issue_texts or [])]
            if part and part.strip()
        )
        if not query:
            return candidates

        scored: list[tuple[int, dict[str, str]]] = []
        query_words = set(re.findall(r"[a-z]{3,}", query))
        for candidate in candidates:
            score = 0
            keywords = set(re.findall(r"[a-z]{3,}", candidate.get("keywords", "").lower()))
            title_words = set(re.findall(r"[a-z]{3,}", candidate.get("title", "").lower()))
            url_words = set(re.findall(r"[a-z]{3,}", candidate.get("url", "").lower()))
            score += len(query_words & keywords) * 5
            score += len(query_words & title_words) * 2
            score += len(query_words & url_words)
            if ministry and ministry.lower() in candidate.get("title", "").lower():
                score += 4
            scored.append((score, candidate))

        return [candidate for _, candidate in sorted(scored, key=lambda item: item[0], reverse=True)]

    async def _fetch_metadata(self, url: str) -> dict[str, str]:
        cached = self._cache.get(url)
        now = datetime.now(timezone.utc)
        if cached and now - cached["cached_at"] < self._ttl:
            return cached["payload"]

        payload: dict[str, str]
        try:
            timeout = httpx.Timeout(3.5, connect=1.5)
            async with httpx.AsyncClient(follow_redirects=True, timeout=timeout) as client:
                response = await client.get(url, headers={"User-Agent": "AgentSabhaBot/1.0"})
                response.raise_for_status()
                html = response.text
                title = self._extract_title(html)
                resolved_url = str(response.url)
                payload = {
                    "title": title,
                    "resolved_url": resolved_url,
                    "retrieved_at": now.isoformat(),
                    "retrieval_status": "live",
                    "source_domain": urlparse(resolved_url).netloc,
                }
        except Exception:
            payload = {
                "title": "",
                "resolved_url": url,
                "retrieved_at": now.isoformat(),
                "retrieval_status": "fallback",
                "source_domain": urlparse(url).netloc,
            }

        self._cache[url] = {"cached_at": now, "payload": payload}
        return payload

    def _extract_title(self, html: str) -> str:
        match = META_OG_TITLE_RE.search(html)
        if match:
            return self._clean_title(match.group(1))
        match = TITLE_RE.search(html)
        if match:
            return self._clean_title(match.group(1))
        return ""

    def _clean_title(self, title: str) -> str:
        text = re.sub(r"\s+", " ", title).strip()
        return text[:240]

    def _build_title(self, base_title: str, *, ministry: str | None, label: str | None) -> str:
        suffix = []
        if ministry:
            suffix.append(ministry)
        if label:
            suffix.append(label)
        if suffix and base_title:
            return f"{base_title} — {' | '.join(suffix[:2])}"
        return base_title
