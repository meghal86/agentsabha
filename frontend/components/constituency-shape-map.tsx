import { geoMercator, geoPath } from "d3-geo";

type ConstituencyFeature = {
  type: string;
  properties: {
    id: number;
    name: string;
    state: string;
  };
  geometry: unknown;
};

type ConstituencyFeatureCollection = {
  type: string;
  features: ConstituencyFeature[];
};

type ConstituencyShapeMapProps = {
  collection: ConstituencyFeatureCollection;
  constituencyId: number;
  constituencyName: string;
  stateName: string;
  topCategory: string | null;
  averageSeverity: number | null;
};

function toneClass(category: string | null) {
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
    case "employment":
      return "road";
    case "environment":
      return "water";
    default:
      return "neutral";
  }
}

export function ConstituencyShapeMap({
  collection,
  constituencyId,
  constituencyName,
  stateName,
  topCategory,
  averageSeverity,
}: ConstituencyShapeMapProps) {
  const feature = collection.features.find((entry) => entry.properties.id === constituencyId);

  if (!feature) {
    return (
      <div className="constituency-map-card">
        <div className="constituency-map-empty">
          <strong>{constituencyName}</strong>
          <span>Constituency geometry is loading.</span>
        </div>
      </div>
    );
  }

  const projection = geoMercator().fitSize([760, 420], feature as never);
  const pathBuilder = geoPath(projection);
  const seatPath = pathBuilder(feature as never) ?? "";
  const [[minX, minY], [maxX, maxY]] = pathBuilder.bounds(feature as never);
  const focusCx = (minX + maxX) / 2;
  const focusCy = (minY + maxY) / 2;
  const focusRadius = Math.max(maxX - minX, maxY - minY) * 0.18;

  return (
    <div className="constituency-map-card">
      <div className="constituency-map-header">
        <div>
          <span className="eyebrow">CONSTITUENCY MAP</span>
          <h4>{constituencyName}</h4>
          <p>{stateName}</p>
        </div>
        <span className={`stamp-badge ${toneClass(topCategory)}`}>{topCategory ?? "constituency"}</span>
      </div>

      <svg className="constituency-shape-svg" viewBox="0 0 760 420" aria-label={`${constituencyName} constituency shape`}>
        <defs>
          <radialGradient id="constituencyGlow" cx="50%" cy="48%" r="58%">
            <stop offset="0%" stopColor="rgba(255,153,51,0.28)" />
            <stop offset="100%" stopColor="rgba(255,153,51,0)" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="760" height="420" className="constituency-map-bg" />
        <circle cx={focusCx} cy={focusCy} r={focusRadius} className="constituency-map-focus" />
        <path d={seatPath} className={`constituency-shape ${toneClass(topCategory)}`} />
      </svg>

      <div className="constituency-map-footer">
        <div>
          <strong>{constituencyName}</strong>
          <span>Selected directly from the national Lok Sabha map.</span>
        </div>
        <div className="constituency-map-metric">
          <strong>{averageSeverity !== null ? averageSeverity.toFixed(1) : "—"}</strong>
          <span>average severity</span>
        </div>
      </div>
    </div>
  );
}
