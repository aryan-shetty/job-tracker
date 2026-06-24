import os
import json
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from fastapi import UploadFile, File
import io

from database import engine, get_db, Base
from models import Job
from ai import extract_skills_from_jd, score_resume_match

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Schemas ---
class JobCreate(BaseModel):
    company: str
    title: str
    status: str = "Applied"
    job_description: Optional[str] = None
    url: Optional[str] = None
    notes: Optional[str] = None

class JobUpdate(BaseModel):
    company: Optional[str] = None
    title: Optional[str] = None
    status: Optional[str] = None
    job_description: Optional[str] = None
    url: Optional[str] = None
    notes: Optional[str] = None

class ResumeScore(BaseModel):
    job_id: int
    resume_text: str

# --- Routes ---
@app.get("/jobs")
def get_jobs(db: Session = Depends(get_db)):
    jobs = db.query(Job).order_by(Job.created_at.desc()).all()
    return jobs

@app.post("/jobs")
def create_job(job: JobCreate, db: Session = Depends(get_db)):
    db_job = Job(**job.model_dump())

    if job.job_description:
        skills = extract_skills_from_jd(job.job_description)
        db_job.extracted_skills = json.dumps(skills)

    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

@app.get("/jobs/{job_id}")
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@app.put("/jobs/{job_id}")
def update_job(job_id: int, job: JobUpdate, db: Session = Depends(get_db)):
    db_job = db.query(Job).filter(Job.id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    for key, value in job.model_dump(exclude_unset=True).items():
        setattr(db_job, key, value)

    if job.job_description:
        skills = extract_skills_from_jd(job.job_description)
        db_job.extracted_skills = json.dumps(skills)

    db.commit()
    db.refresh(db_job)
    return db_job

@app.delete("/jobs/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    db_job = db.query(Job).filter(Job.id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(db_job)
    db.commit()
    return {"message": "Job deleted"}

@app.post("/jobs/score-resume")
def score_resume(data: ResumeScore, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == data.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if not job.job_description:
        raise HTTPException(status_code=400, detail="Job has no description to match against")

    result = score_resume_match(job.job_description, data.resume_text)
    job.match_score = result.get("score")
    job.match_feedback = result.get("feedback")
    db.commit()
    db.refresh(job)
    return result

@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total = db.query(Job).count()
    applied = db.query(Job).filter(Job.status == "Applied").count()
    interview = db.query(Job).filter(Job.status == "Interview").count()
    offer = db.query(Job).filter(Job.status == "Offer").count()
    rejected = db.query(Job).filter(Job.status == "Rejected").count()
    return {
        "total": total,
        "applied": applied,
        "interview": interview,
        "offer": offer,
        "rejected": rejected
    }

@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    contents = await file.read()
    reader = PdfReader(io.BytesIO(contents))
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return {"text": text.strip()}

@app.get("/health")
def health():
    return {"status": "ok"}