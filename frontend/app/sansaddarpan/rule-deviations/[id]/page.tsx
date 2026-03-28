import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSansadDarpanRuleDeviation } from "@/lib/api";

export default async function SansadDarpanRuleDeviationPage({ params }: { params: { id: string } }) {
  let item;
  try {
    item = await getSansadDarpanRuleDeviation(params.id);
  } catch {
    notFound();
  }

  return (
    <div className="page-shell product-shell" data-product="sansaddarpan">
      <SiteHeader active="sansaddarpan-rule-deviations" product="sansaddarpan" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame sansaddarpan-frame">
          <div className="product-intro compact-intro">
            <div>
              <p className="eyebrow">RULE DEVIATION CASE FILE</p>
              <h1 className="product-title">{item.title}</h1>
              <p className="hero-body">
                {item.session_label} · {item.rule_reference}
              </p>
              <p className="frame-note">{item.summary}</p>
            </div>
          </div>
          <section className="frame-panel full-width-panel sansaddarpan-surface">
            <div className="dashboard-summary-grid">
              <article className="summary-tile sansaddarpan-tile">
                <span className="summary-kicker">Confidence</span>
                <strong>{Math.round(item.confidence * 100)}%</strong>
                <p>Confidence is shown publicly, but publication still requires human verification.</p>
              </article>
              <article className="summary-tile sansaddarpan-tile">
                <span className="summary-kicker">Status</span>
                <strong>{item.status}</strong>
                <p>Human review and rationale are part of the permanent audit trail.</p>
              </article>
            </div>
          </section>

          <section className="frame-panel full-width-panel sansaddarpan-surface">
            <div className="section-heading compact-heading">
              <div>
                <p>Deviation analysis</p>
                <h2>Reasoning and source trail</h2>
              </div>
            </div>
            <article className="summary-tile sansaddarpan-card">
              <p>{item.analysis}</p>
            </article>
            <div className="roadmap-detail-grid">
              <section className="roadmap-detail-section">
                <span className="summary-kicker">Primary sources</span>
                <ul>
                  {item.primary_sources.map((source) => (
                    <li key={source}>{source}</li>
                  ))}
                </ul>
              </section>
              <section className="roadmap-detail-section">
                <span className="summary-kicker">Review notes</span>
                <ul>
                  {item.review_notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </section>
            </div>
          </section>
        </section>
      </main>

      <SiteFooter brand="SansadDarpan" note="Case files combine rules, transcripts, precedent, and human review" endLabel="Structured case file" />
    </div>
  );
}
