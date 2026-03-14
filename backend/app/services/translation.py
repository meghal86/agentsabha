from __future__ import annotations

class TranslationService:
    async def translate_to_english(self, text: str, source_language: str | None = None) -> dict:
        return {"translated_text": text, "source_language": source_language or "en"}
