import os
import chromadb
from chromadb.utils import embedding_functions

# Use the explicitly provided db path or fallback
CHROMA_PATH = os.getenv("CHROMA_DB_PATH", "./chroma_db")

class VectorStoreService:
    def __init__(self):
        self.client = chromadb.PersistentClient(path=CHROMA_PATH)
        # Use ChromaDB's built-in local embedding model (all-MiniLM-L6-v2 via ONNX)
        # Runs entirely locally — no API key required
        self.embedding_function = embedding_functions.DefaultEmbeddingFunction()
        self.collection_name = "documents_collection"

        # Get or create
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            embedding_function=self.embedding_function
        )

    def add_document_chunks(self, document_id: str, file_name: str, chunks: list[str]):
        """
        Add chunks to the ChromaDB vector store.
        """
        if not chunks:
            return

        ids = [f"{document_id}_chunk_{i}" for i in range(len(chunks))]
        metadatas = [{"document_id": document_id, "file_name": file_name, "chunk_index": i} for i in range(len(chunks))]

        self.collection.add(
            documents=chunks,
            ids=ids,
            metadatas=metadatas
        )

    def query_documents(self, query: str, n_results: int = 5, document_filter: str = None) -> list[dict]:
        """
        Query the vector store for most relevant chunks.
        """
        kwargs = {
            "query_texts": [query],
            "n_results": n_results
        }

        if document_filter:
            kwargs["where"] = {"file_name": document_filter}

        results = self.collection.query(**kwargs)

        # Flatten chroma response format
        relevant_chunks = []
        if results and results["documents"]:
            for i in range(len(results["documents"][0])):
                doc = results["documents"][0][i]
                meta = results["metadatas"][0][i]
                distance = results["distances"][0][i] if "distances" in results else 0

                relevant_chunks.append({
                    "text": doc,
                    "metadata": meta,
                    "distance": distance
                })

        return relevant_chunks

    def delete_document(self, file_name: str):
        """
        Delete all chunks for a given file_name
        """
        self.collection.delete(
            where={"file_name": file_name}
        )

vector_store = VectorStoreService()

