import Link from "next/link";

import { SansadDarpanSubnav } from "@/components/sansaddarpan-subnav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSansadDarpanMethodology } from "@/lib/api";

export default async function SansadDarpanMethodologyPage() {
  const data = await getSansadDarpanMethodology();

  return (
    <div className="page-shell product-shell" data-product="sansaddarpan">
      <SiteHeader active="sansaddarpan" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame sansaddarpan-frame">
          <nav className="sansaddarpan-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">AgentSabha</Link>
            <span>/</span>
            <Link href="/sansaddarpan">SansadDarpan</Link>
            <span>/</span>
            <span aria-current="page">Methodology</span>
          </nav>

          <section className="sansaddarpan-masthead">
            <div className="sansaddarpan-masthead-copy">
              <p className="eyebrow">PUBLIC METHODOLOGY</p>
              <h1 className="product-title">{data.title}</h1>
              <p className="hero-body">Every published number, benchmark, and flag should be one click away from how it was produced.</p>
              <div className="hero-actions sansaddarpan-hero-actions">
                <Link className="secondary-button button-link" href="/sansaddarpan/mps">
                  Open scorecards
                </Link>
                <Link className="outline-button button-link" href="/sansaddarpan/rule-deviations">
                  Review case registry
                </Link>
              </div>
            </div>
            <aside className="sansaddarpan-masthead-panel">
              <span className="summary-kicker">Method principle</span>
              <strong>Evidence must be inspectable</strong>
              <p>Every score, welfare benchmark, and procedural flag should link back to its inputs, logic, and publication threshold.</p>
            </aside>
          </section>

          <SansadDarpanSubnav active="methodology" />

          <section className="frame-panel full-width-panel sansaddarpan-surface">
            <div className="section-heading compact-heading">
              <div>
                <p>Design principle</p>
                <h2>Transparency of methodology is a product feature</h2>
              </div>
            </div>
            <ul className="sansaddarpan-source-list">
              {data.principles.map((principle) => (
                <li key={principle}>{principle}</li>
              ))}
            </ul>
          </section>

          <section className="frame-panel full-width-panel sansaddarpan-surface">
            <div className="dashboard-summary-grid">
              {data.sections.map((section) => (
                <article key={section.title} className="summary-tile sansaddarpan-card">
                  <span className="summary-kicker">{section.title}</span>
                  <p>{section.body}</p>
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>

      <SiteFooter brand="SansadDarpan" note="Methodology is public, versioned, and product-visible" endLabel="Transparent by design" />
    </div>
  );
}
