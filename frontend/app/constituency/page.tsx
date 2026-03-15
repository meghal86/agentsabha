import { NationalConstituencyMap } from "@/components/national-constituency-map";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getConstituencies, getNationalHeatmap } from "@/lib/api";

export default async function ConstituencyIndexPage() {
  const [directory, heatmap] = await Promise.all([
    getConstituencies().catch(() => ({ constituencies: [] })),
    getNationalHeatmap().catch(() => ({ constituencies: [] })),
  ]);

  return (
    <div className="page-shell">
      <SiteHeader active="constituency" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame bharat-ornament-frame">
          <div className="screen-label-row">
            <div>
              <p className="eyebrow">CONSTITUENCY SELECTOR</p>
              <h2>Choose a Lok Sabha seat</h2>
            </div>
            <p className="frame-note">Start from the national map, then open the constituency desk only after selecting a seat.</p>
          </div>

          <NationalConstituencyMap constituencies={directory.constituencies} heatmap={heatmap.constituencies} />
        </section>
      </main>

      <SiteFooter note="एजेंट सभा · National selector for all 543 Lok Sabha constituencies" />
    </div>
  );
}
