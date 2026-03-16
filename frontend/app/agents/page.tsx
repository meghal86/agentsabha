import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDebugAgents } from "@/lib/api";
import { agentSpecs, phaseBuckets } from "@/lib/agent-system";

function phaseClass(phase: "built" | "partial" | "deferred") {
  if (phase === "built") return "built";
  if (phase === "partial") return "partial";
  return "deferred";
}

export default async function AgentsDebugPage() {
  const debug = await getDebugAgents().catch(() => ({ agents: [] }));
  const debugByType = new Map(debug.agents.map((entry) => [entry.agent_type, entry]));

  return (
    <div className="page-shell">
      <SiteHeader active="agents" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame bharat-ornament-frame">
          <div className="product-intro">
            <div>
              <p className="eyebrow">AGENT DEBUG CONSOLE</p>
              <h1 className="product-title">Which agents exist, and what are they doing now?</h1>
              <p className="hero-body">
                This is the implementation/debug surface. It follows Master Prompt v3 strictly: Phase 1 shows only the core-loop agents as built, while later agents remain visible here as deferred architecture.
              </p>
            </div>
            <div className="product-intro-stats">
              <article className="summary-tile">
                <span className="summary-kicker">Master Prompt v3</span>
                <strong>47+ total agents</strong>
                <p>Across parliamentary, media, and intelligence layers.</p>
              </article>
              <article className="summary-tile accent-tile">
                <span className="summary-kicker">Built in this repo</span>
                <strong>{agentSpecs.filter((agent) => agent.phase === "built").length} agents</strong>
                <p>Phase 1 core loop agents currently implemented.</p>
              </article>
            </div>
          </div>

          <div className="frame-panel full-width-panel">
            <div className="agent-roadmap-actions">
              <Link className="secondary-button" href="/agents-plan">
                Open 47-agent plan
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
                              <span>Recent runs</span>
                              <strong>{debugEntry?.recent_runs ?? 0}</strong>
                            </div>
                            <div>
                              <span>Last run</span>
                              <strong>{debugEntry?.last_run ? new Date(debugEntry.last_run).toLocaleString() : "Not yet"}</strong>
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
        </section>
      </main>

      <SiteFooter note="एजेंट सभा · Debug view of implemented and deferred agents" />
    </div>
  );
}
