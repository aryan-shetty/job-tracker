import os
import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models import User
from auth import hash_password, verify_password, create_access_token, get_current_user
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/auth", tags=["auth"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

# --- Schemas ---
class RegisterRequest(BaseModel):
    email: str
    password: str
    name: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class GoogleAuthRequest(BaseModel):
    token: str

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    saved_resume_text: Optional[str] = None

# --- Routes ---
@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=data.email,
        name=data.name or data.email.split("@")[0],
        password_hash=hash_password(data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "email": user.email, "name": user.name}}

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not user.password_hash or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "email": user.email, "name": user.name}}

@router.post("/google")
async def google_auth(data: GoogleAuthRequest, db: Session = Depends(get_db)):
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        
        idinfo = id_token.verify_oauth2_token(
            data.token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )
        
        email = idinfo.get("email")
        google_id = idinfo.get("sub")
        name = idinfo.get("name")
        avatar_url = idinfo.get("picture")

    except Exception as e:
        print(f"Google token error: {e}")
        raise HTTPException(status_code=401, detail="Invalid Google token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, name=name, google_id=google_id, avatar_url=avatar_url)
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "email": user.email, "name": user.name, "avatar_url": user.avatar_url}}

@router.get("/me")
def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "avatar_url": current_user.avatar_url,
        "saved_resume_text": current_user.saved_resume_text,
        "created_at": current_user.created_at
    }

@router.put("/me")
def update_profile(data: UpdateProfileRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if data.name is not None:
        current_user.name = data.name
    if data.saved_resume_text is not None:
        current_user.saved_resume_text = data.saved_resume_text
    db.commit()
    db.refresh(current_user)
    return {"message": "Profile updated", "user": {"id": current_user.id, "email": current_user.email, "name": current_user.name}}