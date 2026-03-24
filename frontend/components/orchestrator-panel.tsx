import type { ForumDefinition } from "@/lib/forum-system";

export function OrchestratorPanel({ forum }: { forum: ForumDefinition }) {
  return (
    <section className="orchestrator-panel">
      <div className="section-heading small">
        <p>ORCHESTRATOR PANEL</p>
        <h4>{forum.orchestratorTitle}</h4>
      </div>
      <p className="frame-note">{forum.orchestratorIdentity}</p>
      <div className="orchestrator-grid">
        <article>
          <span className="summary-kicker">Can do</span>
          <ul>
            {forum.powers.map((power) => (
              <li key={power}>{power}</li>
            ))}
          </ul>
        </article>
        <article>
          <span className="summary-kicker">Cannot do</span>
          <ul>
            {forum.cannot.map((constraint) => (
              <li key={constraint}>{constraint}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
