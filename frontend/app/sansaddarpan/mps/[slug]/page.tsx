import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSansadDarpanMp } from "@/lib/api";

const scoreBreakdownCopy: Record<string, string> = {
  attendance: "Attendance is weighted as the reliability floor of the score. High presence matters, but it does not outweigh substantive parliamentary work.",
  questions: "Question activity reflects how consistently the MP uses formal parliamentary tools to demand data, accountability, and ministerial answers.",
  debates: "Debate contribution rewards sustained floor participation and issue articulation, not symbolic appearances alone.",
  bonus: "Bonus points remain capped. Zero Hour mentions and private member bills can help the score, but they are not allowed to dominate it.",
};

export default async function SansadDarpanMpDetailPage({ params }: { params: { slug: string } }) {
  let mp;
  try {
    mp = await getSansadDarpanMp(params.slug);
  } catch {
    notFound();
  }

  return (
    <div className="page-shell product-shell" data-product="sansaddarpan">
      <SiteHeader active="sansaddarpan-mps" product="sansaddarpan" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame sansaddarpan-frame">
          <nav className="sansaddarpan-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">AgentSabha</Link>
            <span>/</span>
            <Link href="/sansaddarpan">SansadDarpan</Link>
            <span>/</span>
            <Link href="/sansaddarpan/mps">MP Scorecards</Link>
            <span>/</span>
            <span aria-current="page">{mp.name}</span>
          </nav>

          <section className="sansaddarpan-masthead">
            <div className="sansaddarpan-masthead-copy">
              <p className="eyebrow">MP PROFILE · PUBLIC SCORECARD</p>
              <h1 className="product-title">{mp.name}</h1>
              <p className="hero-body">
                {mp.constituency}, {mp.state} · {mp.party}
              </p>
              <p className="frame-note">{mp.narrative}</p>
              <div className="hero-actions sansaddarpan-hero-actions">
                <Link className="secondary-button button-link" href="#source-trail">
                  Jump to source trail
                </Link>
                <Link className="outline-button button-link" href="/sansaddarpan/methodology">
                  Review methodology
                </Link>
              </div>
            </div>
            <aside className="sansaddarpan-masthead-panel">
              <span className="summary-kicker">National rank</span>
              <strong>#{mp.national_rank}</strong>
              <p>This profile is shareable, source-linked, and rendered as a public scorecard rather than a generic biography page.</p>
            </aside>
          </section>
          <section className="sansaddarpan-stat-strip">
            <article>
              <span>Participation score</span>
              <strong>{mp.score}</strong>
              <small>public score</small>
            </article>
            <article>
              <span>Attendance</span>
              <strong>{mp.attendance_rate.toFixed(1)}%</strong>
              <small>house presence</small>
            </article>
            <article>
              <span>Voting</span>
              <strong>{mp.voting_participation === null ? "—" : `${mp.voting_participation.toFixed(1)}%`}</strong>
              <small>{mp.voting_participation === null ? "not publicly disclosed" : "participation in division"}</small>
            </article>
          </section>

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
                <span className="summary-kicker">Special mentions</span>
                <strong>{mp.zero_hour_mentions}</strong>
                <p>The public Digital Sansad feed exposes Special Mention participation, which is used here as the live floor-intervention bonus signal.</p>
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
                  <p>{scoreBreakdownCopy[key] ?? "This score component is method-linked and source-backed."}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="source-trail" className="frame-panel full-width-panel sansaddarpan-surface">
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

      <SiteFooter brand="SansadDarpan" note="Every score links back to a source and a method" endLabel="Public scorecard" />
    </div>
  );
}
