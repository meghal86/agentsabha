"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { DebugAgentStatus } from "@/lib/api";
import { buildLiveRoadmap, agentRoadmap } from "@/lib/agent-roadmap";
import { agentSpecs, phaseBuckets } from "@/lib/agent-system";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

function phaseClass(phase: "built" | "partial" | "deferred") {
  if (phase === "built") return "built";
  if (phase === "partial") return "partial";
  return "deferred";
}

async function fetchDebugAgents(): Promise<DebugAgentStatus[]> {
  const response = await fetch(`${API_BASE_URL}/api/debug/agents`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to fetch debug agents: ${response.status}`);
  const payload = (await response.json()) as { agents: DebugAgentStatus[] };
  return payload.agents;
}

export function AgentsStatusLive({ initialDebugAgents }: { initialDebugAgents: DebugAgentStatus[] }) {
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

  const roadmapByRuntime = useMemo(() => {
    const liveRoadmap = buildLiveRoadmap(
      agentRoadmap,
      debugAgents.map((agent) => ({
        agent_type: agent.agent_type,
        last_run: agent.last_run,
        recent_runs: agent.recent_runs,
        active_constituency_count: agent.active_constituencies.length,
      })),
    );
    return new Map(liveRoadmap.filter((agent) => agent.runtimeAgentType).map((agent) => [agent.runtimeAgentType, agent]));
  }, [debugAgents]);

  const debugByType = useMemo(() => new Map(debugAgents.map((entry) => [entry.agent_type, entry])), [debugAgents]);

  return (
    <>
      <div className="product-intro">
        <div>
          <p className="eyebrow">AGENT DEBUG CONSOLE</p>
          <h1 className="product-title">Which agents exist, and what are they doing now?</h1>
          <p className="hero-body">
            This is the live build-status surface. It shows actual runtime activity from the backend audit log and refreshes every 15 seconds.
          </p>
          <p className="frame-note">Last updated {new Date(lastUpdated).toLocaleTimeString()}</p>
        </div>
        <div className="product-intro-stats">
          <article className="summary-tile">
            <span className="summary-kicker">Formal roadmap</span>
            <strong>46 agents</strong>
            <p>Exact prompt-defined system from the current document set.</p>
          </article>
          <article className="summary-tile accent-tile">
            <span className="summary-kicker">Live now</span>
            <strong>{debugAgents.filter((agent) => agent.last_run).length} runtime agents</strong>
            <p>Agents with at least one recent audit-log entry.</p>
          </article>
        </div>
      </div>

      <div className="frame-panel full-width-panel">
        <div className="agent-roadmap-actions">
          <Link className="secondary-button" href="/agents-plan">
            Open 46-agent plan
          </Link>
          <Link className="secondary-button" href="/constituency">
            Back to product
          </Link>
        </div>
      </div>

      <div className="agents-debug-groups">
        {(["built", "partial", "deferred"] as const).map((phase) => (
          <section key={phase} className="frame-panel full-width-panel">
            <div className="section-heading compact-heading">
              <div>
                <p>{phaseBuckets[phase]}</p>
                <h2>{phase === "built" ? "Implemented now" : phase === "partial" ? "Visible but not complete" : "Explicitly not in Phase 1"}</h2>
              </div>
            </div>

            <div className="agents-debug-grid">
              {agentSpecs
                .filter((agent) => agent.phase === phase)
                .map((agent) => {
                  const debugEntry = debugByType.get(agent.slug);
                  const roadmapEntry = roadmapByRuntime.get(agent.slug);
                  return (
                    <article key={agent.slug} className={`agent-debug-card ${phaseClass(agent.phase)}`}>
                      <div className="agent-debug-head">
                        <div>
                          <span className="summary-kicker">{agent.layer}</span>
                          <h3>{agent.name}</h3>
                        </div>
                        <span className={`agent-phase-badge ${phaseClass(agent.phase)}`}>{phaseBuckets[agent.phase]}</span>
                      </div>
                      <p className="agent-debug-purpose">{agent.purpose}</p>
                      <p className="agent-debug-scope">{agent.scope}</p>
                      <div className="agent-debug-metrics">
                        <div>
                          <span>Completion</span>
                          <strong>{roadmapEntry?.completion ?? (agent.phase === "built" ? 50 : agent.phase === "partial" ? 20 : 0)}%</strong>
                        </div>
                        <div>
                          <span>Recent runs</span>
                          <strong>{debugEntry?.recent_runs ?? 0}</strong>
                        </div>
                        <div>
                          <span>Last run</span>
                          <strong>{debugEntry?.last_run ? new Date(debugEntry.last_run).toLocaleTimeString() : "Not yet"}</strong>
                        </div>
                      </div>
                      <div className="agent-debug-status">
                        <span className="summary-kicker">Current action</span>
                        <p>{debugEntry?.last_action ?? "No runtime action recorded yet."}</p>
                      </div>
                      <div className="agent-debug-status">
                        <span className="summary-kicker">Outputs</span>
                        <ul>
                          {agent.outputs.map((output) => (
                            <li key={output}>{output}</li>
                          ))}
                        </ul>
                      </div>
                    </article>
                  );
                })}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
