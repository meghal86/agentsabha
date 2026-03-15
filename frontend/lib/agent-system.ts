export type AgentSpec = {
  slug: string;
  name: string;
  layer: string;
  phase: "built" | "partial" | "deferred";
  scope: string;
  purpose: string;
  outputs: string[];
};

export const agentSpecs: AgentSpec[] = [
  {
    slug: "intake",
    name: "Intake Agent",
    layer: "Layer A — Parliamentary",
    phase: "built",
    scope: "543 instances planned • Phase 1 core loop",
    purpose: "Receives citizen issues, structures them, maps them to a constituency, and creates the first usable issue record.",
    outputs: ["Structured issue record", "Constituency mapping", "Citizen acknowledgment trigger"],
  },
  {
    slug: "clustering",
    name: "Clustering Agent",
    layer: "Layer A — Parliamentary",
    phase: "built",
    scope: "543 instances planned • Phase 1 core loop",
    purpose: "Groups similar reports into public issue clusters, computes velocity, and assigns Tatkal/Rising/Chronic style badges.",
    outputs: ["Top issue ledger", "Trend badge", "National pulse contribution"],
  },
  {
    slug: "question_draft",
    name: "Question Hour Agent",
    layer: "Layer A — Parliamentary",
    phase: "built",
    scope: "543 instances planned • Phase 1 core loop",
    purpose: "Turns high-priority constituency clusters into draft parliamentary questions for MP review.",
    outputs: ["Draft starred/unstarred question", "Rule citation", "Source-cited parliamentary draft"],
  },
  {
    slug: "mp_brief",
    name: "MP Brief Agent",
    layer: "Layer A — Parliamentary",
    phase: "built",
    scope: "543 instances planned • Phase 1 core loop",
    purpose: "Builds weekly constituency briefs for MPs using the strongest current clusters and draft actions.",
    outputs: ["Weekly brief payload", "PDF/HTML artifact", "WhatsApp dispatch payload"],
  },
  {
    slug: "distribution",
    name: "Citizen Notification Agent",
    layer: "Layer A — Parliamentary",
    phase: "partial",
    scope: "Phase 1 core loop",
    purpose: "Returns issue acknowledgments and future citizen notifications when their issue reaches parliamentary action.",
    outputs: ["Acknowledgment", "Notification intent", "Delivery log"],
  },
  {
    slug: "zero_hour",
    name: "Zero Hour Agent",
    layer: "Layer A — Parliamentary",
    phase: "deferred",
    scope: "Phase 2+ per Master Prompt v3",
    purpose: "Files urgency notices when Tatkal clusters spike and need same-day parliamentary attention.",
    outputs: ["Zero Hour notice", "Urgency speech", "Cross-constituency escalation"],
  },
  {
    slug: "debate",
    name: "Debate Agent",
    layer: "Layer A — Parliamentary",
    phase: "deferred",
    scope: "Phase 2+ per Master Prompt v3",
    purpose: "Reads listed bills and drafts constituency-grounded debate speeches using real citizen evidence.",
    outputs: ["Debate speech", "Constituency impact note", "Position explanation"],
  },
  {
    slug: "bill_drafting",
    name: "Bill Drafting Agent",
    layer: "Layer A — Parliamentary",
    phase: "deferred",
    scope: "Phase 2+ per Master Prompt v3",
    purpose: "Drafts Private Members Bills from persistent, cross-constituency policy patterns.",
    outputs: ["Bill draft", "Statement of objects", "Citizen-evidence appendix"],
  },
  {
    slug: "budget_scrutiny",
    name: "Budget Scrutiny Agent",
    layer: "Layer A — Parliamentary",
    phase: "deferred",
    scope: "Phase 3 per attached research spec",
    purpose: "Compares public need vs budget allocation and drafts cut-motion or funding recommendations.",
    outputs: ["Budget gap analysis", "Cut motion draft", "MPLAD priority recommendation"],
  },
  {
    slug: "dissent",
    name: "Dissent Agent",
    layer: "Layer A — Citizen Rights",
    phase: "partial",
    scope: "Phase 2 control layer",
    purpose: "Lets verified citizens challenge an agent position or parliamentary action and records the override trail.",
    outputs: ["Dissent record", "Objection trail", "Position challenge ledger"],
  },
  {
    slug: "speaker",
    name: "Speaker Agent",
    layer: "Layer A — System",
    phase: "deferred",
    scope: "Full parliament stage only",
    purpose: "Moderates the multi-agent parliament and applies procedural rules across all seats.",
    outputs: ["Admission/rejection decision", "Session moderation", "Rule enforcement log"],
  },
  {
    slug: "media_engine",
    name: "Media Engine Agents",
    layer: "Layer B — Media Engine",
    phase: "deferred",
    scope: "Explicitly deferred by Master Prompt v3 Phase 1",
    purpose: "Podcast, reels, voice, visuals, and press packages built from the national issue pulse.",
    outputs: ["Podcast", "Reels", "Press package", "Channel distribution"],
  },
];

export const phaseBuckets = {
  built: "Built now",
  partial: "Partially built",
  deferred: "Deferred by Master Prompt v3",
} as const;
