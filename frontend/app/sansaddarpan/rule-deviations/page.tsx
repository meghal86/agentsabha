import Link from "next/link";

import { SansadDarpanSubnav } from "@/components/sansaddarpan-subnav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSansadDarpanRuleDeviations } from "@/lib/api";

export default async function SansadDarpanRuleDeviationsPage() {
  const data = await getSansadDarpanRuleDeviations();

  return (
    <div className="page-shell product-shell" data-product="sansaddarpan">
      <SiteHeader active="sansaddarpan" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame sansaddarpan-frame">
          <div className="product-intro compact-intro">
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
          </div>

          <SansadDarpanSubnav active="rule-deviations" />

          <section className="frame-panel full-width-panel sansaddarpan-surface">
            <div className="dashboard-summary-grid">
              {data.deviations.map((item) => (
                <article key={item.id} className="summary-tile sansaddarpan-card">
                  <span className="summary-kicker">{item.session_label}</span>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <div className="sansaddarpan-metric-row">
                    <strong>{Math.round(item.confidence * 100)}%</strong>
                    <span>{item.rule_reference}</span>
                  </div>
                  <span className={`stamp-badge ${item.status === "human-verified" ? "resolved" : "water"}`}>{item.status}</span>
                  <Link className="secondary-button forum-open-link" href={`/sansaddarpan/rule-deviations/${item.id}`}>
                    Open case
                  </Link>
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>

      <SiteFooter note="SansadDarpan · Verified procedural accountability with human sign-off" />
    </div>
  );
}
