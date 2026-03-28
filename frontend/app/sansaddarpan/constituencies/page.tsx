import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSansadDarpanConstituencies } from "@/lib/api";

export default async function SansadDarpanConstituenciesPage() {
  const data = await getSansadDarpanConstituencies();

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

          <section className="sansaddarpan-masthead">
            <div className="sansaddarpan-masthead-copy">
              <p className="eyebrow">CONSTITUENCY WELFARE DASHBOARD</p>
              <h1 className="product-title">Welfare performance linked back to parliamentary accountability</h1>
              <p className="hero-body">
                Constituency welfare is the public-interest bridge between scheme delivery and whether the MP raised the gap on record.
              </p>
              <p className="frame-note">Update frequency: {data.update_frequency}</p>
            </div>
            <aside className="sansaddarpan-masthead-panel">
              <span className="summary-kicker">Current scope</span>
              <strong>{data.constituencies.length} live constituency profiles</strong>
              <p>Each profile links constituency-level welfare gaps back to whether the issue has been raised on the parliamentary record.</p>
            </aside>
          </section>
          <section className="frame-panel full-width-panel sansaddarpan-surface">
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
