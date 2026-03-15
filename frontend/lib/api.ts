import fallbackConstituencies from "@/data/constituencies-directory.json";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { next: { revalidate: 30 } });
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
