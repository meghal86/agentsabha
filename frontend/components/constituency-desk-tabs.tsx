"use client";

import Link from "next/link";
import { useId, useState } from "react";

import { ConstituencyShapeMap } from "@/components/constituency-shape-map";
import constituencyGeojson from "@/data/constituencies-geojson.json";

type DeskCluster = {
  label: string | null;
  count: number;
  severity: number | null;
  badge: string | null;
  velocity: number | null;
  category: string | null;
};

type DeskAction = {
  type: string | null;
  content: string;
  status: string;
  filed_at: string | null;
  response_text: string | null;
};

type DeskRecentIssue = {
  id: string;
  text_preview: string;
  category: string | null;
  severity: number | null;
  created_at: string;
  clustered: boolean;
};

type TimelineSeries = {
  category: string;
  data: {
    week: string;
    count: number;
    severity_avg: number | null;
  }[];
};

type ConstituencyDeskTabsProps = {
  selectedId: number;
  displayName: string;
  displayState: string;
  issues: DeskCluster[];
  actions: DeskAction[];
  recentIssues: DeskRecentIssue[];
  timelineSeries?: TimelineSeries;
  timelinePath: string;
  timelineValues: number[];
  liveTopCategory: string | null;
  liveIssueCount: number;
  averageSeverity: number;
  hasLiveIntake: boolean;
  isPubliclyActive: boolean;
};

type TabKey = "issues" | "timeline" | "map" | "sessions";

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
    case "housing":
      return "मकान / Housing";
    case "environment":
      return "पर्यावरण / Environment";
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

export function ConstituencyDeskTabs({
  selectedId,
  displayName,
  displayState,
  issues,
  actions,
  recentIssues,
  timelineSeries,
  timelinePath,
  timelineValues,
  liveTopCategory,
  liveIssueCount,
  averageSeverity,
  hasLiveIntake,
  isPubliclyActive,
}: ConstituencyDeskTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("issues");
  const tabsetId = useId();

  return (
    <div className="dashboard-main">
      <div className="tab-bar" role="tablist" aria-label="Constituency sections">
        {[
          ["issues", "Top Issues / प्रमुख समस्याएं"],
          ["timeline", "Timeline / समयरेखा"],
          ["map", "Map / मानचित्र"],
          ["sessions", "Sessions / सत्र"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={`tab ${activeTab === key ? "active" : ""}`}
            type="button"
            role="tab"
            id={`${tabsetId}-${key}-tab`}
            aria-selected={activeTab === key}
            aria-controls={`${tabsetId}-${key}-panel`}
            onClick={() => setActiveTab(key as TabKey)}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "issues" ? (
        <>
          <div className="filter-row">
            <span className="stamp-badge road">Tatkal</span>
            <span className="stamp-badge water">Paani</span>
            <span className="stamp-badge neutral">Live ledger</span>
          </div>
          <section className="tab-panel active" id={`${tabsetId}-issues-panel`} role="tabpanel" aria-labelledby={`${tabsetId}-issues-tab`}>
            {issues.map((cluster, index) => (
              <article className="issue-card full" key={`${cluster.label}-${index}`}>
                <span className="issue-rank">{index + 1}</span>
                <div className="issue-top">
                  <span className={`stamp-badge ${badgeClass(cluster.category)}`}>{categoryLabel(cluster.category)}</span>
                  <span className="trend-up">{cluster.badge ?? "stable"}</span>
                </div>
                <h3>{cluster.label ?? "Unlabelled cluster"}</h3>
                <p className="issue-subhead">{displayName} cluster with {cluster.count} linked reports</p>
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
                  <span>📍 {displayName}</span>
                  <Link href="/submit">Add more evidence →</Link>
                </footer>
              </article>
            ))}

            {issues.length === 0 &&
              recentIssues.map((issue, index) => (
                <article className="issue-card full" key={issue.id}>
                  <span className="issue-rank">{index + 1}</span>
                  <div className="issue-top">
                    <span className={`stamp-badge ${badgeClass(issue.category)}`}>{categoryLabel(issue.category)}</span>
                    <span className="trend-up">{issue.clustered ? "clustered" : "pending cluster"}</span>
                  </div>
                  <h3>{issue.text_preview}</h3>
                  <p className="issue-subhead">{displayName} live intake row, waiting for more evidence before public publication.</p>
                  <div className="issue-progress">
                    <div className={`severity-track ${badgeClass(issue.category)}`}>
                      <span style={{ width: toneWidth(issue.severity) }}></span>
                    </div>
                    <div className="issue-meta">
                      <strong>1 रिपोर्ट</strong>
                      <span>{new Date(issue.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="citizen-quote">
                    <span className="quote-mark">&quot;</span>
                    <div>
                      <p>This issue has been received by Agent {displayName} and is currently part of the live intake queue.</p>
                      <small>{issue.clustered ? "Clustered internally" : "Below public threshold"} • severity {issue.severity?.toFixed(1) ?? "—"}</small>
                    </div>
                  </div>
                  <footer>
                    <span>📍 {displayName}</span>
                    <Link href="/submit">Add more evidence →</Link>
                  </footer>
                </article>
              ))}

            {issues.length === 0 && recentIssues.length === 0 ? <p>No live issues yet.</p> : null}
          </section>
        </>
      ) : null}

      {activeTab === "timeline" ? (
        <section className="tab-panel active" id={`${tabsetId}-timeline-panel`} role="tabpanel" aria-labelledby={`${tabsetId}-timeline-tab`}>
          <div className="timeline-card">
            <div className="section-heading small">
              <p>ISSUE VOLUME OVER TIME</p>
              <h4>समय के साथ समस्याओं की संख्या</h4>
            </div>
            {timelineSeries ? (
              <svg viewBox="0 0 760 200" className="timeline-chart">
                <g className="chart-guides">
                  <line x1="40" y1="180" x2="720" y2="180" />
                  <line x1="40" y1="135" x2="720" y2="135" />
                  <line x1="40" y1="90" x2="720" y2="90" />
                  <line x1="40" y1="45" x2="720" y2="45" />
                </g>
                <path className="chart-line" d={timelinePath} />
                <g className="chart-points">
                  {timelineSeries.data.map((point, index) => {
                    const x = 40 + (index * 680) / Math.max(timelineSeries.data.length - 1, 1);
                    const max = Math.max(...timelineValues, 1);
                    const y = 180 - (point.count / max) * 140;
                    return <circle key={point.week} cx={x} cy={y} r="5" />;
                  })}
                </g>
              </svg>
            ) : (
              <p>No timeline yet.</p>
            )}
          </div>
        </section>
      ) : null}

      {activeTab === "map" ? (
        <section className="tab-panel active" id={`${tabsetId}-map-panel`} role="tabpanel" aria-labelledby={`${tabsetId}-map-tab`}>
          <div className="map-summary">
            <ConstituencyShapeMap
              collection={constituencyGeojson}
              constituencyId={selectedId}
              constituencyName={displayName}
              stateName={displayState}
              topCategory={liveTopCategory}
              averageSeverity={hasLiveIntake ? averageSeverity : null}
            />
            <div className="map-legend">
              <h4>Constituency signal / क्षेत्र संकेत</h4>
              <p>
                {isPubliclyActive
                  ? `${displayName} currently has ${issues.length} public clusters with an average severity of ${averageSeverity ? averageSeverity.toFixed(1) : "—"}.`
                  : hasLiveIntake
                    ? `${displayName} currently has ${liveIssueCount} live issue${liveIssueCount === 1 ? "" : "s"} in the intake pipeline with average severity ${averageSeverity ? averageSeverity.toFixed(1) : "—"}.`
                    : `${displayName} currently has no live issue activity.`}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {activeTab === "sessions" ? (
        <section className="tab-panel active" id={`${tabsetId}-sessions-panel`} role="tabpanel" aria-labelledby={`${tabsetId}-sessions-tab`}>
          <div className="session-list">
            {actions.length > 0 ? (
              actions.map((action, index) => (
                <article key={`${action.type}-${index}`}>
                  <span className="stamp-badge neutral">{action.type ?? "ACTION"}</span>
                  <h4>{action.content}</h4>
                  <p>
                    Status: {action.status}
                    {action.filed_at ? ` • Filed ${new Date(action.filed_at).toLocaleDateString()}` : ""}
                  </p>
                </article>
              ))
            ) : (
              <article>
                <span className="stamp-badge neutral">NO SESSION ACTIONS YET</span>
                <h4>Parliamentary drafting has not produced a visible session item for this constituency yet.</h4>
                <p>Once a question, zero-hour notice, or brief reaches the constituency desk, it will appear here.</p>
              </article>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
