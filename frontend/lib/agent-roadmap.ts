export type AgentRoadmapItem = {
  id: string;
  name: string;
  layer: string;
  status: "built" | "partial" | "planned";
  completion: number;
  source: string;
  note: string;
};

export const agentRoadmap: AgentRoadmapItem[] = [
  { id: "intake", name: "Intake Agent", layer: "Parliamentary Core", status: "built", completion: 85, source: "Master Prompt v3 + research", note: "Receives citizen issues, structures them, and stores the first constituency-linked record." },
  { id: "clustering", name: "Clustering Agent", layer: "Parliamentary Core", status: "built", completion: 75, source: "Master Prompt v3 + research", note: "Groups similar complaints into public clusters and computes trend velocity." },
  { id: "question-hour", name: "Question Hour Agent", layer: "Parliamentary Core", status: "built", completion: 70, source: "Master Prompt v3 + research", note: "Creates draft parliamentary questions with constituency evidence and rule framing." },
  { id: "mp-brief", name: "MP Brief Agent", layer: "Parliamentary Core", status: "built", completion: 70, source: "Master Prompt v3 + media spec", note: "Builds weekly MP brief payloads and artifact output." },
  { id: "citizen-notification", name: "Citizen Notification Agent", layer: "Parliamentary Core", status: "partial", completion: 45, source: "Master Prompt v3", note: "Acknowledgment and notification logic exists, but delivery integrations are not fully live." },
  { id: "zero-hour", name: "Zero Hour Agent", layer: "Parliamentary Core", status: "planned", completion: 0, source: "research", note: "Same-day urgency notices when Tatkal signals spike." },
  { id: "debate", name: "Debate Agent", layer: "Parliamentary Core", status: "planned", completion: 0, source: "research", note: "Drafts citizen-grounded speeches for listed bills and debates." },
  { id: "bill-drafting", name: "Bill Drafting Agent", layer: "Parliamentary Core", status: "planned", completion: 0, source: "research", note: "Creates Private Members Bill drafts from cross-constituency patterns." },
  { id: "budget-scrutiny", name: "Budget Scrutiny Agent", layer: "Parliamentary Core", status: "planned", completion: 0, source: "research", note: "Compares funding allocations against constituency need and drafts scrutiny outputs." },
  { id: "dissent", name: "Dissent Agent", layer: "Parliamentary Control", status: "partial", completion: 35, source: "research", note: "Dissent records exist, but the full override-control loop is not complete." },
  { id: "speaker", name: "Speaker Agent", layer: "Parliamentary Control", status: "planned", completion: 0, source: "research", note: "Moderates the digital parliament and applies procedural rules across seats." },
  { id: "scheme-eligibility", name: "Scheme Eligibility Agent", layer: "Citizen Service", status: "planned", completion: 0, source: "galaxy", note: "Maps citizen profiles to eligible welfare entitlements and missed benefits." },
  { id: "rti-filing", name: "RTI Filing Agent", layer: "Citizen Service", status: "planned", completion: 0, source: "galaxy", note: "Prepares RTI requests when government opacity blocks action." },
  { id: "legal-aid", name: "Legal Aid Agent", layer: "Citizen Service", status: "planned", completion: 0, source: "galaxy", note: "Routes citizens toward appropriate legal remedies and filing paths." },
  { id: "grievance-status", name: "Grievance Status Agent", layer: "Citizen Service", status: "planned", completion: 0, source: "galaxy", note: "Tracks external complaint systems and reports status back to citizens." },
  { id: "ngo-routing", name: "NGO Routing Agent", layer: "Citizen Service", status: "planned", completion: 0, source: "galaxy", note: "Connects unresolved human problems to civil society responders." },
  { id: "urban-planning", name: "Urban Planning Intelligence Agent", layer: "Government Intelligence", status: "planned", completion: 0, source: "galaxy", note: "Surfaces local planning failures and infrastructure blind spots to public agencies." },
  { id: "health-surveillance", name: "Health Surveillance Agent", layer: "Government Intelligence", status: "planned", completion: 0, source: "galaxy", note: "Converts health complaints into early public-health warning signals." },
  { id: "disaster-warning", name: "Disaster Early Warning Agent", layer: "Government Intelligence", status: "planned", completion: 0, source: "galaxy", note: "Detects flood, heat, and disaster patterns from incoming field reports." },
  { id: "agriculture-intelligence", name: "Agricultural Intelligence Agent", layer: "Government Intelligence", status: "planned", completion: 0, source: "galaxy", note: "Tracks farm distress, crop risk, and constituency-level agri signals." },
  { id: "vidhan-sabha", name: "Vidhan Sabha Agent Layer", layer: "Government Intelligence", status: "planned", completion: 0, source: "galaxy", note: "State assembly deployment layer built from the same constituency protocol." },
  { id: "market-entry", name: "Market Entry Intelligence Agent", layer: "Commercial Intelligence", status: "planned", completion: 0, source: "galaxy", note: "Uses constituency reality to inform business expansion decisions." },
  { id: "supply-chain", name: "Supply Chain Risk Agent", layer: "Commercial Intelligence", status: "planned", completion: 0, source: "galaxy", note: "Flags logistics and infrastructure issues affecting operations." },
  { id: "esg", name: "ESG Intelligence Agent", layer: "Commercial Intelligence", status: "planned", completion: 0, source: "galaxy", note: "Maps citizen-reported environmental and community impact against corporate claims." },
  { id: "real-estate", name: "Real Estate Intelligence Agent", layer: "Commercial Intelligence", status: "planned", completion: 0, source: "galaxy", note: "Uses local civic conditions and stress signals to inform land and housing decisions." },
  { id: "workforce", name: "Workforce Intelligence Agent", layer: "Commercial Intelligence", status: "planned", completion: 0, source: "galaxy", note: "Tracks skilling and employment pain to reveal workforce availability and stress." },
  { id: "credit-risk", name: "Credit Risk Intelligence Agent", layer: "Financial Intelligence", status: "planned", completion: 0, source: "galaxy", note: "Translates civic stress into constituency-level lending risk signals." },
  { id: "insurance-risk", name: "Insurance Risk Agent", layer: "Financial Intelligence", status: "planned", completion: 0, source: "galaxy", note: "Uses disaster and infrastructure complaints as risk indicators." },
  { id: "fintech-expansion", name: "Fintech Expansion Agent", layer: "Financial Intelligence", status: "planned", completion: 0, source: "galaxy", note: "Identifies regions where financial services demand and trust gaps are rising." },
  { id: "impact-investment", name: "Impact Investment Intelligence Agent", layer: "Financial Intelligence", status: "planned", completion: 0, source: "galaxy", note: "Supports development finance targeting with constituency-level evidence." },
  { id: "election-intelligence", name: "Election Intelligence Agent", layer: "Media & Research", status: "planned", completion: 0, source: "galaxy", note: "Turns longitudinal constituency issues into pre-election signal intelligence." },
  { id: "investigative-journalism", name: "Investigative Journalism Agent", layer: "Media & Research", status: "planned", completion: 0, source: "galaxy", note: "Surfaces hidden civic patterns that merit deeper editorial investigation." },
  { id: "academic-research", name: "Academic Research Agent", layer: "Media & Research", status: "planned", completion: 0, source: "galaxy", note: "Packages longitudinal constituency data for universities and researchers." },
  { id: "think-tank-policy", name: "Think Tank Policy Agent", layer: "Media & Research", status: "planned", completion: 0, source: "galaxy", note: "Turns issue clusters into structured policy briefs for institutions." },
  { id: "perspective-research", name: "Perspective Research Agent", layer: "Media Engine", status: "planned", completion: 0, source: "media engine", note: "Runs multi-perspective research so editorial outputs stay balanced and auditable." },
  { id: "script-writer", name: "Script Writer Agent", layer: "Media Engine", status: "planned", completion: 0, source: "media engine", note: "Writes podcast and narrative scripts from the weekly issue pulse." },
  { id: "fact-check", name: "Fact Check Agent", layer: "Media Engine", status: "partial", completion: 30, source: "media engine + backend stub", note: "A backend shell exists, but the full hard-gate fact-check workflow is not complete." },
  { id: "narrative", name: "Narrative Agent", layer: "Media Engine", status: "planned", completion: 0, source: "media engine", note: "Shapes structure and emotional pacing without taking editorial sides." },
  { id: "voice-synthesis", name: "Voice Synthesis Agent", layer: "Media Engine", status: "partial", completion: 20, source: "media engine + backend stub", note: "The placeholder exists in code, but there is no live production voice pipeline." },
  { id: "audio-mix", name: "Audio Mix Agent", layer: "Media Engine", status: "planned", completion: 0, source: "media engine", note: "Combines host voices, music, transitions, and chaptering." },
  { id: "data-visualisation", name: "Data Visualisation Agent", layer: "Media Engine", status: "planned", completion: 0, source: "media engine", note: "Builds charts, maps, and visual explainers from issue and severity data." },
  { id: "video-assembly", name: "Video Assembly Agent", layer: "Media Engine", status: "planned", completion: 0, source: "media engine", note: "Builds the longform video and presentation layer for weekly outputs." },
  { id: "reels-cutter", name: "Reels Cutter Agent", layer: "Media Engine", status: "planned", completion: 0, source: "media engine", note: "Finds the strongest short moments and formats them for social distribution." },
  { id: "distribution", name: "Distribution Agent", layer: "Media Engine", status: "planned", completion: 0, source: "media engine", note: "Publishes outputs across channels and dispatch surfaces." },
  { id: "democracy-export", name: "Democracy Export Agent", layer: "Expansion", status: "planned", completion: 0, source: "galaxy", note: "White-labels the AgentSabha protocol for other democracies." },
  { id: "municipal", name: "Municipal Corporation Agent", layer: "Expansion", status: "planned", completion: 0, source: "galaxy", note: "Pushes the system down to ward-level local government." },
  { id: "aaas", name: "Agent-as-a-Service (AaaS)", layer: "Expansion", status: "planned", completion: 0, source: "galaxy", note: "Licenses the orchestration layer to other public-interest products." },
];

export const roadmapSummary = {
  total: agentRoadmap.length,
  built: agentRoadmap.filter((agent) => agent.status === "built").length,
  partial: agentRoadmap.filter((agent) => agent.status === "partial").length,
  planned: agentRoadmap.filter((agent) => agent.status === "planned").length,
  overallCompletion:
    Math.round(agentRoadmap.reduce((sum, agent) => sum + agent.completion, 0) / Math.max(agentRoadmap.length, 1)),
};
