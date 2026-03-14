import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getConstituencyActions, getConstituencyIssues, getConstituencySummary } from "@/lib/api";

function categoryLabel(category: string | null) {
  switch (category) {
    case "road":
      return "सड़क / Roads";
    case "water":
      return "पानी / Water";
    case "power":
      return "बिजली / Electricity";
    case "health":
      return "स्वास्थ्य / Health";
    case "education":
      return "शिक्षा / Education";
    case "employment":
      return "रोज़गार / Employment";
    default:
      return "अन्य / Other";
  }
}

function badgeClass(category: string | null) {
  switch (category) {
    case "road":
      return "road";
    case "water":
      return "water";
    case "power":
      return "electricity";
    case "health":
      return "health";
    case "education":
      return "education";
    default:
      return "neutral";
  }
}

function toneWidth(severity: number | null) {
  return `${Math.max(12, Math.min(96, Math.round((severity ?? 4) * 10)))}%`;
}

export default async function ConstituencyPage({ params }: { params: { id: string } }) {
  const [summary, issues, actions] = await Promise.all([
    getConstituencySummary(params.id).catch(() => null),
    getConstituencyIssues(params.id).catch(() => ({ clusters: [], total: 0, page: 1 })),
    getConstituencyActions(params.id).catch(() => ({ actions: [] })),
  ]);

  const topCategory = issues.clusters[0];
  const totalReports = issues.clusters.reduce((sum, cluster) => sum + cluster.count, 0);
  const tatkalCount = issues.clusters.filter((cluster) => cluster.badge === "tatkal").length;
  const actionRows = actions.actions.slice(0, 3);

  return (
    <div className="page-shell">
      <SiteHeader active="constituency" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame">
          <div className="screen-label-row">
            <div>
              <p className="eyebrow">DESKTOP SCREEN</p>
              <h2>02 — Constituency Dashboard</h2>
            </div>
            <p className="frame-note">Primary operational view for MPs, journalists, and district observers.</p>
          </div>

          <div className="dashboard-masthead frame-panel">
            <div className="dashboard-header">
              <div>
                <p className="breadcrumbs">India → {summary?.state ?? "Unknown"} → {summary?.name ?? `Constituency ${params.id}`}</p>
                <div className="dashboard-title">
                  <div>
                    <h2>{summary?.name ?? `Constituency ${params.id}`}</h2>
                    <h3>{summary?.name ?? `क्षेत्र ${params.id}`}</h3>
                  </div>
                </div>
              </div>
              <div className="dashboard-meta-board">
                <div className="meta-stat">
                  <span className="meta-label">MP</span>
                  <strong>{summary?.mp_name ?? "Unassigned"}</strong>
                </div>
                <div className="meta-stat">
                  <span className="meta-label">Agent</span>
                  <strong>Active / सक्रिय</strong>
                </div>
                <div className="meta-stat">
                  <span className="meta-label">Weekly brief</span>
                  <strong>{actionRows.length} tracked actions</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-summary-grid">
            <article className="summary-tile">
              <span className="summary-kicker">Top category</span>
              <strong>{topCategory ? categoryLabel(topCategory.category) : "No live category yet"}</strong>
              <p>{topCategory?.label ?? "This constituency has not yet crossed the public publication threshold."}</p>
            </article>
            <article className="summary-tile">
              <span className="summary-kicker">This week</span>
              <strong>{totalReports.toLocaleString()} reports</strong>
              <p>Live public ledger rows are now being pulled from the backend instead of placeholder copy.</p>
            </article>
            <article className="summary-tile accent-tile">
              <span className="summary-kicker">Need action today</span>
              <strong>{tatkalCount} Tatkal clusters</strong>
              <p>Escalation is driven by severity, velocity, and verified constituency patterns.</p>
            </article>
          </div>

          <div className="jaali-divider" aria-hidden="true">
            <img src="/prototype/art/jaali-band.svg" alt="" />
          </div>

          <div className="dashboard-layout dashboard-frame-layout">
            <aside className="dashboard-rail">
              <section className="category-breakdown">
                <div className="section-heading small">
                  <p>CATEGORY BREAKDOWN</p>
                  <h4>श्रेणी विवरण</h4>
                </div>
                <div className="category-bars">
                  {(issues.clusters.length > 0 ? issues.clusters.slice(0, 5) : []).map((cluster) => (
                    <div className="category-row" key={`${cluster.category}-${cluster.label}`}>
                      <span>{categoryLabel(cluster.category)}</span>
                      <div className={`bar ${badgeClass(cluster.category)}`}>
                        <i style={{ width: toneWidth(cluster.severity) }}></i>
                      </div>
                      <strong>{cluster.count}</strong>
                    </div>
                  ))}
                </div>
              </section>

              <section className="agent-panel">
                <p>AGENT STATUS</p>
                <h4>Agent {summary?.name ?? params.id}</h4>
                <span className="status-line">
                  <i></i> Active / सक्रिय
                </span>
                <div className="agent-stats">
                  <article>
                    <strong>{issues.total}</strong>
                    <small>Public clusters</small>
                  </article>
                  <article>
                    <strong>{summary?.population?.toLocaleString() ?? "—"}</strong>
                    <small>Population</small>
                  </article>
                  <article>
                    <strong>{actionRows.length}</strong>
                    <small>Filed actions visible</small>
                  </article>
                </div>
              </section>
            </aside>

            <div className="dashboard-main">
              <div className="tab-bar" role="tablist" aria-label="Constituency sections">
                <button className="tab active" type="button">
                  Top Issues / प्रमुख समस्याएं
                </button>
                <button className="tab" type="button">
                  Timeline / समयरेखा
                </button>
                <button className="tab" type="button">
                  Map / मानचित्र
                </button>
                <button className="tab" type="button">
                  Sessions / सत्र
                </button>
              </div>
              <div className="filter-row">
                <span className="stamp-badge road">Tatkal</span>
                <span className="stamp-badge water">Paani</span>
                <span className="stamp-badge neutral">Live ledger</span>
              </div>

              <section className="tab-panel active">
                {(issues.clusters.length > 0 ? issues.clusters.slice(0, 3) : []).map((cluster, index) => (
                  <article className="issue-card full" key={`${cluster.label}-${index}`}>
                    <span className="issue-rank">{index + 1}</span>
                    <div className="issue-top">
                      <span className={`stamp-badge ${badgeClass(cluster.category)}`}>{categoryLabel(cluster.category)}</span>
                      <span className="trend-up">{cluster.badge ?? "stable"}</span>
                    </div>
                    <h3>{cluster.label ?? "Unlabelled cluster"}</h3>
                    <p className="issue-subhead">{summary?.name ?? "This constituency"} cluster with {cluster.count} linked reports</p>
                    <div className="issue-progress">
                      <div className={`severity-track ${badgeClass(cluster.category)}`}>
                        <span style={{ width: toneWidth(cluster.severity) }}></span>
                      </div>
                      <div className="issue-meta">
                        <strong>{cluster.count} रिपोर्ट</strong>
                        <span>{cluster.velocity !== null ? `${cluster.velocity.toFixed(0)}% change` : "steady pattern"}</span>
                      </div>
                    </div>
                    <div className="citizen-quote">
                      <span className="quote-mark">&quot;</span>
                      <div>
                        <p>This cluster has crossed the public threshold and is now visible in the constituency desk.</p>
                        <small>Live backend data • severity {cluster.severity?.toFixed(1) ?? "—"}</small>
                      </div>
                    </div>
                    <footer>
                      <span>📍 {summary?.name ?? `Constituency ${params.id}`}</span>
                      <Link href="/submit">Add more evidence →</Link>
                    </footer>
                  </article>
                ))}
              </section>

              <section className="tab-panel active">
                <div className="session-list">
                  {(actionRows.length > 0 ? actionRows : []).map((action, index) => (
                    <article key={`${action.type}-${index}`}>
                      <span className="stamp-badge neutral">{action.type ?? "ACTION"}</span>
                      <h4>{action.content}</h4>
                      <p>Status: {action.status}{action.filed_at ? ` • Filed ${new Date(action.filed_at).toLocaleDateString()}` : ""}</p>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter note="एजेंट सभा · Constituency intelligence for public action" />
    </div>
  );
}
