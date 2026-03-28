import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <div className="page-shell product-shell" data-product="sansaddarpan">
      <SiteHeader product="sansaddarpan" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame sansaddarpan-frame">
          <section className="frame-panel full-width-panel sansaddarpan-surface sansaddarpan-not-found">
            <span className="summary-kicker">404 · PUBLIC RECORD NOT FOUND</span>
            <h1>That page is not in the current public register.</h1>
            <p>
              The link may be outdated, the record may not be published yet, or the route may not exist in this product surface.
            </p>
            <div className="hero-actions sansaddarpan-hero-actions">
              <Link className="secondary-button button-link" href="/sansaddarpan">
                Back to SansadDarpan
              </Link>
              <Link className="outline-button button-link" href="/">
                Open AgentSabha
              </Link>
            </div>
          </section>
        </section>
      </main>

      <SiteFooter brand="SansadDarpan" note="Branded fallback for missing public records" endLabel="Public register" />
    </div>
  );
}
