type BadgeTone = "tatkal" | "rising" | "chronic" | "stable" | "resolved";

const styles: Record<BadgeTone, string> = {
  tatkal: "border-sindoori bg-sindoori text-haath",
  rising: "border-kesariya bg-kesariya text-raat",
  chronic: "border-mitti bg-mitti text-haath",
  stable: "border-neela bg-neela/10 text-neela",
  resolved: "border-hariyali bg-hariyali text-haath"
};

export function TrendBadge({ tone, label }: { tone: BadgeTone; label: string }) {
  return (
    <span className={`inline-flex items-center border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${styles[tone]}`}>
      {label}
    </span>
  );
}

