import { AgentsStatusLive } from "@/components/agents-status-live";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDebugAgents } from "@/lib/api";
import { forumDefinitions } from "@/lib/forum-system";

export default async function AgentsDebugPage() {
  const debug = await getDebugAgents().catch(() => ({ agents: [] }));

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
