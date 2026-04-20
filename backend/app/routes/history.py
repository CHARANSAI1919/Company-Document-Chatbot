from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import json

from ..db.base import get_db
from ..models.chat import ChatHistory

router = APIRouter()

@router.get("/history")
async def get_history(limit: int = 50, db: AsyncSession = Depends(get_db)):
    stmt = select(ChatHistory).order_by(ChatHistory.created_at.desc()).limit(limit)
    result = await db.execute(stmt)
    history = result.scalars().all()
    
    return [
        {
            "id": chat.id,
            "query": chat.user_query,
            "response": chat.ai_response,
            "citations": json.loads(chat.citations) if chat.citations else [],
            "timestamp": chat.created_at
        }
        for chat in history
    ]
