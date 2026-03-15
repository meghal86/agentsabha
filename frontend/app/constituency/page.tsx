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
          <div className="product-intro compact-intro">
            <div>
              <p className="eyebrow">NATIONAL SELECTOR</p>
              <h1 className="product-title">Choose any Lok Sabha constituency</h1>
              <p className="hero-body">Start from the India map, then open the constituency desk only after selecting a seat.</p>
            </div>
          </div>

          <NationalConstituencyMap constituencies={directory.constituencies} heatmap={heatmap.constituencies} />
        </section>
      </main>

      <SiteFooter note="एजेंट सभा · National selector for all 543 Lok Sabha constituencies" />
    </div>
  );
}
