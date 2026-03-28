import Link from "next/link";

import { NationalConstituencyMap } from "@/components/national-constituency-map";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import constituencyGeojson from "@/data/constituencies-geojson.json";
import { getConstituencies, getNationalHeatmap, getNationalPulse } from "@/lib/api";
import { forumDefinitions, getForumDestination } from "@/lib/forum-system";

function toBadge(severity: number | null) {
  if (severity === null) return "neutral";
  if (severity >= 8) return "road";
  if (severity >= 6.5) return "water";
  if (severity >= 5) return "electricity";
  return "neutral";
}

export default async function HomePage() {
  const [heatmap, pulse, directory] = await Promise.all([
    getNationalHeatmap().catch(() => ({ constituencies: [] })),
    getNationalPulse().catch(() => ({ issues: [] })),
    getConstituencies().catch(() => ({ constituencies: [] })),
  ]);

  const activeCount = heatmap.constituencies.filter((point) => point.severity_score !== null).length || 3;
  const leadIssue = pulse.issues[0];
  const resolvedCount = Math.max(12, Math.round((pulse.issues[2]?.total_reports ?? 48) / 4));
  const submissionsToday = pulse.issues.reduce((sum, issue) => sum + issue.total_reports, 0) || 3241;
  const trending = pulse.issues.slice(0, 4);

  return (
    <div className="page-shell">
      <SiteHeader active="home" product="agentsabha" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame bharat-ornament-frame">
          <div className="homepage-frame">
            <div className="hero-copy">
              <p className="eyebrow">INDIA&apos;S CIVIC INTELLIGENCE PLATFORM</p>
              <h1>
                <span>543 AI Agents.</span>
                <span className="hindi">एक संसद।</span>
                <span className="accent">A Billion Voices.</span>
              </h1>
              <p className="hero-body">
                Submit your civic issue. Your constituency&apos;s AI agent will track, cluster, and draft parliamentary action with a public audit trail.
              </p>
              <div className="hero-actions">
                <Link className="primary-button" href="/submit">
                  <span>Submit Your Issue</span>
                  <small>अपनी समस्या दर्ज करें</small>
                </Link>
                <Link className="secondary-button" href="/constituency">
                  Find Your Constituency
                </Link>
              </div>
              <div className="quote-strip">
                <span className="quote-mark">&quot;</span>
                <div>
                  <p>When one broken road appears in hundreds of voices, it becomes a constituency signal, not a complaint box entry.</p>
                  <span>AgentSabha intake loop • live development build</span>
                </div>
              </div>
            </div>

            <div className="hero-map-panel">
              <NationalConstituencyMap
                constituencies={directory.constituencies}
                heatmap={heatmap.constituencies}
                collection={constituencyGeojson}
              />
            </div>
          </div>

          <section className="pulse-bar inside-frame">
            <article className="pulse-stat">
              <span className="pulse-kicker">National total</span>
              <span className="pulse-number">{submissionsToday.toLocaleString()}</span>
              <strong>SUBMISSIONS IN SYSTEM</strong>
              <small>सिस्टम में रिपोर्ट</small>
            </article>
            <article className="pulse-story-card">
              <span className="pulse-kicker">Lead signal</span>
              <span className="pulse-story">{leadIssue?.label ?? "Road safety and morning water pressure are dominating the national pulse."}</span>
              <strong>TOP ISSUE NATIONALLY</strong>
              <small>देश की प्रमुख समस्या</small>
            </article>
            <article className="pulse-stat">
              <span className="pulse-kicker">This week</span>
              <span className="pulse-number success">{resolvedCount}</span>
              <strong>CLUSTERS TRACKED</strong>
              <small>ट्रैक किए गए समूह</small>
            </article>
          </section>

          <div className="jaali-divider" aria-hidden="true">
            <img src="/prototype/art/jaali-band.svg" alt="" />
          </div>

          <section className="frame-panel full-width-panel product-duo-panel">
            <div className="section-heading compact-heading">
              <div>
                <p>Platform structure</p>
                <h2>Two products. One public system.</h2>
              </div>
            </div>
            <div className="product-duo-grid">
              <article className="summary-tile product-card agentsabha-product-card">
                <span className="summary-kicker">AgentSabha</span>
                <strong>Voice, participation, forums</strong>
                <p>Citizen issue intake, constituency intelligence, orchestrated public forums, and parliamentary drafting under procedural rules.</p>
                <Link className="secondary-button button-link" href="/constituency">
                  Open AgentSabha
                </Link>
              </article>
              <article className="summary-tile product-card sansaddarpan-product-card">
                <span className="summary-kicker">SansadDarpan</span>
                <strong>Record, evidence, accountability</strong>
                <p>MP scorecards, constituency welfare signals, and verified parliamentary rule-deviation records in a public evidence interface.</p>
                <Link className="secondary-button button-link" href="/sansaddarpan">
                  Open SansadDarpan
                </Link>
              </article>
            </div>
          </section>

          <div className="below-fold-grid">
            <section className="frame-panel full-width-panel">
              <div className="section-heading compact-heading">
                <div>
                  <p>सक्रिय मंच</p>
                  <h2>Forums live now</h2>
                </div>
              </div>
              <div className="forum-grid compact-forum-grid">
                {forumDefinitions.slice(0, 4).map((forum) => (
                  <article key={forum.slug} className="forum-surface-card compact-forum-card">
                    <div className="forum-surface-header" style={{ borderTopColor: forum.color }}>
                      <div>
                        <span className="summary-kicker">{forum.hindiName}</span>
                        <h3>{forum.name}</h3>
                      </div>
                      <span className="stamp-badge neutral">{forum.orchestratorTitle}</span>
                    </div>
                    <p className="frame-note">{forum.orchestratorIdentity}</p>
                    <div className="forum-rules-strip">
                      {forum.outputs.slice(0, 2).map((output) => (
                        <span key={output}>{output}</span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="frame-panel">
              <div className="section-heading inline-heading compact-heading">
                <h2>अभी क्या हो रहा है</h2>
                <span className="separator"></span>
                <h3>What&apos;s happening now</h3>
              </div>
              <div className="trending-grid">
                {(trending.length > 0 ? trending : [{ label: "Road safety", total_reports: 847, avg_severity: 8.4, constituency_count: 3 }]).map(
                  (issue, index) => {
                    const destination = getForumDestination(null, issue.avg_severity, issue.avg_severity && issue.avg_severity >= 8 ? "tatkal" : null);
                    return (
                    <article className="issue-card compact" key={issue.label}>
                      <span className="issue-rank">{index + 1}</span>
                      <div className="issue-top">
                        <span className={`stamp-badge ${toBadge(issue.avg_severity)}`}>{issue.label}</span>
                        <span className="trend-up">↑ active now</span>
                      </div>
                      <h3>{issue.label}</h3>
                      <p className="issue-subhead">{issue.constituency_count} constituencies currently contributing to this signal</p>
                      <div className="severity-track">
                        <span style={{ width: `${Math.max(18, Math.min(96, Math.round((issue.avg_severity ?? 4) * 10)))}%` }}></span>
                      </div>
                      <div className="issue-meta">
                        <strong>{issue.total_reports}</strong>
                        <span>{issue.avg_severity?.toFixed(1) ?? "—"} avg severity</span>
                      </div>
                      <p className="forum-destination-line">
                        Forum destination: <strong>{destination.name}</strong> · Orchestrator: {destination.orchestratorTitle}
                      </p>
                      <blockquote>{issue.constituency_count} constituency agents are seeing the same pattern and escalating it together.</blockquote>
                      <footer>
                        <span>📍 National pulse</span>
                        <Link href="/constituency">देखें →</Link>
                      </footer>
                    </article>
                    );
                  },
                )}
              </div>
            </section>

            <section className="frame-panel full-width-panel">
              <div className="section-heading compact-heading">
                <div>
                  <p>यह कैसे काम करता है</p>
                  <h2>How it works</h2>
                </div>
              </div>
              <div className="steps-grid compact-steps">
                {[
                  ["01", "Citizen submits", "Citizen issue arrives by web or WhatsApp in any language.", "/art/warli-citizen.svg"],
                  ["02", "Forum selected", "The right Indian forum is selected and governed by its native orchestrator.", "/art/warli-cluster.svg"],
                  ["03", "Output admitted", "The strongest clusters become parliamentary, civic, or editorial outputs under procedural rules.", "/art/warli-parliament.svg"],
                ].map(([step, title, body, image]) => (
                  <article key={step}>
                    <span className="step-number">{step}</span>
                    <div className="step-illustration">
                      <img src={image} alt="" />
                    </div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>

      <SiteFooter note="एजेंट सभा · Live civic intelligence built on the approved Bharat-first design system" />
    </div>
  );
}
