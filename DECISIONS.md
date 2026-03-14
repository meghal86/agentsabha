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
