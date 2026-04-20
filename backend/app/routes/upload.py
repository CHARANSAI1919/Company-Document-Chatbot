import os
import hashlib
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from ..db.base import get_db
from ..models.document import Document
from ..services.parser import parser_service
from ..services.vector_store import vector_store

router = APIRouter()

import uuid

@router.post("/upload")
async def upload_documents(
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db)
):
    results = []
    
    for file in files:
        contents = await file.read()
        
        # Calculate file hash to prevent duplicates
        file_hash = hashlib.sha256(contents).hexdigest()
        
        # Check if exists
        from sqlalchemy.future import select
        stmt = select(Document).where(Document.file_hash == file_hash)
        result = await db.execute(stmt)
        existing_doc = result.scalar_one_or_none()
        
        if existing_doc:
            results.append({"filename": file.filename, "status": "Already exists", "id": existing_doc.id})
            continue

        try:
            # Parse and chunk
            chunks = parser_service.parse_and_chunk(contents, file.filename)
            
            # Temporary unique ID for metadata
            doc_uuid = str(uuid.uuid4())

            # Save metadata to DB
            new_doc = Document(
                file_name=file.filename,
                file_hash=file_hash,
                number_of_chunks=len(chunks),
                file_path=f"/virtual/path/{file.filename}" # Mock path since we don't store locally
            )
            db.add(new_doc)
            await db.commit()
            await db.refresh(new_doc)

            # Insert into Vector Store
            vector_store.add_document_chunks(str(new_doc.id), file.filename, chunks)
            
            results.append({"filename": file.filename, "status": "Uploaded", "id": new_doc.id, "chunks": len(chunks)})
        except Exception as e:
            results.append({"filename": file.filename, "status": f"Error: {str(e)}"})
            
    return {"results": results}
