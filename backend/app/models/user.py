from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    spotify_id = Column(String, unique=True, index=True)
    display_name = Column(String)
    email = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    access_token = Column(String)
    refresh_token = Column(String)
    token_expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
