# 🎯 AI-Powered Job Application Tracker

A full-stack job application tracker that uses Claude AI to automatically extract required skills from job descriptions and score your resume match percentage.

## 🚀 Features

- Add and track job applications with status (Applied, Interview, Offer, Rejected)
- Claude AI auto-extracts required skills from job descriptions
- Upload your resume PDF and get an AI-powered match score with detailed feedback
- Resume saved locally — upload once, reuse across all applications
- Dashboard showing application stats by status
- Search and filter applications by company, title, or status
- Update application status in real time

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Axios
- **Backend:** FastAPI, Python
- **Database:** PostgreSQL, SQLAlchemy
- **AI:** Anthropic Claude API (claude-sonnet-4-6)
- **PDF Parsing:** PyPDF2

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
ANTHROPIC_API_KEY=your_api_key_here
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/job_tracker
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

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📁 Project Structure

```
job-tracker/
├── backend/
│   ├── main.py          # FastAPI server + REST endpoints
│   ├── models.py        # SQLAlchemy database models
│   ├── database.py      # PostgreSQL connection
│   ├── ai.py            # Claude API integration
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── App.jsx
│       └── components/
│           ├── JobForm.jsx
│           ├── JobCard.jsx
│           └── Dashboard.jsx
├── .env
└── README.md
```

## 🔍 How It Works

1. Add a job application with company, title, status, and job description
2. Claude automatically extracts required skills from the JD and displays them as tags
3. Upload your resume PDF once — it's parsed and saved locally for reuse
4. Click "Score Resume with AI" to get a match percentage and detailed feedback
5. Update application status as you progress through the hiring process