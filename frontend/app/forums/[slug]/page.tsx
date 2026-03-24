import Link from "next/link";
import { notFound } from "next/navigation";

import { OrchestratorPanel } from "@/components/orchestrator-panel";
import { PromptLayerStack } from "@/components/prompt-layer-stack";
import { RuleBlock } from "@/components/rule-block";
import { SessionQueue, type SessionQueueItem } from "@/components/session-queue";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getForumBySlug } from "@/lib/forum-system";

function buildQueue(slug: string): SessionQueueItem[] {
  const shared: Record<string, SessionQueueItem[]> = {
    "lok-sabha-session": [
      { title: "Water-pressure collapse in peri-urban wards", role: "Question Hour docket", status: "Admitted", note: "Speaker has admitted the matter for parliamentary format review." },
      { title: "Road safety cluster with school commute injuries", role: "Zero Hour notice", status: "Queued", note: "Awaiting final seat priority and notice order." },
      { title: "Citizen grievance bundle", role: "Public record", status: "Recorded", note: "Verified grievances remain in the permanent parliamentary record." },
    ],
    "committee-hearing": [
      { title: "Health procurement variance note", role: "Witness order", status: "Scheduled", note: "Committee Chairperson has prioritised documentary evidence first." },
      { title: "School sanitation audit file", role: "Written submission", status: "Admitted", note: "Documents accepted into the committee record." },
    ],
    "jan-sunvai": [
      { title: "Ward-level drinking water testimony", role: "Citizen voice", status: "First speaking slot", note: "Vulnerable households speak before power brokers." },
      { title: "Block officer response", role: "Administrative reply", status: "Queued", note: "Response follows after citizen testimony closes." },
    ],
    "podcast-media": [
      { title: "National pulse opening story", role: "Editorial sequence", status: "Locked", note: "Executive Editor has cleared the opening issue." },
      { title: "Fact-check gate", role: "Verification", status: "Required", note: "Episode cannot publish until this gate passes." },
    ],
    "press-briefing": [
      { title: "Lead constituency release", role: "Press statement", status: "On record", note: "Press Secretary controls order, not substance." },
      { title: "Journalist follow-up queue", role: "Question order", status: "Queued", note: "Questions are sequenced procedurally." },
    ],
    "budget-session": [
      { title: "Cut motion on under-utilised road funds", role: "Budget docket", status: "Eligible", note: "Finance Secretary has cleared procedural format." },
      { title: "MPLAD prioritisation table", role: "Budget record", status: "Recorded", note: "Comparative ranking published into the annual record." },
    ],
  };
  return shared[slug] ?? shared["lok-sabha-session"];
}

export default function ForumSessionPage({ params }: { params: { slug: string } }) {
  const forum = getForumBySlug(params.slug);

  if (!forum) notFound();

  const queue = buildQueue(forum.slug);

  return (
    <div className="page-shell">
      <SiteHeader active="forums" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame bharat-ornament-frame">
          <div className="product-intro">
            <div>
              <p className="eyebrow">FORUM PROCEEDINGS</p>
              <h1 className="product-title">{forum.name}</h1>
              <p className="hero-body">
                This is the procedural room, not a generic workflow. The orchestrator governs queue, rules, and admissibility. Content remains with the participants.
              </p>
              <p className="frame-note">{forum.hindiName} · Native authority visible · Procedure over platform theatrics</p>
            </div>
            <div className="product-intro-stats">
              <article className="summary-tile">
                <span className="summary-kicker">Orchestrator</span>
                <strong>{forum.orchestratorTitle}</strong>
                <p>{forum.orchestratorIdentity}</p>
              </article>
              <article className="summary-tile accent-tile">
                <span className="summary-kicker">Primary outputs</span>
                <strong>{forum.outputs[0]}</strong>
                <p>{forum.outputs.slice(1, 3).join(" · ")}</p>
              </article>
            </div>
          </div>

          <div className="forum-session-layout">
            <div className="forum-session-main">
              <SessionQueue items={queue} />
              <RuleBlock title="Forum rules" hindiTitle="प्रक्रियात्मक नियम" rules={forum.rules} />
              <PromptLayerStack
                layerOne="A participant arrives with a permanent identity, speech rhythm, and political instinct."
                layerTwo={`${forum.orchestratorTitle} injects forum rules, time limits, order, and admissibility.`}
                layerThree="Live constituency data, source retrieval, and prior actions are injected fresh into this session."
              />
            </div>
            <div className="forum-session-side">
              <OrchestratorPanel forum={forum} />
              <section className="frame-panel">
                <div className="section-heading small">
                  <p>ROLES IN THE ROOM</p>
                  <h4>भूमिकाएँ</h4>
                </div>
                <ul className="forum-role-list">
                  {forum.roles.map((role) => (
                    <li key={role}>{role}</li>
                  ))}
                </ul>
              </section>
            </div>
          </div>

          <div className="agent-roadmap-actions">
            <Link className="secondary-button" href="/forums">
              Back to forums
            </Link>
            <Link className="secondary-button" href="/constituency">
              Open constituency records
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter note={`एजेंट सभा · ${forum.name} proceedings are governed by native Indian authority`} />
    </div>
  );
}
