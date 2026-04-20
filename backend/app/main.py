from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .db.base import engine, Base
from .routes import upload, chat, documents, history

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create db tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown logic if any
    pass

app = FastAPI(
    title="Company Document Chatbot API",
    description="RAG Pipeline for exploring company documents",
    version="1.0.0",
    lifespan=lifespan
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Since it's local we allow all, in prod define exact origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload.router, tags=["Upload"])
app.include_router(chat.router, tags=["Chat"])
app.include_router(documents.router, tags=["Documents"])
app.include_router(history.router, tags=["History"])

@app.get("/")
async def root():
    return {"message": "Welcome to Company Document Chatbot API"}
