"use client";

import { useEffect, useState } from "react";

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function GenerationSourceLogger({
  source,
  constituency,
  week,
  year,
  createdAt,
}: {
  source: string;
  constituency: string;
  week: number;
  year: number;
  createdAt: string;
}) {
  const [ago, setAgo] = useState(() => timeAgo(createdAt));

  useEffect(() => {
    // Console log for developers
    const isLive = source.startsWith("groq");
    const label = isLive ? "🟢 LIVE AI" : "🟡 FALLBACK";
    console.log(
      `%c[AgentSabha] ${label} — source: ${source} | ${constituency} Week ${week}/${year} | generated: ${createdAt}`,
      isLive
        ? "color: #22c55e; font-weight: bold; font-size: 13px"
        : "color: #eab308; font-weight: bold; font-size: 13px"
    );

    // Refresh relative time every 30s
    const timer = setInterval(() => setAgo(timeAgo(createdAt)), 30_000);
    return () => clearInterval(timer);
  }, [source, constituency, week, year, createdAt]);

  const isLive = source.startsWith("groq");

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.5rem 1rem",
        fontSize: "0.8rem",
        fontFamily: "var(--font-sans, system-ui)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: isLive
          ? "linear-gradient(90deg, rgba(34,197,94,0.08) 0%, transparent 100%)"
          : "linear-gradient(90deg, rgba(234,179,8,0.08) 0%, transparent 100%)",
        color: "rgba(255,255,255,0.7)",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          fontWeight: 600,
          color: isLive ? "#22c55e" : "#eab308",
        }}
      >
        <span style={{ fontSize: "0.6rem" }}>{isLive ? "●" : "●"}</span>
        {isLive ? "LIVE AI" : "FALLBACK"}
      </span>
      <span style={{ opacity: 0.5 }}>|</span>
      <span>
        {isLive ? source.replace("groq-", "Groq ") : "Template data"}
      </span>
      <span style={{ opacity: 0.5 }}>|</span>
      <span>
        Generated {ago}
      </span>
      <span style={{ opacity: 0.5 }}>|</span>
      <span style={{ opacity: 0.6 }}>
        {new Date(createdAt).toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}
      </span>
    </div>
  );
}
