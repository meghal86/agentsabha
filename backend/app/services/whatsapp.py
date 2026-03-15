class WhatsAppService:
    async def send_acknowledgement(self, phone: str, message: str) -> dict:
        return {"phone": phone, "message": message, "status": "queued"}

    async def send_document(self, phone: str, caption: str, document_url: str) -> dict:
        return {"phone": phone, "caption": caption, "document_url": document_url, "status": "queued"}
