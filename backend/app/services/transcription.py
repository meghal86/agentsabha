class TranscriptionService:
    async def transcribe_audio(self, media_url: str) -> dict:
        return {"media_url": media_url, "text": "", "language": "en"}

