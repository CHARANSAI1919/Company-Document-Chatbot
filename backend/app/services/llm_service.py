import os
import asyncio
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
LLM_MODEL = os.getenv("LLM_MODEL", "gemini-1.5-flash")

genai.configure(api_key=GEMINI_API_KEY)

class LLMService:
    def __init__(self):
        self.model = genai.GenerativeModel(
            model_name=LLM_MODEL,
            system_instruction=(
                "You are a helpful, professional company document assistant. "
                "Your job is to answer user questions using ONLY the provided document context. "
                "If the answer in the context is incomplete, say what you know and note the missing pieces. "
                "Do NOT make up information. If the context doesn't contain the answer, politely say so. "
                "Use citation markers like [1], [2] when referencing information from the provided context."
            )
        )

    async def generate_rag_response(self, query: str, context_chunks: list[dict]) -> tuple[str, list[dict]]:
        """
        Generate a response using the provided context chunks via Google Gemini.
        Returns the AI response string and the list of citations.
        """
        if not context_chunks:
            return "I couldn't find any relevant information in the uploaded documents to answer your question.", []

        # Prepare context
        context_text = ""
        citations = []
        for i, chunk in enumerate(context_chunks):
            citation_num = i + 1
            meta = chunk.get("metadata", {})
            file_name = meta.get("file_name", "Unknown File")

            context_text += f"\n--- Document [{citation_num}]: {file_name} ---\n{chunk.get('text', '')}\n"
            citations.append({
                "citation_number": citation_num,
                "file_name": file_name,
                "chunk_index": meta.get("chunk_index", -1),
                "text_preview": chunk.get('text', '')[:100] + "..."
            })

        user_prompt = f"Context:\n{context_text}\n\nUser Question: {query}\n\nAnswer:"

        try:
            # Gemini SDK is synchronous, so run in a thread to avoid blocking the async event loop
            response = await asyncio.to_thread(
                self.model.generate_content,
                user_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.3,
                    max_output_tokens=1500,
                )
            )
            answer = response.text
            return answer, citations
        except Exception as e:
            print(f"Error in LLM generation: {e}")
            return f"Error communicating with AI service: {str(e)}", []

llm_service = LLMService()

