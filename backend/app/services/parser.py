import os
import io
import pypdf
import docx
from langchain_text_splitters import RecursiveCharacterTextSplitter

class DocumentParserService:
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            is_separator_regex=False,
        )

    def extract_text_from_pdf(self, file_content: bytes) -> tuple[str, list[dict]]:
        """
        Extracts text from a PDF file. 
        Returns a single string for full text and a list of page dicts for metadata tracking.
        """
        reader = pypdf.PdfReader(io.BytesIO(file_content))
        full_text = ""
        pages_metadata = []
        
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                full_text += page_text + "\n\n"
                pages_metadata.append({"page": i + 1, "text": page_text})
                
        return full_text, pages_metadata

    def extract_text_from_docx(self, file_content: bytes) -> tuple[str, list[dict]]:
        """
        Extracts text from a DOCX file.
        Docs don't have strict 'pages' in text extraction easily, so treat paragraphs as block chunks.
        """
        doc = docx.Document(io.BytesIO(file_content))
        full_text = ""
        blocks = []
        
        for i, para in enumerate(doc.paragraphs):
            if para.text.strip():
                full_text += para.text + "\n"
                blocks.append({"block": i + 1, "text": para.text})
                
        return full_text, blocks

    def parse_and_chunk(self, file_content: bytes, filename: str) -> list[str]:
        """
        Parses a file based on its extension and returns chunks of text.
        """
        ext = os.path.splitext(filename)[1].lower()
        if ext == ".pdf":
            full_text, _ = self.extract_text_from_pdf(file_content)
        elif ext == ".docx":
            full_text, _ = self.extract_text_from_docx(file_content)
        else:
            raise ValueError(f"Unsupported file format: {ext}")
            
        chunks = self.text_splitter.split_text(full_text)
        return chunks

parser_service = DocumentParserService()
