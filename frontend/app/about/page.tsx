import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function AboutPage() {
  return (
    <div className="page-shell">
      <SiteHeader active="about" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame">
          <div className="screen-label-row">
            <div>
              <p className="eyebrow">SYSTEM EXPLAINER</p>
              <h2>How AgentSabha works</h2>
            </div>
            <p className="frame-note">Citizen → intake → clustering → MP co-pilot. Same visual grammar as the approved product screens.</p>
          </div>

          <section className="frame-panel full-width-panel">
            <div className="section-heading compact-heading">
              <div>
                <p>यह कैसे काम करता है</p>
                <h2>Citizen to cluster to Parliament</h2>
              </div>
            </div>
            <div className="steps-grid">
              {[
                ["01", "Citizen submits", "Citizens can file by web or WhatsApp in Hindi, English, or local bhasha."],
                ["02", "Intake structures", "The intake agent translates, classifies, embeds, and stores a structured issue record."],
                ["03", "Clusters emerge", "The clustering agent groups similar reports and marks Tatkal, Rising, Chronic, or Stable."],
                ["04", "Drafts prepared", "The strongest clusters are converted into draft parliamentary instruments for MP review."],
                ["05", "Citizen notified", "When the issue reaches action, the originating citizens can be notified back."],
                ["06", "Audit remains public", "Agent logs, counts, and visible public clusters become the credibility layer."],
              ].map(([step, title, body]) => (
                <article key={step}>
                  <span className="step-number">{step}</span>
                  <div className="step-illustration">
                    <img src="/prototype/art/warli-scene.svg" alt="" />
                  </div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>

      <SiteFooter note="एजेंट सभा · Design principles, data dignity, and public accountability" />
    </div>
  );
}
