import datetime as dt
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Boolean
from sqlalchemy.orm import relationship

from .database import Base


class Website(Base):
    __tablename__ = "websites"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    url = Column(String(1024), nullable=False, unique=True)
    recipient_email = Column(String(255), nullable=False)
    active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=dt.datetime.utcnow, nullable=False)
    last_digest_sent = Column(DateTime, nullable=True)

    screenshots = relationship("Screenshot", back_populates="website", cascade="all, delete-orphan")


class Screenshot(Base):
    __tablename__ = "screenshots"

    id = Column(Integer, primary_key=True, index=True)
    website_id = Column(Integer, ForeignKey("websites.id", ondelete="CASCADE"), nullable=False)
    image_path = Column(String(1024), nullable=False)
    captured_at = Column(DateTime, default=dt.datetime.utcnow, nullable=False, index=True)

    website = relationship("Website", back_populates="screenshots")
