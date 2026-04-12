"""
Weekly brief generation pipeline.

Uses Groq (LLaMA) to generate constituency intelligence briefs
from live welfare data, MP participation scores, and contextual evidence.
"""
from __future__ import annotations

import json
import logging
from typing import Any, Optional
from uuid import UUID

from groq import Groq
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import get_settings
from app.models.constituency import Constituency
from app.models.mp_identity import MpIdentity, MpParticipationScore
from app.models.sansaddarpan import ConstituencyWelfareMetric, ConstituencyWelfareProfile, RuleDeviationCase
from app.models.weekly_brief import WeeklyBrief

logger = logging.getLogger(__name__)


def _call_llm(system_prompt: str, user_prompt: str) -> str:
    """Call Groq's LLaMA chat completion and return the raw text response."""
    settings = get_settings()
    client = Groq(api_key=settings.groq_api_key)
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.7,
        max_tokens=8000,
        response_format={"type": "json_object"},
    )
    return response.choices[0].message.content


BRIEF_SYSTEM_PROMPT = """You are a senior civic research analyst producing a weekly constituency intelligence brief for AgentSabha. Your audience is: (1) the MP for this constituency, who will receive an action-oriented summary, (2) Indian citizens curious about their constituency, (3) a YouTube audience watching a civic explainer video.

Tone rules:
- AI is the subject. The MP is always the potential hero who could act — never a villain who failed.
- Never use language that grades, ranks, or publicly shames an MP.
- Frame every gap as an opportunity: "AI identified X — here is the parliamentary action that could address it."
- Be specific: name the scheme, the rule, the data source, the CAG paragraph.
- Be bilingual: produce English primary, Hindi equivalents for key phrases.

Output a JSON object with these exact keys:
{
  "headline_en": "...",
  "headline_hi": "...",
  "standfirst_en": "...",
  "standfirst_hi": "...",
  "top_findings": [
    { "finding_en": "...", "finding_hi": "...", "data_source": "...", "parliamentary_action": "..." }
  ],
  "mp_brief_en": "...",
  "mp_brief_hi": "...",
  "video_script": {
    "youtube_title": "...",
    "youtube_description": "...",
    "hook": "...",
    "priya_intro": "...",
    "arjun_data_segment": "...",
    "deep_dive": "...",
    "solution_segment": "...",
    "cta": "..."
  },
  "reels": [
    { "hook": "...", "script": "...", "caption_en": "...", "caption_hi": "...", "hashtags": [] }
  ],
  "whatsapp_brief_en": "...",
  "whatsapp_brief_hi": "..."
}

Important constraints:
- The WhatsApp brief must be under 300 words and contain exactly one specific parliamentary action the MP could take this week.
- Every finding must include a data_source field — never a bare assertion.
- Generate exactly 4 reel scripts.
- The video script should be structured for a 20-25 minute YouTube explainer with Priya (host) and Arjun (data analyst) as co-hosts."""


def _build_context_packet(
    constituency: Constituency,
    mp: Optional[MpIdentity],
    score: Optional[MpParticipationScore],
    welfare_profile: Optional[ConstituencyWelfareProfile],
    welfare_metrics: list[ConstituencyWelfareMetric],
) -> dict[str, Any]:
    """Build the Layer 3 context packet for Claude."""
    context: dict[str, Any] = {
        "constituency": {
            "name": constituency.name,
            "state": constituency.state,
            "population": constituency.population,
            "mp_name": mp.full_name_en if mp else constituency.mp_name or "Unknown",
            "mp_party": mp.party_name if mp else constituency.mp_party or "Unknown",
        },
        "welfare": {},
        "mp_record": {},
        "cag_findings": [],
        "opportunities": [],
    }

    if welfare_profile:
        context["welfare"]["top_gap"] = welfare_profile.top_gap

    for metric in welfare_metrics:
        context["welfare"][metric.metric_key] = {
            "label": metric.label,
            "value": metric.value_text,
            "benchmark": metric.benchmark_text,
            "status": metric.status,
        }

    if score:
        context["mp_record"] = {
            "participation_score": score.participation_score,
            "attendance_rate": score.attendance_rate,
            "questions_asked": score.questions_asked,
            "debates": score.debates_participated,
            "zero_hour_mentions": score.zero_hour_mentions,
            "national_rank": score.national_rank,
        }

    return context


def _build_brief_markdown(brief_data: dict[str, Any]) -> str:
    """Convert Claude's JSON output into a structured markdown brief."""
    lines = [
        f"# {brief_data.get('headline_en', 'Constituency Intelligence Brief')}",
        f"## {brief_data.get('headline_hi', '')}",
        "",
        f"*{brief_data.get('standfirst_en', '')}*",
        "",
        f"*{brief_data.get('standfirst_hi', '')}*",
        "",
        "## Top Findings",
        "",
    ]

    for i, finding in enumerate(brief_data.get("top_findings", []), 1):
        lines.append(f"### Finding {i}")
        lines.append(f"**EN:** {finding.get('finding_en', '')}")
        lines.append(f"**HI:** {finding.get('finding_hi', '')}")
        lines.append(f"**Data Source:** {finding.get('data_source', '')}")
        lines.append(f"**Parliamentary Action:** {finding.get('parliamentary_action', '')}")
        lines.append("")

    lines.append("## MP Brief (English)")
    lines.append(brief_data.get("mp_brief_en", ""))
    lines.append("")
    lines.append("## MP Brief (Hindi)")
    lines.append(brief_data.get("mp_brief_hi", ""))

    return "\n".join(lines)


async def generate_weekly_brief(
    db: AsyncSession,
    constituency_id: int,
    week_number: int,
    year: int,
) -> WeeklyBrief:
    """Generate a weekly constituency intelligence brief using Claude API."""
    settings = get_settings()

    # Step 1 — Data pull
    constituency_result = await db.execute(
        select(Constituency).where(Constituency.id == constituency_id)
    )
    constituency = constituency_result.scalar_one_or_none()
    if not constituency:
        raise ValueError(f"Constituency {constituency_id} not found")

    # Find MP for this constituency (take first if multiple exist)
    mp_result = await db.execute(
        select(MpIdentity).where(MpIdentity.constituency_id == constituency_id)
    )
    mp = mp_result.scalars().first()

    # Get participation score
    score = None
    if mp:
        score_result = await db.execute(
            select(MpParticipationScore).where(MpParticipationScore.mp_id == mp.mp_id)
        )
        score = score_result.scalar_one_or_none()

    # Get welfare profile and metrics
    profile_result = await db.execute(
        select(ConstituencyWelfareProfile)
        .options(selectinload(ConstituencyWelfareProfile.metrics))
        .where(ConstituencyWelfareProfile.constituency_id == constituency_id)
    )
    welfare_profile = profile_result.scalar_one_or_none()
    welfare_metrics = welfare_profile.metrics if welfare_profile else []

    # Step 2 — Context assembly
    context_packet = _build_context_packet(constituency, mp, score, welfare_profile, welfare_metrics)

    # Step 3 — LLM call (Groq LLaMA)
    if not settings.groq_api_key:
        logger.warning("GROQ_API_KEY not set — using fallback brief generator")
        brief_data = _generate_fallback_brief(constituency, mp, score, welfare_profile, welfare_metrics)
    else:
        try:
            logger.info(f"Generating brief via Groq LLaMA for {constituency.name}")

            mp_name = mp.full_name_en if mp else "Vacant"
            mp_party = (mp.party_name if mp and mp.party_name else "N/A")

            welfare_lines = []
            if welfare_profile and welfare_profile.top_gap:
                welfare_lines.append(f"- Top gap: {welfare_profile.top_gap}")
            for metric in welfare_metrics:
                welfare_lines.append(
                    f"- {metric.label}: {metric.value_text}"
                    f" (benchmark: {metric.benchmark_text}, status: {metric.status})"
                )
            welfare_block = "\n".join(welfare_lines) if welfare_lines else "- (no welfare metrics on record)"

            if score:
                score_block = (
                    f"- Attendance rate: {score.attendance_rate}\n"
                    f"- Starred questions filed: {score.questions_asked}\n"
                    f"- Zero Hour notices: {score.zero_hour_mentions}\n"
                    f"- Debates participated: {score.debates_participated}\n"
                    f"- Participation score: {score.participation_score}/100"
                )
            else:
                score_block = "- (no participation record on file)"

            system_prompt = """You are a senior civic research analyst producing weekly constituency intelligence briefs for AgentSabha, an AI civic platform for Indian democracy.

Core rules:
- AI is always the subject. The MP is always the hero who could act.
- Never grade, rank, or shame any MP.
- Frame every gap as an opportunity with a specific parliamentary action.
- Be specific: name the scheme, the data source, the rule number.
- Output ONLY valid JSON. No markdown fences, no preamble, no explanation.
- Every value must be a non-empty string. No nulls."""

            user_prompt = f"""Generate a constituency intelligence brief for week {week_number} of {year}.

Constituency: {constituency.name}, {constituency.state}
MP: {mp_name} ({mp_party})

Welfare data:
{welfare_block}

MP participation this session:
{score_block}

Return exactly this JSON structure with no extra text:
{{
  "headline_en": "one specific sentence about what AI found",
  "headline_hi": "same in Hindi",
  "standfirst_en": "two sentences expanding on the headline",
  "standfirst_hi": "same in Hindi",
  "top_findings": [
    {{
      "finding_en": "specific welfare gap or opportunity",
      "finding_hi": "same in Hindi",
      "data_source": "which scheme or dataset",
      "parliamentary_action": "exact Zero Hour or starred question text"
    }},
    {{
      "finding_en": "second finding",
      "finding_hi": "same in Hindi",
      "data_source": "source",
      "parliamentary_action": "specific action"
    }},
    {{
      "finding_en": "third finding",
      "finding_hi": "same in Hindi",
      "data_source": "source",
      "parliamentary_action": "specific action"
    }}
  ],
  "mp_brief_en": "action brief for MP under 150 words with one specific action",
  "mp_brief_hi": "same in Hindi",
  "video_script": {{
    "youtube_title": "engaging YouTube title",
    "youtube_description": "2-3 sentence description",
    "hook": "opening 30 seconds — one striking fact",
    "priya_intro": "Priya host segment introducing the constituency",
    "arjun_data_segment": "Arjun host segment presenting data precisely",
    "deep_dive": "detailed examination of the top issue",
    "solution_segment": "parliamentary path forward AI identified",
    "cta": "what viewers can do right now"
  }},
  "reels": [
    {{
      "hook": "line that stops the scroll",
      "script": "60-second reel script",
      "caption_en": "Instagram caption under 200 words",
      "caption_hi": "same in Hindi",
      "hashtags": ["India", "Parliament", "AIForIndia", "JanSeva"]
    }},
    {{
      "hook": "second reel hook",
      "script": "60-second reel script",
      "caption_en": "caption",
      "caption_hi": "caption in Hindi",
      "hashtags": ["India", "Parliament", "AIForIndia"]
    }},
    {{
      "hook": "third reel hook",
      "script": "60-second reel script",
      "caption_en": "caption",
      "caption_hi": "caption in Hindi",
      "hashtags": ["India", "Parliament", "Constituency"]
    }},
    {{
      "hook": "fourth reel hook",
      "script": "60-second reel script",
      "caption_en": "caption",
      "caption_hi": "caption in Hindi",
      "hashtags": ["India", "AIForIndia", "Democracy"]
    }}
  ],
  "whatsapp_brief_en": "under 300 words, one specific parliamentary action this week",
  "whatsapp_brief_hi": "same in Hindi"
}}"""

            raw = _call_llm(system_prompt, user_prompt)

            # Strip markdown fences if model wraps output
            raw = raw.strip()
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            raw = raw.strip()

            brief_data = json.loads(raw)
            logger.info(f"Groq brief generated successfully for {constituency.name}")

        except json.JSONDecodeError as exc:
            logger.error(f"Groq returned invalid JSON: {exc}. Using fallback.")
            brief_data = _generate_fallback_brief(constituency, mp, score, welfare_profile, welfare_metrics)
        except Exception as exc:
            logger.error(f"Groq API error: {exc}. Using fallback.")
            brief_data = _generate_fallback_brief(constituency, mp, score, welfare_profile, welfare_metrics)

    # Step 4 — Save to WeeklyBrief table
    brief_markdown = _build_brief_markdown(brief_data)
    video_script = brief_data.get("video_script", {})
    reels = brief_data.get("reels", [])
    whatsapp_en = brief_data.get("whatsapp_brief_en", "")
    whatsapp_hi = brief_data.get("whatsapp_brief_hi", "")

    weekly_brief = WeeklyBrief(
        week_number=week_number,
        year=year,
        constituency_id=constituency_id,
        mp_id=mp.mp_id if mp else None,
        brief_markdown=brief_markdown,
        video_script_json=video_script,
        mp_whatsapp_brief=whatsapp_en,
        hindi_translation={
            "headline_hi": brief_data.get("headline_hi", ""),
            "standfirst_hi": brief_data.get("standfirst_hi", ""),
            "mp_brief_hi": brief_data.get("mp_brief_hi", ""),
            "whatsapp_brief_hi": whatsapp_hi,
        },
        youtube_title=video_script.get("youtube_title"),
        youtube_description=video_script.get("youtube_description"),
        reel_scripts=reels,
        status="draft",
    )
    db.add(weekly_brief)
    await db.commit()
    await db.refresh(weekly_brief)

    return weekly_brief


def _generate_fallback_brief(
    constituency: Constituency,
    mp: Optional[MpIdentity],
    score: Optional[MpParticipationScore],
    welfare_profile: Optional[ConstituencyWelfareProfile],
    welfare_metrics: list[ConstituencyWelfareMetric],
) -> dict[str, Any]:
    """Generate a fallback brief when Claude API is unavailable."""
    mp_name = mp.full_name_en if mp else constituency.mp_name or "the constituency MP"
    top_gap = welfare_profile.top_gap if welfare_profile else "Welfare data is being assembled for this constituency."

    findings = []
    for metric in welfare_metrics[:3]:
        findings.append({
            "finding_en": f"{metric.label}: {metric.value_text} (benchmark: {metric.benchmark_text})",
            "finding_hi": f"{metric.label}: {metric.value_text}",
            "data_source": "AgentSabha constituency welfare evidence layer",
            "parliamentary_action": f"File an Unstarred Question asking the concerned Minister to provide current {metric.label.lower()} data for {constituency.name}.",
        })

    return {
        "headline_en": f"AI found a constituency brief for {constituency.name} that could help {mp_name} act this week",
        "headline_hi": f"AI ने {constituency.name} के लिए एक संक्षिप्त विवरण तैयार किया है",
        "standfirst_en": f"This weekly brief covers the top welfare signals in {constituency.name}, {constituency.state}.",
        "standfirst_hi": f"यह साप्ताहिक संक्षिप्त विवरण {constituency.name}, {constituency.state} के शीर्ष कल्याण संकेतों को कवर करता है।",
        "top_findings": findings,
        "mp_brief_en": f"This week, AI identified {top_gap.lower()} The most impactful action {mp_name} could take is to file a formal parliamentary question demanding updated constituency-level data from the relevant ministry.",
        "mp_brief_hi": f"इस सप्ताह, AI ने {constituency.name} में कल्याण अंतर की पहचान की है। सबसे प्रभावी कार्रवाई एक औपचारिक संसदीय प्रश्न दायर करना है।",
        "video_script": {
            "youtube_title": f"What AI Found in {constituency.name} This Week | AgentSabha",
            "youtube_description": f"This week, AgentSabha's AI research engine examined {constituency.name}, {constituency.state} — one of 543 Lok Sabha constituencies. Here's what it found and what {mp_name} could do about it.",
            "hook": f"What if AI could show your MP exactly what's going wrong in your constituency — and exactly how to fix it? This week, we looked at {constituency.name}.",
            "priya_intro": f"Welcome to AgentSabha. I'm Priya, and today we're covering {constituency.name} in {constituency.state}. Our AI has spent 24 hours going through welfare data, parliamentary records, and scheme delivery numbers.",
            "arjun_data_segment": f"Arjun here with the numbers. {top_gap}",
            "deep_dive": f"The deeper story is about what happens when constituency-level data is visible but no parliamentary instrument has been used to demand accountability.",
            "solution_segment": f"Here's what {mp_name} could do this week: file one Unstarred Question about the specific welfare gap our AI identified.",
            "cta": "If this is your constituency, share this video. If this is your MP, tell them AI found something they should know about.",
        },
        "reels": [
            {
                "hook": f"AI just analysed {constituency.name} in 24 hours.",
                "script": f"Here's what it found: {top_gap}",
                "caption_en": f"What AI found in {constituency.name} this week",
                "caption_hi": f"AI ने {constituency.name} में क्या पाया",
                "hashtags": ["#AgentSabha", "#SansadDarpan", f"#{constituency.state.replace(' ', '')}", "#AIforDemocracy"],
            },
            {
                "hook": "One question. That's all it takes.",
                "script": f"One Unstarred Question from {mp_name} could force the ministry to respond on record about {constituency.name}'s welfare gaps.",
                "caption_en": "One parliamentary question can change everything",
                "caption_hi": "एक संसदीय प्रश्न सब कुछ बदल सकता है",
                "hashtags": ["#AgentSabha", "#ParliamentaryAction", "#YourMP"],
            },
            {
                "hook": "Your constituency. Your data. Your MP.",
                "script": f"AI found the gap. {mp_name} has the power to act. Citizens have the right to know.",
                "caption_en": "AI is the research assistant. The MP is the actor.",
                "caption_hi": "AI शोध सहायक है। सांसद कर्ता है।",
                "hashtags": ["#AgentSabha", "#CivicTech", "#IndianDemocracy"],
            },
            {
                "hook": f"543 constituencies. This week: {constituency.name}.",
                "script": "Every week, we pick one constituency and show what AI can discover in 24 hours. This week, we found something the MP should know about.",
                "caption_en": f"This week: {constituency.name}, {constituency.state}",
                "caption_hi": f"इस सप्ताह: {constituency.name}, {constituency.state}",
                "hashtags": ["#AgentSabha", "#WeeklyBrief", "#543Constituencies"],
            },
        ],
        "whatsapp_brief_en": (
            f"AGENTSABHA WEEKLY BRIEF — {constituency.name}, {constituency.state}\n\n"
            f"MP: {mp_name}\n\n"
            f"KEY FINDING: {top_gap}\n\n"
            f"RECOMMENDED ACTION: File an Unstarred Question to the relevant Ministry asking for current constituency-level data on the identified welfare gap.\n\n"
            f"This brief was generated by AgentSabha's AI research engine from public welfare data."
        ),
        "whatsapp_brief_hi": (
            f"एजेंटसभा साप्ताहिक संक्षिप्त — {constituency.name}, {constituency.state}\n\n"
            f"सांसद: {mp_name}\n\n"
            f"मुख्य निष्कर्ष: {top_gap}\n\n"
            f"अनुशंसित कार्रवाई: संबंधित मंत्रालय को एक अतारांकित प्रश्न दायर करें।"
        ),
    }
