class EmbeddingService:
    model = "text-embedding-3-small"

    async def embed_text(self, text: str) -> list[float]:
        return [0.0] * 1536 if text else [0.0] * 1536

