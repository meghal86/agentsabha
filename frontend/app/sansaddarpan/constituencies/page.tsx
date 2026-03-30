import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSansadDarpanConstituencies } from "@/lib/api";

export default async function SansadDarpanConstituenciesPage() {
  const data = await getSansadDarpanConstituencies();
  const raisedCount = data.constituencies.filter((item) => item.raised_in_parliament).length;
  const pendingCount = data.constituencies.length - raisedCount;
  const trackedMetrics = data.constituencies.reduce((sum, item) => sum + item.metrics.length, 0);
  const leadProfile = data.constituencies[0];

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
            <span aria-current="page">Welfare</span>
          </nav>

          <section className="sansaddarpan-dashboard-header">
            <div>
              <p className="eyebrow">CONSTITUENCY WELFARE DASHBOARD</p>
              <h1 className="product-title">Welfare performance linked back to parliamentary accountability</h1>
              <p className="hero-body">
                Constituency welfare is the public-interest bridge between scheme delivery and whether the MP raised the gap on record.
              </p>
              <p className="frame-note">Update frequency: {data.update_frequency}</p>
            </div>
          </section>

          <section className="sansaddarpan-monitor-shell">
            <div className="sansaddarpan-monitor-topbar">
              <div className="sansaddarpan-monitor-identity">
                <div className="sansaddarpan-monitor-mark">WF</div>
                <div>
                  <div className="sansaddarpan-monitor-title">Welfare accountability register</div>
                  <div className="sansaddarpan-monitor-sub">Constituency gaps, benchmark deltas, and whether the issue entered the parliamentary record</div>
                </div>
              </div>
              <span className="sansaddarpan-monitor-pill">Constituency evidence layer</span>
              <div className="sansaddarpan-live-wrap">
                <span className="sansaddarpan-live-dot" aria-hidden="true"></span>
                <span className="sansaddarpan-live-label">Benchmark-linked</span>
              </div>
            </div>

            <div className="sansaddarpan-monitor-metrics">
              <article className="sansaddarpan-monitor-metric">
                <strong>{data.constituencies.length}</strong>
                <span>Live constituency welfare profiles in the register</span>
              </article>
              <article className="sansaddarpan-monitor-metric">
                <strong>{raisedCount}</strong>
                <span>Profiles where the top gap has been raised on record</span>
              </article>
              <article className="sansaddarpan-monitor-metric">
                <strong>{pendingCount}</strong>
                <span>Profiles where the gap is still not raised in Parliament</span>
              </article>
              <article className="sansaddarpan-monitor-metric">
                <strong>{trackedMetrics}</strong>
                <span>Welfare metrics currently exposed in the visible layer</span>
              </article>
              <article className="sansaddarpan-monitor-metric">
                <strong>{data.update_frequency}</strong>
                <span>Benchmark refresh cadence for the public welfare layer</span>
              </article>
            </div>

            <div className="sansaddarpan-monitor-body">
              <div className="sansaddarpan-monitor-main">
                <div className="sansaddarpan-sec-label">Constituency watchlist</div>
                {data.constituencies.map((item, index) => (
                  <Link key={item.slug} href={`/sansaddarpan/constituencies/${item.slug}`} className="sansaddarpan-tl-item">
                    <div className="sansaddarpan-tl-label">{index === 0 ? "Lead" : "Watch"}</div>
                    <div className="sansaddarpan-tl-dot-col">
                      <span className={`sansaddarpan-tl-dot ${item.raised_in_parliament ? "healthy" : "warning"}`}></span>
                      {index < data.constituencies.length - 1 ? <span className="sansaddarpan-tl-line"></span> : null}
                    </div>
                    <div className="sansaddarpan-tl-card">
                      <div className="sansaddarpan-tl-title">
                        {item.name}, {item.state}
                      </div>
                      <div className="sansaddarpan-tl-body">{item.top_gap}</div>
                      <div className="sansaddarpan-tl-tags">
                        <span className="sansaddarpan-tag">{item.mp_name}</span>
                        <span className="sansaddarpan-tag">{item.raised_in_parliament ? "Raised on record" : "Not yet raised"}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <aside className="sansaddarpan-monitor-side">
                <div className="sansaddarpan-sec-label">Coverage note</div>
                <div className="sansaddarpan-flag-list">
                  <div className="sansaddarpan-flag-item">
                    <span className="sansaddarpan-flag-icon published"></span>
                    <div>
                      <div className="sansaddarpan-flag-title">Constituency gaps stay tied to Parliament</div>
                      <div className="sansaddarpan-flag-body">The public question is not only what the welfare gap is, but whether the MP raised it on record.</div>
                    </div>
                  </div>
                  <div className="sansaddarpan-flag-item">
                    <span className="sansaddarpan-flag-icon review"></span>
                    <div>
                      <div className="sansaddarpan-flag-title">Crosswalk quality still matters</div>
                      <div className="sansaddarpan-flag-body">The national build-out still depends on better constituency-district mapping and a wider benchmark refresh surface.</div>
                    </div>
                  </div>
                  {leadProfile ? (
                    <div className="sansaddarpan-flag-item">
                      <span className={`sansaddarpan-flag-icon ${leadProfile.raised_in_parliament ? "published" : "archived"}`}></span>
                      <div>
                        <div className="sansaddarpan-flag-title">{leadProfile.name} is the current lead welfare profile</div>
                        <div className="sansaddarpan-flag-body">{leadProfile.top_gap}</div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </aside>
            </div>
          </section>

          <section className="frame-panel full-width-panel sansaddarpan-surface">
            <div className="section-heading compact-heading">
              <div>
                <p>Open constituency profiles</p>
                <h2>Welfare evidence cards with parliamentary linkage</h2>
              </div>
            </div>
            <div className="sansaddarpan-module-grid">
              {data.constituencies.map((item) => (
                <article key={item.slug} className="summary-tile sansaddarpan-card">
                  <span className="summary-kicker">
                    {item.name}, {item.state}
                  </span>
                  <h3>{item.mp_name}</h3>
                  <p>{item.top_gap}</p>
                  <div className="sansaddarpan-badge-row">
                    <span className={`stamp-badge ${item.raised_in_parliament ? "resolved" : "road"}`}>
                      {item.raised_in_parliament ? "Raised in Parliament" : "Not yet raised"}
                    </span>
                  </div>
                  <div className="roadmap-detail-grid">
                    {item.metrics.map((metric) => (
                      <section key={metric.label} className="roadmap-detail-section">
                        <span className="summary-kicker">{metric.label}</span>
                        <strong>{metric.value}</strong>
                        <p>{metric.benchmark}</p>
                      </section>
                    ))}
                  </div>
                  <Link className="secondary-button forum-open-link" href={`/sansaddarpan/constituencies/${item.slug}`}>
                    Open welfare profile
                  </Link>
                </article>
              ))}
              {data.constituencies.length < 3 ? (
                <article className="summary-tile sansaddarpan-card sansaddarpan-placeholder-card">
                  <span className="summary-kicker">Coverage expanding</span>
                  <h3>More constituencies are coming next</h3>
                  <p>The welfare layer is already live, but national profile coverage and benchmark refresh are still being expanded.</p>
                </article>
              ) : null}
            </div>
          </section>
        </section>
      </main>

      <SiteFooter brand="SansadDarpan" note="Welfare evidence linked to parliamentary accountability" endLabel="Evidence with benchmark context" />
    </div>
  );
}
