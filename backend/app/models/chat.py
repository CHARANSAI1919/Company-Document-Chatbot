from sqlalchemy import Column, Integer, String, DateTime, func, Text
from ..db.base import Base

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_query = Column(Text, nullable=False)
    ai_response = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # You could also add user_id here for multi-user support
    # user_id = Column(String, index=True, nullable=True)
    
    # Store references/citations used as a JSON string
    citations = Column(Text, nullable=True)
