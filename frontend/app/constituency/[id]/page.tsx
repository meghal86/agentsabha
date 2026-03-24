import { ConstituencyDeskTabs } from "@/components/constituency-desk-tabs";
import { ConstituencySwitcher } from "@/components/constituency-switcher";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getConstituencies, getConstituencyActions, getConstituencyDesk, getConstituencyIssues, getConstituencySummary, getConstituencyTimeline } from "@/lib/api";
import { getForumsForConstituency } from "@/lib/forum-system";

function summaryCategoryLabel(category: string | null) {
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
    case "housing":
      return "मकान / Housing";
    case "environment":
      return "पर्यावरण / Environment";
    default:
      return "अन्य / Other";
  }
}

function categoryLabel(category: string | null) {
  return summaryCategoryLabel(category);
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
    case "housing":
      return "sanitation";
    case "environment":
      return "water";
    default:
      return "neutral";
  }
}

function toneWidth(severity: number | null) {
  return `${Math.max(12, Math.min(96, Math.round((severity ?? 4) * 10)))}%`;
}

function buildTimelinePath(values: number[]) {
  const width = 680;
  const height = 160;
  const paddingX = 40;
  const paddingY = 20;
  const max = Math.max(...values, 1);
  return values
    .map((value, index) => {
      const x = paddingX + (index * (width - paddingX * 2)) / Math.max(values.length - 1, 1);
      const y = height - paddingY - ((value / max) * (height - paddingY * 2));
      return `${index === 0 ? "M" : "L"}${x} ${y}`;
    })
    .join(" ");
}

export default async function ConstituencyPage({ params }: { params: { id: string } }) {
  const [summary, desk, issues, actions, timeline, directory] = await Promise.all([
    getConstituencySummary(params.id).catch(() => null),
    getConstituencyDesk(params.id).catch(() => null),
    getConstituencyIssues(params.id).catch(() => ({ clusters: [], total: 0, page: 1 })),
    getConstituencyActions(params.id).catch(() => ({ actions: [] })),
    getConstituencyTimeline(params.id).catch(() => ({ timeline: [] })),
    getConstituencies().catch(() => ({ constituencies: [] })),
  ]);
  const selectedId = Number(params.id);
  const directoryEntry = directory.constituencies.find((entry) => entry.id === selectedId);
  const displayName = summary?.name ?? directoryEntry?.name ?? `Constituency ${params.id}`;
  const displayState = summary?.state ?? directoryEntry?.state ?? "Unknown state";
  const displayMp = summary?.mp_name ?? directoryEntry?.mp_name ?? "Unassigned";

  const topCategory = issues.clusters[0];
  const liveTopCategory = topCategory?.category ?? desk?.top_category ?? null;
  const totalReports = issues.clusters.reduce((sum, cluster) => sum + cluster.count, 0);
  const liveIssueCount = desk?.raw_issue_count ?? totalReports;
  const pendingIssueCount = desk?.pending_issue_count ?? Math.max(liveIssueCount - totalReports, 0);
  const tatkalCount = issues.clusters.filter((cluster) => cluster.badge === "tatkal").length;
  const actionRows = actions.actions.slice(0, 3);
  const timelineSeries =
    timeline.timeline.find((series) => series.category === (topCategory?.category ?? "")) ?? timeline.timeline[0];
  const timelineValues = timelineSeries?.data.map((point) => point.count) ?? [];
  const timelinePath = timelineValues.length > 0 ? buildTimelinePath(timelineValues) : "";
  const averageSeverity =
    issues.clusters.length > 0
      ? issues.clusters.reduce((sum, cluster) => sum + (cluster.severity ?? 0), 0) / issues.clusters.length
      : desk?.average_severity ?? 0;
  const isPubliclyActive = issues.total > 0;
  const hasLiveIntake = (desk?.raw_issue_count ?? 0) > 0;
  const categoryBreakdown = issues.clusters.length > 0
    ? issues.clusters.slice(0, 5).map((cluster) => ({
        category: cluster.category,
        count: cluster.count,
        severity: cluster.severity,
      }))
    : (desk?.category_breakdown ?? []).map((row) => ({
        category: row.category,
        count: row.count,
        severity: averageSeverity || 4,
      }));
  const recentIssueRows = desk?.recent_issues ?? [];
  const forumRows = getForumsForConstituency(liveIssueCount, actionRows.length > 0);
  const currentForum =
    forumRows.find((forum) => forum.status === "Admitted") ??
    forumRows.find((forum) => forum.status === "Queued") ??
    forumRows[0];
  const lastAction = actionRows[0];

  return (
    <div className="page-shell">
      <SiteHeader active="constituency" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame bharat-ornament-frame dashboard-art-frame">
          <div className="dashboard-masthead frame-panel">
            <div className="dashboard-header">
              <div>
                <p className="breadcrumbs">India → {displayState} → {displayName}</p>
              <div className="dashboard-title">
                <div>
                  <h2>{displayName}</h2>
                  <h3>{displayName}</h3>
                </div>
                <ConstituencySwitcher
                  constituencies={directory.constituencies}
                  selectedId={selectedId}
                  label="Switch constituency / बदलें"
                  className="dashboard-switcher"
                />
              </div>
            </div>
              <div className="dashboard-meta-board">
                <div className="meta-stat">
                  <span className="meta-label">MP</span>
                  <strong>{displayMp}</strong>
                </div>
                <div className="meta-stat">
                  <span className="meta-label">Agent</span>
                  <strong>Active / सक्रिय</strong>
                </div>
                <div className="meta-stat">
                  <span className="meta-label">Weekly brief</span>
                  <strong>{desk?.action_count ?? actionRows.length} tracked actions</strong>
                </div>
              </div>
            </div>
          </div>

          <div className={`activation-banner ${isPubliclyActive ? "active" : "inactive"}`}>
            <strong>
              {isPubliclyActive
                ? "Public constituency desk is active"
                : hasLiveIntake
                  ? "Live intake is active"
                  : "Seat selected successfully"}
            </strong>
            <span>
              {isPubliclyActive
                ? `${displayName} has public clusters above the publication threshold and active parliamentary tracking.`
                : hasLiveIntake
                  ? `${displayName} has ${liveIssueCount} live issue${liveIssueCount === 1 ? "" : "s"} in the intake pipeline. They are visible below even before crossing public publication threshold.`
                  : `${displayName} is available in the national map, but no public cluster has crossed the publication threshold yet.`}
            </span>
          </div>

          <div className="dashboard-summary-grid">
            <article className="summary-tile">
              <span className="summary-kicker">Top category</span>
              <strong>{liveTopCategory ? summaryCategoryLabel(liveTopCategory) : "No live category yet"}</strong>
              <p>
                {topCategory?.label ??
                  recentIssueRows[0]?.text_preview ??
                  "This constituency has not yet crossed the public publication threshold."}
              </p>
            </article>
            <article className="summary-tile">
              <span className="summary-kicker">This week</span>
              <strong>{liveIssueCount.toLocaleString()} live reports</strong>
              <p>
                {isPubliclyActive
                  ? "Public desk rows are visible because clustered evidence crossed the threshold."
                  : pendingIssueCount > 0
                    ? `${pendingIssueCount} issue${pendingIssueCount === 1 ? "" : "s"} still pending cluster/publication threshold.`
                    : "No live intake has arrived yet."}
              </p>
            </article>
            <article className="summary-tile accent-tile">
              <span className="summary-kicker">Need action today</span>
              <strong>{tatkalCount} Tatkal clusters</strong>
              <p>
                {hasLiveIntake
                  ? `${desk?.clustered_issue_count ?? 0} issues already processed by intake and routing agents.`
                  : "Escalation is driven by severity, velocity, and verified constituency patterns."}
              </p>
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
                  {categoryBreakdown.map((cluster) => (
                    <div className="category-row" key={`${cluster.category}-${cluster.count}`}>
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
                <p>CONSTITUENCY AGENT</p>
                <h4>Agent {displayName}</h4>
                <span className="status-line">
                  <i></i> Active / सक्रिय
                </span>
                <div className="agent-procedure-block">
                  <article>
                    <small>Current forum</small>
                    <strong>{currentForum?.name ?? "Lok Sabha Session"}</strong>
                  </article>
                  <article>
                    <small>Layer 2 rules active</small>
                    <strong>{currentForum?.rules[0] ?? "No forum rule injected yet"}</strong>
                  </article>
                  <article>
                    <small>Last action</small>
                    <strong>{lastAction?.type ?? "No admitted action yet"}</strong>
                  </article>
                </div>
                <div className="agent-stats">
                  <article>
                    <strong>{liveIssueCount}</strong>
                    <small>Live issues</small>
                  </article>
                  <article>
                    <strong>{summary?.population?.toLocaleString() ?? "—"}</strong>
                    <small>Population</small>
                  </article>
                  <article>
                    <strong>{desk?.action_count ?? actionRows.length}</strong>
                    <small>Parliamentary actions</small>
                  </article>
                </div>
              </section>
            </aside>

            <ConstituencyDeskTabs
              selectedId={selectedId}
              displayName={displayName}
              displayState={displayState}
              mpName={displayMp}
              issues={issues.clusters.length > 0 ? issues.clusters.slice(0, 3) : []}
              actions={actionRows}
              recentIssues={recentIssueRows}
              timelineSeries={timelineSeries}
              timelinePath={timelinePath}
              timelineValues={timelineValues}
              liveTopCategory={liveTopCategory}
              liveIssueCount={liveIssueCount}
              averageSeverity={averageSeverity}
              hasLiveIntake={hasLiveIntake}
              isPubliclyActive={isPubliclyActive}
            />
          </div>
        </section>
      </main>

      <SiteFooter note="एजेंट सभा · Constituency intelligence for public action" />
    </div>
  );
}
