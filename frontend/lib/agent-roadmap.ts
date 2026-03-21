export type AgentRoadmapItem = {
  id: string;
  number: number;
  name: string;
  layer: string;
  status: "built" | "partial" | "planned";
  baseCompletion: number;
  source: string;
  note: string;
  runtimeAgentType?: string;
  completedWork?: string[];
  remainingWork?: string[];
  proofPoints?: string[];
  nextStep?: string;
};

export const agentRoadmap: AgentRoadmapItem[] = [
  {
    id: "intake",
    number: 1,
    name: "Intake Agent",
    layer: "Layer A — Citizen Issue Intake",
    status: "built",
    baseCompletion: 66,
    runtimeAgentType: "intake",
    source: "46 prompts doc",
    note: "Web intake, structuring, and issue persistence exist; WhatsApp, voice, and production verification remain incomplete.",
    completedWork: [
      "Web citizen submit path stores structured issues in the live database.",
      "Prompt-backed extraction plus deterministic fallback parsing exists.",
      "Issue type, urgency, severity, location, and ministry mapping are normalized.",
      "Non-urgent severity is now capped below 8 unless explicit safety-risk language is present.",
      "Audit logging records intake runs for runtime inspection.",
    ],
    remainingWork: [
      "Real WhatsApp webhook processing must persist issues through the same pipeline.",
      "Voice-note transcription must move from placeholder to a real service.",
      "Indic translation must run in production for multilingual intake.",
      "Aadhaar and constituency verification must be fully enforced across all intake channels.",
      "Duplicate, abuse, and empty-message handling need production-grade rules.",
    ],
    proofPoints: [
      "Audit-log entries exist for agent_type=intake.",
      "Backend intake tests are passing.",
      "Live web submit flow already creates issue rows.",
    ],
    nextStep: "Wire WhatsApp text and voice messages into the same persisted intake pipeline.",
  },
  {
    id: "clustering",
    number: 2,
    name: "Clustering Agent",
    layer: "Layer A — Issue Pattern Intelligence",
    status: "built",
    baseCompletion: 61,
    runtimeAgentType: "clustering",
    source: "46 prompts doc",
    note: "Cluster creation, velocity, and badge logic now cover tatkal, rising, chronic, and resolved; continuity, multilingual robustness, and production hardening are still open.",
    completedWork: [
      "Issue clusters are created from stored issues and linked back to issue rows.",
      "Category labels, badge assignment, and weekly velocity logic exist.",
      "Snapshot-aware velocity calculation is implemented.",
      "Resolved and chronic badge logic now considers confirmed ministry response state.",
      "Top-issue ledger and public cluster queries already read from clustered data.",
    ],
    remainingWork: [
      "Cross-run cluster continuity and merge/split behavior need hardening.",
      "Mixed-language and noisier intake data must be handled more reliably.",
      "National pattern detection across constituencies is still too thin.",
      "Public threshold vs internal threshold separation needs stricter enforcement.",
      "Scheduled clustering under load needs operational verification.",
    ],
    proofPoints: [
      "Clustering pipeline tests pass.",
      "Cluster badges and velocity are visible on public screens from stored data.",
      "Agent logs show clustering runs when executed.",
    ],
    nextStep: "Harden multilingual clustering quality and continuity across repeated runs.",
  },
  {
    id: "question-hour",
    number: 3,
    name: "Question Hour Draft Agent",
    layer: "Layer A — Parliamentary Questions",
    status: "built",
    baseCompletion: 83,
    runtimeAgentType: "question_draft",
    source: "46 prompts doc",
    note: "Rule 32 and Rule 33 drafting, confidence scoring, shadow mode, review routing, issue-aware source retrieval, duplicate suppression, and editable MP approval now exist; the remaining work is concentrated in final language quality and production hardening.",
    completedWork: [
      "Draft generation now distinguishes starred and unstarred parliamentary questions.",
      "Rule 32 and Rule 33 are assigned correctly based on draft type.",
      "Minimum verified-report gating is enforced before draft creation.",
      "Drafts now include live source retrieval, cluster citations, and verified-citizen citations.",
      "Confidence score is now stored in draft metadata within source_citations.",
      "Needs-review records are created when ministry confidence is weak or conflicting.",
      "Starred vs unstarred selection now considers severity plus urgent badge context.",
      "Source retrieval is now issue-text-aware and passes issue evidence into source selection.",
      "Near-duplicate strong clusters are suppressed before drafting.",
      "Fallback or unresolved source retrieval now escalates the draft to review.",
      "MP approval now supports edited draft content and confirmed ministry updates inside the existing approval flow.",
      "Question Draft can now run in shadow mode without persisting parliamentary actions.",
    ],
    remainingWork: [
      "Draft ranking across multiple strong clusters still needs further tuning under real constituency traffic.",
      "Language quality must still be raised from structurally correct to consistently filing-grade parliamentary prose.",
      "Duplicate suppression and review escalation need more production traffic hardening.",
      "MP review should capture richer editorial guidance before final filing.",
      "Shadow mode should be generalized beyond Agent 03 into a broader governance release process.",
    ],
    proofPoints: [
      "Dedicated Agent 03 tests are passing.",
      "Pipeline test still passes after the review-workflow and retrieval upgrades.",
      "Parliamentary drafts are being written into parliamentary_actions.",
      "Source citations now include retrieval metadata from live government URLs.",
      "Internal MP route tests now cover edited approval content.",
      "Agent 03 tests now cover stored confidence metadata and shadow-mode audit behavior.",
    ],
    nextStep: "Raise the language quality to filing-grade output and further tune cluster ranking before expanding to Agent 04.",
  },
  {
    id: "zero-hour",
    number: 4,
    name: "Zero Hour Agent",
    layer: "Layer A — Urgent Parliamentary Notices",
    status: "built",
    baseCompletion: 72,
    runtimeAgentType: "zero_hour",
    source: "46 prompts doc",
    note: "Tatkal-trigger detection, coordinated notices, speech drafts, Celery execution, and draft persistence are now implemented.",
    completedWork: [
      "Tatkal threshold enforcement now checks severity, cluster age, and fresh report volume.",
      "Zero Hour notices are persisted into parliamentary_actions with action_type=zero_hour.",
      "The agent generates a formal notice subject, urgency justification, and 3-minute speech draft.",
      "Cross-constituency coordinated notices are generated when the same Tatkal pattern appears in 5 or more constituencies.",
      "A dedicated Celery task now runs Zero Hour notice generation on an overnight schedule.",
    ],
    remainingWork: [
      "Zero Hour output should still be upgraded from deterministic formal prose to higher-quality filing-grade parliamentary drafting.",
      "Session-calendar awareness and sitting-day gating should be added before production use.",
      "Jurisdiction checks should become more precise for state-vs-central edge cases.",
      "Shadow mode and MP review controls should be extended to Zero Hour notices.",
    ],
    proofPoints: [
      "Dedicated Zero Hour agent tests now cover both local and coordinated notice paths.",
      "Zero Hour notices are written to parliamentary_actions with structured citation metadata.",
      "Agent logs now record zero_hour runs for runtime status tracking.",
    ],
    nextStep: "Raise drafting quality and add session-day gating before relying on Zero Hour notices operationally.",
  },
  { id: "debate", number: 5, name: "Debate Agent", layer: "Layer A — Legislative Debate Participation", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "bill-drafting", number: 6, name: "Bill Drafting Agent", layer: "Layer A — Private Members Bills", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "budget-scrutiny", number: 7, name: "Budget Scrutiny Agent", layer: "Layer A — Budget & MPLAD Intelligence", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "dissent", number: 8, name: "Dissent Agent", layer: "Layer A — Citizen Override Mechanism", status: "partial", baseCompletion: 28, source: "46 prompts doc", note: "Dissent records exist, but the decision loop and safeguards are incomplete." },
  { id: "speaker", number: 9, name: "Speaker Agent", layer: "Layer A — Parliament Moderator", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },

  { id: "bill-sponsor", number: 10, name: "Bill Sponsor Agent (Debate)", layer: "Layer B — Debate Parliament", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "government-bench", number: 11, name: "Government Bench Agent (Debate)", layer: "Layer B — Debate Parliament", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "opposition-leader", number: 12, name: "Opposition Leader Agent (Debate)", layer: "Layer B — Debate Parliament", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "policy-expert", number: 13, name: "Policy Expert Agent (Debate)", layer: "Layer B — Debate Parliament", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "citizen-voice", number: 14, name: "Citizen Voice Agent (Debate)", layer: "Layer B — Debate Parliament", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "constitutional-expert", number: 15, name: "Constitutional Expert Agent (Debate)", layer: "Layer B — Debate Parliament", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "debate-dissent", number: 16, name: "Dissent Agent (Debate)", layer: "Layer B — Debate Parliament", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },

  { id: "perspective-research", number: 17, name: "Perspective Research Agent", layer: "Layer C — Media Engine", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "script-writer", number: 18, name: "Script Writer Agent", layer: "Layer C — Media Engine", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "fact-check", number: 19, name: "Fact Check Agent", layer: "Layer C — Media Engine", status: "partial", baseCompletion: 24, runtimeAgentType: "fact_check", source: "46 prompts doc", note: "Backend shell exists, but the hard-gate research workflow is not complete.", nextStep: "Implement claim extraction plus source verification before media generation is allowed." },
  { id: "voice-synthesis", number: 20, name: "Voice Synthesis Agent", layer: "Layer C — Media Engine", status: "partial", baseCompletion: 16, source: "46 prompts doc", note: "Placeholder exists, but no live audio pipeline exists." },
  { id: "data-visualisation", number: 21, name: "Data Visualisation Agent", layer: "Layer C — Media Engine", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "video-assembly", number: 22, name: "Video Assembly Agent", layer: "Layer C — Media Engine", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "reels-cutter", number: 23, name: "Reels Cutter Agent", layer: "Layer C — Media Engine", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "distribution", number: 24, name: "Distribution Agent", layer: "Layer C — Media Engine", status: "partial", baseCompletion: 22, runtimeAgentType: "distribution", source: "46 prompts doc", note: "Notification and dispatch paths exist in part, but not the full media distribution system.", nextStep: "Finish citizen notifications first, then media and external channel dispatch." },

  { id: "scheme-eligibility", number: 25, name: "Scheme Eligibility Agent", layer: "Layer D — Citizen Welfare", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "rti-filing", number: 26, name: "RTI Filing Agent", layer: "Layer D — Citizen Welfare", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "legal-aid", number: 27, name: "Legal Aid Agent", layer: "Layer D — Citizen Welfare", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "grievance-status", number: 28, name: "Grievance Status Agent", layer: "Layer D — Citizen Welfare", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "ngo-routing", number: 29, name: "NGO Routing Agent", layer: "Layer D — Citizen Welfare", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },

  { id: "urban-planning", number: 30, name: "Urban Planning Intelligence Agent", layer: "Layer E — Gov Intelligence", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "health-surveillance", number: 31, name: "Health Surveillance Agent", layer: "Layer E — Gov Intelligence", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "disaster-warning", number: 32, name: "Disaster Early Warning Agent", layer: "Layer E — Gov Intelligence", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "agriculture-intelligence", number: 33, name: "Agricultural Intelligence Agent", layer: "Layer E — Gov Intelligence", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "vidhan-sabha", number: 34, name: "Vidhan Sabha Agent Layer", layer: "Layer E — Gov Intelligence", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },

  { id: "market-entry", number: 35, name: "Market Entry Intelligence Agent", layer: "Layer F — Corporate Intelligence", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "election-intelligence", number: 36, name: "Election Intelligence Agent", layer: "Layer F — Media & Research", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "credit-risk", number: 37, name: "Credit Risk Intelligence Agent", layer: "Layer G — Financial Sector", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "insurance-risk", number: 38, name: "Insurance Risk Agent", layer: "Layer G — Financial Sector", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "democracy-export", number: 39, name: "Democracy Export Agent", layer: "Layer H — Platform & Global", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "impact-investment", number: 40, name: "Impact Investment Intelligence Agent", layer: "Layer G — Financial Sector", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "investigative-journalism", number: 41, name: "Investigative Journalism Agent", layer: "Layer F — Media & Research", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "academic-research", number: 42, name: "Academic Research Agent", layer: "Layer F — Media & Research", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "municipal", number: 43, name: "Municipal Corporation Agent", layer: "Layer H — Platform", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "aaas", number: 44, name: "Agent-as-a-Service (AaaS)", layer: "Layer H — Platform", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "constituency-data-marketplace", number: 45, name: "Constituency Data Marketplace", layer: "Layer H — Platform", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "fintech-expansion", number: 46, name: "Fintech Expansion Agent", layer: "Layer G — Financial Sector", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
];

export type DebugAgentSnapshot = {
  agent_type: string;
  last_run: string | null;
  recent_runs: number;
  active_constituency_count: number;
};

export type LiveRoadmapAgent = AgentRoadmapItem & {
  completion: number;
  health: "healthy" | "attention" | "idle" | "planned";
  last_run: string | null;
  recent_runs: number;
  active_constituency_count: number;
};

export function buildLiveRoadmap(agents: AgentRoadmapItem[], debugAgents: DebugAgentSnapshot[]): LiveRoadmapAgent[] {
  const debugByType = new Map(debugAgents.map((agent) => [agent.agent_type, agent]));

  return agents.map((agent) => {
    const runtime = agent.runtimeAgentType ? debugByType.get(agent.runtimeAgentType) : undefined;
    const runtimeBoost =
      !runtime
        ? 0
        : (runtime.last_run ? 8 : 0) +
          (runtime.recent_runs >= 1 ? 5 : 0) +
          (runtime.recent_runs >= 5 ? 3 : 0) +
          (runtime.active_constituency_count > 0 ? 4 : 0) +
          (runtime.last_run ? 3 : 0);
    const completion = Math.min(100, agent.baseCompletion + runtimeBoost);
    const health =
      agent.status === "planned"
        ? "planned"
        : runtime?.last_run
          ? "healthy"
          : "idle";

    return {
      ...agent,
      completion,
      health,
      last_run: runtime?.last_run ?? null,
      recent_runs: runtime?.recent_runs ?? 0,
      active_constituency_count: runtime?.active_constituency_count ?? 0,
    };
  });
}

export function buildRoadmapSummary(liveAgents: LiveRoadmapAgent[]) {
  const activeAgents = liveAgents.filter((agent) => agent.status !== "planned");
  return {
    total: liveAgents.length,
    built: liveAgents.filter((agent) => agent.status === "built").length,
    partial: liveAgents.filter((agent) => agent.status === "partial").length,
    planned: liveAgents.filter((agent) => agent.status === "planned").length,
    live: liveAgents.filter((agent) => agent.last_run).length,
    activeCompletion: Math.round(
      activeAgents.reduce((sum, agent) => sum + agent.completion, 0) / Math.max(activeAgents.length, 1),
    ),
    roadmapCoverage: Math.round(
      liveAgents.reduce((sum, agent) => sum + agent.completion, 0) / Math.max(liveAgents.length, 1),
    ),
  };
}

export function groupRoadmapByLayer(liveAgents: LiveRoadmapAgent[]) {
  const groups = new Map<string, LiveRoadmapAgent[]>();
  for (const agent of liveAgents) {
    const bucket = groups.get(agent.layer) ?? [];
    bucket.push(agent);
    groups.set(agent.layer, bucket);
  }
  return Array.from(groups.entries()).map(([layer, agents]) => ({
    layer,
    agents: agents.sort((left, right) => left.number - right.number),
  }));
}

export function getRoadmapDetails(agent: LiveRoadmapAgent) {
  const completedWork =
    agent.completedWork ??
    (agent.status === "built"
      ? [
          "Core code path exists in the repo.",
          "The agent is represented in the runtime status board.",
          "The agent can be inspected through the delivery roadmap.",
        ]
      : agent.status === "partial"
        ? [
            "Some supporting code or schema pieces exist.",
            "The agent is visible in the roadmap and delivery plan.",
          ]
        : ["The formal agent exists in the roadmap document."]);

  const remainingWork =
    agent.remainingWork ??
    (agent.status === "built"
      ? [
          "Production-grade integrations are still required.",
          "Operational monitoring and failure handling need hardening.",
          "End-to-end quality must be proven with real traffic.",
        ]
      : agent.status === "partial"
        ? [
            "Primary runtime path is incomplete.",
            "Agent-specific outputs are not yet fully reliable.",
            "Definition of done must be converted into tests and live runs.",
          ]
        : [
            "No implementation exists yet.",
            "Prompt, runtime, persistence, and tests all remain to be built.",
          ]);

  const proofPoints =
    agent.proofPoints ??
    (agent.last_run
      ? [
          "Recent runtime activity exists in the audit log.",
          `${agent.recent_runs} recent run(s) have been recorded.`,
          `${agent.active_constituency_count} active constituencies are linked to this runtime snapshot.`,
        ]
      : ["No runtime proof recorded yet."]);

  const nextStep =
    agent.nextStep ??
    (agent.status === "planned"
      ? "Create the first implementation slice: prompt, runtime entrypoint, persistence, and tests."
      : "Take the next incomplete integration and convert it into a tested runtime path.");

  return { completedWork, remainingWork, proofPoints, nextStep };
}
