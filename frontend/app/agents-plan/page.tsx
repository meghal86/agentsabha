import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { agentRoadmap, roadmapSummary } from "@/lib/agent-roadmap";

function statusTone(status: "built" | "partial" | "planned") {
  if (status === "built") return "built";
  if (status === "partial") return "partial";
  return "deferred";
}

export default function AgentsPlanPage() {
  return (
    <div className="page-shell">
      <SiteHeader active="agents" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame bharat-ornament-frame">
          <div className="product-intro">
            <div>
              <p className="eyebrow">47 AGENT BUILD PLAN</p>
              <h1 className="product-title">What is planned, what is built, and what is still missing</h1>
              <p className="hero-body">
                This page separates the long-term 47-agent roadmap from the live product screens. It is based on Master Prompt v3 plus the attached research, galaxy, and media engine files.
              </p>
            </div>
            <div className="product-intro-stats">
              <article className="summary-tile">
                <span className="summary-kicker">Total planned</span>
                <strong>{roadmapSummary.total} agents</strong>
                <p>Curated roadmap count for the full AgentSabha system.</p>
              </article>
              <article className="summary-tile accent-tile">
                <span className="summary-kicker">Overall completion</span>
                <strong>{roadmapSummary.overallCompletion}%</strong>
                <p>Repo-level delivery estimate across all planned agents.</p>
              </article>
            </div>
          </div>

          <div className="dashboard-summary-grid">
            <article className="summary-tile">
              <span className="summary-kicker">Built now</span>
              <strong>{roadmapSummary.built}</strong>
              <p>Core agents that have working code paths in this repo.</p>
            </article>
            <article className="summary-tile">
              <span className="summary-kicker">Partial</span>
              <strong>{roadmapSummary.partial}</strong>
              <p>Started, but still missing key integrations or production behavior.</p>
            </article>
            <article className="summary-tile accent-tile">
              <span className="summary-kicker">Not started</span>
              <strong>{roadmapSummary.planned}</strong>
              <p>Still roadmap only, not yet implemented in runtime code.</p>
            </article>
          </div>

          <div className="frame-panel full-width-panel">
            <div className="agent-roadmap-bar">
              <span style={{ width: `${roadmapSummary.overallCompletion}%` }}></span>
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
                <p>ROADMAP REGISTER</p>
                <h2>47 planned agents</h2>
              </div>
            </div>

            <div className="agents-debug-grid roadmap-grid">
              {agentRoadmap.map((agent, index) => (
                <article key={agent.id} className={`agent-debug-card ${statusTone(agent.status)}`}>
                  <div className="agent-debug-head">
                    <div>
                      <span className="summary-kicker">
                        #{String(index + 1).padStart(2, "0")} · {agent.layer}
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
                      <span>Source</span>
                      <strong>{agent.source}</strong>
                    </div>
                  </div>
                  <div className="agent-roadmap-bar small">
                    <span style={{ width: `${agent.completion}%` }}></span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>

      <SiteFooter note="एजेंट सभा · 47-agent roadmap separated from the live product surface" />
    </div>
  );
}
