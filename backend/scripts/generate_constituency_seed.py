from __future__ import annotations

import json
from pathlib import Path

SOURCE = Path("/tmp/datameet-maps/parliamentary-constituencies/india_pc_2019_simplified.geojson")
TARGET = Path(__file__).resolve().parents[1] / "app" / "data" / "constituencies.seed.json"

REGIONS = {
    "north": {
        "Jammu & Kashmir",
        "Ladakh",
        "Himachal Pradesh",
        "Punjab",
        "Chandigarh",
        "Uttarakhand",
        "Haryana",
        "Delhi",
        "Uttar Pradesh",
    },
    "south": {
        "Andhra Pradesh",
        "Telangana",
        "Karnataka",
        "Kerala",
        "Tamil Nadu",
        "Puducherry",
        "Lakshadweep",
        "Andaman & Nicobar",
    },
    "east": {"Bihar", "Jharkhand", "Odisha", "West Bengal"},
    "west": {"Rajasthan", "Gujarat", "Maharashtra", "Goa", "Dadra & Nagar Haveli and Daman & Diu"},
    "central": {"Madhya Pradesh", "Chhattisgarh"},
    "northeast": {"Assam", "Arunachal Pradesh", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Sikkim", "Tripura"},
}


def assign_region(state: str) -> str:
    for region, states in REGIONS.items():
        if state in states:
            return region
    return "central"


def extract_feature_centroid(feature: dict) -> tuple[float | None, float | None]:
    coords: list[list[float]] = []
    geometry = feature["geometry"]
    if geometry["type"] == "Polygon":
        polygons = [geometry["coordinates"]]
    elif geometry["type"] == "MultiPolygon":
        polygons = geometry["coordinates"]
    else:
        polygons = []

    for polygon in polygons:
        for ring in polygon:
            coords.extend(ring)

    if not coords:
        return None, None

    lng = round(sum(point[0] for point in coords) / len(coords), 6)
    lat = round(sum(point[1] for point in coords) / len(coords), 6)
    return lat, lng


def build_seed() -> list[dict]:
    payload = json.loads(SOURCE.read_text())
    features = sorted(payload["features"], key=lambda item: item["properties"]["pc_id"])

    rows = []
    for internal_id, feature in enumerate(features, start=1):
        props = feature["properties"]
        lat, lng = extract_feature_centroid(feature)
        rows.append(
            {
                "id": internal_id,
                "name": props["pc_name"],
                "state": props["st_name"],
                "region": assign_region(props["st_name"]),
                "population": None,
                "area_km2": None,
                "mp_name": None,
                "mp_party": None,
                "mp_party_govt": None,
                "lat": lat,
                "lng": lng,
            }
        )
    return rows


def main() -> None:
    rows = build_seed()
    TARGET.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n")
    print(f"Wrote {len(rows)} constituencies to {TARGET}")


if __name__ == "__main__":
    main()

