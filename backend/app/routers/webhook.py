from fastapi import APIRouter, HTTPException, Query, Request

from app.config import get_settings

router = APIRouter(tags=["webhook"])
settings = get_settings()


@router.get("/webhook/whatsapp")
async def verify_whatsapp_webhook(
    hub_mode: str = Query(alias="hub.mode"),
    hub_verify_token: str = Query(alias="hub.verify_token"),
    hub_challenge: str = Query(alias="hub.challenge"),
) -> str:
    if hub_mode == "subscribe" and hub_verify_token == settings.whatsapp_verify_token:
        return hub_challenge
    raise HTTPException(status_code=403, detail="Webhook verification failed")


@router.post("/webhook/whatsapp")
async def receive_whatsapp_webhook(request: Request) -> dict:
    payload = await request.json()
    return {"status": "accepted", "messages": len(payload.get("entry", []))}

