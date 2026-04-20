from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..db.base import get_db
from ..models.document import Document
from ..services.vector_store import vector_store

router = APIRouter()

@router.get("/documents")
async def get_documents(db: AsyncSession = Depends(get_db)):
    stmt = select(Document).order_by(Document.upload_time.desc())
    result = await db.execute(stmt)
    documents = result.scalars().all()
    
    return [
        {
            "id": doc.id,
            "filename": doc.file_name,
            "upload_time": doc.upload_time,
            "chunks": doc.number_of_chunks
        }
        for doc in documents
    ]

@router.delete("/document/{doc_id}")
async def delete_document(doc_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Document).where(Document.id == doc_id)
    result = await db.execute(stmt)
    doc = result.scalar_one_or_none()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Delete from DB
    await db.delete(doc)
    await db.commit()
    
    # Delete from Vector Store
    vector_store.delete_document(doc.file_name)
    
    return {"status": "success", "message": f"Deleted {doc.file_name}"}
