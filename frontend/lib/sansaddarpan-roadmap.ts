export type SansadDarpanRoadmapItem = {
  id: string;
  title: string;
  category: string;
  href: string;
  status: "built" | "partial" | "planned";
  completion: number;
  note: string;
  completedWork: string[];
  remainingWork: string[];
  proofPoints: string[];
  nextStep: string;
};

export const sansaddarpanRoadmap: SansadDarpanRoadmapItem[] = [
  {
    id: "shell",
    title: "Product shell and navigation",
    category: "Layer 3 product surface",
    href: "/sansaddarpan",
    status: "built",
    completion: 88,
    note: "SansadDarpan now exists as a distinct public evidence product with its own routes, navigation, and visual mode inside the shared codebase.",
    completedWork: [
      "A dedicated SansadDarpan product switch exists in the shared header.",
      "Landing, methodology, and feature routes are wired under /sansaddarpan.",
      "SansadDarpan has its own evidence-mode presentation inside the shared design system.",
    ],
    remainingWork: [
      "The two-product story still needs stronger narrative framing on the homepage.",
      "More mobile-specific refinement is still needed for dense evidence screens.",
    ],
    proofPoints: [
      "Dedicated routes exist for dashboard, scorecards, welfare, rule deviations, and methodology.",
      "SansadDarpan uses a separate product mode in the header and footer.",
    ],
    nextStep: "Tighten the product split so AgentSabha and SansadDarpan feel intentionally related, not merely adjacent.",
  },
  {
    id: "mp-scorecards",
    title: "MP Participation Scorecards",
    category: "Public accountability module",
    href: "/sansaddarpan/mps",
    status: "built",
    completion: 79,
    note: "The first full SansadDarpan feature is working end to end with real database-backed scorecard pages and profile routes.",
    completedWork: [
      "MP identity and participation score tables exist in the backend.",
      "List and detail APIs are reading from database rows when available.",
      "Public scorecard and profile pages are live in the frontend.",
      "Methodology and score presentation are visible to users.",
    ],
    remainingWork: [
      "Coverage is still far below all 543 MPs.",
      "Real ingest jobs for attendance, questions, debates, and PMB data are still missing.",
      "Ranking and benchmark refresh need scheduled data jobs.",
    ],
    proofPoints: [
      "DB-backed MP routes exist under /api/sansaddarpan/mps.",
      "Migration and seed data were added for MP participation.",
      "Public MP routes render from backend data instead of static-only UI fixtures.",
    ],
    nextStep: "Replace the small seeded cohort with a larger live MP ingestion pipeline and regular score refresh jobs.",
  },
  {
    id: "welfare-dashboard",
    title: "Constituency Welfare Dashboard",
    category: "Public accountability module",
    href: "/sansaddarpan/constituencies",
    status: "partial",
    completion: 64,
    note: "The welfare dashboard exists with live DB-backed profiles, but it still operates on a curated subset instead of a national constituency coverage model.",
    completedWork: [
      "Constituency welfare profile and metric tables exist in the backend.",
      "Welfare list and detail APIs are DB-backed with parliamentary linkage flags.",
      "Public welfare cards and detail pages are routed in the frontend.",
    ],
    remainingWork: [
      "National constituency-district crosswalk logic is not complete.",
      "Coverage is still a seeded subset, not a national welfare evidence layer.",
      "Refresh jobs for welfare metrics and state/national benchmarks are missing.",
      "Raised-vs-not-raised linkage needs richer parliamentary record matching.",
    ],
    proofPoints: [
      "Live welfare routes exist under /api/sansaddarpan/constituencies.",
      "Welfare metrics are persisted in dedicated tables.",
      "Public welfare cards already render from live backend data.",
    ],
    nextStep: "Build the real constituency crosswalk and scheduled welfare refresh pipeline so the module can scale nationally.",
  },
  {
    id: "rule-deviations",
    title: "Verified Rule Deviation Tracker",
    category: "Public accountability module",
    href: "/sansaddarpan/rule-deviations",
    status: "partial",
    completion: 58,
    note: "The case registry and human-review presentation are built, but the review pipeline and rule corpus ingestion are still thin.",
    completedWork: [
      "Rule deviation cases are stored in dedicated backend tables.",
      "Published, under-review, and archived statuses are surfaced in the UI.",
      "Case list and detail pages are live with human-review framing.",
      "Methodology explicitly states human sign-off before publication.",
    ],
    remainingWork: [
      "Rule corpus ingestion and vector retrieval are not yet built end to end.",
      "AI-assisted deviation reasoning still needs a formal internal review workflow.",
      "The registry is still a curated subset instead of a wider published archive.",
      "Reviewer tooling and case publishing controls are not yet surfaced internally.",
    ],
    proofPoints: [
      "Live routes exist under /api/sansaddarpan/rule-deviations.",
      "Case detail pages already show status, sources, and review framing.",
      "Seeded case registry is now persisted in the database rather than only in frontend fallbacks.",
    ],
    nextStep: "Build the internal review queue and rule-retrieval pipeline before expanding the case registry.",
  },
  {
    id: "methodology",
    title: "Methodology and evidence standards",
    category: "Trust and governance",
    href: "/sansaddarpan/methodology",
    status: "built",
    completion: 84,
    note: "SansadDarpan already exposes user-facing methodology, evidence principles, and publication standards instead of hiding them as internal notes.",
    completedWork: [
      "A public methodology page exists in the product.",
      "Each major module explains its scoring or evidence basis.",
      "Human-review requirements are visible on the public rule-deviation surface.",
    ],
    remainingWork: [
      "Methodology should link more directly to raw source snapshots and update timestamps.",
      "Each public number should eventually expose its exact source lineage in a more structured way.",
    ],
    proofPoints: [
      "Public methodology route exists and is linked from the product shell.",
      "Methodology copy is already visible on dashboard and registry surfaces.",
    ],
    nextStep: "Attach clearer source lineage and freshness metadata to every published metric and case.",
  },
  {
    id: "national-ingestion",
    title: "National ingestion and refresh jobs",
    category: "Data foundation",
    href: "/sansaddarpan",
    status: "partial",
    completion: 34,
    note: "The backend now has real tables and live queries, but the data coverage is still bootstrapped through migrations and seed files rather than sustained ingestion pipelines.",
    completedWork: [
      "Dedicated tables now exist for MP scorecards, welfare profiles, welfare metrics, and rule deviation cases.",
      "Seed migrations load initial live DB content for the SansadDarpan product.",
      "Frontend pages now read live backend data where available.",
    ],
    remainingWork: [
      "Regular ingestion jobs for parliamentary participation data are missing.",
      "Regular ingestion jobs for welfare metrics are missing.",
      "Rule corpus updates, transcript processing, and source snapshot storage are still incomplete.",
      "National coverage and automatic refresh are the main scaling gap for the whole product.",
    ],
    proofPoints: [
      "Alembic migration for SansadDarpan live tables exists.",
      "API overview counts now come from database queries.",
      "The public product works against backend tables rather than only hardcoded frontend fixtures.",
    ],
    nextStep: "Turn the current live DB-backed seed state into repeatable national ingest and refresh workflows.",
  },
];

export function buildSansadDarpanSummary(items: SansadDarpanRoadmapItem[]) {
  return {
    total: items.length,
    built: items.filter((item) => item.status === "built").length,
    partial: items.filter((item) => item.status === "partial").length,
    planned: items.filter((item) => item.status === "planned").length,
    completion: Math.round(items.reduce((sum, item) => sum + item.completion, 0) / Math.max(items.length, 1)),
  };
}
