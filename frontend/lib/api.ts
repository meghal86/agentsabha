import fallbackConstituencies from "@/data/constituencies-directory.json";
import {
  sansaddarpanConstituenciesFallback,
  sansaddarpanMethodologyFallback,
  sansaddarpanOverviewFallback,
  sansaddarpanRuleDeviationDetailsFallback,
  sansaddarpanRuleDeviationsFallback,
} from "@/lib/sansaddarpan-fallback";
import { getWeeklyBrief as getWeeklyBriefFallback, weeklyBriefs as weeklyBriefsFallback } from "@/lib/weekly-briefs";

const LOCAL_API_BASE_URL = "http://127.0.0.1:8000";
const API_REQUEST_TIMEOUT_MS = process.env.NODE_ENV === "production" ? 8000 : 15000;
const API_REQUEST_RETRIES = process.env.NODE_ENV === "production" ? 1 : 0;

function getApiBaseUrl() {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, "");
  }
  if (process.env.NODE_ENV !== "production") {
    return LOCAL_API_BASE_URL;
  }
  return null;
}

async function request<T>(path: string): Promise<T> {
  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= API_REQUEST_RETRIES; attempt += 1) {
    try {
      const response = await fetch(`${apiBaseUrl}${path}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(API_REQUEST_TIMEOUT_MS),
      });
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      return response.json() as Promise<T>;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown API request error");
      if (attempt < API_REQUEST_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
      }
    }
  }

  throw lastError ?? new Error("API request failed");
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
  voting_participation: number | null;
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

export type WeeklyBriefGap = {
  title: string;
  detail: string;
  why_it_matters: string;
};

export type WeeklyBriefAuditHook = {
  title: string;
  body: string;
  source_label: string;
};

export type WeeklyBriefParliamentaryMove = {
  title: string;
  body: string;
  draft_question: string;
};

export type WeeklyBriefNarrativeBlock = {
  title: string;
  body: string;
};

export type WeeklyBriefSource = {
  label: string;
  note: string;
};

export type WeeklyBriefCard = {
  slug: string;
  constituency_slug: string;
  week_label: string;
  publish_date: string;
  constituency: string;
  state: string;
  mp_name: string;
  mp_party: string;
  headline: string;
  summary: string;
};

export type WeeklyBriefDetail = WeeklyBriefCard & {
  hero_note: string;
  welfare_gaps: WeeklyBriefGap[];
  audit_hook: WeeklyBriefAuditHook;
  parliamentary_move: WeeklyBriefParliamentaryMove;
  anomaly: WeeklyBriefNarrativeBlock;
  sdg_trend: WeeklyBriefNarrativeBlock;
  mp_summary: string[];
  video_segments: WeeklyBriefNarrativeBlock[];
  source_trail: WeeklyBriefSource[];
};

export type WeeklyBriefListResponse = {
  briefs: WeeklyBriefCard[];
};

function mapFallbackWeeklyBrief(brief: (typeof weeklyBriefsFallback)[number]): WeeklyBriefDetail {
  return {
    slug: brief.slug,
    constituency_slug: brief.constituencySlug,
    week_label: brief.weekLabel,
    publish_date: brief.publishDate,
    constituency: brief.constituency,
    state: brief.state,
    mp_name: brief.mpName,
    mp_party: brief.mpParty,
    headline: brief.headline,
    summary: brief.summary,
    hero_note: brief.heroNote,
    welfare_gaps: brief.welfareGaps.map((gap) => ({
      title: gap.title,
      detail: gap.detail,
      why_it_matters: gap.whyItMatters,
    })),
    audit_hook: {
      title: brief.auditHook.title,
      body: brief.auditHook.body,
      source_label: brief.auditHook.sourceLabel,
    },
    parliamentary_move: {
      title: brief.parliamentaryMove.title,
      body: brief.parliamentaryMove.body,
      draft_question: brief.parliamentaryMove.draftQuestion,
    },
    anomaly: {
      title: brief.anomaly.title,
      body: brief.anomaly.body,
    },
    sdg_trend: {
      title: brief.sdgTrend.title,
      body: brief.sdgTrend.body,
    },
    mp_summary: brief.mpSummary,
    video_segments: brief.videoSegments,
    source_trail: brief.sourceTrail,
  };
}

function getWeeklyBriefFallbackList(): WeeklyBriefListResponse {
  return {
    briefs: weeklyBriefsFallback.map((brief) => {
      const mapped = mapFallbackWeeklyBrief(brief);
      return {
        slug: mapped.slug,
        constituency_slug: mapped.constituency_slug,
        week_label: mapped.week_label,
        publish_date: mapped.publish_date,
        constituency: mapped.constituency,
        state: mapped.state,
        mp_name: mapped.mp_name,
        mp_party: mapped.mp_party,
        headline: mapped.headline,
        summary: mapped.summary,
      };
    }),
  };
}

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
    const { sansaddarpanMpsFallback } = await import("@/lib/sansaddarpan-fallback");
    return sansaddarpanMpsFallback;
  }
}

export async function getSansadDarpanMp(slug: string) {
  try {
    return await request<SansadDarpanMpProfile>(`/api/sansaddarpan/mps/${slug}`);
  } catch {
    const { sansaddarpanMpProfilesFallback } = await import("@/lib/sansaddarpan-fallback");
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

// --- SansadDarpan Weekly Briefs (stored, Claude-generated) ---

export type SansadDarpanWeeklyBriefCard = {
  id: string;
  week_number: number;
  year: number;
  constituency_name: string;
  constituency_state: string;
  mp_name: string | null;
  headline: string;
  status: string;
  youtube_title: string | null;
  published_at: string | null;
  created_at: string;
};

export type SansadDarpanWeeklyBriefDetail = SansadDarpanWeeklyBriefCard & {
  brief_markdown: string;
  video_script_json: Record<string, string>;
  mp_whatsapp_brief: string;
  hindi_translation: Record<string, string> | null;
  youtube_description: string | null;
  reel_scripts: Array<{
    hook: string;
    script: string;
    caption_en: string;
    caption_hi: string;
    hashtags: string[] | string;
  }> | null;
  generation_source: string;
};

export type SansadDarpanWeeklyBriefListResponse = {
  briefs: SansadDarpanWeeklyBriefCard[];
};

export async function getSansadDarpanWeeklyBriefs() {
  try {
    return await request<SansadDarpanWeeklyBriefListResponse>("/api/sansaddarpan/weekly-briefs");
  } catch {
    return { briefs: [] } as SansadDarpanWeeklyBriefListResponse;
  }
}

export async function getSansadDarpanWeeklyBrief(id: string) {
  return request<SansadDarpanWeeklyBriefDetail>(`/api/sansaddarpan/weekly-briefs/${id}`);
}

// --- Legacy weekly briefs (welfare-profile-derived) ---

export async function getWeeklyBriefs() {
  try {
    return await request<WeeklyBriefListResponse>("/api/briefs");
  } catch {
    return getWeeklyBriefFallbackList();
  }
}

export async function getWeeklyBrief(slug: string) {
  try {
    return await request<WeeklyBriefDetail>(`/api/briefs/${slug}`);
  } catch {
    const fallback = getWeeklyBriefFallback(slug);
    if (!fallback) {
      throw new Error("Weekly brief not found");
    }
    return mapFallbackWeeklyBrief(fallback);
  }
}
