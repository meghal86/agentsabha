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
          <div className="product-intro compact-intro">
            <div>
              <p className="eyebrow">CONSTITUENCY WELFARE DASHBOARD</p>
              <h1 className="product-title">Welfare performance linked back to parliamentary accountability</h1>
              <p className="hero-body">
                Constituency welfare is the public-interest bridge between scheme delivery and whether the MP raised the gap on record.
              </p>
              <p className="frame-note">Update frequency: {data.update_frequency}</p>
            </div>
          </div>

          <SansadDarpanSubnav active="constituencies" />

          <section className="frame-panel full-width-panel sansaddarpan-surface">
            <div className="dashboard-summary-grid">
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

      <SiteFooter note="SansadDarpan · Welfare evidence linked to parliamentary accountability" />
    </div>
  );
}
