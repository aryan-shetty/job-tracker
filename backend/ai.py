import os
import json
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

client = Anthropic()

def extract_skills_from_jd(job_description: str) -> list[str]:
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        messages=[
            {
                "role": "user",
                "content": f"""Extract the key required skills from this job description.
Return ONLY a JSON array of strings, no markdown, no backticks, no extra text.
Example output: ["Python", "SQL", "AWS"]

Job Description:
{job_description}"""
            }
        ]
    )

    try:
        raw = response.content[0].text.strip().replace("```json", "").replace("```", "").strip()
        return json.loads(raw)
    except Exception as e:
        print(f"Skills parsing error: {e}, raw: {response.content[0].text}")
        return []

def score_resume_match(job_description: str, resume_text: str) -> dict:
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        messages=[
            {
                "role": "user",
                "content": f"""Compare this resume against the job description.
Return ONLY a JSON object with no markdown, no backticks, no extra text.
Example output: {{"score": 75, "feedback": "Strong Python skills but missing dbt experience."}}

Job Description:
{job_description}

Resume:
{resume_text}"""
            }
        ]
    )

    try:
        raw = response.content[0].text.strip().replace("```json", "").replace("```", "").strip()
        print(f"Score raw response: {raw}")
        return json.loads(raw)
    except Exception as e:
        print(f"Score parsing error: {e}, raw: {response.content[0].text}")
        return {"score": 0, "feedback": "Could not analyze match."}
    
def generate_cover_letter(job_description: str, resume_text: str, user_name: str) -> str:
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1500,
        messages=[
            {
                "role": "user",
                "content": f"""Write a professional, tailored cover letter for this job application.

Guidelines:
- Address it to the hiring team
- Keep it to 3-4 paragraphs
- Opening: express enthusiasm for the specific role and company
- Middle: highlight 2-3 most relevant experiences from the resume that match the JD
- Closing: call to action, thank them
- Sign off with the candidate's name: {user_name}
- Do NOT use generic filler phrases like "I am writing to express my interest"
- Sound natural, confident, and specific

Job Description:
{job_description}

Resume:
{resume_text}

Write only the cover letter, no extra commentary."""
            }
        ]
    )
    return response.content[0].text.strip()