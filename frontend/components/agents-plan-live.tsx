"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { DebugAgentStatus } from "@/lib/api";
import { agentRoadmap, buildLiveRoadmap, buildRoadmapSummary, getRoadmapDetails } from "@/lib/agent-roadmap";

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

async function fetchDebugAgents(): Promise<DebugAgentStatus[]> {
  const response = await fetch(`${API_BASE_URL}/api/debug/agents`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to fetch debug agents: ${response.status}`);
  const payload = (await response.json()) as { agents: DebugAgentStatus[] };
  return payload.agents;
}

export function AgentsPlanLive({ initialDebugAgents }: { initialDebugAgents: DebugAgentStatus[] }) {
  const [debugAgents, setDebugAgents] = useState(initialDebugAgents);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      try {
        const agents = await fetchDebugAgents();
        if (!cancelled) {
          setDebugAgents(agents);
          setLastUpdated(new Date().toISOString());
        }
      } catch {
        // Keep last successful snapshot on screen.
      }
    };

    const interval = window.setInterval(refresh, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const liveRoadmap = useMemo(() => buildLiveRoadmap(agentRoadmap, debugAgents), [debugAgents]);
  const summary = useMemo(() => buildRoadmapSummary(liveRoadmap), [liveRoadmap]);
  const focusAgents = useMemo(
    () =>
      liveRoadmap
        .filter((agent) => agent.status !== "planned")
        .sort((left, right) => left.completion - right.completion)
        .slice(0, 3),
    [liveRoadmap],
  );

  return (
    <>
      <div className="product-intro">
        <div>
          <p className="eyebrow">46 AGENT BUILD PLAN</p>
          <h1 className="product-title">What is planned, what is built, and what is live right now</h1>
          <p className="hero-body">
            This board now combines the formal 46-agent roadmap with live runtime signals from the backend. Percentages are computed from implementation state plus recent runs, not frozen design-time numbers.
          </p>
          <p className="frame-note">Live refresh every 15 seconds · Last updated {new Date(lastUpdated).toLocaleTimeString()}</p>
        </div>
        <div className="product-intro-stats">
          <article className="summary-tile">
            <span className="summary-kicker">Total planned</span>
            <strong>{summary.total} agents</strong>
            <p>Exact formal agent count from the 46-prompts document.</p>
          </article>
          <article className="summary-tile accent-tile">
            <span className="summary-kicker">Overall completion</span>
            <strong>{summary.overallCompletion}%</strong>
            <p>Computed from live runtime plus implementation maturity.</p>
          </article>
        </div>
      </div>

      <div className="dashboard-summary-grid">
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
          <p>Agents with recent runtime activity in the audit log.</p>
        </article>
        <article className="summary-tile accent-tile">
          <span className="summary-kicker">Not started</span>
          <strong>{summary.planned}</strong>
          <p>Still roadmap only, not yet implemented in runtime code.</p>
        </article>
      </div>

      <div className="frame-panel full-width-panel">
        <div className="agent-roadmap-bar">
          <span style={{ width: `${summary.overallCompletion}%` }}></span>
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
            <p>Finish the weakest active agents first. The next delivery focus should stay on the lowest-completion built or partial agents, not planned future layers.</p>
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
            <p>ROADMAP REGISTER</p>
            <h2>46 planned agents</h2>
          </div>
        </div>

        <div className="agents-debug-grid roadmap-grid">
          {liveRoadmap.map((agent) => (
            <details key={agent.id} className={`agent-debug-card ${statusTone(agent.status)} roadmap-detail-card`}>
              <summary className="roadmap-detail-summary">
                <div className="agent-debug-head">
                  <div>
                    <span className="summary-kicker">
                      #{String(agent.number).padStart(2, "0")} · {agent.layer}
                    </span>
                    <h3>{agent.name}</h3>
                  </div>
                  <span className={`agent-phase-badge ${statusTone(agent.status)}`}>
                    {agent.status === "built" ? "Built" : agent.status === "partial" ? "Partial" : "Planned"}
                  </span>
                </div>
                <p className="agent-debug-purpose">{agent.note}</p>
                <div className="agent-debug-metrics">
                  <div>
                    <span>Completion</span>
                    <strong>{agent.completion}%</strong>
                  </div>
                  <div>
                    <span>Runtime</span>
                    <strong>{healthLabel(agent.health)}</strong>
                  </div>
                  <div>
                    <span>Recent runs</span>
                    <strong>{agent.recent_runs}</strong>
                  </div>
                  <div>
                    <span>Constituencies</span>
                    <strong>{agent.active_constituency_count}</strong>
                  </div>
                </div>
                <div className="agent-debug-status">
                  <span className="summary-kicker">Last run</span>
                  <p>{agent.last_run ? new Date(agent.last_run).toLocaleString() : "No runtime entry yet."}</p>
                </div>
                <div className="agent-roadmap-bar small">
                  <span style={{ width: `${agent.completion}%` }}></span>
                </div>
              </summary>

              {(() => {
                const details = getRoadmapDetails(agent);
                return (
                  <div className="roadmap-detail-body">
                    <div className="roadmap-detail-grid">
                      <section className="roadmap-detail-section">
                        <span className="summary-kicker">Completed</span>
                        <ul>
                          {details.completedWork.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </section>
                      <section className="roadmap-detail-section">
                        <span className="summary-kicker">Left to build</span>
                        <ul>
                          {details.remainingWork.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </section>
                    </div>
                    <div className="roadmap-detail-grid">
                      <section className="roadmap-detail-section">
                        <span className="summary-kicker">Proof</span>
                        <ul>
                          {details.proofPoints.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </section>
                      <section className="roadmap-detail-section">
                        <span className="summary-kicker">Next step</span>
                        <p>{details.nextStep}</p>
                      </section>
                    </div>
                  </div>
                );
              })()}
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
