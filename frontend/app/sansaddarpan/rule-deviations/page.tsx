import Link from "next/link";

import { SansadDarpanSubnav } from "@/components/sansaddarpan-subnav";
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

  return (
    <div className="page-shell product-shell" data-product="sansaddarpan">
      <SiteHeader active="sansaddarpan" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame sansaddarpan-frame">
          <nav className="sansaddarpan-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">AgentSabha</Link>
            <span>/</span>
            <Link href="/sansaddarpan">SansadDarpan</Link>
            <span>/</span>
            <span aria-current="page">Rule Deviations</span>
          </nav>

          <section className="sansaddarpan-masthead">
            <div className="sansaddarpan-masthead-copy">
              <p className="eyebrow">VERIFIED RULE DEVIATION TRACKER</p>
              <h1 className="product-title">No procedural flag goes public without human review</h1>
              <p className="hero-body">
                AI may retrieve and reason across rules, transcripts, and precedent. Publication requires a reviewer, rationale, and audit trail.
              </p>
              <p className="frame-note">
                Human review required: <strong>{data.human_review_required ? "Yes" : "No"}</strong>
              </p>
            </div>
            <aside className="sansaddarpan-masthead-panel">
              <span className="summary-kicker">Review principle</span>
              <strong>Human sign-off mandatory</strong>
              <p>This is the highest-risk module in SansadDarpan. The UI should feel like a case registry, not a feed.</p>
            </aside>
          </section>

          <SansadDarpanSubnav active="rule-deviations" />

          <section className="sansaddarpan-stat-strip">
            <article>
              <span>Published cases</span>
              <strong>{data.deviations.filter((item) => item.status === "human-verified").length}</strong>
              <small>human-verified only</small>
            </article>
            <article>
              <span>Under review</span>
              <strong>{data.deviations.filter((item) => item.status !== "human-verified").length}</strong>
              <small>not yet public-final</small>
            </article>
            <article>
              <span>Highest confidence</span>
              <strong>{Math.round(Math.max(...data.deviations.map((item) => item.confidence)) * 100)}%</strong>
              <small>current seeded cases</small>
            </article>
          </section>

          <section className="frame-panel full-width-panel sansaddarpan-surface">
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
                    <strong>{Math.round(item.confidence * 100)}%</strong>
                    <span>{item.rule_reference}</span>
                  </div>
                  <Link className="secondary-button forum-open-link" href={`/sansaddarpan/rule-deviations/${item.id}`}>
                    Open case
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
