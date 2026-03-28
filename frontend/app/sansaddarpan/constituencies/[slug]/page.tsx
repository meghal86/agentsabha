import { notFound } from "next/navigation";

import { SansadDarpanSubnav } from "@/components/sansaddarpan-subnav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSansadDarpanConstituency } from "@/lib/api";

export default async function SansadDarpanConstituencyPage({ params }: { params: { slug: string } }) {
  let item;
  try {
    item = await getSansadDarpanConstituency(params.slug);
  } catch {
    notFound();
  }

  return (
    <div className="page-shell product-shell" data-product="sansaddarpan">
      <SiteHeader active="sansaddarpan" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame sansaddarpan-frame">
          <div className="product-intro compact-intro">
            <div>
              <p className="eyebrow">CONSTITUENCY WELFARE PROFILE</p>
              <h1 className="product-title">{item.name}</h1>
              <p className="hero-body">
                {item.state} · MP: {item.mp_name}
              </p>
              <p className="frame-note">{item.top_gap}</p>
            </div>
          </div>

          <SansadDarpanSubnav active="constituencies" />

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
        </section>
      </main>

      <SiteFooter note="SansadDarpan · Constituency welfare shown with benchmark context" />
    </div>
  );
}
