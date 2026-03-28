import { AgentsStatusLive } from "@/components/agents-status-live";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDebugAgents } from "@/lib/api";
import { forumDefinitions } from "@/lib/forum-system";
import { buildSansadDarpanSummary, sansaddarpanRoadmap } from "@/lib/sansaddarpan-roadmap";

export default async function AgentsDebugPage() {
  const debug = await getDebugAgents().catch(() => ({ agents: [] }));
  const sansaddarpanSummary = buildSansadDarpanSummary(sansaddarpanRoadmap);

  return (
    <div className="page-shell">
      <SiteHeader active="agents" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame bharat-ornament-frame">
          <div className="product-intro">
            <div>
              <p className="eyebrow">AGENT SYSTEM</p>
              <h1 className="product-title">Forum orchestrators and role agents</h1>
              <p className="hero-body">
                AgentSabha is no longer one generic agent surface. Forum orchestrators govern procedure. Role agents carry the work, voice, and outputs within those forums.
              </p>
            </div>
          </div>

          <section className="frame-panel full-width-panel">
            <div className="section-heading compact-heading">
              <div>
                <p>LAYER 3</p>
                <h2>SansadDarpan public evidence layer</h2>
              </div>
            </div>
            <div className="dashboard-summary-grid">
              <article className="summary-tile">
                <span className="summary-kicker">Workstreams</span>
                <strong>{sansaddarpanSummary.total}</strong>
                <p>Shell, scorecards, welfare, rule deviations, methodology, and data foundation.</p>
              </article>
              <article className="summary-tile">
                <span className="summary-kicker">Built now</span>
                <strong>{sansaddarpanSummary.built}</strong>
                <p>Workstreams that already have user-facing routes and working code paths.</p>
              </article>
              <article className="summary-tile">
                <span className="summary-kicker">In progress</span>
                <strong>{sansaddarpanSummary.partial}</strong>
                <p>Modules that work in part but still need broader data coverage or pipeline hardening.</p>
              </article>
              <article className="summary-tile accent-tile">
                <span className="summary-kicker">Coverage</span>
                <strong>{sansaddarpanSummary.completion}%</strong>
                <p>Average completion across the current SansadDarpan product workstreams.</p>
              </article>
            </div>
            <div className="agents-debug-grid">
              {sansaddarpanRoadmap.map((item) => (
                <article key={item.id} className={`agent-debug-card ${item.status === "planned" ? "deferred" : item.status}`}>
                  <div className="agent-debug-head">
                    <div>
                      <span className="summary-kicker">{item.category}</span>
                      <h3>{item.title}</h3>
                    </div>
                    <span className={`agent-phase-badge ${item.status === "planned" ? "deferred" : item.status}`}>
                      {item.status === "built" ? "Built" : item.status === "partial" ? "Partial" : "Planned"}
                    </span>
                  </div>
                  <p className="agent-debug-purpose">{item.note}</p>
                  <div className="agent-debug-summaryline">
                    <span>{item.completion}% complete</span>
                    <span>{item.completedWork.length} completed</span>
                    <span>{item.remainingWork.length} pending</span>
                  </div>
                  <div className="agent-roadmap-bar small">
                    <span style={{ width: `${Math.max(item.completion, item.completion > 0 ? 4 : 0)}%` }}></span>
                  </div>
                  <div className="agent-debug-status">
                    <span className="summary-kicker">Completed now</span>
                    <p>{item.completedWork[0]}</p>
                  </div>
                  <div className="agent-debug-status">
                    <span className="summary-kicker">Pending</span>
                    <p>{item.remainingWork[0]}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

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
                      <span className="summary-kicker">Controls</span>
                      <ul>
                        {forum.powers.slice(0, 2).map((item) => (
                          <li key={item}>{item}</li>
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

          <AgentsStatusLive initialDebugAgents={debug.agents} />
        </section>
      </main>

      <SiteFooter note="एजेंट सभा · Agent System = forum orchestrators + role agents + live runtime evidence" />
    </div>
  );
}
