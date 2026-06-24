from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from sqlalchemy.sql import func
from database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    company = Column(String, nullable=False)
    title = Column(String, nullable=False)
    status = Column(String, default="Applied")  # Applied, Interview, Offer, Rejected
    job_description = Column(Text, nullable=True)
    extracted_skills = Column(Text, nullable=True)  # JSON string of skills
    match_score = Column(Float, nullable=True)
    match_feedback = Column(Text, nullable=True)
    url = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())