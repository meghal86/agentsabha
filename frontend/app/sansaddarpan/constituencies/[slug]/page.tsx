import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSansadDarpanConstituency, getSansadDarpanWeeklyBriefs } from "@/lib/api";

export default async function SansadDarpanConstituencyPage({ params }: { params: { slug: string } }) {
  let item;
  try {
    item = await getSansadDarpanConstituency(params.slug);
  } catch {
    notFound();
  }

  // Try to find a matching weekly brief for this constituency
  const weeklyBriefs = await getSansadDarpanWeeklyBriefs().catch(() => ({ briefs: [] }));
  const matchingBrief = weeklyBriefs.briefs.find(
    (b) => b.constituency_name.toLowerCase() === item.name.toLowerCase()
  );

  return (
    <div className="page-shell product-shell" data-product="sansaddarpan">
      <SiteHeader active="sansaddarpan-constituencies" product="sansaddarpan" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame sansaddarpan-frame">
          <nav className="sansaddarpan-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">AgentSabha</Link>
            <span>/</span>
            <Link href="/sansaddarpan">SansadDarpan</Link>
            <span>/</span>
            <Link href="/sansaddarpan/constituencies">Welfare</Link>
            <span>/</span>
            <span aria-current="page">{item.name}</span>
          </nav>

          <section className="sansaddarpan-masthead">
            <div className="sansaddarpan-masthead-copy">
              <p className="eyebrow">CONSTITUENCY WELFARE PROFILE</p>
              <h1 className="product-title">{item.name}</h1>
              <p className="hero-body">
                {item.state} · MP: {item.mp_name}
              </p>
              <p className="frame-note">{item.top_gap}</p>
              <div className="hero-actions sansaddarpan-hero-actions">
                {matchingBrief ? (
                  <Link className="secondary-button button-link" href={`/sansaddarpan/weekly-briefs/${matchingBrief.id}`}>
                    Read this week&apos;s brief
                  </Link>
                ) : null}
                <Link className="outline-button button-link" href="/sansaddarpan/methodology">
                  Review methodology
                </Link>
              </div>
            </div>
            <aside className="sansaddarpan-masthead-panel">
              <span className="summary-kicker">Parliamentary linkage</span>
              <strong>{item.raised_in_parliament ? "Raised on record" : "Not yet raised"}</strong>
              <p>
                {item.raised_in_parliament
                  ? "The top welfare gap has been raised in Parliament by the constituency MP."
                  : "The top welfare gap has not yet been raised in Parliament. This is an opportunity for parliamentary action."}
              </p>
            </aside>
          </section>

          <section className="sansaddarpan-stat-strip">
            {item.metrics.map((metric) => (
              <article key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.benchmark}</small>
              </article>
            ))}
          </section>

          <section className="frame-panel full-width-panel sansaddarpan-surface">
            <div className="section-heading compact-heading">
              <div>
                <p>Welfare indicators</p>
                <h2>Current constituency evidence</h2>
              </div>
            </div>
            <div className="dashboard-summary-grid">
              {item.metrics.map((metric) => (
                <article key={metric.label} className="summary-tile sansaddarpan-card">
                  <span className="summary-kicker">{metric.label}</span>
                  <strong>{metric.value}</strong>
                  <p>{metric.benchmark}</p>
                  <span className={`stamp-badge ${metric.status === "positive" ? "resolved" : metric.status === "alert" ? "road" : "water"}`}>
                    {metric.status}
                  </span>
                </article>
              ))}
            </div>
          </section>

          {matchingBrief ? (
            <section className="frame-panel full-width-panel sansaddarpan-surface">
              <div className="section-heading compact-heading">
                <div>
                  <p>What AI found this week</p>
                  <h2>Latest weekly brief</h2>
                </div>
              </div>
              <article className="summary-tile sansaddarpan-card">
                <div className="sansaddarpan-case-header">
                  <span className="summary-kicker">Week {matchingBrief.week_number}, {matchingBrief.year}</span>
                  <span className={`sansaddarpan-status-pill ${matchingBrief.status === "published" ? "published" : "review"}`}>
                    {matchingBrief.status}
                  </span>
                </div>
                <h3>{matchingBrief.headline}</h3>
                <p>{matchingBrief.constituency_name}, {matchingBrief.constituency_state}</p>
                <Link className="secondary-button forum-open-link" href={`/sansaddarpan/weekly-briefs/${matchingBrief.id}`}>
                  Read full brief
                </Link>
              </article>
            </section>
          ) : null}

          <section className="frame-panel full-width-panel sansaddarpan-surface">
            <div className="section-heading compact-heading">
              <div>
                <p>Parliamentary actions available</p>
                <h2>Questions the MP could file</h2>
              </div>
            </div>
            <div className="dashboard-summary-grid">
              {item.metrics
                .filter((m) => m.status === "alert" || m.status === "pending")
                .map((metric) => (
                  <article key={metric.label} className="summary-tile sansaddarpan-card">
                    <span className="summary-kicker">Suggested question</span>
                    <h3>{metric.label}</h3>
                    <p>
                      Will the concerned Minister be pleased to state whether the Government has reviewed the current{" "}
                      {metric.label.toLowerCase()} situation in {item.name}, {item.state}, given that the constituency shows{" "}
                      {metric.value} against the benchmark of {metric.benchmark}?
                    </p>
                    <span className={`stamp-badge ${metric.status === "alert" ? "road" : "water"}`}>
                      Priority: {metric.status === "alert" ? "High" : "Medium"}
                    </span>
                  </article>
                ))}
              {item.metrics.filter((m) => m.status === "alert" || m.status === "pending").length === 0 ? (
                <article className="summary-tile sansaddarpan-card sansaddarpan-placeholder-card">
                  <span className="summary-kicker">All clear</span>
                  <h3>No urgent parliamentary actions identified</h3>
                  <p>All welfare metrics for this constituency are at or above benchmark. The MP may choose to highlight this as a success story.</p>
                </article>
              ) : null}
            </div>
          </section>
        </section>
      </main>

      <SiteFooter brand="SansadDarpan" note="Constituency welfare shown with benchmark context" endLabel="Scheme evidence made legible" />
    </div>
  );
}
