import { TrendBadge } from "@/components/trend-badge";

type LedgerRow = {
  badge: "tatkal" | "rising" | "chronic" | "stable" | "resolved";
  label: string;
  category: string;
  reports: number;
  severity: string;
  since: string;
};

const sampleRows: LedgerRow[] = [
  { badge: "tatkal", label: "School road collapse", category: "सड़क", reports: 847, severity: "9.1", since: "2h ago" },
  { badge: "rising", label: "Morning water pressure drop", category: "पानी", reports: 421, severity: "7.3", since: "today" },
  { badge: "chronic", label: "Sub-centre medicine shortage", category: "स्वास्थ्य", reports: 266, severity: "6.9", since: "11 days" }
];

type IssueLedgerProps = {
  title?: string;
  subtitle?: string;
  rows?: LedgerRow[];
};

export function IssueLedger({ title = "Top Issues Ledger", subtitle = "प्रमुख समस्याएं", rows = sampleRows }: IssueLedgerProps) {
  return (
    <div className="overflow-hidden border border-[#E2D4B0] bg-haath">
      <div className="border-b border-[#E2D4B0] bg-haldi px-4 py-3">
        <h3 className="font-display text-2xl text-neela">{title}</h3>
        <p className="font-hindi text-lg text-neela/80">{subtitle}</p>
      </div>
      <div className="divide-y divide-[#E2D4B0]">
        {rows.map((row) => (
          <div key={row.label} className="grid gap-3 px-4 py-4 md:grid-cols-[110px_110px_1fr_90px_90px_90px] md:items-center">
            <TrendBadge tone={row.badge} label={row.badge} />
            <div className="font-body text-sm font-semibold uppercase tracking-[0.08em] text-neela">{row.category}</div>
            <div className="font-display text-2xl text-neela">{row.label}</div>
            <div className="font-body text-sm text-neela/80">{row.reports}</div>
            <div className="font-body text-sm text-neela/80">{row.severity}</div>
            <div className="font-body text-sm text-neela/60">{row.since}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
