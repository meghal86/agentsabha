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
};

export const agentRoadmap: AgentRoadmapItem[] = [
  { id: "intake", number: 1, name: "Intake Agent", layer: "Layer A — Citizen Issue Intake", status: "built", baseCompletion: 62, runtimeAgentType: "intake", source: "46 prompts doc", note: "Web intake, structuring, and issue persistence exist; WhatsApp, voice, and production verification remain incomplete." },
  { id: "clustering", number: 2, name: "Clustering Agent", layer: "Layer A — Issue Pattern Intelligence", status: "built", baseCompletion: 56, runtimeAgentType: "clustering", source: "46 prompts doc", note: "Cluster creation, labels, velocity, and badges exist; continuity, multilingual robustness, and production hardening are still open." },
  { id: "question-hour", number: 3, name: "Question Hour Draft Agent", layer: "Layer A — Parliamentary Questions", status: "built", baseCompletion: 52, runtimeAgentType: "question_draft", source: "46 prompts doc", note: "Rule 32 and Rule 33 drafting now exists, but richer source retrieval and full MP review quality gates are still pending." },
  { id: "zero-hour", number: 4, name: "Zero Hour Agent", layer: "Layer A — Urgent Parliamentary Notices", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
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
  { id: "fact-check", number: 19, name: "Fact Check Agent", layer: "Layer C — Media Engine", status: "partial", baseCompletion: 24, runtimeAgentType: "fact_check", source: "46 prompts doc", note: "Backend shell exists, but the hard-gate research workflow is not complete." },
  { id: "voice-synthesis", number: 20, name: "Voice Synthesis Agent", layer: "Layer C — Media Engine", status: "partial", baseCompletion: 16, source: "46 prompts doc", note: "Placeholder exists, but no live audio pipeline exists." },
  { id: "data-visualisation", number: 21, name: "Data Visualisation Agent", layer: "Layer C — Media Engine", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "video-assembly", number: 22, name: "Video Assembly Agent", layer: "Layer C — Media Engine", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "reels-cutter", number: 23, name: "Reels Cutter Agent", layer: "Layer C — Media Engine", status: "planned", baseCompletion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "distribution", number: 24, name: "Distribution Agent", layer: "Layer C — Media Engine", status: "partial", baseCompletion: 22, runtimeAgentType: "distribution", source: "46 prompts doc", note: "Notification and dispatch paths exist in part, but not the full media distribution system." },

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
  last_action: string | null;
  error_code: string | null;
  recent_runs: number;
  active_constituencies: number[];
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
          (runtime.active_constituencies.length > 0 ? 4 : 0) +
          (!runtime.error_code && runtime.last_run ? 3 : 0);
    const completion = Math.min(95, agent.baseCompletion + runtimeBoost);
    const health =
      agent.status === "planned"
        ? "planned"
        : runtime?.error_code
          ? "attention"
          : runtime?.last_run
            ? "healthy"
            : "idle";

    return {
      ...agent,
      completion,
      health,
      last_run: runtime?.last_run ?? null,
      recent_runs: runtime?.recent_runs ?? 0,
      active_constituency_count: runtime?.active_constituencies.length ?? 0,
    };
  });
}

export function buildRoadmapSummary(liveAgents: LiveRoadmapAgent[]) {
  return {
    total: liveAgents.length,
    built: liveAgents.filter((agent) => agent.status === "built").length,
    partial: liveAgents.filter((agent) => agent.status === "partial").length,
    planned: liveAgents.filter((agent) => agent.status === "planned").length,
    live: liveAgents.filter((agent) => agent.last_run).length,
    overallCompletion: Math.round(
      liveAgents.reduce((sum, agent) => sum + agent.completion, 0) / Math.max(liveAgents.length, 1),
    ),
  };
}
