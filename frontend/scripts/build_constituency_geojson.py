from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SEED_PATH = ROOT / "backend" / "app" / "data" / "constituencies.seed.json"
SOURCE_PATH = Path("/tmp/datameet-maps/parliamentary-constituencies/india_pc_2019_simplified.geojson")
OUTPUT_PATH = ROOT / "frontend" / "public" / "data" / "constituencies.geojson"
DISPLAY_NAME_OVERRIDES = {
    "Bangalore South": "Bengaluru South",
    "Gurgaon": "Gurugram",
}


def main() -> None:
    seed = json.loads(SEED_PATH.read_text())
    source = json.loads(SOURCE_PATH.read_text())
    seed_by_pair = {(row["name"], row["state"]): row for row in seed}

    features = []
    for feature in source["features"]:
        properties = feature["properties"]
        pair = (properties["pc_name"], properties["st_name"])
        row = seed_by_pair[pair]
        features.append(
            {
                "type": "Feature",
                "properties": {
                    "id": row["id"],
                    "name": DISPLAY_NAME_OVERRIDES.get(row["name"], row["name"]),
                    "source_name": row["name"],
                    "state": row["state"],
                    "name_hi": properties.get("pc_name_hi"),
                },
                "geometry": feature["geometry"],
            }
        )

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps({"type": "FeatureCollection", "features": features}, separators=(",", ":")))
    print(f"Wrote {len(features)} features to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
