<img width="673" height="3" alt="image" src="https://github.com/user-attachments/assets/ad0de24e-e40f-4c1b-ba6a-dc1de853c336" />

# AI-powered Company Document Chatbot

[![Case Study PDF](https://img.shields.io/badge/Case%20Study-PDF-red?style=for-the-badge&logo=adobeacrobatreader)](./Trendance_case_study.pdf)

A full-stack Retrieval-Augmented Generation (RAG) web application using FastAPI, PostgreSQL, Redis, ChromaDB, React, and Tailwind CSS.

## Architecture

1. **Frontend**: React + Vite + Tailwind CSS. Designed with a dark mode modern aesthetic, interactive sidebars, uploading modals, and dynamic chat functionality.
2. **Backend**: FastAPI with async router configurations. Connects to PostgreSQL, Redis, and ChromaDB.
3. **Database**: PostgreSQL for storing Document metadata and Chat History.
4. **Cache**: Redis for rapid querying of exact-match repeated chat questions.
5. **Vector Store**: ChromaDB running embedded.
6. **LLM/Embeddings**: OpenAI `text-embedding-3-small` and `gpt-4o-mini`.

### System Flow
1. **Upload**: User drags/drops DOCX/PDF files -> Sent to FastAPI `/upload`
2. **Chunking**: `pypdf`/`docx` extracts text, Langchain splits into chunks
3. **Embedding**: Chunks are embedded and stored in ChromaDB
4. **Retrieval**: User asks question -> Semantic search in ChromaDB -> Top 5 chunks retrieved
5. **Generation**: Top 5 chunks formatted into LLM context -> OpenAI inference -> Answer & citations generated
6. **Cache**: Responses saved in Redis. Chat history saved in PostgreSQL.

## Getting Started

1. **Add API Key**: Copy `backend/.env.example` to `backend/.env` and update `OPENAI_API_KEY`.
2. **Launch Infrastructure**: Run `docker-compose up -d --build` from the root directory.
   - Frontend will run on `http://localhost:5173`
   - Backend API will run on `http://localhost:8000`
3. **Run DB Migrations**: 
   ```bash
   docker exec -it chatbot-backend python -m app.db.init_db
   ```
4. **Use App**: Open `http://localhost:5173`. Upload PDF/DOCX files and perform natural language chat queries.

## Advanced Features Implemented
- Compare Mode: Built into the UI; visual toggles via sidebar.
- Progress Uploads: Animated progress tracking in the dynamic drag-and-drop modal.
- Cache optimizations: Immediate response rendering if hitting Redis via the chat endpoint.
- Database persistance via async SQLAlchemy.

## Future Improvements Suggested
- **Authentication**: Oauth2 + JWT integration.
- **OCR Support**: Incorporate `pytesseract` to extract image-based PDFs.
- **Role-based Access**: Limit certain documents based on admin/employee levels.
- **Streaming Tokens**: Utilize SSE (Server-Sent Events) from FastAPI to show typing generation visually word-by-word.
