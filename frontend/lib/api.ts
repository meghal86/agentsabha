import fallbackConstituencies from "@/data/constituencies-directory.json";
import {
  sansaddarpanConstituenciesFallback,
  sansaddarpanMethodologyFallback,
  sansaddarpanMpProfilesFallback,
  sansaddarpanMpsFallback,
  sansaddarpanOverviewFallback,
  sansaddarpanRuleDeviationDetailsFallback,
  sansaddarpanRuleDeviationsFallback,
} from "@/lib/sansaddarpan-fallback";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export type HeatmapPoint = {
  id: number;
  lat: number | null;
  lng: number | null;
  severity_score: number | null;
  top_category: string | null;
};

export async function getHealth() {
  return request<{ status: string; db: string; redis: string; agents_active: number; version: string }>("/health");
}

export async function getNationalHeatmap() {
  return request<{ constituencies: HeatmapPoint[] }>("/api/national/heatmap");
}

export type ConstituencySummary = {
  id: number;
  name: string;
  state: string;
  mp_name: string | null;
  mp_party: string | null;
  population: number | null;
};

export type ConstituencyDirectoryItem = {
  id: number;
  name: string;
  state: string;
  mp_name: string | null;
  lat: number | null;
  lng: number | null;
};

export async function getConstituencies() {
  try {
    return await request<{ constituencies: ConstituencyDirectoryItem[] }>("/api/constituencies");
  } catch {
    return { constituencies: fallbackConstituencies as ConstituencyDirectoryItem[] };
  }
}

export type ConstituencyIssueCluster = {
  label: string | null;
  count: number;
  severity: number | null;
  badge: "tatkal" | "rising" | "chronic" | "stable" | "resolved" | null;
  velocity: number | null;
  category: string | null;
};

export type ConstituencyDeskCategoryCount = {
  category: string;
  count: number;
};

export type ConstituencyRecentIssue = {
  id: string;
  text_preview: string;
  category: string | null;
  severity: number | null;
  created_at: string;
  clustered: boolean;
};

export type ConstituencyDesk = {
  constituency_id: number;
  raw_issue_count: number;
  clustered_issue_count: number;
  pending_issue_count: number;
  public_cluster_count: number;
  action_count: number;
  top_category: string | null;
  average_severity: number | null;
  latest_issue_at: string | null;
  category_breakdown: ConstituencyDeskCategoryCount[];
  recent_issues: ConstituencyRecentIssue[];
};

export type ParliamentaryActionSummary = {
  type: string | null;
  content: string;
  status: string;
  filed_at: string | null;
  response_text: string | null;
};

export type TimelineDatum = {
  week: string;
  count: number;
  severity_avg: number | null;
};

export type TimelineSeries = {
  category: string;
  data: TimelineDatum[];
};

export type NationalPulseIssue = {
  label: string;
  constituency_count: number;
  avg_severity: number | null;
  total_reports: number;
};

export async function getConstituencySummary(id: number | string) {
  return request<ConstituencySummary>(`/api/constituency/${id}`);
}

export async function getConstituencyIssues(id: number | string) {
  return request<{ constituency_id: number; clusters: ConstituencyIssueCluster[]; total: number; page: number }>(
    `/api/constituency/${id}/issues`,
  );
}

export async function getConstituencyDesk(id: number | string) {
  return request<ConstituencyDesk>(`/api/constituency/${id}/desk`);
}

export async function getConstituencyActions(id: number | string) {
  return request<{ constituency_id: number; actions: ParliamentaryActionSummary[] }>(`/api/constituency/${id}/actions`);
}

export async function getConstituencyTimeline(id: number | string) {
  return request<{ constituency_id: number; timeline: TimelineSeries[] }>(`/api/constituency/${id}/timeline`);
}

export async function getNationalPulse() {
  return request<{ issues: NationalPulseIssue[] }>("/api/national/pulse");
}

export type DebugAgentStatus = {
  agent_type: string;
  last_run: string | null;
  last_action: string | null;
  error_code: string | null;
  recent_runs: number;
  active_constituencies: number[];
};

export async function getDebugAgents() {
  return request<{ agents: DebugAgentStatus[] }>("/api/debug/agents");
}

export type RoadmapRuntimeAgent = {
  agent_type: string;
  last_run: string | null;
  recent_runs: number;
  active_constituency_count: number;
};

export async function getRoadmapRuntime() {
  return request<{ generated_at: string; agents: RoadmapRuntimeAgent[] }>("/api/roadmap/runtime");
}

export type SansadDarpanSection = {
  slug: string;
  title: string;
  hindi_title: string;
  summary: string;
  metric_label: string;
  metric_value: string;
  href: string;
  layer: string;
};

export type SansadDarpanOverview = {
  product_name: string;
  hindi_name: string;
  tagline: string;
  launch_window: string;
  primary_users: string[];
  layer_placement: string;
  sections: SansadDarpanSection[];
};

export type SansadDarpanMpCard = {
  slug: string;
  name: string;
  constituency: string;
  state: string;
  party: string;
  attendance_rate: number;
  questions_asked: number;
  debates: number;
  score: number;
  national_rank: number;
  summary: string;
};

export type SansadDarpanMpListResponse = {
  methodology_version: string;
  mps: SansadDarpanMpCard[];
};

export type SansadDarpanMpProfile = SansadDarpanMpCard & {
  zero_hour_mentions: number;
  private_member_bills: number;
  voting_participation: number;
  score_breakdown: Record<string, number>;
  sources: string[];
  narrative: string;
  og_ready: boolean;
};

export type SansadDarpanWelfareMetric = {
  label: string;
  value: string;
  benchmark: string;
  status: string;
};

export type SansadDarpanConstituencyCard = {
  slug: string;
  name: string;
  state: string;
  mp_name: string;
  top_gap: string;
  raised_in_parliament: boolean;
  metrics: SansadDarpanWelfareMetric[];
};

export type SansadDarpanConstituencyListResponse = {
  update_frequency: string;
  constituencies: SansadDarpanConstituencyCard[];
};

export type SansadDarpanRuleDeviationCard = {
  id: string;
  title: string;
  session_label: string;
  rule_reference: string;
  confidence: number;
  status: string;
  summary: string;
};

export type SansadDarpanRuleDeviationListResponse = {
  human_review_required: boolean;
  deviations: SansadDarpanRuleDeviationCard[];
};

export type SansadDarpanRuleDeviationDetail = SansadDarpanRuleDeviationCard & {
  analysis: string;
  primary_sources: string[];
  review_notes: string[];
};

export type SansadDarpanMethodologyResponse = {
  title: string;
  principles: string[];
  sections: { title: string; body: string }[];
};

export async function getSansadDarpanOverview() {
  try {
    return await request<SansadDarpanOverview>("/api/sansaddarpan");
  } catch {
    return sansaddarpanOverviewFallback;
  }
}

export async function getSansadDarpanMps() {
  try {
    return await request<SansadDarpanMpListResponse>("/api/sansaddarpan/mps");
  } catch {
    return sansaddarpanMpsFallback;
  }
}

export async function getSansadDarpanMp(slug: string) {
  try {
    return await request<SansadDarpanMpProfile>(`/api/sansaddarpan/mps/${slug}`);
  } catch {
    const fallback = sansaddarpanMpProfilesFallback[slug];
    if (!fallback) {
      throw new Error("MP profile not found");
    }
    return fallback;
  }
}

export async function getSansadDarpanConstituencies() {
  try {
    return await request<SansadDarpanConstituencyListResponse>("/api/sansaddarpan/constituencies");
  } catch {
    return sansaddarpanConstituenciesFallback;
  }
}

export async function getSansadDarpanConstituency(slug: string) {
  try {
    return await request<SansadDarpanConstituencyCard>(`/api/sansaddarpan/constituencies/${slug}`);
  } catch {
    const fallback = sansaddarpanConstituenciesFallback.constituencies.find((item) => item.slug === slug);
    if (!fallback) {
      throw new Error("Constituency profile not found");
    }
    return fallback;
  }
}

export async function getSansadDarpanRuleDeviations() {
  try {
    return await request<SansadDarpanRuleDeviationListResponse>("/api/sansaddarpan/rule-deviations");
  } catch {
    return sansaddarpanRuleDeviationsFallback;
  }
}

export async function getSansadDarpanRuleDeviation(id: string) {
  try {
    return await request<SansadDarpanRuleDeviationDetail>(`/api/sansaddarpan/rule-deviations/${id}`);
  } catch {
    const fallback = sansaddarpanRuleDeviationDetailsFallback[id];
    if (!fallback) {
      throw new Error("Rule deviation not found");
    }
    return fallback;
  }
}

export async function getSansadDarpanMethodology() {
  try {
    return await request<SansadDarpanMethodologyResponse>("/api/sansaddarpan/methodology");
  } catch {
    return sansaddarpanMethodologyFallback;
  }
}
