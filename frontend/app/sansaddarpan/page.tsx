import Link from "next/link";

import { SansadDarpanSubnav } from "@/components/sansaddarpan-subnav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSansadDarpanOverview } from "@/lib/api";

export default async function SansadDarpanPage() {
  const overview = await getSansadDarpanOverview();

  return (
    <div className="page-shell product-shell" data-product="sansaddarpan">
      <SiteHeader active="sansaddarpan" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame sansaddarpan-frame">
          <div className="product-intro">
            <div>
              <p className="eyebrow">PUBLIC ACCOUNTABILITY LAYER</p>
              <h1 className="product-title">{overview.product_name}</h1>
              <p className="sansaddarpan-hindi-title">{overview.hindi_name}</p>
              <p className="hero-body">{overview.tagline}</p>
              <p className="frame-note">{overview.layer_placement}</p>
            </div>
            <div className="product-intro-stats product-intro-stats-grid">
              <article className="summary-tile sansaddarpan-tile">
                <span className="summary-kicker">Launch discipline</span>
                <strong>{overview.launch_window}</strong>
                <p>Three-feature MVP: participation, welfare, and verified procedural accountability.</p>
              </article>
              <article className="summary-tile sansaddarpan-tile accent-tile">
                <span className="summary-kicker">Primary users</span>
                <strong>{overview.primary_users.length} user groups</strong>
                <p>{overview.primary_users.join(" · ")}</p>
              </article>
            </div>
          </div>

          <SansadDarpanSubnav active="overview" />

          <section className="frame-panel full-width-panel sansaddarpan-surface">
            <div className="section-heading compact-heading">
              <div>
                <p>Parliamentary transparency dashboard</p>
                <h2>The three public accountability systems</h2>
              </div>
            </div>
            <div className="dashboard-summary-grid">
              {overview.sections.map((section) => (
                <article key={section.slug} className="summary-tile sansaddarpan-card">
                  <span className="summary-kicker">
                    {section.layer} · {section.hindi_title}
                  </span>
                  <h3>{section.title}</h3>
                  <p>{section.summary}</p>
                  <div className="sansaddarpan-metric-row">
                    <strong>{section.metric_value}</strong>
                    <span>{section.metric_label}</span>
                  </div>
                  <Link className="secondary-button forum-open-link" href={section.href}>
                    Open module
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <section className="frame-panel full-width-panel sansaddarpan-surface">
            <div className="section-heading compact-heading">
              <div>
                <p>How it fits the shared architecture</p>
                <h2>One codebase, different evidence mode</h2>
              </div>
            </div>
            <div className="dashboard-summary-grid">
              <article className="summary-tile sansaddarpan-tile">
                <span className="summary-kicker">Layer 1</span>
                <strong>Permanent roles</strong>
                <p>Speaker, MP, Minister, Journalist, and other roles remain the runtime actors. SansadDarpan does not replace them.</p>
              </article>
              <article className="summary-tile sansaddarpan-tile">
                <span className="summary-kicker">Layer 2</span>
                <strong>Forum rules</strong>
                <p>Lok Sabha, Zero Hour, Committee, and Jan Sunvai sessions still govern procedure and admissibility.</p>
              </article>
              <article className="summary-tile sansaddarpan-tile accent-tile">
                <span className="summary-kicker">Layer 3</span>
                <strong>Public evidence surface</strong>
                <p>SansadDarpan exposes verified parliamentary records, welfare metrics, and procedural review in a journalist-grade interface.</p>
              </article>
            </div>
          </section>
        </section>
      </main>

      <SiteFooter note="SansadDarpan · Parliamentary transparency, accountability, and public record" />
    </div>
  );
}
