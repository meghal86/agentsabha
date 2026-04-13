"use client";

import { useEffect } from "react";

export function GenerationSourceLogger({
  source,
  constituency,
  week,
  year,
}: {
  source: string;
  constituency: string;
  week: number;
  year: number;
}) {
  useEffect(() => {
    const isLive = source.startsWith("groq");
    const label = isLive ? "🟢 LIVE AI" : "🟡 FALLBACK";
    console.log(
      `%c[AgentSabha] ${label} — source: ${source} | ${constituency} Week ${week}/${year}`,
      isLive
        ? "color: #22c55e; font-weight: bold; font-size: 13px"
        : "color: #eab308; font-weight: bold; font-size: 13px"
    );
  }, [source, constituency, week, year]);

  return null;
}
