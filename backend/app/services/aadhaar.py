class AadhaarService:
    async def initiate_otp(self, mobile_e164: str, constituency_id: int) -> dict:
        return {"mobile_e164": mobile_e164, "constituency_id": constituency_id, "session_token": "sandbox-session-token"}

