import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { mpPersonalities } from "@/lib/forum-system";

export default function MpPersonalitiesPage() {
  return (
    <div className="page-shell">
      <SiteHeader active="mps" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame bharat-ornament-frame">
          <div className="product-intro">
            <div>
              <p className="eyebrow">LAYER 1 ROLE IDENTITIES</p>
              <h1 className="product-title">One Parliament, many voices</h1>
              <p className="hero-body">
                The same forum rules can produce completely different outcomes because each MP has a different biography, language, constituency memory, and parliamentary rhythm.
              </p>
              <p className="frame-note">
                Layer 1 defines who they are. Layer 2 is the forum they enter. Layer 3 is the live constituency context injected into that session.
              </p>
            </div>
            <div className="product-intro-stats">
              <article className="summary-tile">
                <span className="summary-kicker">Personalities mapped</span>
                <strong>{mpPersonalities.length}</strong>
                <p>These are sample personality archetypes for the live product direction, not yet the full 543-member roster.</p>
              </article>
              <article className="summary-tile accent-tile">
                <span className="summary-kicker">Key UX rule</span>
                <strong>Same rulebook, different human voice</strong>
                <p>Users should understand that forum rules shape procedure, while Layer 1 personality shapes tone and emphasis.</p>
              </article>
            </div>
          </div>

          <section className="frame-panel full-width-panel">
            <div className="section-heading compact-heading">
              <div>
                <p>Representative voices</p>
                <h2>MP personality register</h2>
              </div>
            </div>
            <div className="mp-personality-grid">
              {mpPersonalities.map((mp) => (
                <article key={mp.slug} className="mp-personality-card" style={{ borderTopColor: mp.partyColor }}>
                  <div className="mp-personality-head">
                    <div className="mp-avatar-mark" style={{ background: `${mp.partyColor}22`, color: mp.partyColor }}>
                      {mp.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <h3>{mp.name}</h3>
                      <p>
                        {mp.constituency}, {mp.state}
                      </p>
                      <span className="stamp-badge neutral">
                        {mp.party} · Term {mp.terms}
                      </span>
                    </div>
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
                      <small>{mp.languages}</small>
                    </div>
                  </blockquote>
                  <div className="roadmap-detail-grid">
                    <section className="roadmap-detail-section">
                      <span className="summary-kicker">Core drive</span>
                      <p>{mp.coreDrive}</p>
                    </section>
                    <section className="roadmap-detail-section">
                      <span className="summary-kicker">Forum behaviour</span>
                      <ul>
                        <li>{mp.forumStyle.parliament}</li>
                        <li>{mp.forumStyle.committee}</li>
                        <li>{mp.forumStyle.janSunvai}</li>
                        <li>{mp.forumStyle.media}</li>
                      </ul>
                    </section>
                  </div>
                  <div className="roadmap-detail-section full-span">
                    <span className="summary-kicker">Layer 1 prompt fragment</span>
                    <p>{mp.layerOnePrompt}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="frame-panel full-width-panel">
            <div className="section-heading compact-heading">
              <div>
                <p>Three-layer system</p>
                <h2>How a personality becomes a session</h2>
              </div>
            </div>
            <div className="dashboard-summary-grid">
              <article className="summary-tile">
                <span className="summary-kicker">Layer 1</span>
                <strong>Who they are</strong>
                <p>Permanent personality, speech pattern, knowledge memory, non-negotiable values, and constituency instinct.</p>
              </article>
              <article className="summary-tile accent-tile">
                <span className="summary-kicker">Layer 2</span>
                <strong>Where they are</strong>
                <p>Forum rules are injected by the orchestrator: time, output type, speaking order, and procedural constraints.</p>
              </article>
              <article className="summary-tile">
                <span className="summary-kicker">Layer 3</span>
                <strong>What they know now</strong>
                <p>Live context arrives fresh from constituency data, cluster state, prior actions, and source retrieval.</p>
              </article>
            </div>
          </section>
        </section>
      </main>

      <SiteFooter note="एजेंट सभा · Personality is permanent, forum is procedural, context is live" />
    </div>
  );
}
