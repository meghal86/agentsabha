import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSansadDarpanConstituency, getSansadDarpanRuleDeviations, getWeeklyBriefs } from "@/lib/api";

export default async function WeeklyBriefsPage() {
  const [briefsResponse, deviations] = await Promise.all([
    getWeeklyBriefs(),
    getSansadDarpanRuleDeviations().catch(() => null),
  ]);
  const leadBrief = briefsResponse.briefs[0];
  const leadConstituency = leadBrief
    ? await getSansadDarpanConstituency(leadBrief.constituency_slug).catch(() => null)
    : null;

  return (
    <div className="page-shell">
      <SiteHeader active="briefs" product="agentsabha" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame">
          <section className="weekly-brief-hero">
            <div className="weekly-brief-copy">
              <p className="eyebrow">WEEKLY CONSTITUENCY INTELLIGENCE BRIEF</p>
              <h1>One constituency each week. One brief that shows what AI can do for an MP.</h1>
              <p className="hero-body">
                This is the public output layer of AgentSabha: a weekly constituency intelligence brief, a public video narrative, and a one-page MP summary built from the same civic research engine.
              </p>
              {leadBrief ? (
                <div className="hero-actions">
                  <Link className="primary-button" href={`/briefs/${leadBrief.slug}`}>
                    <span>Read this week&apos;s brief</span>
                    <small>{leadBrief.constituency} · {leadBrief.state}</small>
                  </Link>
                  <Link className="secondary-button" href="/sansaddarpan">
                    Open evidence layer
                  </Link>
                </div>
              ) : null}
            </div>
            <aside className="weekly-brief-aside">
              <span className="summary-kicker">Why this exists</span>
              <strong>AI is the subject. The MP is the person who can act.</strong>
              <p>
                The brief is framed as research assistance, not political judgment. Citizens see what AI can uncover. MPs see a high-quality brief they could use immediately.
              </p>
            </aside>
          </section>

          <section className="frame-panel full-width-panel">
            <div className="section-heading compact-heading">
              <div>
                <p>Current run</p>
                <h2>This week&apos;s published output</h2>
              </div>
            </div>
            <div className="weekly-brief-grid">
              {briefsResponse.briefs.map((brief) => (
                <article key={brief.slug} className="summary-tile weekly-brief-card">
                  <span className="summary-kicker">{brief.week_label} · {brief.publish_date}</span>
                  <h3>{brief.constituency}, {brief.state}</h3>
                  <p>{brief.summary}</p>
                  <div className="weekly-brief-meta">
                    <span>MP: {brief.mp_name}</span>
                    <span>Public output: brief + video + MP summary</span>
                  </div>
                  {brief.slug === leadBrief.slug && leadConstituency ? (
                    <div className="weekly-brief-live-row">
                      {leadConstituency.metrics.slice(0, 2).map((metric) => (
                        <span key={metric.label} className="sansaddarpan-tag">
                          {metric.label}: {metric.value}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <Link className="secondary-button button-link" href={`/briefs/${brief.slug}`}>
                    Open weekly brief
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <section className="frame-panel full-width-panel">
            <div className="section-heading compact-heading">
              <div>
                <p>Output format</p>
                <h2>What ships every week</h2>
              </div>
            </div>
            <div className="dashboard-summary-grid">
              <article className="summary-tile weekly-output-card">
                <span className="summary-kicker">01</span>
                <strong>Constituency Intelligence Brief</strong>
                <p>Top welfare gaps, one audit hook, one parliamentary move, one anomaly, and one trendline written for the MP.</p>
              </article>
              <article className="summary-tile weekly-output-card">
                <span className="summary-kicker">02</span>
                <strong>Video / short-form script</strong>
                <p>A public narrative showing what AI found in the constituency and what action the MP could take this week.</p>
              </article>
              <article className="summary-tile weekly-output-card">
                <span className="summary-kicker">Live evidence context</span>
                <strong>{deviations?.deviations?.length ?? 0} reviewed parliamentary cases are already in the current evidence layer</strong>
                <p>The weekly brief sits on top of the same evidence system that now tracks welfare signals and parliamentary case review.</p>
              </article>
            </div>
          </section>
        </section>
      </main>

      <SiteFooter note="Weekly constituency research briefs built from the AgentSabha evidence engine" endLabel="Public output layer" />
    </div>
  );
}
