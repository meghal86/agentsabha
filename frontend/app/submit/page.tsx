import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SubmitIssueForm } from "@/components/submit-issue-form";
import { getConstituencies } from "@/lib/api";

export default async function SubmitPage() {
  const directory = await getConstituencies().catch(() => ({ constituencies: [] }));

  return (
    <div className="page-shell">
      <SiteHeader active="submit" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame narrow-screen">
          <div className="screen-label-row">
            <div>
              <p className="eyebrow">DESKTOP SCREEN</p>
              <h2>03 — Submit Issue</h2>
            </div>
            <p className="frame-note">Core citizen action. Live form flow running on top of the approved composition.</p>
          </div>

          <div className="submit-masthead frame-panel">
            <div>
              <p className="eyebrow">CITIZEN ENTRY DESK</p>
              <h3>Write once. Let the constituency agent do the routing.</h3>
            </div>
            <div className="submit-summary-grid">
              <div className="meta-stat">
                <span className="meta-label">Languages</span>
                <strong>Hindi + English + local bhasha</strong>
              </div>
              <div className="meta-stat">
                <span className="meta-label">Evidence</span>
                <strong>Voice, photo, or text</strong>
              </div>
              <div className="meta-stat">
                <span className="meta-label">Routing</span>
                <strong>Agent auto-detects category</strong>
              </div>
            </div>
          </div>

          <div className="submit-layout">
            <div className="submit-shell">
              <div className="section-heading centered">
                <h2>अपनी समस्या दर्ज करें</h2>
                <h3>Submit Your Issue</h3>
              </div>

              <div className="step-line">
                <span className="step-index current">1</span>
                <span></span>
                <span className="step-index current">2</span>
                <span></span>
                <span className="step-index">3</span>
              </div>

              <SubmitIssueForm constituencies={directory.constituencies} />

              <div className="whatsapp-divider">— या / or —</div>
              <a className="whatsapp-button" href="https://wa.me/919999999999">
                WhatsApp se turant bhejein / Submit via WhatsApp instantly
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter note="एजेंट सभा · Citizen entry designed for trust" />
    </div>
  );
}
