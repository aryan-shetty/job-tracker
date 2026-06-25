# 🎯 AI-Powered Job Application Tracker

A full-stack job application tracker that uses Claude AI to automatically extract required skills from job descriptions, score your resume match, and generate tailored cover letters.

## 🚀 Features

- **User Authentication** — Email/password and Google OAuth login with JWT tokens
- **Job Tracking** — Add and manage applications with status (Applied, Interview, Offer, Rejected)
- **AI Skill Extraction** — Claude automatically extracts required skills from job descriptions
- **Resume Scoring** — Upload your resume PDF and get an AI match score with detailed feedback
- **Cover Letter Generator** — Generate tailored cover letters with one click, download as PDF
- **User Profiles** — Save your resume once, reuse across all applications
- **Dashboard** — Visual stats showing your application pipeline
- **Search & Filter** — Filter by status, search by company or title

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Axios
- **Backend:** FastAPI, Python
- **Database:** PostgreSQL, SQLAlchemy
- **Auth:** JWT tokens, Google OAuth 2.0
- **AI:** Anthropic Claude API (claude-sonnet-4-6)
- **PDF Parsing:** PyPDF2
- **PDF Generation:** jsPDF

## ⚙️ Setup

### Prerequisites
- Python 3.10+
- Node.js 20.19+
- PostgreSQL

### 1. Clone the repository
```bash
git clone https://github.com/aryan-shetty/job-tracker.git
cd job-tracker
```

### 2. Backend setup
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
pip install -r backend/requirements.txt
```

### 3. Environment variables
Create a `.env` file in the root:
```
ANTHROPIC_API_KEY=your_anthropic_api_key
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/job_tracker
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GOOGLE_CLIENT_ID=your_google_client_id
```

### 4. Create PostgreSQL database
```sql
CREATE DATABASE job_tracker;
```

### 5. Run the backend
```bash
cd backend
uvicorn main:app --reload
```

### 6. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env`:
```
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📁 Project Structure

```
job-tracker/
├── backend/
│   ├── main.py          # FastAPI server + REST endpoints
│   ├── models.py        # SQLAlchemy database models
│   ├── database.py      # PostgreSQL connection
│   ├── ai.py            # Claude API integration
│   ├── auth.py          # JWT authentication
│   ├── users.py         # User routes (register, login, profile)
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       └── components/
│           ├── JobForm.jsx
│           ├── JobCard.jsx
│           ├── Dashboard.jsx
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── Profile.jsx
│           └── CoverLetter.jsx
├── .env
└── README.md
```

## 🔍 How It Works

1. Register or log in with email/password or Google OAuth
2. Add a job application with company, title, status, and job description
3. Claude automatically extracts required skills from the JD and displays them as tags
4. Upload your resume PDF once — it's parsed and saved to your profile
5. Click "Score Resume with AI" to get a match percentage and detailed feedback
6. Click "Generate Cover Letter" to get a tailored cover letter — download as PDF
7. Update application status as you progress through the hiring process