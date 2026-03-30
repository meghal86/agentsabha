from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class OfficialSource:
    key: str
    title: str
    owner: str
    url: str
    format_hint: str
    refresh: str
    acquisition: str
    notes: str


@dataclass(frozen=True)
class FieldSourcePlan:
    page: str
    field: str
    live_from: tuple[str, ...]
    derivation: str
    status: str
    notes: str


OFFICIAL_SOURCES: dict[str, OfficialSource] = {
    "digital_sansad_member_portal": OfficialSource(
        key="digital_sansad_member_portal",
        title="Digital Sansad Lok Sabha member portal",
        owner="Lok Sabha Secretariat",
        url="https://sansad.in/ls/members",
        format_hint="Dynamic web application with exportable tables",
        refresh="During sessions and on publication of records",
        acquisition="Playwright session crawler; prefer network JSON/XHR discovery before DOM scraping",
        notes="Primary source for member roster, attendance views, question lists, debate search, and bill/member tools.",
    ),
    "digital_sansad_member_manual": OfficialSource(
        key="digital_sansad_member_manual",
        title="Lok Sabha public portal user manual",
        owner="Lok Sabha Secretariat",
        url="https://sansad.in/uploads/Lok_Sabha_Member_Portal_User_Manual_3fe3446a73.pdf",
        format_hint="PDF manual",
        refresh="Occasional",
        acquisition="Static reference document only",
        notes="Confirms filters and export-to-excel availability for Questions, Debates, Bills, and Membership views.",
    ),
    "lok_sabha_rules": OfficialSource(
        key="lok_sabha_rules",
        title="Rules of Procedure and Conduct of Business in Lok Sabha",
        owner="Lok Sabha Secretariat",
        url="https://sansad.in/uploads/Rules_of_Procedures_E_9d8fd0f4c3.pdf",
        format_hint="PDF",
        refresh="On amendment",
        acquisition="Direct PDF snapshot",
        notes="Primary rules corpus for rule-deviation analysis.",
    ),
    "lok_sabha_bulletin_ii": OfficialSource(
        key="lok_sabha_bulletin_ii",
        title="Lok Sabha Bulletin Part II",
        owner="Lok Sabha Secretariat",
        url="https://sansad.in/getFile/bull2mk/2024/03-09-24.pdf?source=loksabhadocs",
        format_hint="PDF per sitting day",
        refresh="Daily when House business is published",
        acquisition="Direct PDF snapshot by sitting date pattern discovery",
        notes="Supports proceedings timeline, notices, and session event reconstruction.",
    ),
    "eci_results": OfficialSource(
        key="eci_results",
        title="Election Commission of India results portal",
        owner="Election Commission of India",
        url="https://results.eci.gov.in/index2.html",
        format_hint="Dynamic website with constituency results",
        refresh="Per election / bye-election",
        acquisition="HTML snapshot + network JSON extraction",
        notes="Primary source for elected MP, constituency, party, and election-result joins.",
    ),
    "eci_delimitation_orders": OfficialSource(
        key="eci_delimitation_orders",
        title="Delimitation Commission final orders",
        owner="Election Commission of India",
        url="https://www.eci.gov.in/eci-backend/public/api/download?url=LMAhAK6sOPBp%2FNFF0iRfXbEB1EVSLT41NNLRjYNJJP1KivrUxbfqkDatmHy12e%2FzVx8fLfn2ReU7TfrqYobgIpWkrJiCNOiJzh6ySMg8PU3D0lVju45jm9XZI3GY4zfjrT%2FndieByAaC2ckXAS8v6q3pzoHNtpGsBSvG7O7tSDunkCkmteC%2BZM8wdiCXLlpO",
        format_hint="PDF gazette orders",
        refresh="Rare; by delimitation or notification",
        acquisition="PDF snapshot + OCR/text extraction",
        notes="Primary source for constituency-to-district crosswalk. Third-party crosswalks should not be trusted.",
    ),
    "mgnrega_dashboard": OfficialSource(
        key="mgnrega_dashboard",
        title="MGNREGA public MIS dashboards",
        owner="Ministry of Rural Development",
        url="https://mnregaweb4.nic.in/netnrega/all_lvl_details_dashboard_new.aspx",
        format_hint="ASP.NET dashboard pages",
        refresh="Daily / near-daily",
        acquisition="HTTP snapshot plus Playwright fallback for viewstate-backed forms",
        notes="Use alongside delay-specific reports to derive pending wages, delay days, and worker impact.",
    ),
    "pmay_urban_dashboard": OfficialSource(
        key="pmay_urban_dashboard",
        title="PMAY Urban MIS",
        owner="Ministry of Housing and Urban Affairs",
        url="https://pmaymis.gov.in/",
        format_hint="Dashboard with beneficiary and progress views",
        refresh="Regular mission updates",
        acquisition="HTTP snapshot + targeted dashboard extraction",
        notes="Strong source for urban housing completion and funds released; pair with PMAY-G for rural seats.",
    ),
    "pmay_rural_dashboard": OfficialSource(
        key="pmay_rural_dashboard",
        title="PMAY-G dashboard",
        owner="Ministry of Rural Development",
        url="https://pmayg.dord.gov.in/netiay/PBIDashboard/PMAYGDashboard.aspx",
        format_hint="Dashboard",
        refresh="Regular mission updates",
        acquisition="HTTP snapshot + table extraction",
        notes="Needed for rural completion metrics where PMAY-U is irrelevant.",
    ),
    "pmkisan_portal": OfficialSource(
        key="pmkisan_portal",
        title="PM-KISAN official portal",
        owner="Department of Agriculture & Farmers Welfare",
        url="https://fw.pmkisan.gov.in/",
        format_hint="Portal with beneficiary status and scheme documents",
        refresh="Per instalment / operational update",
        acquisition="Portal scrape for available public tables plus manual source discovery",
        notes="Useful, but not a clean nationwide district aggregate feed on its own. We need OGD companions or to narrow the promised field.",
    ),
    "pmuy_portal": OfficialSource(
        key="pmuy_portal",
        title="Pradhan Mantri Ujjwala Yojana portal",
        owner="Ministry of Petroleum & Natural Gas",
        url="https://www.pmuy.gov.in/",
        format_hint="Portal and downloadable documents",
        refresh="Operational updates",
        acquisition="HTTP snapshot + supporting OGD datasets where available",
        notes="Connections are publicly visible more often than refill continuity. The current UI field should be adjusted unless a durable refill source is found.",
    ),
    "niti_sdg_index": OfficialSource(
        key="niti_sdg_index",
        title="SDG India Index",
        owner="NITI Aayog",
        url="https://sdgindiaindex.niti.gov.in/",
        format_hint="Dashboard / PDF reports",
        refresh="Annual",
        acquisition="Static snapshot + PDF parsing",
        notes="State-level coverage is official and strong. Nationwide district-level SDG scores are not uniformly available from one NITI feed, so the current constituency claim needs a narrower or alternative metric set.",
    ),
    "sci_judgments": OfficialSource(
        key="sci_judgments",
        title="Supreme Court of India judgments API / PDFs",
        owner="Supreme Court of India",
        url="https://api.sci.gov.in/",
        format_hint="API-backed PDFs",
        refresh="As judgments are delivered",
        acquisition="HTTP API snapshot",
        notes="Primary judicial precedent source for rule-deviation cases such as Money Bill and anti-defection disputes.",
    ),
}


FIELD_SOURCE_PLAN: tuple[FieldSourcePlan, ...] = (
    FieldSourcePlan(
        page="sansaddarpan.dashboard",
        field="mp_count",
        live_from=("digital_sansad_member_portal", "eci_results"),
        derivation="Count active Lok Sabha MPs in mp_identity after identity reconciliation.",
        status="ready",
        notes="No mock needed once mp_identity ingest is live.",
    ),
    FieldSourcePlan(
        page="sansaddarpan.dashboard",
        field="welfare_system_count",
        live_from=("mgnrega_dashboard", "pmay_urban_dashboard", "pmay_rural_dashboard", "pmkisan_portal", "pmuy_portal"),
        derivation="Count distinct live metric families actually ingested into constituency_welfare_metrics.",
        status="ready",
        notes="Should reflect only systems with active refresh jobs, not design-time aspirations.",
    ),
    FieldSourcePlan(
        page="sansaddarpan.dashboard",
        field="verified_case_count",
        live_from=("lok_sabha_rules", "lok_sabha_bulletin_ii", "sci_judgments"),
        derivation="Count rule_deviation_cases where status='human-verified'.",
        status="ready",
        notes="Purely internal after source-backed review pipeline exists.",
    ),
    FieldSourcePlan(
        page="sansaddarpan.mps",
        field="name/constituency/state/party",
        live_from=("digital_sansad_member_portal", "eci_results"),
        derivation="Identity graph joins Digital Sansad member profile to ECI results and constituency table.",
        status="ready",
        notes="This should be the first live ingestion pipeline implemented.",
    ),
    FieldSourcePlan(
        page="sansaddarpan.mps",
        field="attendance_rate",
        live_from=("digital_sansad_member_portal",),
        derivation="Eligible-days denominator from oath date; attendance numerator from member attendance views.",
        status="ready",
        notes="Current UI can be fully live once the member attendance scraper is stable.",
    ),
    FieldSourcePlan(
        page="sansaddarpan.mps",
        field="questions_asked",
        live_from=("digital_sansad_member_portal",),
        derivation="Count starred/unstarred questions from Questions & Answers / Question List exports; keep both raw columns and a weighted derived score input.",
        status="ready",
        notes="Store ministry, question date, and subject tags for downstream accountability views.",
    ),
    FieldSourcePlan(
        page="sansaddarpan.mps",
        field="debates/zero_hour_mentions",
        live_from=("digital_sansad_member_portal",),
        derivation="Parse Debate Search / date-wise debate records; classify Zero Hour mentions by proceeding type and/or transcript section.",
        status="ready",
        notes="Requires transcript normalization so >200-word substantive interventions can be counted defensibly.",
    ),
    FieldSourcePlan(
        page="sansaddarpan.mps",
        field="private_member_bills",
        live_from=("digital_sansad_member_portal",),
        derivation="Count bills introduced by the member where bill_type='Private Member'.",
        status="ready",
        notes="The public portal manual confirms Bills tables with export support.",
    ),
    FieldSourcePlan(
        page="sansaddarpan.mps",
        field="voting_participation",
        live_from=("lok_sabha_bulletin_ii", "digital_sansad_member_portal"),
        derivation="Derived from division/voting records where member-wise participation is explicitly published.",
        status="partial",
        notes="Do not present this as full-house comprehensive until we prove nationwide division coverage. Add a coverage badge.",
    ),
    FieldSourcePlan(
        page="sansaddarpan.mps",
        field="score/national_rank/state_rank/party_rank/score_breakdown",
        live_from=("digital_sansad_member_portal",),
        derivation="Internal derived metrics on top of live attendance/questions/debate/bill data.",
        status="ready",
        notes="These are not source fields; they are auditable calculations and must be versioned.",
    ),
    FieldSourcePlan(
        page="sansaddarpan.constituencies",
        field="constituency crosswalk",
        live_from=("eci_delimitation_orders", "eci_results"),
        derivation="OCR delimitation orders into constituency→district weights, then validate manually.",
        status="ready",
        notes="This is the second critical data asset after the MP identity graph.",
    ),
    FieldSourcePlan(
        page="sansaddarpan.constituencies",
        field="MGNREGS pending wages / average delay",
        live_from=("mgnrega_dashboard",),
        derivation="District/block dashboards aggregated to constituency by crosswalk weights.",
        status="ready",
        notes="This is one of the strongest live welfare feeds available.",
    ),
    FieldSourcePlan(
        page="sansaddarpan.constituencies",
        field="PMAY completion",
        live_from=("pmay_urban_dashboard", "pmay_rural_dashboard"),
        derivation="Use PMAY-U for urban seats and PMAY-G for rural coverage; aggregate by crosswalk weights where district-level figures are available.",
        status="ready",
        notes="Current single PMAY line in the UI should preserve scheme variant provenance.",
    ),
    FieldSourcePlan(
        page="sansaddarpan.constituencies",
        field="PM-KISAN disbursal status",
        live_from=("pmkisan_portal",),
        derivation="Use only if we confirm a reproducible public aggregate feed. Otherwise narrow to beneficiary-status exemplars or replace with another official agriculture metric.",
        status="partial",
        notes="Current concept is valid, but the official public aggregate source path is weaker than MGNREGS/PMAY.",
    ),
    FieldSourcePlan(
        page="sansaddarpan.constituencies",
        field="Ujjwala coverage / continuity",
        live_from=("pmuy_portal",),
        derivation="Prefer connection coverage from official counts. Refill continuity should not stay in MVP until an official durable feed is confirmed.",
        status="partial",
        notes="Current refill-continuity mock should be replaced with a supportable official field.",
    ),
    FieldSourcePlan(
        page="sansaddarpan.constituencies",
        field="SDG district score",
        live_from=("niti_sdg_index",),
        derivation="Use official state SDG benchmark today; district-level SDG should only appear where official district data exists and is reproducible.",
        status="blocked",
        notes="The concept spec overstates nationwide district SDG availability. This field needs a narrowed promise or a different official proxy dataset.",
    ),
    FieldSourcePlan(
        page="sansaddarpan.constituencies",
        field="raised_in_parliament / what your MP raised",
        live_from=("digital_sansad_member_portal",),
        derivation="Scheme-tag questions, debates, and Zero Hour mentions by MP are matched back to welfare metric families.",
        status="ready",
        notes="This is one of the highest-leverage joins in the whole product.",
    ),
    FieldSourcePlan(
        page="sansaddarpan.rule_deviations",
        field="rule text / rule_reference",
        live_from=("lok_sabha_rules",),
        derivation="Rule chunk retrieval at rule or direction granularity.",
        status="ready",
        notes="Store chunk offsets and PDF citations.",
    ),
    FieldSourcePlan(
        page="sansaddarpan.rule_deviations",
        field="proceeding text / session_label",
        live_from=("digital_sansad_member_portal", "lok_sabha_bulletin_ii"),
        derivation="Session/date metadata from bulletins and debate transcripts; proceeding extracts stored in raw snapshots.",
        status="ready",
        notes="Use transcript snapshots, not paraphrases, as the public evidence base.",
    ),
    FieldSourcePlan(
        page="sansaddarpan.rule_deviations",
        field="judicial precedent",
        live_from=("sci_judgments",),
        derivation="Structured case references for procedural disputes; attach only where actually relevant.",
        status="ready",
        notes="Use official SCI PDFs/API rather than third-party legal blogs.",
    ),
    FieldSourcePlan(
        page="sansaddarpan.rule_deviations",
        field="confidence/status/review_notes",
        live_from=("lok_sabha_rules", "digital_sansad_member_portal", "sci_judgments"),
        derivation="AI-assisted internal assessment plus mandatory human review workflow and audit log.",
        status="ready",
        notes="These are internal outputs, but every public case must be source-backed and reviewer-signed.",
    ),
)
