class WhatsAppService:
    async def send_acknowledgement(self, phone: str, message: str) -> dict:
        return {"phone": phone, "message": message, "status": "queued"}

