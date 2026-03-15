"use client";

import { useEffect, useMemo, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { useRouter } from "next/navigation";

import type { ConstituencyDirectoryItem, HeatmapPoint } from "@/lib/api";

type ConstituencyFeature = {
  type: "Feature";
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
  type: "FeatureCollection";
  features: ConstituencyFeature[];
};

type ProjectedFeature = ConstituencyFeature["properties"] & {
  d: string;
};

type NationalConstituencyMapProps = {
  constituencies: ConstituencyDirectoryItem[];
  heatmap: HeatmapPoint[];
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

export function NationalConstituencyMap({ constituencies, heatmap, selectedId }: NationalConstituencyMapProps) {
  const router = useRouter();
  const [collection, setCollection] = useState<ConstituencyFeatureCollection | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(selectedId ?? null);
  const [pendingId, setPendingId] = useState<number>(selectedId ?? constituencies[0]?.id ?? 1);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch("/data/constituencies.geojson")
      .then((response) => response.json())
      .then((data: ConstituencyFeatureCollection) => {
        if (!cancelled) setCollection(data);
      })
      .catch(() => {
        if (!cancelled) setCollection({ type: "FeatureCollection", features: [] });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedId) {
      setPendingId(selectedId);
      setHoveredId(selectedId);
    }
  }, [selectedId]);

  useEffect(() => {
    const current = constituencies.find((entry) => entry.id === pendingId);
    if (current) {
      setSearchValue(`${current.name} — ${current.state}`);
    }
  }, [pendingId, constituencies]);

  const heatmapById = useMemo(() => new Map(heatmap.map((entry) => [entry.id, entry])), [heatmap]);
  const constituencyById = useMemo(() => new Map(constituencies.map((entry) => [entry.id, entry])), [constituencies]);

  const projectedFeatures = useMemo<ProjectedFeature[]>(() => {
    if (!collection || collection.features.length === 0) return [];
    const projection = geoMercator().fitSize([530, 640], collection as never);
    const pathBuilder = geoPath(projection);
    return collection.features
      .map((feature) => {
        const d = pathBuilder(feature as never);
        if (!d) return null;
        return {
          ...feature.properties,
          d,
        };
      })
      .filter((feature): feature is ProjectedFeature => Boolean(feature));
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
          <input
            list="constituency-directory"
            value={searchValue}
            onChange={(event) => {
              const value = event.target.value;
              setSearchValue(value);
              const match = constituencies.find((entry) => `${entry.name} — ${entry.state}` === value);
              if (match) {
                setPendingId(match.id);
                setHoveredId(match.id);
              }
            }}
            placeholder="Search constituency or state"
          />
          <datalist id="constituency-directory">
            {constituencies.map((entry) => (
              <option key={entry.id} value={`${entry.name} — ${entry.state}`} />
            ))}
          </datalist>
        </label>
        <button className="secondary-button map-open-button" type="button" onClick={() => openConstituency(pendingId)}>
          Open constituency
        </button>
      </div>

      <div className="national-map-stage">
        <svg className="india-map national-map-svg" viewBox="0 0 530 640" aria-label="India map with all 543 Lok Sabha constituencies">
          <g className="national-constituency-layer">
            {projectedFeatures.map((feature) => {
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
