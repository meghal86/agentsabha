export type ConstituencyGeometry = {
  type: string;
  coordinates: unknown;
};

export type ConstituencyFeature<P = Record<string, unknown>> = {
  type: string;
  properties: P;
  geometry: ConstituencyGeometry;
};

export type ConstituencyFeatureCollection<P = Record<string, unknown>> = {
  type: string;
  features: ConstituencyFeature<P>[];
};

type Point = [number, number];
type Ring = Point[];
type Polygon = Ring[];
type Bounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

function isPoint(value: unknown): value is Point {
  return Array.isArray(value) && value.length >= 2 && typeof value[0] === "number" && typeof value[1] === "number";
}

function distinctPointCount(ring: Ring) {
  return new Set(ring.map((point) => `${point[0]},${point[1]}`)).size;
}

export function polygonsFromGeometry(geometry: ConstituencyGeometry): Polygon[] {
  if (!geometry || geometry.type !== "MultiPolygon" || !Array.isArray(geometry.coordinates)) {
    return [];
  }

  const polygons: Polygon[] = [];
  for (const polygonValue of geometry.coordinates as unknown[]) {
    if (!Array.isArray(polygonValue)) continue;
    const rings: Ring[] = [];
    for (const ringValue of polygonValue as unknown[]) {
      if (!Array.isArray(ringValue)) continue;
      const ring = ringValue.filter(isPoint);
      if (ring.length >= 4 && distinctPointCount(ring) >= 3) {
        rings.push(ring);
      }
    }
    if (rings.length > 0) {
      polygons.push(rings);
    }
  }

  return polygons;
}

export function boundsForPolygons(polygons: Polygon[]): Bounds | null {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const polygon of polygons) {
    for (const ring of polygon) {
      for (const [x, y] of ring) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    return null;
  }

  return { minX, minY, maxX, maxY };
}

export function mergeBounds(items: Array<Bounds | null>): Bounds | null {
  const valid = items.filter((item): item is Bounds => item !== null);
  if (valid.length === 0) return null;

  return valid.reduce(
    (accumulator, item) => ({
      minX: Math.min(accumulator.minX, item.minX),
      minY: Math.min(accumulator.minY, item.minY),
      maxX: Math.max(accumulator.maxX, item.maxX),
      maxY: Math.max(accumulator.maxY, item.maxY),
    }),
    valid[0],
  );
}

export function createProjector(bounds: Bounds, width: number, height: number, padding: number) {
  const innerWidth = Math.max(width - padding * 2, 1);
  const innerHeight = Math.max(height - padding * 2, 1);
  const extentX = Math.max(bounds.maxX - bounds.minX, 0.0001);
  const extentY = Math.max(bounds.maxY - bounds.minY, 0.0001);
  const scale = Math.min(innerWidth / extentX, innerHeight / extentY);
  const offsetX = (width - extentX * scale) / 2;
  const offsetY = (height - extentY * scale) / 2;

  return (point: Point): Point => [
    offsetX + (point[0] - bounds.minX) * scale,
    offsetY + (bounds.maxY - point[1]) * scale,
  ];
}

export function pathFromPolygons(polygons: Polygon[], project: (point: Point) => Point) {
  return polygons
    .map((polygon) =>
      polygon
        .map((ring) => {
          const projected = ring.map(project);
          if (projected.length === 0) return "";
          const [first, ...rest] = projected;
          return `M ${first[0].toFixed(2)} ${first[1].toFixed(2)} ${rest
            .map(([x, y]) => `L ${x.toFixed(2)} ${y.toFixed(2)}`)
            .join(" ")} Z`;
        })
        .join(" "),
    )
    .join(" ");
}

export function centroidFromBounds(bounds: Bounds, project: (point: Point) => Point) {
  return project([(bounds.minX + bounds.maxX) / 2, (bounds.minY + bounds.maxY) / 2]);
}
