from __future__ import annotations

import asyncio
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.database import AsyncSessionLocal
from app.services.sansaddarpan_mp_ingest import sync_mp_identity_from_digital_sansad


async def main() -> None:
    async with AsyncSessionLocal() as db:
        result = await sync_mp_identity_from_digital_sansad(db)
    print(json.dumps(result.as_dict(), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
