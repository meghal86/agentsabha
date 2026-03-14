import { IssueLedger } from "@/components/issue-ledger";
import { QuestionLog } from "@/components/question-log";
import { SeverityBar } from "@/components/severity-bar";
import { SiteHeader } from "@/components/site-header";
import { getConstituencyActions, getConstituencyIssues, getConstituencySummary } from "@/lib/api";

function categoryLabel(category: string | null) {
  switch (category) {
    case "road":
      return "सड़क";
    case "water":
      return "पानी";
    case "power":
      return "बिजली";
    case "health":
      return "स्वास्थ्य";
    case "education":
      return "शिक्षा";
    case "employment":
      return "रोज़गार";
    default:
      return "अन्य";
  }
}

function categoryTone(category: string | null) {
  switch (category) {
    case "road":
      return "#C8592A";
    case "water":
      return "#2B7A8B";
    case "power":
      return "#D4831A";
    case "health":
      return "#7B3F9E";
    case "education":
      return "#2D6A4F";
    case "employment":
      return "#A0522D";
    default:
      return "#1B2A4A";
  }
}

export default async function ConstituencyPage({ params }: { params: { id: string } }) {
  const [summary, issues, actions] = await Promise.all([
    getConstituencySummary(params.id).catch(() => null),
    getConstituencyIssues(params.id).catch(() => ({ clusters: [] })),
    getConstituencyActions(params.id).catch(() => ({ actions: [] })),
  ]);
  const title = summary?.name ?? `Constituency ${params.id}`;
  const issueRows =
    issues.clusters.map((cluster) => ({
      badge: cluster.badge ?? "stable",
      label: cluster.label ?? "Unlabelled cluster",
      category: categoryLabel(cluster.category),
      reports: cluster.count,
      severity: cluster.severity?.toFixed(1) ?? "—",
      since: cluster.velocity !== null ? `${cluster.velocity.toFixed(0)}%` : "steady",
    })) || [];
  const severityItems =
    issues.clusters.slice(0, 5).map((cluster) => ({
      label: categoryLabel(cluster.category),
      value: Math.max(8, Math.min(100, Math.round((cluster.severity ?? 1) * 10))),
      tone: categoryTone(cluster.category),
    })) || [];
  const actionRows = actions.actions.map((action) => action.content);

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <div className="border-b border-[#E2D4B0] pb-6">
          <p className="font-body text-xs uppercase tracking-[0.14em] text-neela/50">
            India → {summary?.state ?? "Unknown state"} → Constituency {params.id}
          </p>
          <h1 className="mt-3 font-display text-5xl text-neela md:text-7xl">{title}</h1>
          <p className="mt-1 font-hindi text-3xl text-neela/80 md:text-5xl">{title}</p>
          <p className="mt-3 font-body text-sm uppercase tracking-[0.08em] text-neela/60">
            MP: {summary?.mp_name ?? "Unassigned"} {summary?.mp_party ? `· ${summary.mp_party}` : ""}
          </p>
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-6">
            <div className="border border-[#E2D4B0] bg-haath p-5">
              <h2 className="font-display text-3xl text-neela">Category severity</h2>
              <div className="mt-4">
                <SeverityBar items={severityItems.length > 0 ? severityItems : [{ label: "सड़क", value: 82, tone: "#C8592A" }]} />
              </div>
            </div>
            <div className="border border-neela bg-neela p-5 text-haath">
              <p className="font-display text-3xl">Agent {title}</p>
              <p className="mt-2 font-body text-sm uppercase tracking-[0.08em] text-kesariya">Active / सक्रिय</p>
            </div>
          </aside>
          <div className="space-y-8">
            <IssueLedger rows={issueRows.length > 0 ? issueRows : undefined} />
            <QuestionLog items={actionRows.length > 0 ? actionRows : undefined} />
          </div>
        </div>
      </section>
    </main>
  );
}
