from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel
from services.chatbot_service import process_chat_message

router = APIRouter(tags=["chat"])


class ChatRequest(BaseModel):
    message: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    language: Optional[str] = "en-IN"
    commodity: Optional[str] = "onion"


@router.post("/api/chat")
def api_chat(req: ChatRequest):
    return process_chat_message(
        user_message=req.message,
        lat=req.latitude,
        lon=req.longitude,
        language=req.language,
        commodity=req.commodity
    )

