from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    password_hash = Column(String, nullable=True)  # Null for Google OAuth users
    google_id = Column(String, nullable=True, unique=True)
    avatar_url = Column(String, nullable=True)
    saved_resume_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    jobs = relationship("Job", back_populates="user", cascade="all, delete-orphan")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company = Column(String, nullable=False)
    title = Column(String, nullable=False)
    status = Column(String, default="Applied")
    job_description = Column(Text, nullable=True)
    extracted_skills = Column(Text, nullable=True)
    match_score = Column(Float, nullable=True)
    match_feedback = Column(Text, nullable=True)
    url = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="jobs")