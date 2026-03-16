import {
  boundsForPolygons,
  centroidFromBounds,
  createProjector,
  pathFromPolygons,
  polygonsFromGeometry,
  type ConstituencyFeatureCollection,
} from "@/lib/map-geometry";

type ConstituencyFeature = ConstituencyFeatureCollection<{
  id: number;
  name: string;
  state: string;
}>["features"][number];

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

  const polygons = polygonsFromGeometry(feature.geometry);
  const bounds = boundsForPolygons(polygons);

  if (!bounds) {
    return (
      <div className="constituency-map-card">
        <div className="constituency-map-empty">
          <strong>{constituencyName}</strong>
          <span>Constituency geometry is unavailable.</span>
        </div>
      </div>
    );
  }

  const project = createProjector(bounds, 760, 420, 34);
  const seatPath = pathFromPolygons(polygons, project);
  const [focusCx, focusCy] = centroidFromBounds(bounds, project);
  const focusRadius = Math.max(38, Math.min(110, Math.max(760 / 10, 420 / 4.8) * 0.18));

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
        <path d={seatPath} className={`constituency-shape ${toneClass(topCategory)}`} fillRule="evenodd" />
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
