import Link from "next/link";

import { SansadDarpanDebugPanel } from "@/components/sansaddarpan-debug-panel";
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
  const topScore = data.mps.length ? Math.max(...data.mps.map((mp) => mp.score)) : 0;
  const avgAttendance = data.mps.length
    ? (data.mps.reduce((sum, mp) => sum + mp.attendance_rate, 0) / data.mps.length).toFixed(1)
    : "0.0";
  const totalQuestions = data.mps.reduce((sum, mp) => sum + mp.questions_asked, 0);
  const totalDebates = data.mps.reduce((sum, mp) => sum + mp.debates, 0);
  const topScorer = [...data.mps].sort((left, right) => right.score - left.score)[0];
  const topAttendance = [...data.mps].sort((left, right) => right.attendance_rate - left.attendance_rate)[0];
  const mostQuestions = [...data.mps].sort((left, right) => right.questions_asked - left.questions_asked)[0];

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

          <section className="sansaddarpan-dashboard-header">
            <div>
              <p className="eyebrow">MP PARTICIPATION SCORECARD</p>
              <h1 className="product-title">Public scorecards for every sitting Lok Sabha MP</h1>
              <p className="hero-body">
                Attendance, questions, debates, and floor participation are normalized into a public score and benchmarked against national peers.
              </p>
              <p className="frame-note">Methodology version: {data.methodology_version}</p>
            </div>
          </section>

          <section className="sansaddarpan-monitor-shell">
            <div className="sansaddarpan-monitor-topbar">
              <div className="sansaddarpan-monitor-identity">
                <div className="sansaddarpan-monitor-mark">MP</div>
                <div>
                  <div className="sansaddarpan-monitor-title">Participation register</div>
                  <div className="sansaddarpan-monitor-sub">Public scorecards ranked across attendance, questions, debates, and floor participation</div>
                </div>
              </div>
              <span className="sansaddarpan-monitor-pill">Method-linked public register</span>
              <div className="sansaddarpan-live-wrap">
                <span className="sansaddarpan-live-dot" aria-hidden="true"></span>
                <span className="sansaddarpan-live-label">Live DB-backed</span>
              </div>
            </div>

            <div className="sansaddarpan-monitor-metrics">
              <article className="sansaddarpan-monitor-metric">
                <strong>{data.mps.length}</strong>
                <span>MP profiles in the current public register</span>
              </article>
              <article className="sansaddarpan-monitor-metric">
                <strong>{topScore}</strong>
                <span>Highest visible participation score</span>
              </article>
              <article className="sansaddarpan-monitor-metric">
                <strong>{avgAttendance}%</strong>
                <span>Average attendance across the visible cohort</span>
              </article>
              <article className="sansaddarpan-monitor-metric">
                <strong>{totalQuestions}</strong>
                <span>Total questions across the current public register</span>
              </article>
              <article className="sansaddarpan-monitor-metric">
                <strong>{totalDebates}</strong>
                <span>Substantive debates counted in the visible cohort</span>
              </article>
            </div>

            <div className="sansaddarpan-monitor-body">
              <div className="sansaddarpan-monitor-main">
                <div className="sansaddarpan-sec-label">Register briefing</div>
                <div className="sansaddarpan-module-grid">
                  {topScorer ? (
                    <article className="summary-tile sansaddarpan-card">
                      <span className="summary-kicker">Top score</span>
                      <h3>{topScorer.name}</h3>
                      <p>{topScorer.constituency}, {topScorer.state} currently leads the visible cohort on the public participation index.</p>
                      <div className="sansaddarpan-metric-row">
                        <strong>{topScorer.score}</strong>
                        <span>national rank #{topScorer.national_rank}</span>
                      </div>
                    </article>
                  ) : null}
                  {topAttendance ? (
                    <article className="summary-tile sansaddarpan-card">
                      <span className="summary-kicker">Attendance leader</span>
                      <h3>{topAttendance.name}</h3>
                      <p>Attendance remains the basic floor discipline check before the register even begins to compare speaking and questioning volume.</p>
                      <div className="sansaddarpan-metric-row">
                        <strong>{topAttendance.attendance_rate.toFixed(1)}%</strong>
                        <span>{topAttendance.constituency}</span>
                      </div>
                    </article>
                  ) : null}
                  {mostQuestions ? (
                    <article className="summary-tile sansaddarpan-card">
                      <span className="summary-kicker">Questions leader</span>
                      <h3>{mostQuestions.name}</h3>
                      <p>Questions are counted separately from debate participation so one strong intervention mode does not erase weak performance elsewhere.</p>
                      <div className="sansaddarpan-metric-row">
                        <strong>{mostQuestions.questions_asked}</strong>
                        <span>questions asked on record</span>
                      </div>
                    </article>
                  ) : null}
                </div>
              </div>

              <aside className="sansaddarpan-monitor-side">
                <div className="sansaddarpan-sec-label">Current register</div>
                <div className="sansaddarpan-flag-list">
                  <div className="sansaddarpan-flag-item">
                <span className="sansaddarpan-flag-icon published"></span>
                    <div>
                      <div className="sansaddarpan-flag-title">Live Digital Sansad register</div>
                      <div className="sansaddarpan-flag-body">Attendance, questions, debates, and floor participation are now sourced from official Digital Sansad feeds rather than curated demo cards.</div>
                    </div>
                  </div>
                  <div className="sansaddarpan-flag-item">
                    <span className="sansaddarpan-flag-icon review"></span>
                    <div>
                      <div className="sansaddarpan-flag-title">Methodology stays inspectable</div>
                      <div className="sansaddarpan-flag-body">Every score is intended to remain one click away from the source trail and the weighting logic that produced it.</div>
                    </div>
                  </div>
                  <div className="sansaddarpan-flag-item">
                    <span className="sansaddarpan-flag-icon archived"></span>
                    <div>
                      <div className="sansaddarpan-flag-title">National roster sync is active</div>
                      <div className="sansaddarpan-flag-body">The register now expands with the live Lok Sabha roster. Fields that are not exposed by the public source are left undisclosed rather than mocked.</div>
                    </div>
                  </div>
                </div>
                <div className="sansaddarpan-quick-links">
                  <Link className="secondary-button button-link" href="/sansaddarpan/methodology">
                    Open methodology
                  </Link>
                </div>
              </aside>
            </div>
          </section>

          <section className="frame-panel full-width-panel sansaddarpan-surface">
            <div className="section-heading compact-heading">
              <div>
                <p>Participation index</p>
                <h2>MP scorecard register</h2>
              </div>
            </div>
            <div className="sansaddarpan-table-wrap">
              {data.mps.length === 0 ? (
                <div className="sansaddarpan-empty-state">
                  <strong>Live participation feed is syncing.</strong>
                  <p>Scorecards appear here only after official Digital Sansad participation data has been ingested.</p>
                </div>
              ) : null}
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

          <SansadDarpanDebugPanel />
        </section>
      </main>

      <SiteFooter brand="SansadDarpan" note="MP participation benchmarked and method-linked" endLabel="Methodology visible" />
    </div>
  );
}
