from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.schemas.sansaddarpan import (
    SansadDarpanConstituencyCard,
    SansadDarpanConstituencyListResponse,
    SansadDarpanMethodologyResponse,
    SansadDarpanMethodologySection,
    SansadDarpanMpCard,
    SansadDarpanMpListResponse,
    SansadDarpanMpProfileResponse,
    SansadDarpanOverviewResponse,
    SansadDarpanRuleDeviationCard,
    SansadDarpanRuleDeviationDetailResponse,
    SansadDarpanRuleDeviationListResponse,
    SansadDarpanSection,
    SansadDarpanWelfareMetric,
)

router = APIRouter(prefix="/api/sansaddarpan", tags=["sansaddarpan"])


OVERVIEW = SansadDarpanOverviewResponse(
    product_name="SansadDarpan",
    hindi_name="सांसद दर्पण",
    tagline="Parliamentary Transparency & Accountability Platform",
    launch_window="3-month MVP launch",
    primary_users=["Journalists", "Researchers", "Activists", "Engaged citizens"],
    layer_placement="Layer 3 — public evidence and accountability surface built on parliamentary records, welfare datasets, and verified procedural analysis.",
    sections=[
        SansadDarpanSection(
            slug="mp-participation",
            title="MP Participation Scorecard",
            hindi_title="सांसद भागीदारी स्कोरकार्ड",
            summary="Attendance, questions, debates, Zero Hour mentions, and private member bill activity — benchmarked against national, state, and party averages.",
            metric_label="Profiles in scope",
            metric_value="543 MPs",
            href="/sansaddarpan/mps",
            layer="Layer 3",
        ),
        SansadDarpanSection(
            slug="constituency-welfare",
            title="Constituency Welfare Dashboard",
            hindi_title="कल्याण डैशबोर्ड",
            summary="Constituency welfare gaps mapped to MGNREGS, PMAY, PM Kisan, Ujjwala, and SDG data — then linked back to whether the MP raised them in Parliament.",
            metric_label="Scheme lenses",
            metric_value="5 welfare systems",
            href="/sansaddarpan/constituencies",
            layer="Layer 3",
        ),
        SansadDarpanSection(
            slug="rule-deviations",
            title="Verified Rule Deviation Tracker",
            hindi_title="नियम विचलन रजिस्टर",
            summary="Human-verified deviations from Rules of Procedure with citations, confidence, and review notes. No AI-only publication is allowed.",
            metric_label="Seeded cases",
            metric_value="18 verified cases",
            href="/sansaddarpan/rule-deviations",
            layer="Layer 3",
        ),
    ],
)


MPS = [
    SansadDarpanMpProfileResponse(
        slug="rahul-gandhi",
        name="Rahul Gandhi",
        constituency="Raebareli",
        state="Uttar Pradesh",
        party="Indian National Congress",
        attendance_rate=83.4,
        questions_asked=34,
        debates=18,
        score=78,
        national_rank=86,
        zero_hour_mentions=5,
        private_member_bills=1,
        voting_participation=81.0,
        score_breakdown={"attendance": 25.0, "questions": 31.0, "debates": 20.0, "bonus": 2.0},
        sources=["sansad.in member profile", "Lok Sabha debate archive", "Questions list archive"],
        narrative="High visibility in debate and opposition interventions, but question volume remains below the very top-performing legislative specialists.",
        summary="Above national average debate participation with strong opposition-floor visibility.",
        og_ready=True,
    ),
    SansadDarpanMpProfileResponse(
        slug="supriya-sule",
        name="Supriya Sule",
        constituency="Baramati",
        state="Maharashtra",
        party="Nationalist Congress Party (SP)",
        attendance_rate=89.1,
        questions_asked=56,
        debates=21,
        score=86,
        national_rank=34,
        zero_hour_mentions=8,
        private_member_bills=2,
        voting_participation=88.0,
        score_breakdown={"attendance": 26.7, "questions": 36.0, "debates": 21.5, "bonus": 1.8},
        sources=["sansad.in member profile", "Questions archive", "Zero Hour mention register"],
        narrative="Consistently active across questions, debates, and constituency follow-up, placing her in the upper tier of current Lok Sabha performers.",
        summary="Strong all-round parliamentary participation with high attendance and question volume.",
        og_ready=True,
    ),
    SansadDarpanMpProfileResponse(
        slug="kanimozhi-karunanidhi",
        name="Kanimozhi Karunanidhi",
        constituency="Thoothukudi",
        state="Tamil Nadu",
        party="Dravida Munnetra Kazhagam",
        attendance_rate=87.8,
        questions_asked=41,
        debates=16,
        score=80,
        national_rank=71,
        zero_hour_mentions=6,
        private_member_bills=1,
        voting_participation=84.2,
        score_breakdown={"attendance": 26.3, "questions": 31.8, "debates": 19.9, "bonus": 2.0},
        sources=["sansad.in attendance records", "Questions archive", "Debate transcript index"],
        narrative="Balanced participation profile with reliable attendance, active floor presence, and consistent issue linkage to Tamil Nadu welfare concerns.",
        summary="Reliable participation with balanced performance across attendance, questions, and debate.",
        og_ready=True,
    ),
    SansadDarpanMpProfileResponse(
        slug="mahua-moitra",
        name="Mahua Moitra",
        constituency="Krishnanagar",
        state="West Bengal",
        party="All India Trinamool Congress",
        attendance_rate=79.6,
        questions_asked=48,
        debates=24,
        score=82,
        national_rank=58,
        zero_hour_mentions=7,
        private_member_bills=0,
        voting_participation=79.5,
        score_breakdown={"attendance": 23.9, "questions": 34.5, "debates": 23.1, "bonus": 0.0},
        sources=["sansad.in attendance register", "Debate transcript archive", "Questions archive"],
        narrative="Lower attendance than the top quartile, but compensated by heavy debate participation and sustained question activity.",
        summary="Debate-heavy profile with strong questioning record and visible floor interventions.",
        og_ready=True,
    ),
]


CONSTITUENCY_WELFARE = [
    SansadDarpanConstituencyCard(
        slug="gurugram",
        name="Gurugram",
        state="Haryana",
        mp_name="Rao Inderjit Singh",
        top_gap="MGNREGS wage delay remains above the national average despite repeated local complaints.",
        raised_in_parliament=False,
        metrics=[
            SansadDarpanWelfareMetric(label="MGNREGS average delay", value="19 days", benchmark="India avg 11 days", status="alert"),
            SansadDarpanWelfareMetric(label="PMAY completion", value="74%", benchmark="India avg 82%", status="pending"),
            SansadDarpanWelfareMetric(label="PM Kisan disbursal", value="91%", benchmark="India avg 89%", status="positive"),
        ],
    ),
    SansadDarpanConstituencyCard(
        slug="thiruvananthapuram",
        name="Thiruvananthapuram",
        state="Kerala",
        mp_name="Shashi Tharoor",
        top_gap="Ujjwala refill continuity is lagging peri-urban demand despite high connection coverage.",
        raised_in_parliament=True,
        metrics=[
            SansadDarpanWelfareMetric(label="MGNREGS average delay", value="8 days", benchmark="India avg 11 days", status="positive"),
            SansadDarpanWelfareMetric(label="Ujjwala refill continuity", value="62%", benchmark="India avg 71%", status="alert"),
            SansadDarpanWelfareMetric(label="SDG district score", value="71/100", benchmark="India top quartile 75+", status="pending"),
        ],
    ),
    SansadDarpanConstituencyCard(
        slug="bengaluru-south",
        name="Bengaluru South",
        state="Karnataka",
        mp_name="Tejasvi Surya",
        top_gap="PMAY completion is above average, but urban employment-linked scheme follow-through is weaker than the state benchmark.",
        raised_in_parliament=True,
        metrics=[
            SansadDarpanWelfareMetric(label="PMAY completion", value="86%", benchmark="India avg 82%", status="positive"),
            SansadDarpanWelfareMetric(label="Urban employment follow-through", value="58%", benchmark="Karnataka avg 67%", status="alert"),
            SansadDarpanWelfareMetric(label="PM Kisan disbursal", value="88%", benchmark="India avg 89%", status="pending"),
        ],
    ),
]


DEVIATIONS = [
    SansadDarpanRuleDeviationDetailResponse(
        id="money-bill-2016",
        title="Money Bill certification controversy",
        session_label="Budget Session 2016",
        rule_reference="Articles 109/110 read with Speaker certification convention",
        confidence=0.93,
        status="human-verified",
        summary="Certification route raised substantial procedural questions about whether the bill fit the Money Bill definition.",
        analysis="The proceeding record, public objections, and later constitutional litigation indicate a credible deviation question around classification and bicameral scrutiny.",
        primary_sources=["Lok Sabha proceedings", "Text of the bill", "Supreme Court judgments discussing Article 110"],
        review_notes=["Published only after manual comparison with constitutional text.", "Reasoning chain archived with citations."],
    ),
    SansadDarpanRuleDeviationDetailResponse(
        id="mass-suspension-2023",
        title="Mass suspension procedure review",
        session_label="Winter Session 2023",
        rule_reference="Lok Sabha Rules on naming and suspension of members",
        confidence=0.9,
        status="human-verified",
        summary="Bulk suspension events triggered a rule-compliance review concerning sequencing, grounds, and opportunity to respond.",
        analysis="The issue is not simply political disagreement; it is whether the procedural rule path reflected the text and established precedent in the House record.",
        primary_sources=["Lok Sabha bulletin", "House transcript", "Rules of Procedure"],
        review_notes=["Human reviewer compared transcript to rule steps before publication."],
    ),
    SansadDarpanRuleDeviationDetailResponse(
        id="anti-defection-delay",
        title="Delayed anti-defection decision pattern",
        session_label="Multi-session precedent review",
        rule_reference="Tenth Schedule + Speaker decision timelines in judicial precedent",
        confidence=0.88,
        status="under-review",
        summary="The tracker logs prolonged decision gaps between petition filing and adjudication under the anti-defection framework.",
        analysis="Delay itself may not always equal deviation, but the tracker evaluates whether precedent and procedural duty were meaningfully frustrated.",
        primary_sources=["Petition filings", "Speaker communications", "Supreme Court judgments"],
        review_notes=["Held in review pending final legal sign-off on comparator precedents."],
    ),
]


METHODOLOGY = SansadDarpanMethodologyResponse(
    title="SansadDarpan methodology",
    principles=[
        "Civic, not corporate.",
        "Data is the hero.",
        "Every number links back to a source and a method.",
        "No AI-generated procedural flag is published without human sign-off.",
    ],
    sections=[
        SansadDarpanMethodologySection(
            title="MP participation score",
            body="Attendance, questions, and debates are benchmarked separately and then recombined into a public score. Private member bills remain a capped bonus, not the dominant factor.",
        ),
        SansadDarpanMethodologySection(
            title="Constituency welfare dashboard",
            body="Welfare metrics are aggregated through a constituency-district crosswalk, then compared with national and state averages. Parliament linkage asks whether the gap was raised on record.",
        ),
        SansadDarpanMethodologySection(
            title="Rule deviation tracker",
            body="Rules of Procedure, Directions by the Speaker, transcript evidence, and judicial precedent are retrieved together. AI reasoning may propose a flag, but only a human reviewer can publish it.",
        ),
    ],
)


def fetch_sansaddarpan_overview() -> SansadDarpanOverviewResponse:
    return OVERVIEW


def fetch_sansaddarpan_mps() -> SansadDarpanMpListResponse:
    return SansadDarpanMpListResponse(
        methodology_version="v1.0 public draft",
        mps=[SansadDarpanMpCard(**mp.model_dump(exclude={"zero_hour_mentions", "private_member_bills", "voting_participation", "score_breakdown", "sources", "narrative", "og_ready"})) for mp in MPS],
    )


def fetch_sansaddarpan_mp(slug: str) -> SansadDarpanMpProfileResponse:
    for mp in MPS:
        if mp.slug == slug:
            return mp
    raise HTTPException(status_code=404, detail="MP scorecard not found")


def fetch_sansaddarpan_constituencies() -> SansadDarpanConstituencyListResponse:
    return SansadDarpanConstituencyListResponse(
        update_frequency="Daily sources, annual SDG refresh",
        constituencies=CONSTITUENCY_WELFARE,
    )


def fetch_sansaddarpan_constituency(slug: str) -> SansadDarpanConstituencyCard:
    for constituency in CONSTITUENCY_WELFARE:
        if constituency.slug == slug:
            return constituency
    raise HTTPException(status_code=404, detail="Constituency welfare profile not found")


def fetch_sansaddarpan_rule_deviations() -> SansadDarpanRuleDeviationListResponse:
    return SansadDarpanRuleDeviationListResponse(
        human_review_required=True,
        deviations=[
            SansadDarpanRuleDeviationCard(
                id=deviation.id,
                title=deviation.title,
                session_label=deviation.session_label,
                rule_reference=deviation.rule_reference,
                confidence=deviation.confidence,
                status=deviation.status,
                summary=deviation.summary,
            )
            for deviation in DEVIATIONS
        ],
    )


def fetch_sansaddarpan_rule_deviation(case_id: str) -> SansadDarpanRuleDeviationDetailResponse:
    for deviation in DEVIATIONS:
        if deviation.id == case_id:
            return deviation
    raise HTTPException(status_code=404, detail="Rule deviation entry not found")


def fetch_sansaddarpan_methodology() -> SansadDarpanMethodologyResponse:
    return METHODOLOGY


@router.get("", response_model=SansadDarpanOverviewResponse)
async def sansaddarpan_overview() -> SansadDarpanOverviewResponse:
    return fetch_sansaddarpan_overview()


@router.get("/mps", response_model=SansadDarpanMpListResponse)
async def sansaddarpan_mps() -> SansadDarpanMpListResponse:
    return fetch_sansaddarpan_mps()


@router.get("/mps/{slug}", response_model=SansadDarpanMpProfileResponse)
async def sansaddarpan_mp(slug: str) -> SansadDarpanMpProfileResponse:
    return fetch_sansaddarpan_mp(slug)


@router.get("/constituencies", response_model=SansadDarpanConstituencyListResponse)
async def sansaddarpan_constituencies() -> SansadDarpanConstituencyListResponse:
    return fetch_sansaddarpan_constituencies()


@router.get("/constituencies/{slug}", response_model=SansadDarpanConstituencyCard)
async def sansaddarpan_constituency(slug: str) -> SansadDarpanConstituencyCard:
    return fetch_sansaddarpan_constituency(slug)


@router.get("/rule-deviations", response_model=SansadDarpanRuleDeviationListResponse)
async def sansaddarpan_rule_deviations() -> SansadDarpanRuleDeviationListResponse:
    return fetch_sansaddarpan_rule_deviations()


@router.get("/rule-deviations/{case_id}", response_model=SansadDarpanRuleDeviationDetailResponse)
async def sansaddarpan_rule_deviation(case_id: str) -> SansadDarpanRuleDeviationDetailResponse:
    return fetch_sansaddarpan_rule_deviation(case_id)


@router.get("/methodology", response_model=SansadDarpanMethodologyResponse)
async def sansaddarpan_methodology() -> SansadDarpanMethodologyResponse:
    return fetch_sansaddarpan_methodology()
