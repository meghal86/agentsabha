from __future__ import annotations

import math
from collections import Counter

from openai import AsyncOpenAI

from app.config import get_settings


class EmbeddingService:
    model = "text-embedding-3-small"
    dimensions = 1536

    def __init__(self) -> None:
        self.settings = get_settings()
        self.client = AsyncOpenAI(api_key=self.settings.openai_api_key) if self.settings.openai_api_key else None

    async def embed_text(self, text: str) -> list[float]:
        normalized_text = " ".join(text.lower().split())
        if not normalized_text:
            return [0.0] * self.dimensions

        if self.client is not None:
            response = await self.client.embeddings.create(model=self.model, input=normalized_text)
            return response.data[0].embedding

        return self._fallback_embedding(normalized_text)

    def _fallback_embedding(self, text: str) -> list[float]:
        vector = [0.0] * self.dimensions
        counts = Counter(text.split())
        for token, weight in counts.items():
            index = hash(token) % self.dimensions
            vector[index] += float(weight)

        magnitude = math.sqrt(sum(value * value for value in vector)) or 1.0
        return [value / magnitude for value in vector]
