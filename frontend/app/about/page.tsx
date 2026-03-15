import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function AboutPage() {
  return (
    <div className="page-shell">
      <SiteHeader active="about" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame bharat-ornament-frame">
          <div className="product-intro compact-intro">
            <div>
              <p className="eyebrow">HOW AGENTSABHA WORKS</p>
              <h1 className="product-title">How AgentSabha works</h1>
              <p className="hero-body">Citizen → intake → clustering → MP co-pilot. The live app now uses the same Bharat-first visual grammar without the prototype screen labels.</p>
            </div>
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
                ["01", "Citizen submits", "Citizens can file by web or WhatsApp in Hindi, English, or local bhasha.", "/art/warli-citizen.svg"],
                ["02", "Intake structures", "The intake agent translates, classifies, embeds, and stores a structured issue record.", "/art/warli-submit.svg"],
                ["03", "Clusters emerge", "The clustering agent groups similar reports and marks Tatkal, Rising, Chronic, or Stable.", "/art/warli-cluster.svg"],
                ["04", "Drafts prepared", "The strongest clusters are converted into draft parliamentary instruments for MP review.", "/art/warli-parliament.svg"],
                ["05", "Citizen notified", "When the issue reaches action, the originating citizens can be notified back.", "/art/warli-notify.svg"],
                ["06", "Audit remains public", "Agent logs, counts, and visible public clusters become the credibility layer.", "/art/warli-audit.svg"],
              ].map(([step, title, body, image]) => (
                <article key={step}>
                  <span className="step-number">{step}</span>
                  <div className="step-illustration">
                    <img src={image} alt="" />
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
