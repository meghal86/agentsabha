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

