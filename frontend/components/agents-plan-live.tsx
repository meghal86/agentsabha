"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { RoadmapRuntimeAgent } from "@/lib/api";
import { agentRoadmap, buildLiveRoadmap, buildRoadmapSummary, getRoadmapDetails, groupRoadmapByLayer } from "@/lib/agent-roadmap";
import { forumDefinitions } from "@/lib/forum-system";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

function statusTone(status: "built" | "partial" | "planned") {
  if (status === "built") return "built";
  if (status === "partial") return "partial";
  return "deferred";
}

function healthLabel(health: "healthy" | "attention" | "idle" | "planned") {
  if (health === "healthy") return "Live";
  if (health === "attention") return "Needs attention";
  if (health === "idle") return "Code only";
  return "Planned";
}

async function fetchRoadmapRuntime(): Promise<{ generated_at: string; agents: RoadmapRuntimeAgent[] }> {
  const response = await fetch(`${API_BASE_URL}/api/roadmap/runtime`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to fetch roadmap runtime: ${response.status}`);
  return (await response.json()) as { generated_at: string; agents: RoadmapRuntimeAgent[] };
}

function progressWidth(value: number) {
  return `${Math.max(value, value > 0 ? 4 : 0)}%`;
}

export function AgentsPlanLive({
  initialRuntimeAgents,
  initialBackendAvailable,
  initialGeneratedAt,
}: {
  initialRuntimeAgents: RoadmapRuntimeAgent[];
  initialBackendAvailable: boolean;
  initialGeneratedAt: string | null;
}) {
  const contextSystems = [
    "Constituency data injection",
    "Cluster state and velocity memory",
    "Source retrieval and citation context",
    "Parliamentary action history",
    "Audit log and runtime proof",
  ];
  const [runtimeAgents, setRuntimeAgents] = useState(initialRuntimeAgents);
  const [backendAvailable, setBackendAvailable] = useState(initialBackendAvailable);
  const [lastSuccessfulUpdate, setLastSuccessfulUpdate] = useState<string | null>(initialGeneratedAt);
  const [lastAttemptAt, setLastAttemptAt] = useState<string>(new Date().toISOString());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let cancelled = false;

    const refresh = async () => {
      setLastAttemptAt(new Date().toISOString());
      try {
        const payload = await fetchRoadmapRuntime();
        if (!cancelled) {
          setRuntimeAgents(payload.agents);
          setBackendAvailable(true);
          setLastSuccessfulUpdate(payload.generated_at);
        }
      } catch {
        if (!cancelled) {
          setBackendAvailable(false);
        }
      }
    };

    const interval = window.setInterval(refresh, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const liveRoadmap = useMemo(() => buildLiveRoadmap(agentRoadmap, runtimeAgents), [runtimeAgents]);
  const summary = useMemo(() => buildRoadmapSummary(liveRoadmap), [liveRoadmap]);
  const groupedRoadmap = useMemo(() => groupRoadmapByLayer(liveRoadmap), [liveRoadmap]);
  const focusAgents = useMemo(
    () =>
      liveRoadmap
        .filter((agent) => agent.status === "built")
        .sort((left, right) => left.completion - right.completion)
        .slice(0, 3),
    [liveRoadmap],
  );

  const formatTimestamp = (value: string | null, fallback: string) => {
    if (!value) return fallback;
    if (!mounted) return "Updating…";
    return new Date(value).toLocaleTimeString();
  };

  return (
    <>
      <div className="product-intro">
        <div>
          <p className="eyebrow">{summary.total} ROLE AGENT BUILD PLAN</p>
          <h1 className="product-title">Layer 1 role agents, Layer 2 forum orchestrators, Layer 3 live context</h1>
          <p className="hero-body">
            This board combines the formal 46-agent roadmap with the forum-native orchestration model. It is meant to be an execution document, not just a checklist.
          </p>
          <p className="frame-note">
            Refresh every 15 seconds · Last successful update{" "}
            {formatTimestamp(lastSuccessfulUpdate, "never")} · Last poll attempt {formatTimestamp(lastAttemptAt, "never")}
          </p>
        </div>
        <div className="product-intro-stats product-intro-stats-grid">
          <article className="summary-tile">
            <span className="summary-kicker">Total planned</span>
            <strong>{summary.total} role agents</strong>
            <p>Exact formal agent count from the 46-prompts document.</p>
          </article>
          <article className="summary-tile accent-tile">
            <span className="summary-kicker">Active delivery completion</span>
            <strong>{summary.activeCompletion}%</strong>
            <p>Average completion across built and partial agents only.</p>
          </article>
        </div>
      </div>

      {!backendAvailable ? (
        <div className="backend-warning-banner">
          Backend offline or unreachable. Showing static roadmap data only. Runtime health, runs, and constituency counts may be stale.
        </div>
      ) : null}

      <div className="dashboard-summary-grid roadmap-summary-grid">
        <article className="summary-tile">
          <span className="summary-kicker">Built now</span>
          <strong>{summary.built}</strong>
          <p>Core agents with working code paths in this repo.</p>
        </article>
        <article className="summary-tile">
          <span className="summary-kicker">Partial</span>
          <strong>{summary.partial}</strong>
          <p>Started, but still missing key integrations or production behavior.</p>
        </article>
        <article className="summary-tile">
          <span className="summary-kicker">Live recently</span>
          <strong>{summary.live}</strong>
          <p>Agents with runtime activity recorded in the audit log.</p>
        </article>
        <article className="summary-tile accent-tile">
          <span className="summary-kicker">Roadmap coverage</span>
          <strong>{summary.roadmapCoverage}%</strong>
          <p>Average coverage across the full 46-agent roadmap.</p>
        </article>
      </div>

      <div className="frame-panel full-width-panel">
        <div className="agent-roadmap-meter">
          <div className="agent-roadmap-bar">
            <span style={{ width: progressWidth(summary.activeCompletion) }}></span>
          </div>
          <strong>{summary.activeCompletion}% active delivery completion</strong>
        </div>
        <div className="agent-roadmap-actions">
          <Link className="secondary-button" href="/agents">
            Current build status
          </Link>
          <Link className="secondary-button" href="/constituency">
            Back to product
          </Link>
        </div>
      </div>

      <section className="frame-panel full-width-panel">
        <div className="section-heading compact-heading">
          <div>
            <p>LAYER 2</p>
            <h2>Forum orchestrators</h2>
          </div>
        </div>
        <div className="forum-grid compact-forum-grid">
          {forumDefinitions.map((forum) => (
            <article key={forum.slug} className="forum-surface-card compact-forum-card">
              <div className="forum-surface-header" style={{ borderTopColor: forum.color }}>
                <div>
                  <span className="summary-kicker">{forum.hindiName}</span>
                  <h3>{forum.orchestratorTitle}</h3>
                </div>
                <span className="stamp-badge neutral">{forum.name}</span>
              </div>
              <p className="frame-note">{forum.orchestratorIdentity}</p>
              <div className="forum-mini-grid">
                <section>
                  <span className="summary-kicker">Procedure</span>
                  <ul>
                    {forum.rules.slice(0, 2).map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                </section>
                <section>
                  <span className="summary-kicker">Cannot do</span>
                  <ul>
                    {forum.cannot.slice(0, 2).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="frame-panel full-width-panel">
        <div className="section-heading compact-heading">
          <div>
            <p>EXECUTION GUIDE</p>
            <h2>How to use this board to finish the project end to end</h2>
          </div>
        </div>
        <div className="dashboard-summary-grid">
          <article className="summary-tile">
            <span className="summary-kicker">1. Make it real</span>
            <p>Every built agent needs a live runtime path, stored outputs, tests, and visible audit logs. Code without runtime proof should not be treated as complete.</p>
          </article>
          <article className="summary-tile">
            <span className="summary-kicker">2. Close the loop</span>
            <p>Phase 1 is only real when citizen intake, clustering, parliamentary drafting, MP review, and citizen notification all work together on live data.</p>
          </article>
          <article className="summary-tile accent-tile">
            <span className="summary-kicker">3. Build in order</span>
            <p>Finish the weakest Layer A built agents first. Planned future layers should not displace Phase 1 completion work.</p>
          </article>
        </div>
        <div className="agent-next-steps">
          {focusAgents.map((agent) => {
            const details = getRoadmapDetails(agent);
            return (
              <article key={agent.id} className="agent-next-step-card">
                <span className="summary-kicker">Immediate focus</span>
                <h3>{agent.name}</h3>
                <p>{details.nextStep}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="frame-panel full-width-panel">
        <div className="section-heading compact-heading">
          <div>
            <p>LAYER 1</p>
            <h2>Role agents</h2>
          </div>
        </div>
      </section>

      {groupedRoadmap.map((group) => (
        <section key={group.layer} className="frame-panel full-width-panel">
          <div className="section-heading compact-heading">
            <div>
              <p>LAYER GROUP</p>
              <h2>{group.layer}</h2>
            </div>
          </div>

          <div className="agents-debug-grid roadmap-grid">
            {group.agents.map((agent) => {
              const details = getRoadmapDetails(agent);
              return (
                <details key={agent.id} className={`agent-debug-card ${statusTone(agent.status)} roadmap-detail-card`}>
                  <summary className="roadmap-detail-summary">
                    <div className="agent-debug-head">
                      <div>
                        <span className="summary-kicker">#{String(agent.number).padStart(2, "0")}</span>
                        <h3>{agent.name}</h3>
                      </div>
                      <span className={`agent-phase-badge ${statusTone(agent.status)}`}>
                        {agent.status === "built" ? "Built" : agent.status === "partial" ? "Partial" : "Planned"}
                      </span>
                    </div>
                    <p className="agent-debug-purpose">{agent.note}</p>
                    <div className="agent-debug-summaryline">
                      <span>{agent.completion}% complete</span>
                      <span>{healthLabel(agent.health)}</span>
                    </div>
                    <div className="agent-roadmap-bar small">
                      <span style={{ width: progressWidth(agent.completion) }}></span>
                    </div>
                  </summary>

                  <div className="roadmap-detail-body">
                    <div className="roadmap-detail-grid">
                      <section className="roadmap-detail-section">
                        <span className="summary-kicker">Completed</span>
                        <ul>
                          {details.completedWork.map((item, index) => (
                            <li key={`${agent.id}-completed-${index}`}>{item}</li>
                          ))}
                        </ul>
                      </section>
                      <section className="roadmap-detail-section">
                        <span className="summary-kicker">Left to build</span>
                        <ul>
                          {details.remainingWork.map((item, index) => (
                            <li key={`${agent.id}-remaining-${index}`}>{item}</li>
                          ))}
                        </ul>
                      </section>
                    </div>
                    <div className="roadmap-detail-grid">
                      <section className="roadmap-detail-section">
                        <span className="summary-kicker">Proof</span>
                        <ul>
                          {details.proofPoints.map((item, index) => (
                            <li key={`${agent.id}-proof-${index}`}>{item}</li>
                          ))}
                        </ul>
                      </section>
                      <section className="roadmap-detail-section">
                        <span className="summary-kicker">Runtime snapshot</span>
                        <p>
                          Last run: {agent.last_run ? (mounted ? new Date(agent.last_run).toLocaleString() : "Updating…") : "No runtime entry yet."}
                          <br />
                          Recent runs: {agent.recent_runs}
                          <br />
                          Active constituencies: {agent.active_constituency_count}
                        </p>
                      </section>
                    </div>
                    <div className="roadmap-detail-grid">
                      <section className="roadmap-detail-section">
                        <span className="summary-kicker">Next step</span>
                        <p>{details.nextStep}</p>
                      </section>
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        </section>
      ))}

      <section className="frame-panel full-width-panel">
        <div className="section-heading compact-heading">
          <div>
            <p>LAYER 3</p>
            <h2>Live context injection</h2>
          </div>
        </div>
        <div className="dashboard-summary-grid">
          {contextSystems.map((item) => (
            <article key={item} className="summary-tile">
              <span className="summary-kicker">Context system</span>
              <strong>{item}</strong>
              <p>These systems feed fresh procedural context into every session without changing the underlying identity or forum authority.</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
