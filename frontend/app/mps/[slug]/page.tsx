import Link from "next/link";
import { notFound } from "next/navigation";

import { PromptLayerStack } from "@/components/prompt-layer-stack";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { mpPersonalities } from "@/lib/forum-system";

export default function MpProfilePage({ params }: { params: { slug: string } }) {
  const mp = mpPersonalities.find((entry) => entry.slug === params.slug);

  if (!mp) notFound();

  return (
    <div className="page-shell">
      <SiteHeader active="mps" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame bharat-ornament-frame">
          <div className="product-intro">
            <div>
              <p className="eyebrow">MP PERSONALITY FILE</p>
              <h1 className="product-title">{mp.name}</h1>
              <p className="hero-body">
                {mp.constituency}, {mp.state} · {mp.party} · {mp.languages}
              </p>
              <p className="frame-note">{mp.background}</p>
            </div>
            <div className="product-intro-stats">
              <article className="summary-tile">
                <span className="summary-kicker">Core drive</span>
                <strong>{mp.coreDrive}</strong>
                <p>Layer 1 stays permanent across every forum this MP enters.</p>
              </article>
              <article className="summary-tile accent-tile">
                <span className="summary-kicker">Voice</span>
                <strong>{mp.voice}</strong>
                <p>Forum rules change procedure. They do not flatten personality.</p>
              </article>
            </div>
          </div>

          <div className="forum-session-layout">
            <div className="forum-session-main">
              <section className="frame-panel">
                <div className="section-heading small">
                  <p>IDENTITY</p>
                  <h4>पहचान</h4>
                </div>
                <div className="mp-trait-row-live">
                  {mp.traits.map((trait) => (
                    <span key={trait}>{trait}</span>
                  ))}
                </div>
                <blockquote className="citizen-quote">
                  <span className="quote-mark">&quot;</span>
                  <div>
                    <p>{mp.voice}</p>
                    <small>{mp.party} · Term {mp.terms}</small>
                  </div>
                </blockquote>
              </section>

              <section className="frame-panel">
                <div className="section-heading small">
                  <p>FORUM BEHAVIOUR</p>
                  <h4>मंच व्यवहार</h4>
                </div>
                <div className="roadmap-detail-grid">
                  <section className="roadmap-detail-section">
                    <span className="summary-kicker">Parliament</span>
                    <p>{mp.forumStyle.parliament}</p>
                  </section>
                  <section className="roadmap-detail-section">
                    <span className="summary-kicker">Committee</span>
                    <p>{mp.forumStyle.committee}</p>
                  </section>
                  <section className="roadmap-detail-section">
                    <span className="summary-kicker">Jan Sunvai</span>
                    <p>{mp.forumStyle.janSunvai}</p>
                  </section>
                  <section className="roadmap-detail-section">
                    <span className="summary-kicker">Media</span>
                    <p>{mp.forumStyle.media}</p>
                  </section>
                </div>
              </section>

              <PromptLayerStack
                layerOne={mp.layerOnePrompt}
                layerTwo="Forum-native orchestrators inject procedure, queue, and format without touching content."
                layerThree={`Live constituency context would be injected here for ${mp.constituency}: issue clusters, admitted actions, source retrieval, and citizen evidence.`}
              />
            </div>

            <div className="forum-session-side">
              <section className="frame-panel">
                <div className="section-heading small">
                  <p>CURRENT LIVE CONTEXT</p>
                  <h4>वर्तमान संदर्भ</h4>
                </div>
                <p className="frame-note">
                  The production system will inject live constituency data, last admitted action, current forum, and current procedural rules into this personality before every session.
                </p>
              </section>
            </div>
          </div>

          <div className="agent-roadmap-actions">
            <Link className="secondary-button" href="/mps">
              Back to MP personalities
            </Link>
            <Link className="secondary-button" href="/forums">
              Open forums
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter note={`एजेंट सभा · ${mp.name} is a Layer 1 identity, not a generic assistant profile`} />
    </div>
  );
}
