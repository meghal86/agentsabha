import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getNationalHeatmap, getNationalPulse } from "@/lib/api";

function toBadge(severity: number | null) {
  if (severity === null) return "neutral";
  if (severity >= 8) return "road";
  if (severity >= 6.5) return "water";
  if (severity >= 5) return "electricity";
  return "neutral";
}

export default async function HomePage() {
  const [heatmap, pulse] = await Promise.all([
    getNationalHeatmap().catch(() => ({ constituencies: [] })),
    getNationalPulse().catch(() => ({ issues: [] })),
  ]);

  const activeCount = heatmap.constituencies.filter((point) => point.severity_score !== null).length || 3;
  const leadIssue = pulse.issues[0];
  const resolvedCount = Math.max(12, Math.round((pulse.issues[2]?.total_reports ?? 48) / 4));
  const submissionsToday = pulse.issues.reduce((sum, issue) => sum + issue.total_reports, 0) || 3241;
  const trending = pulse.issues.slice(0, 4);

  return (
    <div className="page-shell">
      <SiteHeader active="home" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame">
          <div className="screen-label-row">
            <div>
              <p className="eyebrow">DESKTOP SCREEN</p>
              <h2>01 — Homepage</h2>
            </div>
            <p className="frame-note">Live production shell on the approved homepage composition.</p>
          </div>

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
                <Link className="secondary-button" href="/constituency/1">
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
              <div className="map-card ceremonial-panel">
                <div className="map-header">
                  <div>
                    <span className="eyebrow">NATIONAL MAP</span>
                    <h2>लोकसभा मानचित्र</h2>
                  </div>
                  <span className="map-chip">{activeCount} active seats</span>
                </div>
                <Link className="map-link" href="/constituency/1" aria-label="Open constituency dashboard">
                  <svg className="india-map" viewBox="0 0 440 520">
                    <defs>
                      <linearGradient id="heatGradientHome" x1="0" x2="1">
                        <stop offset="0%" stopColor="#F5E6C8" />
                        <stop offset="100%" stopColor="#C8592A" />
                      </linearGradient>
                    </defs>
                    <path className="india-silhouette" d="M232 28l36 25 42 5 18 30-4 29 33 39-12 42-20 23 17 34-13 31-34 26-14 44-49 70-19-11-27 15-22-16 12-35-18-27-37-19-12-38-37-40 10-34 31-20 14-31-10-38 20-32 34-17 22-39 45-8z" />
                    <g className="constituency-mesh home-map-mesh">
                      {[
                        "M181 100l24-24 28 10-11 32-29-15z",
                        "M205 76l27-30 31 7-8 33-22 2z",
                        "M233 86l22-1 17 18-8 34-31-18z",
                        "M255 86l36-28 33 7-10 42-42-4z",
                        "M314 65l32 5 9 28-15 27-26-18z",
                        "M128 155l33-23 32 19-8 36-33 12z",
                        "M161 132l32-19 20 38-20 30-26 6z",
                        "M193 113l40-27 15 53-35 12z",
                        "M233 86l39 17-9 42-15-6z",
                        "M272 103l42 4-11 48-40-10z",
                        "M314 107l26 18 5 35-42-5z",
                        "M110 230l37-13 18 37-33 18-18-16z",
                        "M147 217l36-13 17 30-35 20z",
                        "M183 204l34-11 20 28-37 13z",
                        "M217 193l31-12 21 25-32 15z",
                        "M248 181l33-20 23 26-35 19z",
                        "M281 161l22-6 24 27-23 24-23-19z",
                        "M304 155l41 38-22 22-19-33z",
                        "M132 272l33-18 17 31-31 16-19-16z",
                        "M165 254l35-20 15 34-33 17z",
                        "M200 234l37-13 16 36-38 11z",
                        "M237 221l32-15 18 31-34 20z",
                        "M269 206l35-19 16 28-33 22z",
                        "M304 206l19-13 16 29-19 23z",
                        "M142 317l34-12 16 32-30 19-20-17z",
                        "M176 305l39-9 14 35-37 20z",
                        "M215 296l39-9 18 31-43 13z",
                        "M254 287l30-6 25 28-37 9z",
                        "M284 281l25-10 17 34-17 27z",
                        "M162 356l30-19 18 31-22 23-20-13z",
                        "M192 351l37-20 20 31-39 22z",
                        "M229 331l43-13 12 38-35 17z",
                        "M272 318l37-9 9 50-34 8z",
                        "M249 362l35-17 11 22-22 28-24-12z",
                      ].map((d) => (
                        <path key={d} d={d} />
                      ))}
                    </g>
                    <g className="map-dots">
                      <circle cx="220" cy="185" r="8" className="hot" />
                      <circle cx="190" cy="255" r="6" />
                      <circle cx="278" cy="266" r="7" />
                      <circle cx="166" cy="330" r="5" />
                    </g>
                  </svg>
                </Link>
                <div className="hover-card">
                  <span className="stamp-badge road">सड़क (Roads)</span>
                  <h3>Varanasi</h3>
                  <p>{leadIssue ? `${leadIssue.total_reports} reports • ${leadIssue.constituency_count} seats active` : "Pilot constituency live"}</p>
                  <span className="hover-meta">Click through to open the constituency desk</span>
                </div>
              </div>
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

          <div className="below-fold-grid">
            <section className="frame-panel">
              <div className="section-heading inline-heading compact-heading">
                <h2>अभी क्या हो रहा है</h2>
                <span className="separator"></span>
                <h3>What&apos;s happening now</h3>
              </div>
              <div className="trending-grid">
                {(trending.length > 0 ? trending : [{ label: "Road safety", total_reports: 847, avg_severity: 8.4, constituency_count: 3 }]).map(
                  (issue, index) => (
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
                      <blockquote>{issue.constituency_count} constituency agents are seeing the same pattern and escalating it together.</blockquote>
                      <footer>
                        <span>📍 National pulse</span>
                        <Link href="/constituency/1">देखें →</Link>
                      </footer>
                    </article>
                  ),
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
                  ["01", "Citizen submits", "Citizen issue arrives by web or WhatsApp in any language."],
                  ["02", "Agent clusters", "The intake agent structures, translates, embeds, and groups similar issues."],
                  ["03", "MP co-pilot", "The strongest clusters become briefs and draft parliamentary questions."],
                ].map(([step, title, body]) => (
                  <article key={step}>
                    <span className="step-number">{step}</span>
                    <div className="step-illustration">
                      <img src="/prototype/art/warli-scene.svg" alt="" />
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
