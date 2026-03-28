import Link from "next/link";

import { SansadDarpanSubnav } from "@/components/sansaddarpan-subnav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSansadDarpanConstituencies } from "@/lib/api";

export default async function SansadDarpanConstituenciesPage() {
  const data = await getSansadDarpanConstituencies();

  return (
    <div className="page-shell product-shell" data-product="sansaddarpan">
      <SiteHeader active="sansaddarpan" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame sansaddarpan-frame">
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
              <strong>{data.constituencies.length} seeded constituencies</strong>
              <p>Next step is a real constituency-district crosswalk and welfare ingestion pipeline. This page is ready for that migration.</p>
            </aside>
          </section>

          <SansadDarpanSubnav active="constituencies" />

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
            </div>
          </section>
        </section>
      </main>

      <SiteFooter brand="SansadDarpan" note="Welfare evidence linked to parliamentary accountability" endLabel="Evidence with benchmark context" />
    </div>
  );
}
