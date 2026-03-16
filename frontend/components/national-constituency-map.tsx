"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { ConstituencyDirectoryItem, HeatmapPoint } from "@/lib/api";
import {
  boundsForPolygons,
  centroidFromBounds,
  createProjector,
  mergeBounds,
  pathFromPolygons,
  polygonsFromGeometry,
  type ConstituencyFeatureCollection,
} from "@/lib/map-geometry";

type ConstituencyProps = {
  id: number;
  name: string;
  source_name: string;
  state: string;
  name_hi: string | null;
};

type ProjectedFeature = ConstituencyProps & {
  d: string;
  cx: number;
  cy: number;
};

type InsetFrame = {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

type NationalConstituencyMapProps = {
  constituencies: ConstituencyDirectoryItem[];
  heatmap: HeatmapPoint[];
  collection: ConstituencyFeatureCollection<ConstituencyProps>;
  selectedId?: number;
};

function fillClass(severity: number | null | undefined) {
  if (severity === null || severity === undefined) return "is-idle";
  if (severity >= 8) return "is-high";
  if (severity >= 6) return "is-warm";
  if (severity >= 4) return "is-medium";
  return "is-low";
}

function badgeTone(severity: number | null | undefined) {
  if (severity === null || severity === undefined) return "neutral";
  if (severity >= 8) return "road";
  if (severity >= 6) return "electricity";
  if (severity >= 4) return "water";
  return "neutral";
}

export function NationalConstituencyMap({
  constituencies,
  heatmap,
  collection,
  selectedId,
}: NationalConstituencyMapProps) {
  const router = useRouter();
  const defaultId = useMemo(
    () => selectedId ?? heatmap.find((entry) => entry.severity_score !== null)?.id ?? constituencies[0]?.id ?? 1,
    [constituencies, heatmap, selectedId],
  );
  const [hoveredId, setHoveredId] = useState<number | null>(selectedId ?? null);
  const [pendingId, setPendingId] = useState<number>(defaultId);

  useEffect(() => {
    setPendingId(defaultId);
    setHoveredId(selectedId ?? defaultId);
  }, [defaultId, selectedId]);

  const heatmapById = useMemo(() => new Map(heatmap.map((entry) => [entry.id, entry])), [heatmap]);
  const constituencyById = useMemo(() => new Map(constituencies.map((entry) => [entry.id, entry])), [constituencies]);

  const mapGeometry = useMemo(() => {
    if (collection.features.length === 0) {
      return {
        projectedFeatures: [] as ProjectedFeature[],
        outlineFeatures: [] as ProjectedFeature[],
        insetFrames: [] as InsetFrame[],
      };
    }

    const width = 530;
    const height = 640;
    const insetTargets: Record<number, { x: number; y: number; width: number; height: number }> = {
      482: { x: 36, y: 536, width: 84, height: 74 },
      542: { x: 398, y: 498, width: 90, height: 72 },
      543: { x: 402, y: 560, width: 96, height: 86 },
    };

    const mainlandFeatures = collection.features.filter((feature) => !(feature.properties.id in insetTargets));
    const mainlandBounds = mergeBounds(mainlandFeatures.map((feature) => boundsForPolygons(polygonsFromGeometry(feature.geometry))));
    if (!mainlandBounds) {
      return {
        projectedFeatures: [] as ProjectedFeature[],
        outlineFeatures: [] as ProjectedFeature[],
        insetFrames: [] as InsetFrame[],
      };
    }

    const mainlandProject = createProjector(mainlandBounds, width, height, 28);
    const outlineFeatures: ProjectedFeature[] = [];
    const projectedFeatures = collection.features.reduce<ProjectedFeature[]>((accumulator, feature) => {
      const polygons = polygonsFromGeometry(feature.geometry);
      const featureBounds = boundsForPolygons(polygons);
      if (!featureBounds || polygons.length === 0) return accumulator;

      const insetTarget = insetTargets[feature.properties.id];
      const project = insetTarget
        ? createProjector(featureBounds, insetTarget.width, insetTarget.height, 2)
        : mainlandProject;

      const rawPath = pathFromPolygons(polygons, project);
      if (!rawPath) return accumulator;

      const d = insetTarget ? `M 0 0 ${rawPath}`.replace(/^M 0 0 /, "") : rawPath;
      const translatedPath = insetTarget
        ? rawPath.replace(/([0-9.-]+) ([0-9.-]+)/g, (_, x, y) => `${(Number(x) + insetTarget.x).toFixed(2)} ${(Number(y) + insetTarget.y).toFixed(2)}`)
        : rawPath;
      const [cx, cy] = insetTarget
        ? [insetTarget.x + insetTarget.width / 2, insetTarget.y + insetTarget.height / 2]
        : centroidFromBounds(featureBounds, mainlandProject);

      const projected = {
        ...feature.properties,
        d: translatedPath,
        cx,
        cy,
      };

      accumulator.push(projected);
      if (!insetTarget) {
        outlineFeatures.push(projected);
      }
      return accumulator;
    }, []);

    const insetFrames = Object.entries(insetTargets).map(([id, target]) => ({
      id: Number(id),
      ...target,
    }));

    return {
      projectedFeatures,
      outlineFeatures,
      insetFrames,
    };
  }, [collection]);

  const activeId = hoveredId ?? pendingId;
  const activeConstituency = (activeId ? constituencyById.get(activeId) : null) ?? constituencies[0] ?? null;
  const activeHeat = activeId ? heatmapById.get(activeId) : null;
  const activeSeats = heatmap.filter((entry) => entry.severity_score !== null).length;

  function openConstituency(id: number) {
    router.push(`/constituency/${id}`);
  }

  return (
    <div className="map-card ceremonial-panel national-map-card">
      <div className="map-header national-map-header">
        <div>
          <span className="eyebrow">NATIONAL MAP</span>
          <h2>लोकसभा मानचित्र</h2>
        </div>
        <span className="map-chip">{activeSeats} agents active right now</span>
      </div>

      <div className="national-map-toolbar">
        <label className="map-select">
          <span>Select constituency / निर्वाचन क्षेत्र चुनें</span>
          <select
            value={pendingId}
            onChange={(event) => {
              const nextId = Number(event.target.value);
              setPendingId(nextId);
              setHoveredId(nextId);
            }}
          >
            {constituencies.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.name} — {entry.state}
              </option>
            ))}
          </select>
        </label>
        <button className="secondary-button map-open-button" type="button" onClick={() => openConstituency(pendingId)}>
          Open constituency
        </button>
      </div>

      <div className="national-map-stage">
        <svg className="india-map national-map-svg" viewBox="0 0 530 640" aria-label="India map with all 543 Lok Sabha constituencies">
          {mapGeometry.insetFrames.map((frame) => (
            <rect
              key={frame.id}
              x={frame.x - 6}
              y={frame.y - 6}
              width={frame.width + 12}
              height={frame.height + 12}
              rx="6"
              className="national-inset-frame"
            />
          ))}
          <g className="national-outline-layer" aria-hidden="true">
            {mapGeometry.outlineFeatures.map((feature) => (
              <path key={`outline-${feature.id}`} d={feature.d} className="national-outline-seat" fillRule="evenodd" />
            ))}
          </g>
          <g className="national-constituency-layer">
            {mapGeometry.projectedFeatures.map((feature) => {
              const severity = heatmapById.get(feature.id)?.severity_score;
              const isSelected = pendingId === feature.id;
              const isHovered = hoveredId === feature.id;
              const classes = [
                "national-seat",
                fillClass(severity),
                isSelected ? "is-selected" : "",
                isHovered ? "is-hovered" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <path
                  key={feature.id}
                  d={feature.d}
                  className={classes}
                  fillRule="evenodd"
                  onMouseEnter={() => setHoveredId(feature.id)}
                  onMouseLeave={() => setHoveredId(selectedId ?? null)}
                  onFocus={() => setHoveredId(feature.id)}
                  onBlur={() => setHoveredId(selectedId ?? null)}
                  onClick={() => openConstituency(feature.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${feature.name}, ${feature.state}`}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openConstituency(feature.id);
                    }
                  }}
                />
              );
            })}
          </g>
        </svg>

        <div className="hover-card national-hover-card">
          <span className={`stamp-badge ${badgeTone(activeHeat?.severity_score)}`}>
            {(activeHeat?.top_category ?? "national").replace(/^./, (letter) => letter.toUpperCase())}
          </span>
          <h3>{activeConstituency?.name ?? "Select a constituency"}</h3>
          <p>
            {activeConstituency
              ? `${activeConstituency.state}${activeConstituency.mp_name ? ` • MP ${activeConstituency.mp_name}` : ""}`
              : "All 543 constituencies are selectable from the national map."}
          </p>
          <span className="hover-meta">
            {activeHeat?.severity_score !== null && activeHeat?.severity_score !== undefined
              ? `Severity ${activeHeat.severity_score.toFixed(1)} • click polygon to open desk`
              : "No public cluster above threshold yet • click polygon to open desk"}
          </span>
        </div>
      </div>
    </div>
  );
}
