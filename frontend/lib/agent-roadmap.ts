export type AgentRoadmapItem = {
  id: string;
  number: number;
  name: string;
  layer: string;
  status: "built" | "partial" | "planned";
  completion: number;
  source: string;
  note: string;
};

export const agentRoadmap: AgentRoadmapItem[] = [
  { id: "intake", number: 1, name: "Intake Agent", layer: "Layer A — Citizen Issue Intake", status: "built", completion: 85, source: "46 prompts doc", note: "Working intake path exists for web submissions and issue structuring." },
  { id: "clustering", number: 2, name: "Clustering Agent", layer: "Layer A — Issue Pattern Intelligence", status: "built", completion: 75, source: "46 prompts doc", note: "Clustering and label generation exist, though still not production-grade across all inputs." },
  { id: "question-hour", number: 3, name: "Question Hour Draft Agent", layer: "Layer A — Parliamentary Questions", status: "built", completion: 70, source: "46 prompts doc", note: "Question drafting exists with constituency evidence and rule framing." },
  { id: "zero-hour", number: 4, name: "Zero Hour Agent", layer: "Layer A — Urgent Parliamentary Notices", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "debate", number: 5, name: "Debate Agent", layer: "Layer A — Legislative Debate Participation", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "bill-drafting", number: 6, name: "Bill Drafting Agent", layer: "Layer A — Private Members Bills", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "budget-scrutiny", number: 7, name: "Budget Scrutiny Agent", layer: "Layer A — Budget & MPLAD Intelligence", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "dissent", number: 8, name: "Dissent Agent", layer: "Layer A — Citizen Override Mechanism", status: "partial", completion: 35, source: "46 prompts doc", note: "Dissent records exist, but the decision loop and safeguards are incomplete." },
  { id: "speaker", number: 9, name: "Speaker Agent", layer: "Layer A — Parliament Moderator", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },

  { id: "bill-sponsor", number: 10, name: "Bill Sponsor Agent (Debate)", layer: "Layer B — Debate Parliament", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "government-bench", number: 11, name: "Government Bench Agent (Debate)", layer: "Layer B — Debate Parliament", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "opposition-leader", number: 12, name: "Opposition Leader Agent (Debate)", layer: "Layer B — Debate Parliament", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "policy-expert", number: 13, name: "Policy Expert Agent (Debate)", layer: "Layer B — Debate Parliament", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "citizen-voice", number: 14, name: "Citizen Voice Agent (Debate)", layer: "Layer B — Debate Parliament", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "constitutional-expert", number: 15, name: "Constitutional Expert Agent (Debate)", layer: "Layer B — Debate Parliament", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "debate-dissent", number: 16, name: "Dissent Agent (Debate)", layer: "Layer B — Debate Parliament", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },

  { id: "perspective-research", number: 17, name: "Perspective Research Agent", layer: "Layer C — Media Engine", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "script-writer", number: 18, name: "Script Writer Agent", layer: "Layer C — Media Engine", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "fact-check", number: 19, name: "Fact Check Agent", layer: "Layer C — Media Engine", status: "partial", completion: 30, source: "46 prompts doc", note: "Backend shell exists, but the hard-gate research workflow is not complete." },
  { id: "voice-synthesis", number: 20, name: "Voice Synthesis Agent", layer: "Layer C — Media Engine", status: "partial", completion: 20, source: "46 prompts doc", note: "Placeholder exists, but no live audio pipeline exists." },
  { id: "data-visualisation", number: 21, name: "Data Visualisation Agent", layer: "Layer C — Media Engine", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "video-assembly", number: 22, name: "Video Assembly Agent", layer: "Layer C — Media Engine", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "reels-cutter", number: 23, name: "Reels Cutter Agent", layer: "Layer C — Media Engine", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "distribution", number: 24, name: "Distribution Agent", layer: "Layer C — Media Engine", status: "partial", completion: 25, source: "46 prompts doc", note: "Notification and dispatch paths exist in part, but not the full media distribution system." },

  { id: "scheme-eligibility", number: 25, name: "Scheme Eligibility Agent", layer: "Layer D — Citizen Welfare", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "rti-filing", number: 26, name: "RTI Filing Agent", layer: "Layer D — Citizen Welfare", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "legal-aid", number: 27, name: "Legal Aid Agent", layer: "Layer D — Citizen Welfare", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "grievance-status", number: 28, name: "Grievance Status Agent", layer: "Layer D — Citizen Welfare", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "ngo-routing", number: 29, name: "NGO Routing Agent", layer: "Layer D — Citizen Welfare", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },

  { id: "urban-planning", number: 30, name: "Urban Planning Intelligence Agent", layer: "Layer E — Gov Intelligence", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "health-surveillance", number: 31, name: "Health Surveillance Agent", layer: "Layer E — Gov Intelligence", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "disaster-warning", number: 32, name: "Disaster Early Warning Agent", layer: "Layer E — Gov Intelligence", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "agriculture-intelligence", number: 33, name: "Agricultural Intelligence Agent", layer: "Layer E — Gov Intelligence", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "vidhan-sabha", number: 34, name: "Vidhan Sabha Agent Layer", layer: "Layer E — Gov Intelligence", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },

  { id: "market-entry", number: 35, name: "Market Entry Intelligence Agent", layer: "Layer F — Corporate Intelligence", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "election-intelligence", number: 36, name: "Election Intelligence Agent", layer: "Layer F — Media & Research", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "credit-risk", number: 37, name: "Credit Risk Intelligence Agent", layer: "Layer G — Financial Sector", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "insurance-risk", number: 38, name: "Insurance Risk Agent", layer: "Layer G — Financial Sector", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "democracy-export", number: 39, name: "Democracy Export Agent", layer: "Layer H — Platform & Global", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "impact-investment", number: 40, name: "Impact Investment Intelligence Agent", layer: "Layer G — Financial Sector", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "investigative-journalism", number: 41, name: "Investigative Journalism Agent", layer: "Layer F — Media & Research", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "academic-research", number: 42, name: "Academic Research Agent", layer: "Layer F — Media & Research", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "municipal", number: 43, name: "Municipal Corporation Agent", layer: "Layer H — Platform", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "aaas", number: 44, name: "Agent-as-a-Service (AaaS)", layer: "Layer H — Platform", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "constituency-data-marketplace", number: 45, name: "Constituency Data Marketplace", layer: "Layer H — Platform", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
  { id: "fintech-expansion", number: 46, name: "Fintech Expansion Agent", layer: "Layer G — Financial Sector", status: "planned", completion: 0, source: "46 prompts doc", note: "Not built yet." },
];

export const roadmapSummary = {
  total: agentRoadmap.length,
  built: agentRoadmap.filter((agent) => agent.status === "built").length,
  partial: agentRoadmap.filter((agent) => agent.status === "partial").length,
  planned: agentRoadmap.filter((agent) => agent.status === "planned").length,
  overallCompletion:
    Math.round(agentRoadmap.reduce((sum, agent) => sum + agent.completion, 0) / Math.max(agentRoadmap.length, 1)),
};
