import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSansadDarpanRuleDeviations } from "@/lib/api";

function getDeviationStatus(status: string) {
  if (status === "human-verified") {
    return { label: "Published", tone: "published" };
  }
  if (status === "archived") {
    return { label: "Archived", tone: "archived" };
  }
  return { label: "Under Review", tone: "review" };
}

export default async function SansadDarpanRuleDeviationsPage() {
  const data = await getSansadDarpanRuleDeviations();
  const publishedCount = data.deviations.filter((item) => item.status === "human-verified").length;
  const underReviewCount = data.deviations.filter((item) => item.status !== "human-verified").length;
  const highestConfidence = data.deviations.length ? Math.round(Math.max(...data.deviations.map((item) => item.confidence)) * 100) : 0;
  const leadCase = [...data.deviations].sort((left, right) => right.confidence - left.confidence)[0];

  return (
    <div className="page-shell product-shell" data-product="sansaddarpan">
      <SiteHeader active="sansaddarpan-rule-deviations" product="sansaddarpan" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame sansaddarpan-frame">
          <nav className="sansaddarpan-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">AgentSabha</Link>
            <span>/</span>
            <Link href="/sansaddarpan">SansadDarpan</Link>
            <span>/</span>
            <span aria-current="page">Rule Deviations</span>
          </nav>

          <section className="sansaddarpan-dashboard-header">
            <div>
              <p className="eyebrow">VERIFIED RULE DEVIATION TRACKER</p>
              <h1 className="product-title">No procedural flag goes public without human review</h1>
              <p className="hero-body">
                AI may retrieve and reason across rules, transcripts, and precedent. Publication requires a reviewer, rationale, and audit trail.
              </p>
              <p className="frame-note">
                Human review required: <strong>{data.human_review_required ? "Yes" : "No"}</strong>
              </p>
            </div>
          </section>

          <section className="sansaddarpan-monitor-shell">
            <div className="sansaddarpan-monitor-topbar">
              <div className="sansaddarpan-monitor-identity">
                <div className="sansaddarpan-monitor-mark">RD</div>
                <div>
                  <div className="sansaddarpan-monitor-title">Case registry</div>
                  <div className="sansaddarpan-monitor-sub">Rules, transcripts, precedent, and human publication review in one visible procedural layer</div>
                </div>
              </div>
              <span className="sansaddarpan-monitor-pill">Highest-risk public module</span>
              <div className="sansaddarpan-live-wrap">
                <span className="sansaddarpan-live-dot" aria-hidden="true"></span>
                <span className="sansaddarpan-live-label">Reviewer-gated</span>
              </div>
            </div>

            <div className="sansaddarpan-monitor-metrics">
              <article className="sansaddarpan-monitor-metric">
                <strong>{publishedCount}</strong>
                <span>Published cases cleared for the public registry</span>
              </article>
              <article className="sansaddarpan-monitor-metric">
                <strong>{underReviewCount}</strong>
                <span>Cases still under review or not yet public-final</span>
              </article>
              <article className="sansaddarpan-monitor-metric">
                <strong>{highestConfidence}%</strong>
                <span>Highest confidence in the current live registry</span>
              </article>
              <article className="sansaddarpan-monitor-metric">
                <strong>{data.deviations.length}</strong>
                <span>Total visible case files in the current register</span>
              </article>
              <article className="sansaddarpan-monitor-metric">
                <strong>{data.human_review_required ? "Yes" : "No"}</strong>
                <span>Human review required before publication</span>
              </article>
            </div>

            <div className="sansaddarpan-monitor-body">
              <div className="sansaddarpan-monitor-main">
                <div className="sansaddarpan-sec-label">Case ladder</div>
                {data.deviations.map((item, index) => (
                  <Link key={item.id} href={`/sansaddarpan/rule-deviations/${item.id}`} className="sansaddarpan-tl-item">
                    <div className="sansaddarpan-tl-label">{index === 0 ? "Lead" : "Case"}</div>
                    <div className="sansaddarpan-tl-dot-col">
                      <span className={`sansaddarpan-tl-dot ${item.status === "human-verified" ? "alert" : "warning"}`}></span>
                      {index < data.deviations.length - 1 ? <span className="sansaddarpan-tl-line"></span> : null}
                    </div>
                    <div className="sansaddarpan-tl-card">
                      <div className="sansaddarpan-tl-title">{item.title}</div>
                      <div className="sansaddarpan-tl-body">{item.summary}</div>
                      <div className="sansaddarpan-tl-tags">
                        <span className="sansaddarpan-tag">{item.rule_reference}</span>
                        <span className="sansaddarpan-tag">{getDeviationStatus(item.status).label}</span>
                        <span className="sansaddarpan-tag">{Math.round(item.confidence * 100)}% confidence</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <aside className="sansaddarpan-monitor-side">
                <div className="sansaddarpan-sec-label">Review protocol</div>
                <div className="sansaddarpan-flag-list">
                  <div className="sansaddarpan-flag-item">
                    <span className="sansaddarpan-flag-icon published"></span>
                    <div>
                      <div className="sansaddarpan-flag-title">Published means reviewer-cleared</div>
                      <div className="sansaddarpan-flag-body">A case is only public after the rationale, evidence chain, and publication threshold have all been reviewed by a human.</div>
                    </div>
                  </div>
                  <div className="sansaddarpan-flag-item">
                    <span className="sansaddarpan-flag-icon review"></span>
                    <div>
                      <div className="sansaddarpan-flag-title">Under review means not ready for public certainty</div>
                      <div className="sansaddarpan-flag-body">AI retrieval and reasoning can propose a flag, but it does not get to publish one on its own.</div>
                    </div>
                  </div>
                  {leadCase ? (
                    <div className="sansaddarpan-flag-item">
                      <span className={`sansaddarpan-flag-icon ${getDeviationStatus(leadCase.status).tone}`}></span>
                      <div>
                        <div className="sansaddarpan-flag-title">{leadCase.title}</div>
                        <div className="sansaddarpan-flag-body">{leadCase.summary}</div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </aside>
            </div>
          </section>

          <section className="frame-panel full-width-panel sansaddarpan-surface">
            <div className="section-heading compact-heading">
              <div>
                <p>Open case files</p>
                <h2>Public registry of procedural deviation reviews</h2>
              </div>
            </div>
            <div className="sansaddarpan-module-grid">
              {data.deviations.map((item) => (
                <article key={item.id} className="summary-tile sansaddarpan-card sansaddarpan-case-card">
                  <div className="sansaddarpan-case-header">
                    <span className="summary-kicker">{item.session_label}</span>
                    <span className={`sansaddarpan-status-pill ${getDeviationStatus(item.status).tone}`}>
                      {getDeviationStatus(item.status).label}
                    </span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <div className="sansaddarpan-metric-row">
                    <strong>
                      <span className="sansaddarpan-nowrap">{Math.round(item.confidence * 100)}%</span>
                    </strong>
                    <span>{item.rule_reference}</span>
                  </div>
                  <Link className="sansaddarpan-inline-action forum-open-link" href={`/sansaddarpan/rule-deviations/${item.id}`}>
                    Open case →
                  </Link>
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>

      <SiteFooter brand="SansadDarpan" note="Verified procedural accountability with human sign-off" endLabel="Human-reviewed case registry" />
    </div>
  );
}
