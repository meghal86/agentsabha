import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  getSansadDarpanConstituencies,
  getSansadDarpanMps,
  getSansadDarpanOverview,
  getSansadDarpanRuleDeviations,
  getSansadDarpanWeeklyBriefs,
} from "@/lib/api";

function getDeviationStatus(status: string) {
  if (status === "human-verified") {
    return { label: "Published", tone: "published" as const };
  }
  if (status === "archived") {
    return { label: "Archived", tone: "archived" as const };
  }
  return { label: "Under review", tone: "review" as const };
}

function getTimelineTone(type: "alert" | "warning" | "healthy") {
  if (type === "alert") return "alert";
  if (type === "warning") return "warning";
  return "healthy";
}

export default async function SansadDarpanPage() {
  const [overview, mps, welfare, deviations, weeklyBriefs] = await Promise.all([
    getSansadDarpanOverview(),
    getSansadDarpanMps(),
    getSansadDarpanConstituencies(),
    getSansadDarpanRuleDeviations(),
    getSansadDarpanWeeklyBriefs().catch(() => ({ briefs: [] })),
  ]);
  const latestBrief = weeklyBriefs.briefs[0];

  const scoreLeaderboard = [...mps.mps].sort((left, right) => right.score - left.score).slice(0, 4);
  const topMp = scoreLeaderboard[0];
  const welfareGap = welfare.constituencies[0];
  const topDeviation = [...deviations.deviations].sort((left, right) => right.confidence - left.confidence)[0];
  const avgAttendance = mps.mps.length
    ? (mps.mps.reduce((sum, mp) => sum + mp.attendance_rate, 0) / mps.mps.length).toFixed(1)
    : "0.0";
  const avgScore = mps.mps.length ? Math.round(mps.mps.reduce((sum, mp) => sum + mp.score, 0) / mps.mps.length) : 0;
  const publishedCases = deviations.deviations.filter((item) => item.status === "human-verified").length;
  const underReviewCases = deviations.deviations.filter((item) => item.status !== "human-verified").length;

  const timelineItems = [
    topDeviation && {
      label: "Rules",
      tone: getTimelineTone(topDeviation.status === "human-verified" ? "alert" : "warning"),
      title: topDeviation.title,
      body: topDeviation.summary,
      href: `/sansaddarpan/rule-deviations/${topDeviation.id}`,
      tags: [getDeviationStatus(topDeviation.status).label, `${Math.round(topDeviation.confidence * 100)}% confidence`],
    },
    welfareGap && {
      label: "Welfare",
      tone: getTimelineTone(welfareGap.raised_in_parliament ? "healthy" : "warning"),
      title: `${welfareGap.name}: constituency gap in focus`,
      body: welfareGap.top_gap,
      href: `/sansaddarpan/constituencies/${welfareGap.slug}`,
      tags: [welfareGap.raised_in_parliament ? "Raised on record" : "Not yet raised", welfareGap.state],
    },
    topMp && {
      label: "MPs",
      tone: getTimelineTone("healthy"),
      title: `${topMp.name} leads the current public register`,
      body: `${topMp.constituency}, ${topMp.state} is currently leading the visible scorecard cohort with a score of ${topMp.score}.`,
      href: `/sansaddarpan/mps/${topMp.slug}`,
      tags: [`${topMp.attendance_rate.toFixed(1)}% attendance`, `${topMp.questions_asked} questions`],
    },
  ].filter(Boolean) as {
    label: string;
    tone: string;
    title: string;
    body: string;
    href: string;
    tags: string[];
  }[];

  const flagItems = [
    topDeviation && {
      title: topDeviation.title,
      body: `${getDeviationStatus(topDeviation.status).label} case with ${Math.round(topDeviation.confidence * 100)}% confidence and source-linked reasoning.`,
      tone: getDeviationStatus(topDeviation.status).tone,
    },
    welfareGap && {
      title: `${welfareGap.name} welfare gap`,
      body: welfareGap.top_gap,
      tone: welfareGap.raised_in_parliament ? "published" : "review",
    },
    topMp && {
      title: `${topMp.name} scorecard`,
      body: `${topMp.score} score · rank #${topMp.national_rank} in the current visible cohort.`,
      tone: "archived",
    },
  ].filter(Boolean) as { title: string; body: string; tone: "published" | "review" | "archived" }[];

  return (
    <div className="page-shell product-shell" data-product="sansaddarpan">
      <SiteHeader active="sansaddarpan-overview" product="sansaddarpan" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame sansaddarpan-frame">
          <nav className="sansaddarpan-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">AgentSabha</Link>
            <span>/</span>
            <span aria-current="page">SansadDarpan</span>
          </nav>

          <section className="sansaddarpan-dashboard-header">
            <div>
              <p className="eyebrow">PUBLIC ACCOUNTABILITY LAYER</p>
              <h1 className="product-title">{overview.product_name}</h1>
              <p className="sansaddarpan-hindi-title">{overview.hindi_name}</p>
              <p className="hero-body">{overview.tagline}</p>
            </div>
            <div className="sansaddarpan-dashboard-actions">
              <Link className="secondary-button button-link" href="/sansaddarpan/mps">
                Explore MPs
              </Link>
              <Link className="outline-button button-link" href="/sansaddarpan/methodology">
                Open methodology
              </Link>
            </div>
          </section>

          <section className="sansaddarpan-monitor-shell">
            <div className="sansaddarpan-monitor-topbar">
              <div className="sansaddarpan-monitor-identity">
                <div className="sansaddarpan-monitor-mark">SD</div>
                <div>
                  <div className="sansaddarpan-monitor-title">SansadDarpan parliamentary transparency monitor</div>
                  <div className="sansaddarpan-monitor-sub">Public evidence register · parliamentary records · welfare accountability · reviewed procedural flags</div>
                </div>
              </div>
              <span className="sansaddarpan-monitor-pill">Layer 3 public evidence</span>
              <div className="sansaddarpan-live-wrap">
                <span className="sansaddarpan-live-dot" aria-hidden="true"></span>
                <span className="sansaddarpan-live-label">Live DB-backed</span>
              </div>
            </div>

            <div className="sansaddarpan-monitor-metrics">
              <article className="sansaddarpan-monitor-metric">
                <strong>{mps.mps.length}</strong>
                <span>MP scorecards in the current public register</span>
              </article>
              <article className="sansaddarpan-monitor-metric">
                <strong>{avgAttendance}%</strong>
                <span>Average attendance in the visible scorecard cohort</span>
              </article>
              <article className="sansaddarpan-monitor-metric">
                <strong>{avgScore}</strong>
                <span>Average public participation score in the visible cohort</span>
              </article>
              <article className="sansaddarpan-monitor-metric">
                <strong>{welfare.constituencies.length}</strong>
                <span>Constituency welfare profiles currently linked to Parliament</span>
              </article>
              <article className="sansaddarpan-monitor-metric">
                <strong>{publishedCases}/{underReviewCases}</strong>
                <span>Published vs under-review rule deviation cases</span>
              </article>
            </div>

            <div className="sansaddarpan-monitor-body">
              <div className="sansaddarpan-monitor-main">
                <div className="sansaddarpan-sec-label">Live accountability monitor</div>
                {timelineItems.map((item, index) => (
                  <Link key={`${item.label}-${index}`} href={item.href} className="sansaddarpan-tl-item">
                    <div className="sansaddarpan-tl-label">{item.label}</div>
                    <div className="sansaddarpan-tl-dot-col">
                      <span className={`sansaddarpan-tl-dot ${item.tone}`}></span>
                      {index < timelineItems.length - 1 ? <span className="sansaddarpan-tl-line"></span> : null}
                    </div>
                    <div className="sansaddarpan-tl-card">
                      <div className="sansaddarpan-tl-title">{item.title}</div>
                      <div className="sansaddarpan-tl-body">{item.body}</div>
                      <div className="sansaddarpan-tl-tags">
                        {item.tags.map((tag) => (
                          <span key={tag} className="sansaddarpan-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}

                <div className="sansaddarpan-quick-links">
                  <Link className="secondary-button button-link" href="/sansaddarpan/rule-deviations">
                    Review case registry
                  </Link>
                  <Link className="outline-button button-link" href="/sansaddarpan/constituencies">
                    Open welfare profiles
                  </Link>
                </div>
              </div>

              <aside className="sansaddarpan-monitor-side">
                <div className="sansaddarpan-sec-label">Priority flags</div>
                <div className="sansaddarpan-flag-list">
                  {flagItems.map((item, index) => (
                    <div key={`${item.title}-${index}`} className="sansaddarpan-flag-item">
                      <span className={`sansaddarpan-flag-icon ${item.tone}`}></span>
                      <div>
                        <div className="sansaddarpan-flag-title">{item.title}</div>
                        <div className="sansaddarpan-flag-body">{item.body}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="sansaddarpan-sec-label sansaddarpan-side-table-label">MP leaderboard preview</div>
                <div className="sansaddarpan-mini-table-wrap">
                  <table className="sansaddarpan-mini-table">
                    <thead>
                      <tr>
                        <th>MP</th>
                        <th>Score</th>
                        <th>Attendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scoreLeaderboard.map((mp) => (
                        <tr key={mp.slug}>
                          <td>
                            <strong>{mp.name}</strong>
                            <span>{mp.constituency}</span>
                          </td>
                          <td>{mp.score}</td>
                          <td>
                            {mp.attendance_rate.toFixed(1)}%
                            <span className="sansaddarpan-mini-bar-wrap">
                              <span className="sansaddarpan-mini-bar-fill" style={{ width: `${mp.attendance_rate}%` }}></span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </aside>
            </div>
          </section>

          <section className="frame-panel full-width-panel sansaddarpan-surface">
            <div className="section-heading compact-heading">
              <div>
                <p>One-screen public record</p>
                <h2>Open the full modules only when you need depth</h2>
              </div>
            </div>
            <div className="sansaddarpan-module-grid">
              <article className="summary-tile sansaddarpan-card">
                <span className="summary-kicker">MP participation</span>
                <h3>{topMp ? `${topMp.name} leads the current register` : "MP scorecards"}</h3>
                <p>{topMp ? topMp.summary : overview.sections[0]?.summary}</p>
                <div className="sansaddarpan-metric-row">
                  <strong>{topMp ? topMp.score : mps.mps.length}</strong>
                  <span>{topMp ? "current top visible score" : "profiles in scope"}</span>
                </div>
                <Link className="secondary-button forum-open-link" href="/sansaddarpan/mps">
                  Open scorecards
                </Link>
              </article>

              <article className="summary-tile sansaddarpan-card">
                <span className="summary-kicker">Constituency welfare</span>
                <h3>{welfareGap ? welfareGap.name : "Welfare dashboard"}</h3>
                <p>{welfareGap ? welfareGap.top_gap : overview.sections[1]?.summary}</p>
                <div className="sansaddarpan-metric-row">
                  <strong>{welfare.constituencies.length}</strong>
                  <span>live welfare profiles</span>
                </div>
                <Link className="secondary-button forum-open-link" href="/sansaddarpan/constituencies">
                  Open welfare
                </Link>
              </article>

              <article className="summary-tile sansaddarpan-card sansaddarpan-case-card">
                <div className="sansaddarpan-case-header">
                  <span className="summary-kicker">Rule deviation registry</span>
                  {topDeviation ? (
                    <span className={`sansaddarpan-status-pill ${getDeviationStatus(topDeviation.status).tone}`}>
                      {getDeviationStatus(topDeviation.status).label}
                    </span>
                  ) : null}
                </div>
                <h3>{topDeviation ? topDeviation.title : "Verified procedural review"}</h3>
                <p>{topDeviation ? topDeviation.summary : overview.sections[2]?.summary}</p>
                <div className="sansaddarpan-metric-row">
                  <strong>{publishedCases}</strong>
                  <span>published cases in the registry</span>
                </div>
                <Link className="secondary-button forum-open-link" href="/sansaddarpan/rule-deviations">
                  Open case registry
                </Link>
              </article>
            </div>
          </section>

          {latestBrief ? (
            <section className="frame-panel full-width-panel sansaddarpan-surface">
              <div className="section-heading compact-heading">
                <div>
                  <p>Latest weekly brief</p>
                  <h2>AI-generated constituency intelligence</h2>
                </div>
              </div>
              <article className="summary-tile sansaddarpan-card">
                <div className="sansaddarpan-case-header">
                  <span className="summary-kicker">Week {latestBrief.week_number}, {latestBrief.year}</span>
                  <span className={`sansaddarpan-status-pill ${latestBrief.status === "published" ? "published" : "review"}`}>
                    {latestBrief.status}
                  </span>
                </div>
                <h3>{latestBrief.headline}</h3>
                <p>{latestBrief.constituency_name}, {latestBrief.constituency_state} · MP: {latestBrief.mp_name || "Not mapped"}</p>
                <div className="sansaddarpan-quick-links" style={{ marginTop: "1rem" }}>
                  <Link className="secondary-button button-link" href={`/sansaddarpan/weekly-briefs/${latestBrief.id}`}>
                    Read full brief
                  </Link>
                  <Link className="outline-button button-link" href="/sansaddarpan/weekly-briefs">
                    Browse all briefs
                  </Link>
                </div>
              </article>
            </section>
          ) : (
            <section className="frame-panel full-width-panel sansaddarpan-surface">
              <div className="section-heading compact-heading">
                <div>
                  <p>Weekly constituency briefs</p>
                  <h2>AI research for the MP who could act</h2>
                </div>
              </div>
              <article className="summary-tile sansaddarpan-card sansaddarpan-placeholder-card">
                <span className="summary-kicker">Coming soon</span>
                <h3>Weekly briefs rotate through 543 constituencies</h3>
                <p>Each brief uses AI to research welfare gaps, parliamentary opportunities, and policy failures — then publishes the findings as a public brief, a video script, and a one-page MP summary.</p>
                <Link className="secondary-button forum-open-link" href="/sansaddarpan/weekly-briefs">
                  Open weekly briefs
                </Link>
              </article>
            </section>
          )}
        </section>
      </main>

      <SiteFooter
        brand="SansadDarpan"
        note="Parliamentary transparency, accountability, and public record"
        endLabel="Open public record"
      />
    </div>
  );
}
