# SansadDarpan Live Data Plan

This document replaces hand-wavy “live later” assumptions with a field-by-field source plan.

Principles:

- No SansadDarpan field should silently fall back to mock data in production.
- Every source must be an official public record or an official government dataset.
- Every raw fetch should be snapshotted before transformation.
- Any field without a durable official source must either be narrowed, relabeled, or removed.

## Official Source Graph

| Source key | Official owner | URL | What it is good for | Notes |
| --- | --- | --- | --- | --- |
| `digital_sansad_member_portal` | Lok Sabha Secretariat | `https://sansad.in/ls/members` | MP identity, attendance, questions, debates, bills, member-centric exports | Primary parliamentary operations source |
| `digital_sansad_member_manual` | Lok Sabha Secretariat | `https://sansad.in/uploads/Lok_Sabha_Member_Portal_User_Manual_3fe3446a73.pdf` | Confirms filters and exportability of Questions, Debates, Bills | Reference document, not a data feed |
| `lok_sabha_rules` | Lok Sabha Secretariat | `https://sansad.in/uploads/Rules_of_Procedures_E_9d8fd0f4c3.pdf` | Rule corpus for deviation tracking | Chunk at rule level |
| `lok_sabha_bulletin_ii` | Lok Sabha Secretariat | `https://sansad.in/getFile/bull2mk/2024/03-09-24.pdf?source=loksabhadocs` | Daily proceeding and notice metadata | Session timeline backbone |
| `eci_results` | Election Commission of India | `https://results.eci.gov.in/index2.html` | Winners, party, constituency, election joins | Use for official constituency/party linkage |
| `eci_delimitation_orders` | Election Commission of India | official delimitation order PDFs | Constituency→district crosswalk | Primary source only; no Wikipedia crosswalks |
| `mgnrega_dashboard` | Ministry of Rural Development | `https://mnregaweb4.nic.in/netnrega/all_lvl_details_dashboard_new.aspx` | Pending wages, delay days, worker-facing scheme stress | Strong live feed |
| `pmay_urban_dashboard` | MoHUA | `https://pmaymis.gov.in/` | Urban PMAY progress and beneficiary reporting | Strong for PMAY-U |
| `pmay_rural_dashboard` | Ministry of Rural Development | `https://pmayg.dord.gov.in/netiay/PBIDashboard/PMAYGDashboard.aspx` | Rural PMAY completion | Needed for rural seats |
| `pmkisan_portal` | Dept. of Agriculture & Farmers Welfare | `https://fw.pmkisan.gov.in/` | Scheme status and official PM-KISAN documents | Aggregate public district feeds need more validation |
| `pmuy_portal` | Ministry of Petroleum & Natural Gas | `https://www.pmuy.gov.in/` | Official Ujjwala program source | Public connection counts are safer than refill continuity |
| `niti_sdg_index` | NITI Aayog | `https://sdgindiaindex.niti.gov.in/` | State SDG benchmarks; some district coverage, not universal | Nationwide district SDG is not one clean official feed |
| `sci_judgments` | Supreme Court of India | `https://api.sci.gov.in/` | Procedural judgments and precedent PDFs | Use official court PDFs |

## Page-by-Page Field Plan

## 1. SansadDarpan Overview / Dashboard

| Field | Live source | Implementation |
| --- | --- | --- |
| `mp_count` | `digital_sansad_member_portal`, `eci_results` | Count active MPs in `mp_identity` after identity reconciliation |
| `welfare_system_count` | Welfare ingestion tables | Count distinct ingested metric families, not design intentions |
| `verified_case_count` | `rule_deviation_cases` | Count published human-verified cases |
| Live monitor events | Bulletins, debate records, welfare refresh jobs, review queue | Materialize to `accountability_events` table |

## 2. MP Scorecards

| Field | Live source | Implementation |
| --- | --- | --- |
| Name / party / constituency / state | `digital_sansad_member_portal`, `eci_results` | Build `mp_identity` as canonical graph |
| Attendance rate | `digital_sansad_member_portal` attendance view | Oath-date denominator, session-aware numerator |
| Questions asked | `digital_sansad_member_portal` Questions & Answers / Question List | Store starred and unstarred separately before scoring |
| Debates participated | `digital_sansad_member_portal` Debate Search | Count substantive interventions and keep transcript links |
| Zero Hour mentions | Debate metadata / proceeding type | Derived from debate/proceeding labels, not manual text |
| Private member bills | Bills table in Digital Sansad | Count PMBs introduced/debated |
| Voting participation | Division/voting records where explicitly published | Show coverage note until proven complete |
| Score / ranks / breakdown | Internal methodology over live source data | Version and publish methodology hash |
| Summary / narrative | AI summary over live metrics | Label as AI-generated and cache |

## 3. Constituency Welfare Dashboard

| Field | Live source | Implementation |
| --- | --- | --- |
| Constituency→district weights | `eci_delimitation_orders`, `eci_results` | OCR and manually validate crosswalk |
| MGNREGS delay / pending wages | `mgnrega_dashboard` | Aggregate district/block values by constituency weight |
| PMAY completion | `pmay_urban_dashboard`, `pmay_rural_dashboard` | Keep scheme variant provenance |
| PM-KISAN disbursal | `pmkisan_portal` plus official aggregate companion source if found | Do not ship as nationwide aggregate until the public feed is validated |
| Ujjwala | `pmuy_portal` plus OGD companion source | Use supportable connection coverage first |
| SDG benchmark | `niti_sdg_index` | Use state benchmark now; district SDG only where official and reproducible |
| Raised in Parliament | Questions/debates/Zero Hour linked by scheme tags | Derived from parliamentary records |
| Top gap | Internal benchmark delta calculation | Must cite the underlying metric and refresh date |

## 4. Rule Deviation Tracker

| Field | Live source | Implementation |
| --- | --- | --- |
| Rule text | `lok_sabha_rules` | Chunk and embed at rule/direction granularity |
| Proceeding text | Debate transcripts, bulletins | Store verbatim extracts with citations |
| Judicial precedent | `sci_judgments` | Link only where relevant |
| Confidence | Internal AI-assisted output | Never displayed without human sign-off |
| Status / review notes | Internal review queue | Full audit trail required |

## Where Current UI Fields Must Change

These current fields are not yet supportable exactly as designed from a durable official source:

- `Ujjwala refill continuity`
  - Replace with `Ujjwala connection coverage` until an official refill-continuity feed is proven.
- `Nationwide district SDG score`
  - Narrow to `state SDG benchmark` now, or ship district SDG only where official district data exists.
- `Voting participation`
  - Keep only with an explicit coverage badge based on available division records.

## Implementation Order

1. Remove silent SansadDarpan frontend fallbacks in production mode.
2. Build raw snapshot infrastructure for all official sources.
3. Finish the MP identity graph and make MPs page fully source-backed.
4. Add questions/debates/attendance ingestion and recompute live scorecards.
5. Build constituency crosswalk and MGNREGS + PMAY first.
6. Add Parliament linkage from MP records back to welfare gaps.
7. Build rule corpus + transcript snapshotting + review queue.

## Immediate Engineering Tasks

1. Create snapshot jobs for:
   - Digital Sansad members
   - Questions
   - Debate search
   - PMAY-U
   - PMAY-G
   - MGNREGA
   - ECI results
   - ECI delimitation PDFs
   - SCI judgments referenced by rule cases
2. Replace seed-only SansadDarpan tables with ingestion-run outputs.
3. Add `data_quality_status` and `source_count` to every public card so the UI can show confidence honestly.
4. Keep `PM-KISAN`, `PMUY`, and district `SDG` behind explicit readiness flags until the official aggregate feed is proven.
