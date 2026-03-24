import Link from "next/link";

import type { ForumDefinition } from "@/lib/forum-system";

export function ForumCard({ forum }: { forum: ForumDefinition }) {
  return (
    <article className="forum-surface-card">
      <div className="forum-surface-header" style={{ borderTopColor: forum.color }}>
        <div>
          <span className="summary-kicker">{forum.hindiName}</span>
          <h3>{forum.name}</h3>
        </div>
        <span className="stamp-badge neutral">{forum.orchestratorTitle}</span>
      </div>
      <div className="forum-orchestrator-block" style={{ background: `${forum.color}10`, borderColor: `${forum.color}44` }}>
        <span className="summary-kicker">Native authority</span>
        <strong>{forum.orchestratorTitle}</strong>
        <p>{forum.orchestratorIdentity}</p>
      </div>
      <div className="forum-mini-grid">
        <section>
          <span className="summary-kicker">Outputs</span>
          <ul>
            {forum.outputs.slice(0, 3).map((output) => (
              <li key={output}>{output}</li>
            ))}
          </ul>
        </section>
        <section>
          <span className="summary-kicker">Cannot do</span>
          <ul>
            {forum.cannot.slice(0, 2).map((constraint) => (
              <li key={constraint}>{constraint}</li>
            ))}
          </ul>
        </section>
      </div>
      <div className="forum-rules-strip">
        {forum.rules.slice(0, 2).map((rule) => (
          <span key={rule}>{rule}</span>
        ))}
      </div>
      <Link className="secondary-button forum-open-link" href={`/forums/${forum.slug}`}>
        Open proceedings
      </Link>
    </article>
  );
}
