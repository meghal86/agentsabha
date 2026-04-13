import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSansadDarpanWeeklyBrief } from "@/lib/api";

export default async function SansadDarpanWeeklyBriefDetailPage({ params }: { params: { id: string } }) {
  let brief;
  try {
    brief = await getSansadDarpanWeeklyBrief(params.id);
  } catch {
    notFound();
  }

  const videoScript = brief.video_script_json || {};
  const reels = brief.reel_scripts || [];
  const hindi = brief.hindi_translation || {};

  return (
    <div className="page-shell product-shell" data-product="sansaddarpan">
      <SiteHeader active="sansaddarpan-weekly-briefs" product="sansaddarpan" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame sansaddarpan-frame">
          <nav className="sansaddarpan-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">AgentSabha</Link>
            <span>/</span>
            <Link href="/sansaddarpan">SansadDarpan</Link>
            <span>/</span>
            <Link href="/sansaddarpan/weekly-briefs">Weekly Briefs</Link>
            <span>/</span>
            <span aria-current="page">{brief.constituency_name}</span>
          </nav>

          <section className="sansaddarpan-masthead">
            <div className="sansaddarpan-masthead-copy">
              <p className="eyebrow">WEEK {brief.week_number}, {brief.year} · CONSTITUENCY INTELLIGENCE BRIEF</p>
              <h1 className="product-title">{brief.headline}</h1>
              <p className="hero-body">
                {brief.constituency_name}, {brief.constituency_state} · MP: {brief.mp_name || "Not mapped"}
              </p>
              <div className="hero-actions sansaddarpan-hero-actions">
                <Link className="secondary-button button-link" href="#whatsapp-brief">
                  Jump to MP brief
                </Link>
                <Link className="outline-button button-link" href="#video-script">
                  Open video script
                </Link>
              </div>
            </div>
            <aside className="sansaddarpan-masthead-panel">
              <span className="summary-kicker">Brief status</span>
              <strong>{brief.status}</strong>
              <p>AI-generated constituency intelligence brief. Every fact includes a data source. The MP is framed as the hero who could act.</p>
            </aside>
          </section>

          <section className="frame-panel full-width-panel sansaddarpan-surface">
            <div className="section-heading compact-heading">
              <div>
                <p>Constituency intelligence brief</p>
                <h2>Full research output</h2>
              </div>
            </div>
            <article className="summary-tile sansaddarpan-card">
              <div className="weekly-brief-markdown" style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
                {brief.brief_markdown}
              </div>
            </article>
          </section>

          {hindi.headline_hi || hindi.standfirst_hi ? (
            <section className="frame-panel full-width-panel sansaddarpan-surface">
              <div className="section-heading compact-heading">
                <div>
                  <p>हिंदी अनुवाद</p>
                  <h2>Hindi translation</h2>
                </div>
              </div>
              <div className="dashboard-summary-grid">
                {hindi.headline_hi ? (
                  <article className="summary-tile sansaddarpan-tile">
                    <span className="summary-kicker">शीर्षक</span>
                    <strong>{hindi.headline_hi}</strong>
                  </article>
                ) : null}
                {hindi.standfirst_hi ? (
                  <article className="summary-tile sansaddarpan-tile">
                    <span className="summary-kicker">उपशीर्षक</span>
                    <p>{hindi.standfirst_hi}</p>
                  </article>
                ) : null}
                {hindi.mp_brief_hi ? (
                  <article className="summary-tile sansaddarpan-tile">
                    <span className="summary-kicker">सांसद संक्षिप्त</span>
                    <p>{hindi.mp_brief_hi}</p>
                  </article>
                ) : null}
              </div>
            </section>
          ) : null}

          <section id="video-script" className="frame-panel full-width-panel sansaddarpan-surface">
            <div className="section-heading compact-heading">
              <div>
                <p>Video script</p>
                <h2>{videoScript.youtube_title || "YouTube / Instagram script"}</h2>
              </div>
            </div>
            {videoScript.youtube_description ? (
              <p className="frame-note" style={{ marginBottom: "1.5rem" }}>{videoScript.youtube_description}</p>
            ) : null}
            <div className="dashboard-summary-grid">
              {videoScript.hook ? (
                <article className="summary-tile sansaddarpan-card">
                  <span className="summary-kicker">Hook</span>
                  <p>{videoScript.hook}</p>
                </article>
              ) : null}
              {videoScript.priya_intro ? (
                <article className="summary-tile sansaddarpan-card">
                  <span className="summary-kicker">Priya — Introduction</span>
                  <p>{videoScript.priya_intro}</p>
                </article>
              ) : null}
              {videoScript.arjun_data_segment ? (
                <article className="summary-tile sansaddarpan-card">
                  <span className="summary-kicker">Arjun — Data segment</span>
                  <p>{videoScript.arjun_data_segment}</p>
                </article>
              ) : null}
              {videoScript.deep_dive ? (
                <article className="summary-tile sansaddarpan-card">
                  <span className="summary-kicker">Deep dive</span>
                  <p>{videoScript.deep_dive}</p>
                </article>
              ) : null}
              {videoScript.solution_segment ? (
                <article className="summary-tile sansaddarpan-card">
                  <span className="summary-kicker">Solution segment</span>
                  <p>{videoScript.solution_segment}</p>
                </article>
              ) : null}
              {videoScript.cta ? (
                <article className="summary-tile sansaddarpan-card">
                  <span className="summary-kicker">Call to action</span>
                  <p>{videoScript.cta}</p>
                </article>
              ) : null}
            </div>
          </section>

          {reels.length > 0 ? (
            <section className="frame-panel full-width-panel sansaddarpan-surface">
              <div className="section-heading compact-heading">
                <div>
                  <p>Short-form content</p>
                  <h2>{reels.length} Reel scripts</h2>
                </div>
              </div>
              <div className="sansaddarpan-module-grid">
                {reels.map((reel, index) => (
                  <article key={index} className="summary-tile sansaddarpan-card">
                    <span className="summary-kicker">Reel {index + 1}</span>
                    <h3>{reel.hook}</h3>
                    <p>{reel.script}</p>
                    <div className="sansaddarpan-badge-row" style={{ marginTop: "0.75rem" }}>
                      <span className="stamp-badge">{reel.caption_en}</span>
                    </div>
                    <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.5rem" }}>{reel.caption_hi}</p>
                    {reel.hashtags ? (
                      <div className="sansaddarpan-tl-tags" style={{ marginTop: "0.5rem" }}>
                        {(Array.isArray(reel.hashtags)
                          ? reel.hashtags
                          : String(reel.hashtags).split(/[\s,]+/).filter(Boolean)
                        ).map((tag: string) => (
                          <span key={tag} className="sansaddarpan-tag">{tag}</span>
                        ))}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section id="whatsapp-brief" className="frame-panel full-width-panel sansaddarpan-surface">
            <div className="section-heading compact-heading">
              <div>
                <p>MP WhatsApp brief</p>
                <h2>One-page summary for the MP</h2>
              </div>
            </div>
            <article className="summary-tile sansaddarpan-card" style={{ maxWidth: "640px" }}>
              <span className="summary-kicker">English</span>
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, fontFamily: "var(--font-body, sans-serif)" }}>
                {brief.mp_whatsapp_brief}
              </div>
            </article>
            {hindi.whatsapp_brief_hi ? (
              <article className="summary-tile sansaddarpan-card" style={{ maxWidth: "640px", marginTop: "1rem" }}>
                <span className="summary-kicker">हिंदी</span>
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, fontFamily: "var(--font-hindi, sans-serif)" }}>
                  {hindi.whatsapp_brief_hi}
                </div>
              </article>
            ) : null}
          </section>

          <section className="frame-panel full-width-panel sansaddarpan-surface">
            <div className="section-heading compact-heading">
              <div>
                <p>Share this brief</p>
                <h2>Help citizens discover what AI found</h2>
              </div>
            </div>
            <div className="sansaddarpan-quick-links">
              <Link className="secondary-button button-link" href="/sansaddarpan/weekly-briefs">
                Browse all briefs
              </Link>
              <Link className="outline-button button-link" href={`/sansaddarpan/constituencies`}>
                Explore constituencies
              </Link>
            </div>
          </section>
        </section>
      </main>

      <SiteFooter
        brand="SansadDarpan"
        note="AI-generated constituency intelligence brief with source-backed findings"
        endLabel="Weekly brief"
      />
    </div>
  );
}
