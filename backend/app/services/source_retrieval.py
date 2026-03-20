from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone
from typing import Any
from urllib.parse import urlparse

import httpx


SOURCE_CATALOG: dict[str, list[dict[str, str]]] = {
    "road": [
        {
            "title": "Ministry of Road Transport and Highways official portal",
            "url": "https://morth.nic.in/",
            "type": "ministry_record",
        },
        {
            "title": "National Highways Authority of India official portal",
            "url": "https://nhai.gov.in/",
            "type": "government_record",
        },
    ],
    "water": [
        {
            "title": "Jal Jeevan Mission official portal",
            "url": "https://jaljeevanmission.gov.in/",
            "type": "scheme_guideline",
        },
        {
            "title": "Department of Water Resources official portal",
            "url": "https://jalshakti-dowr.gov.in/",
            "type": "government_record",
        },
    ],
    "power": [
        {
            "title": "Ministry of Power official portal",
            "url": "https://powermin.gov.in/",
            "type": "ministry_record",
        },
        {
            "title": "National Power Portal",
            "url": "https://npp.gov.in/",
            "type": "government_record",
        },
    ],
    "health": [
        {
            "title": "National Health Mission official portal",
            "url": "https://nhm.gov.in/",
            "type": "scheme_guideline",
        },
        {
            "title": "Ministry of Health and Family Welfare official portal",
            "url": "https://main.mohfw.gov.in/",
            "type": "ministry_record",
        },
    ],
    "education": [
        {
            "title": "Ministry of Education official portal",
            "url": "https://www.education.gov.in/",
            "type": "ministry_record",
        },
        {
            "title": "Samagra Shiksha programme portal",
            "url": "https://samagra.education.gov.in/",
            "type": "scheme_guideline",
        },
    ],
    "employment": [
        {
            "title": "MGNREGA official portal",
            "url": "https://nrega.nic.in/",
            "type": "scheme_guideline",
        },
        {
            "title": "Ministry of Rural Development official portal",
            "url": "https://rural.nic.in/",
            "type": "ministry_record",
        },
    ],
    "housing": [
        {
            "title": "Pradhan Mantri Awas Yojana Urban official portal",
            "url": "https://pmay-urban.gov.in/",
            "type": "scheme_guideline",
        },
        {
            "title": "Ministry of Housing and Urban Affairs official portal",
            "url": "https://mohua.gov.in/",
            "type": "ministry_record",
        },
    ],
    "environment": [
        {
            "title": "Central Pollution Control Board official portal",
            "url": "https://cpcb.nic.in/",
            "type": "government_record",
        },
        {
            "title": "Ministry of Environment, Forest and Climate Change official portal",
            "url": "https://moef.gov.in/",
            "type": "ministry_record",
        },
    ],
    "other": [
        {
            "title": "Government of India national portal",
            "url": "https://www.india.gov.in/",
            "type": "government_record",
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
    ) -> dict[str, str]:
        normalized_category = (category or "other").strip().lower()
        candidates = SOURCE_CATALOG.get(normalized_category, SOURCE_CATALOG["other"])

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
