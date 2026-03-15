# AgentSabha Architecture Decisions

## 2026-03-14 — Preserve approved prototype while building production stack

Context: The approved screens 01-08 are already accepted as the design baseline, and the next step is end-to-end system construction.

Decision: Keep the approved prototype files at the repo root unchanged and build the production monorepo in `backend/` and `frontend/` around that baseline.

Alternatives considered: Rebuild the prototype directly inside Next.js first; discard the static prototype and redesign from the FRD.

Reason: Rebuilding the approved screens before the backend exists adds risk and churn. The prototype is now the visual contract and should remain stable while the real stack is scaffolded.

Consequences: The frontend app will initially coexist with the static prototype. A later migration can port the approved screens into production routes without losing the accepted look and feel.

---

## 2026-03-14 — Phase 1 framing follows the MP co-pilot wedge

Context: The FRD v2.0 explicitly reframes launch positioning away from "parallel parliament" toward a safer and more credible Phase 1 posture.

Decision: Treat all production code, naming, and documentation as an MP co-pilot implementation for three constituencies, while preserving the broader AgentSabha brand identity in the UI.

Alternatives considered: Build to the broader "AI parliament" framing immediately.

Reason: The FRD makes this a political, legal, and go-to-market constraint, not a messaging preference.

Consequences: The platform will emphasize draft generation, auditability, and MP review in Phase 1. Public claims and route copy should avoid implying direct parliamentary filing by AI.

---

## 2026-03-14 — Verify locally on Python 3.9, target deployment on Python 3.11

Context: The master prompt specifies Python 3.11, but the available local interpreter is Python 3.9 while Docker is unavailable on the machine.

Decision: Keep the authored code aligned with the Python 3.11 target, but maintain local testability under Python 3.9 where practical so session progress can still be validated without waiting for a container runtime.

Alternatives considered: Stop all backend verification until Python 3.11 or Docker is available; downgrade the production target away from the documented Python 3.11 baseline.

Reason: The local environment should not block progress on scaffolding and API validation, but the deployment contract from the master prompt remains the source of truth.

Consequences: A small amount of typing compatibility work is needed in request-facing code until containerized Python 3.11 verification is available.

---

## 2026-03-14 — Normalize DataMeet constituency ids into schema ids 1..543

Context: The Phase 1 schema requires `constituencies.id` to be a `SERIAL`-style 1..543 identifier, while the DataMeet constituency geometry source uses `pc_id` values encoded by state and seat number.

Decision: Use DataMeet as the authoritative source for constituency names, states, and geometry-derived centroids, but map features sorted by `pc_id` onto internal ids `1..543` in the committed seed asset.

Alternatives considered: Store DataMeet `pc_id` directly as the primary key; invent a second identifier column for source ids.

Reason: The schema is explicitly fixed in the master prompt and should not be widened during foundation work.

Consequences: Any later geometry join will need a deterministic mapping layer if raw DataMeet `pc_id` is required in code or analytics.

---

## 2026-03-14 — Enable pgvector before the issues table, keep index step at migration 13

Context: The master prompt lists pgvector extension installation in migration step 13, but the schema for `issues` requires an `embedding vector(1536)` column much earlier in the chain.

Decision: Create the `vector` extension as a prerequisite in the issues-table migration so the column can exist, then repeat `CREATE EXTENSION IF NOT EXISTS vector` in migration 13 where the ivfflat index is added.

Alternatives considered: Delay the embedding column until migration 13; store embeddings temporarily in a non-vector column.

Reason: Both alternatives would temporarily violate the documented schema. The least harmful path is to preserve the final schema early and keep the indexed optimization at the documented final step.

Consequences: The migration chain remains functionally correct, but the pgvector capability is technically enabled before the optimization step listed in the prompt.

---

## 2026-03-14 — Use Supabase only as a temporary development database

Context: The provided database credentials point to a Supabase host in `us-east-1`, while the master prompt requires India-only data residency for production.

Decision: Wire the Supabase connection as a local development override only, and keep the India-only requirement as the production infrastructure constraint.

Alternatives considered: Refuse to connect at all; silently treat the Supabase instance as production-ready.

Reason: Development needs a live Postgres target now, but using a US-hosted database as the implied production environment would violate the documented legal and architecture constraints.

Consequences: Local `.env` supports Supabase-backed development and migrations, but deployment planning must still move to an India-region database before real production use.

---

## 2026-03-14 — Strip Supabase pooler flags from the async SQLAlchemy URL

Context: Supabase connection strings include query flags like `pgbouncer=true` and `sslmode=require`. The direct migration path accepts those, but SQLAlchemy's `asyncpg` driver rejects them as connection kwargs.

Decision: Keep the direct URL intact for migrations, but normalize the async app URL by removing `pgbouncer` and `sslmode` from the query string and passing SSL through `connect_args`.

Alternatives considered: Use the direct URL for all async traffic; leave the async URL unchanged and tolerate connection failures.

Reason: The backend needs a working async engine for FastAPI routes, and the migration path needs to remain explicit and separate.

Consequences: The app can use Supabase-backed async sessions locally, while Alembic continues to run over the direct synchronous connection.

---

## 2026-03-14 — Capture explicit consent flags at citizen verification confirmation

Context: The master prompt requires explicit, granular consent for issue storage, constituency mapping, anonymised aggregation, and MP brief inclusion, but the endpoint section did not yet define where those fields should enter the API.

Decision: Extend `POST /api/citizen/verify/confirm` to require a `consent_flags` object and `age_verified` boolean, and persist those flags directly on the `citizens` record at verification time.

Alternatives considered: Implicitly default all consent flags to `true`; defer consent collection until issue submission.

Reason: Consent is a hard legal constraint, and verification confirmation is the first authenticated point where a stable citizen record is created.

Consequences: The frontend and WhatsApp verification flows must provide explicit consent fields before production use, and issue submission can now enforce only the specific flags it actually needs.

---

## 2026-03-14 — Require `issue_storage` and `mapping` consent before citizen submission

Context: Citizen submission cannot lawfully proceed unless the platform can store the issue and link it to a constituency, but aggregation and MP-brief inclusion may remain optional.

Decision: Block `/api/citizen/submit` unless the citizen has granted `issue_storage=true` and `mapping=true`. Keep `aggregation` and `mp_brief` available for later publication and briefing filters.

Alternatives considered: Require all four consents before any submission; allow submission even if storage/mapping consent is absent.

Reason: This keeps the Phase 1 flow operational while honoring the minimum legally necessary permissions for the core loop.

Consequences: Submission is now consent-aware, and future public aggregation / MP brief generation logic must read the remaining flags instead of assuming universal reuse rights.

---

## 2026-03-14 — Use direct Postgres for async app traffic when `DATABASE_URL` is a PgBouncer endpoint

Context: The supplied Supabase pooled URL uses PgBouncer transaction mode. Even with reduced asyncpg caching, SQLAlchemy's async dialect still hits prepared-statement incompatibilities under test and route execution.

Decision: When `DATABASE_URL` carries `pgbouncer=true` and `DIRECT_URL` is available, prefer `DIRECT_URL` for the async FastAPI engine while keeping `DIRECT_URL` explicit for Alembic as well.

Alternatives considered: Continue using the pooler with more asyncpg tuning; require a different pooled database before any live verification.

Reason: The direct connection is already available, avoids the prepared-statement failures, and unblocks reliable local development immediately.

Consequences: The current development app no longer exercises pooled async traffic, so connection pooling behavior still needs explicit verification in a production-grade India-hosted environment later.

---

## 2026-03-14 — Use deterministic hashed embeddings as the offline fallback

Context: The schema and clustering pipeline require 1536-dimension embeddings, but local development cannot assume an OpenAI API key will always be present.

Decision: Keep `text-embedding-3-small` as the primary embedding contract, but fall back to deterministic hashed token vectors with the same dimensionality when no API key is configured.

Alternatives considered: Persist zero vectors; block intake entirely without OpenAI credentials.

Reason: Zero vectors destroy clustering quality and make even local end-to-end flow unrealistic, while blocking intake would stall the build whenever keys are unavailable.

Consequences: Development clustering is now structurally meaningful but not production-grade semantic quality. Real OpenAI embeddings remain mandatory before Phase 1 field use.

---

## 2026-03-14 — Seed the development database with deterministic Phase 1 demo data

Context: The live app shells were correctly wired to the backend, but the development database only contained a single citizen issue, which left all public surfaces below the publication threshold and visually empty.

Decision: Add and run a deterministic demo seeding script for exactly three FRD-approved Phase 1 constituencies: Thiruvananthapuram (`502`), Bengaluru South (`477`, using the official seed row `Bangalore South`), and Gurugram (`38`, using the official seed row `Gurgaon`). Populate each with public-sized clusters, issue timelines, filed actions, and audit activity.

Alternatives considered: Leave the app technically live but visually sparse; lower the public cluster threshold; fake the UI with hardcoded frontend-only content.

Reason: For credible product review, the screens need to be backed by real database rows flowing through the published APIs, while still respecting the exact three-constituency Phase 1 constraint documented in the FRD and question-resolution record.

Consequences: The current local/staging-like preview is powered by seeded demo data rather than organic field traffic. This must be treated as development/demo state until real intake volume replaces it.

---

## 2026-03-14 — Correct the demo constituencies to match the FRD

Context: An earlier demo-data pass incorrectly used Varanasi, Bangalore Central, and Chennai Central. The FRD and the `15 Questions Resolved` decision record explicitly define the Phase 1 constituencies as Thiruvananthapuram, Bengaluru South, and Gurugram.

Decision: Replace the mistaken demo constituencies in the seeding script, frontend defaults, and handoff documentation. Keep the official DataMeet constituency seed rows intact, but normalize user-facing names from `Bangalore South` to `Bengaluru South` and `Gurgaon` to `Gurugram`.

Alternatives considered: Leave the seed data as-is because it was only demo content; rename the official seed rows directly in the database seed asset.

Reason: The live app must reflect the documented Phase 1 operating plan, and the user-facing product should use the modern public names even if the seed asset preserves official legacy naming.

Consequences: Existing demo data for the mistaken seats must be cleared from the dev database and reseeded. Frontend links and copy now point to the correct pilot constituencies.

---

## 2026-03-15 — Use deterministic Phase 1 agents before live model orchestration

Context: The FRD requires the clustering, question-draft, and MP-brief stages to exist as real pipeline steps, but live Anthropic-driven orchestration and external tool wiring are not yet fully configured.

Decision: Implement a deterministic Phase 1 baseline for clustering, question drafting, and brief generation directly on the live schema. Use issue-type bucketing, severity/velocity rules, structured parliamentary templates, and generated brief artifacts so the end-to-end system can execute now.

Alternatives considered: Leave the agents as placeholders until full LLM wiring is ready; hardcode fake outputs in the UI only.

Reason: A deterministic baseline materially increases FRD completion and allows the real core loop to be exercised, tested, and demoed before model quality tuning and external integrations are finished.

Consequences: The pipeline now works end-to-end in a development-safe form, but output quality is baseline operational quality rather than final parliamentary-grade quality. Live model prompting and fact/source rigor still need the next pass.

---

## 2026-03-15 — Fall back from WeasyPrint PDF generation when native libraries are missing

Context: The repo uses WeasyPrint for MP brief rendering, but the current macOS environment does not have the native GTK/GObject libraries required for WeasyPrint to load.

Decision: Keep WeasyPrint as the preferred renderer, but lazy-import it inside the PDF service and fall back to HTML bytes when the native libraries are unavailable.

Alternatives considered: Remove PDF generation entirely; fail hard whenever WeasyPrint cannot load.

Reason: The pipeline needs to remain executable on this machine while preserving the intended production renderer.

Consequences: Brief generation now succeeds in development on this machine, but the generated artifact is HTML bytes unless the native WeasyPrint dependencies are installed. Production deployment should still use real PDF rendering.

---

## 2026-03-15 — Make the homepage national-first and constituency selection explicit

Context: The live Next.js app was still using a pilot-oriented symbolic map and default constituency links, which conflicts with the FRD and the approved product direction. The user explicitly called out that the homepage must show the national India map and allow selection of any constituency, with constituency detail appearing only after selection.

Decision: Add a live constituency directory, generate a 543-seat geojson asset aligned to database IDs, move the top-level `Constituency` nav to a selector route, and replace pilot-default homepage linking with a real national constituency selector map.

Alternatives considered: Keep the symbolic homepage map and only add a simple dropdown; show only the three Phase 1 constituencies on the live map; continue linking directly to a default constituency desk from the header.

Reason: The product’s claim is national in scope even in Phase 1. Observers and citizens both need a true national-first entry point, and the constituency desk should feel like a chosen drill-down, not the default landing state.

Consequences: The frontend now carries a real 543-seat geographic asset and selector flow. The homepage, selector route, submit flow, and constituency dashboard are aligned around explicit seat choice rather than pilot hardcoding.
