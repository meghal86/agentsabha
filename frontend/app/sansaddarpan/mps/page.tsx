import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSansadDarpanMps } from "@/lib/api";

function getScoreTone(score: number) {
  if (score >= 90) {
    return "positive";
  }
  if (score >= 70) {
    return "warning";
  }
  return "critical";
}

export default async function SansadDarpanMpsPage() {
  const data = await getSansadDarpanMps();

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
            <span aria-current="page">MP Scorecards</span>
          </nav>

          <section className="sansaddarpan-masthead">
            <div className="sansaddarpan-masthead-copy">
              <p className="eyebrow">MP PARTICIPATION SCORECARD</p>
              <h1 className="product-title">Public scorecards for every sitting Lok Sabha MP</h1>
              <p className="hero-body">
                Attendance, questions, debates, and floor participation are normalized into a public score and benchmarked against national peers.
              </p>
              <p className="frame-note">Methodology version: {data.methodology_version}</p>
            </div>
            <aside className="sansaddarpan-masthead-panel">
              <span className="summary-kicker">Current register</span>
              <strong>{data.mps.length} profiles</strong>
              <p>These scorecards are coming from the live SansadDarpan database layer, not a static page fixture.</p>
            </aside>
          </section>
          <section className="sansaddarpan-stat-strip">
            <article>
              <span>Highest score</span>
              <strong>{Math.max(...data.mps.map((mp) => mp.score))}</strong>
              <small>current public register</small>
            </article>
            <article>
              <span>Avg attendance</span>
              <strong>{(data.mps.reduce((sum, mp) => sum + mp.attendance_rate, 0) / data.mps.length).toFixed(1)}%</strong>
              <small>participation baseline</small>
            </article>
            <article>
              <span>Total debates</span>
              <strong>{data.mps.reduce((sum, mp) => sum + mp.debates, 0)}</strong>
              <small>substantive interventions</small>
            </article>
          </section>

          <section className="frame-panel full-width-panel sansaddarpan-surface">
            <div className="section-heading compact-heading">
              <div>
                <p>Participation index</p>
                <h2>MP scorecard register</h2>
              </div>
            </div>
            <div className="sansaddarpan-table-wrap">
              <table className="sansaddarpan-table">
                <thead>
                  <tr>
                    <th>MP</th>
                    <th>Constituency</th>
                    <th>Attendance</th>
                    <th>Questions</th>
                    <th>Debates</th>
                    <th>Score</th>
                    <th>Rank</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.mps.map((mp) => (
                    <tr key={mp.slug}>
                      <td data-label="MP">
                        <strong>{mp.name}</strong>
                        <span>{mp.party}</span>
                      </td>
                      <td data-label="Constituency">
                        {mp.constituency}
                        <span>{mp.state}</span>
                      </td>
                      <td data-label="Attendance">{mp.attendance_rate.toFixed(1)}%</td>
                      <td data-label="Questions">{mp.questions_asked}</td>
                      <td data-label="Debates">{mp.debates}</td>
                      <td data-label="Score">
                        <span className={`sansaddarpan-score-pill ${getScoreTone(mp.score)}`}>{mp.score}</span>
                      </td>
                      <td data-label="Rank">#{mp.national_rank}</td>
                      <td data-label="Profile">
                        <Link className="sansaddarpan-inline-action forum-open-link" href={`/sansaddarpan/mps/${mp.slug}`}>
                          Open →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </main>

      <SiteFooter brand="SansadDarpan" note="MP participation benchmarked and method-linked" endLabel="Methodology visible" />
    </div>
  );
}
