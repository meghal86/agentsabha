import { notFound } from "next/navigation";

import { SansadDarpanSubnav } from "@/components/sansaddarpan-subnav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSansadDarpanMp } from "@/lib/api";

export default async function SansadDarpanMpDetailPage({ params }: { params: { slug: string } }) {
  let mp;
  try {
    mp = await getSansadDarpanMp(params.slug);
  } catch {
    notFound();
  }

  return (
    <div className="page-shell product-shell" data-product="sansaddarpan">
      <SiteHeader active="sansaddarpan" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame sansaddarpan-frame">
          <div className="product-intro">
            <div>
              <p className="eyebrow">MP PROFILE · PUBLIC SCORECARD</p>
              <h1 className="product-title">{mp.name}</h1>
              <p className="hero-body">
                {mp.constituency}, {mp.state} · {mp.party}
              </p>
              <p className="frame-note">{mp.narrative}</p>
            </div>
            <div className="product-intro-stats product-intro-stats-grid">
              <article className="summary-tile sansaddarpan-tile">
                <span className="summary-kicker">Participation score</span>
                <strong>{mp.score}</strong>
                <p>National rank #{mp.national_rank}</p>
              </article>
              <article className="summary-tile sansaddarpan-tile accent-tile">
                <span className="summary-kicker">Attendance</span>
                <strong>{mp.attendance_rate.toFixed(1)}%</strong>
                <p>Voting participation {mp.voting_participation.toFixed(1)}%</p>
              </article>
            </div>
          </div>

          <SansadDarpanSubnav active="mps" />

          <section className="frame-panel full-width-panel sansaddarpan-surface">
            <div className="dashboard-summary-grid">
              <article className="summary-tile sansaddarpan-tile">
                <span className="summary-kicker">Questions asked</span>
                <strong>{mp.questions_asked}</strong>
                <p>Starred and unstarred question archive is counted separately in the methodology.</p>
              </article>
              <article className="summary-tile sansaddarpan-tile">
                <span className="summary-kicker">Debates</span>
                <strong>{mp.debates}</strong>
                <p>Substantive debate contributions count more than symbolic appearances.</p>
              </article>
              <article className="summary-tile sansaddarpan-tile">
                <span className="summary-kicker">Zero Hour</span>
                <strong>{mp.zero_hour_mentions}</strong>
                <p>Zero Hour mentions are tracked, but weighted below substantive debate contribution.</p>
              </article>
              <article className="summary-tile sansaddarpan-tile">
                <span className="summary-kicker">Private member bills</span>
                <strong>{mp.private_member_bills}</strong>
                <p>These remain a capped bonus rather than the core of the participation score.</p>
              </article>
            </div>
          </section>

          <section className="frame-panel full-width-panel sansaddarpan-surface">
            <div className="section-heading compact-heading">
              <div>
                <p>Score methodology</p>
                <h2>Public score breakdown</h2>
              </div>
            </div>
            <div className="dashboard-summary-grid">
              {Object.entries(mp.score_breakdown).map(([key, value]) => (
                <article key={key} className="summary-tile sansaddarpan-card">
                  <span className="summary-kicker">{key}</span>
                  <strong>{value.toFixed(1)}</strong>
                  <p>This component is versioned and must remain methodology-linked at all times.</p>
                </article>
              ))}
            </div>
          </section>

          <section className="frame-panel full-width-panel sansaddarpan-surface">
            <div className="section-heading compact-heading">
              <div>
                <p>Source trail</p>
                <h2>Primary records used</h2>
              </div>
            </div>
            <ul className="sansaddarpan-source-list">
              {mp.sources.map((source) => (
                <li key={source}>{source}</li>
              ))}
            </ul>
          </section>
        </section>
      </main>

      <SiteFooter note="SansadDarpan · Every score links back to a source and a method" />
    </div>
  );
}
