from sqlalchemy import Column, Integer, String, DateTime, func
from ..db.base import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String, index=True, nullable=False)
    file_hash = Column(String, unique=True, index=True, nullable=False)
    upload_time = Column(DateTime(timezone=True), server_default=func.now())
    number_of_chunks = Column(Integer, default=0)
    file_path = Column(String, nullable=False)
