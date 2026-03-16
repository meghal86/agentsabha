"use client";

import { useEffect, useMemo, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { useRouter } from "next/navigation";

import type { ConstituencyDirectoryItem, HeatmapPoint } from "@/lib/api";

type ConstituencyFeature = {
  type: string;
  properties: {
    id: number;
    name: string;
    source_name: string;
    state: string;
    name_hi: string | null;
  };
  geometry: unknown;
};

type ConstituencyFeatureCollection = {
  type: string;
  features: ConstituencyFeature[];
};

type ProjectedFeature = ConstituencyFeature["properties"] & {
  d: string;
  transform?: string;
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
  collection: ConstituencyFeatureCollection;
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
        mainlandOutline: "",
        insetFrames: [] as InsetFrame[],
      };
    }
    const insetTargets: Record<number, { x: number; y: number; width: number; height: number }> = {
      482: { x: 38, y: 510, width: 52, height: 58 },   // Lakshadweep
      542: { x: 392, y: 454, width: 76, height: 74 },  // Puducherry
      543: { x: 418, y: 526, width: 82, height: 92 },  // Andaman and Nicobar Islands
    };
    const mainlandFeatures = collection.features.filter((feature) => !(feature.properties.id in insetTargets));
    const projection = geoMercator().fitSize([530, 640], { ...collection, features: mainlandFeatures } as never);
    const pathBuilder = geoPath(projection);
    const mainlandOutline = pathBuilder({ ...collection, features: mainlandFeatures } as never) ?? "";
    const insetFrames = Object.entries(insetTargets).map(([id, target]) => ({
      id: Number(id),
      ...target,
    }));
    const projectedFeatures = collection.features.reduce<ProjectedFeature[]>((accumulator, feature) => {
        const d = pathBuilder(feature as never);
        if (!d) return accumulator;
        let transform: string | undefined;
        const target = insetTargets[feature.properties.id];
        if (target) {
          const [[minX, minY], [maxX, maxY]] = pathBuilder.bounds(feature as never);
          const width = Math.max(maxX - minX, 1);
          const height = Math.max(maxY - minY, 1);
          const scale = Math.min(target.width / width, target.height / height);
          const translatedX = target.x + (target.width - width * scale) / 2 - minX * scale;
          const translatedY = target.y + (target.height - height * scale) / 2 - minY * scale;
          transform = `translate(${translatedX} ${translatedY}) scale(${scale})`;
        }
        accumulator.push({
          ...feature.properties,
          d,
          transform,
        });
        return accumulator;
      }, []);
    return {
      projectedFeatures,
      mainlandOutline,
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
            key={pendingId}
            defaultValue={pendingId}
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
          <path d={mapGeometry.mainlandOutline} className="national-outline" />
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
                <g key={feature.id} transform={feature.transform}>
                  <path
                    d={feature.d}
                    className={classes}
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
                </g>
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
            {activeConstituency ? `${activeConstituency.state}${activeConstituency.mp_name ? ` • MP ${activeConstituency.mp_name}` : ""}` : "All 543 constituencies are selectable from the national map."}
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
