import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSansadDarpanConstituency, getSansadDarpanRuleDeviations, getWeeklyBrief } from "@/lib/api";

export default async function WeeklyBriefDetailPage({ params }: { params: { slug: string } }) {
  let brief;
  try {
    brief = await getWeeklyBrief(params.slug);
  } catch {
    notFound();
  }

  const [constituencyEvidence, deviations] = await Promise.all([
    getSansadDarpanConstituency(brief.constituency_slug).catch(() => null),
    getSansadDarpanRuleDeviations().catch(() => null),
  ]);

  return (
    <div className="page-shell">
      <SiteHeader active="briefs" product="agentsabha" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame">
          <nav className="sansaddarpan-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">AgentSabha</Link>
            <span>/</span>
            <Link href="/briefs">Weekly Briefs</Link>
            <span>/</span>
            <span aria-current="page">{brief.constituency}</span>
          </nav>

          <section className="weekly-brief-hero">
            <div className="weekly-brief-copy">
              <p className="eyebrow">{brief.week_label} · {brief.publish_date}</p>
              <h1>{brief.headline}</h1>
              <p className="hero-body">{brief.summary}</p>
              <div className="hero-actions">
                <Link className="secondary-button button-link" href="#mp-summary">
                  Jump to MP summary
                </Link>
                <Link className="outline-button button-link" href="#video-script">
                  Open video script
                </Link>
              </div>
            </div>
            <aside className="weekly-brief-aside">
              <span className="summary-kicker">Addressed to</span>
              <strong>{brief.mp_name}</strong>
              <p>{brief.constituency}, {brief.state} · {brief.mp_party}</p>
              <p>{brief.hero_note}</p>
              {constituencyEvidence ? (
                <div className="weekly-brief-live-row">
                  {constituencyEvidence.metrics.slice(0, 2).map((metric) => (
                    <span key={metric.label} className="sansaddarpan-tag">
                      {metric.label}: {metric.value}
                    </span>
                  ))}
                </div>
              ) : null}
            </aside>
          </section>

          <section className="frame-panel full-width-panel">
            <div className="section-heading compact-heading">
              <div>
                <p>Constituency intelligence brief</p>
                <h2>What AI would hand to the MP this week</h2>
              </div>
            </div>
            <div className="weekly-brief-grid">
              {(constituencyEvidence
                ? constituencyEvidence.metrics.map((metric) => ({
                    title: metric.label,
                    detail: `${metric.value} against ${metric.benchmark}. ${constituencyEvidence.top_gap}`,
                    why_it_matters:
                      metric.status === "positive"
                        ? "This is a relative strength worth preserving through continued ministerial and administrative follow-through."
                        : "This is the kind of constituency signal that should become a parliamentary follow-up rather than remain a dashboard observation.",
                  }))
                : brief.welfare_gaps
              ).map((gap) => (
                <article key={gap.title} className="summary-tile weekly-brief-card">
                  <span className="summary-kicker">Welfare gap</span>
                  <h3>{gap.title}</h3>
                  <p>{gap.detail}</p>
                  <div className="weekly-brief-note">{gap.why_it_matters}</div>
                </article>
              ))}
            </div>
          </section>

          <section className="frame-panel full-width-panel">
            <div className="dashboard-summary-grid">
              <article className="summary-tile weekly-output-card">
                <span className="summary-kicker">Audit hook</span>
                <strong>{brief.audit_hook.title}</strong>
                <p>{brief.audit_hook.body}</p>
                <small>{brief.audit_hook.source_label}</small>
              </article>
              <article className="summary-tile weekly-output-card">
                <span className="summary-kicker">MGNREGS anomaly</span>
                <strong>{brief.anomaly.title}</strong>
                <p>{brief.anomaly.body}</p>
              </article>
              <article className="summary-tile weekly-output-card">
                <span className="summary-kicker">SDG trend</span>
                <strong>{brief.sdg_trend.title}</strong>
                <p>{brief.sdg_trend.body}</p>
              </article>
              <article className="summary-tile weekly-output-card">
                <span className="summary-kicker">Evidence stack</span>
                <strong>{deviations?.deviations?.length ?? 0} reviewed rule-deviation cases in the current public register</strong>
                <p>This week’s brief is being published alongside the evidence layer rather than in isolation from it.</p>
              </article>
            </div>
          </section>

          <section className="frame-panel full-width-panel">
            <div className="section-heading compact-heading">
              <div>
                <p>Parliamentary move</p>
                <h2>The question AI would draft next</h2>
              </div>
            </div>
            <article className="weekly-question-card">
              <p>{brief.parliamentary_move.body}</p>
              <blockquote>{brief.parliamentary_move.draft_question}</blockquote>
            </article>
          </section>

          <section id="video-script" className="frame-panel full-width-panel">
            <div className="section-heading compact-heading">
              <div>
                <p>Video script</p>
                <h2>Public narrative for YouTube and short-form video</h2>
              </div>
            </div>
            <div className="weekly-script-list">
              {brief.video_segments.map((segment, index) => (
                <article key={segment.title} className="summary-tile weekly-script-card">
                  <span className="summary-kicker">Segment {index + 1}</span>
                  <strong>{segment.title}</strong>
                  <p>{segment.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="mp-summary" className="frame-panel full-width-panel">
            <div className="section-heading compact-heading">
              <div>
                <p>MP summary</p>
                <h2>WhatsApp-ready one-page takeaway</h2>
              </div>
            </div>
            <div className="weekly-summary-panel">
              <p>This summary keeps the MP as the actor who can move the issue onto the parliamentary record this week.</p>
              <ul className="weekly-summary-list">
                {brief.mp_summary.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="frame-panel full-width-panel">
            <div className="section-heading compact-heading">
              <div>
                <p>Source trail</p>
                <h2>Where this brief comes from</h2>
              </div>
            </div>
            <div className="weekly-source-grid">
              {brief.source_trail.map((item) => (
                <article key={item.label} className="summary-tile weekly-output-card">
                  <span className="summary-kicker">Evidence line</span>
                  <strong>{item.label}</strong>
                  <p>{item.note}</p>
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>

      <SiteFooter note="Weekly constituency research brief generated from the current evidence stack" endLabel="AI-assisted public output" />
    </div>
  );
}
