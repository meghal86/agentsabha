from __future__ import annotations

import asyncio
import json
import os
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.database import AsyncSessionLocal  # noqa: E402
from app.services.sansaddarpan_mp_participation_ingest import sync_mp_participation_from_digital_sansad  # noqa: E402


async def main() -> None:
    max_members = os.environ.get("MAX_MEMBERS")
    async with AsyncSessionLocal() as db:
        result = await sync_mp_participation_from_digital_sansad(
            db,
            max_members=int(max_members) if max_members else None,
        )
    print(json.dumps(result.as_dict(), indent=2))


if __name__ == "__main__":
    asyncio.run(main())
