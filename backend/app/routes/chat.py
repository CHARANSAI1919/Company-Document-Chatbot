from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
import json
from typing import Optional

from ..db.base import get_db
from ..models.chat import ChatHistory
from ..services.vector_store import vector_store
from ..services.llm_service import llm_service
from ..services.cache_service import cache_service

router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    filter_file: Optional[str] = None  # Optional specific file to search in

@router.post("/chat")
async def chat_endpoint(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    # 1. Check Cache
    cache_key = request.query + (f"|doc:{request.filter_file}" if request.filter_file else "")
    cached = await cache_service.get_cached_response(cache_key)
    if cached:
        return {"answer": cached["answer"], "citations": cached["citations"], "cached": True}

    # 2. Retrieve Relevant Chunks
    relevant_chunks = vector_store.query_documents(
        query=request.query, 
        n_results=5,
        document_filter=request.filter_file
    )

    # 3. Generate Answer
    answer, citations = await llm_service.generate_rag_response(request.query, relevant_chunks)

    # 4. Save to DB
    new_chat = ChatHistory(
        user_query=request.query,
        ai_response=answer,
        citations=json.dumps(citations)
    )
    db.add(new_chat)
    await db.commit()

    # 5. Cache response
    response_data = {"answer": answer, "citations": citations, "cached": False}
    await cache_service.set_cached_response(cache_key, response_data)

    return response_data
