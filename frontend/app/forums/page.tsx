import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { forumDefinitions } from "@/lib/forum-system";

export default function ForumsPage() {
  return (
    <div className="page-shell">
      <SiteHeader active="forums" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame bharat-ornament-frame">
          <div className="product-intro">
            <div>
              <p className="eyebrow">FORUM-NATIVE ARCHITECTURE</p>
              <h1 className="product-title">Every Indian forum produces its own rightful orchestrator</h1>
              <p className="hero-body">
                AgentSabha no longer behaves like one generic pipeline. A Lok Sabha session is governed by the Speaker, a Jan Sunvai by a Sarpanch, a committee by its Chairperson, and the media engine by an editor.
              </p>
              <p className="frame-note">
                The orchestrator controls procedure, queue, rules, output format, and veto. It does not control the substance of what any participant says.
              </p>
            </div>
            <div className="product-intro-stats">
              <article className="summary-tile">
                <span className="summary-kicker">Forums introduced</span>
                <strong>{forumDefinitions.length}</strong>
                <p>Each forum is procedural, native, and Indian in its authority model.</p>
              </article>
              <article className="summary-tile accent-tile">
                <span className="summary-kicker">UX shift</span>
                <strong>Trigger → forum → output</strong>
                <p>Users should see where an issue is headed, who governs that forum, and what that forum can produce.</p>
              </article>
            </div>
          </div>

          <section className="frame-panel full-width-panel">
            <div className="section-heading compact-heading">
              <div>
                <p>Active procedural rooms</p>
                <h2>Forums of AgentSabha</h2>
              </div>
            </div>
            <div className="forum-grid">
              {forumDefinitions.map((forum) => (
                <article key={forum.slug} className="forum-surface-card">
                  <div className="forum-surface-header" style={{ borderTopColor: forum.color }}>
                    <div>
                      <span className="summary-kicker">{forum.hindiName}</span>
                      <h3>{forum.name}</h3>
                    </div>
                    <span className="stamp-badge neutral">Orchestrator</span>
                  </div>
                  <div className="forum-orchestrator-block" style={{ background: `${forum.color}10`, borderColor: `${forum.color}44` }}>
                    <span className="summary-kicker">Native authority</span>
                    <strong>{forum.orchestratorTitle}</strong>
                    <p>{forum.orchestratorIdentity}</p>
                  </div>
                  <div className="forum-mini-grid">
                    <section>
                      <span className="summary-kicker">Roles</span>
                      <ul>
                        {forum.roles.slice(0, 4).map((role) => (
                          <li key={role}>{role}</li>
                        ))}
                      </ul>
                    </section>
                    <section>
                      <span className="summary-kicker">Outputs</span>
                      <ul>
                        {forum.outputs.slice(0, 4).map((output) => (
                          <li key={output}>{output}</li>
                        ))}
                      </ul>
                    </section>
                  </div>
                  <div className="forum-rules-strip">
                    {forum.rules.slice(0, 2).map((rule) => (
                      <span key={rule}>{rule}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="frame-panel full-width-panel">
            <div className="section-heading compact-heading">
              <div>
                <p>What changes in the product</p>
                <h2>From constituency dashboard to procedural republic</h2>
              </div>
            </div>
            <div className="dashboard-summary-grid">
              <article className="summary-tile">
                <span className="summary-kicker">Old model</span>
                <strong>Issue → cluster → action</strong>
                <p>The user mostly saw a data pipeline, not the constitutional or civic room in which the issue was being handled.</p>
              </article>
              <article className="summary-tile accent-tile">
                <span className="summary-kicker">New model</span>
                <strong>Trigger → forum → output</strong>
                <p>The product now explains why one issue becomes a parliamentary question, another a Jan Sunvai item, and another an editorial story.</p>
              </article>
              <article className="summary-tile">
                <span className="summary-kicker">User expectation</span>
                <strong>Show who governs the room</strong>
                <p>Every session needs a visible orchestrator, visible rules, and a visible procedural state.</p>
              </article>
            </div>
            <div className="agent-roadmap-actions">
              <Link className="secondary-button" href="/constituency">
                Open constituency records
              </Link>
              <Link className="secondary-button" href="/mps">
                Explore MP personalities
              </Link>
            </div>
          </section>
        </section>
      </main>

      <SiteFooter note="एजेंट सभा · Indian forums, native authority, visible procedure" />
    </div>
  );
}
