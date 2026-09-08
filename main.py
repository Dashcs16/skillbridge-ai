from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pathlib import Path

app = FastAPI(title="SkillBridge AI")

BASE_DIR = Path(__file__).resolve().parent


career_skills = {
    "Frontend Developer": [
        "HTML", "CSS", "JavaScript", "React", "Git", "API"
    ],
    "Backend Developer": [
        "Python", "SQL", "FastAPI", "API", "Git"
    ],
    "Full Stack Developer": [
        "HTML", "CSS", "JavaScript", "React",
        "Python", "SQL", "Git", "API"
    ],
    "Data Analyst": [
        "Python", "SQL", "Excel", "Power BI",
        "Pandas", "Statistics"
    ],
    "AI/ML Engineer": [
        "Python", "Machine Learning", "Pandas",
        "NumPy", "Statistics", "Deep Learning"
    ]
}


class StudentData(BaseModel):
    name: str
    skills: str
    career: str


@app.get("/")
def home():
    return FileResponse(BASE_DIR / "frontend" / "index.html")


@app.post("/api/analyze")
def analyze_skills(student: StudentData):

    student_skills = [
        skill.strip().lower()
        for skill in student.skills.split(",")
        if skill.strip()
    ]

    required_skills = career_skills.get(student.career, [])

    matched = []
    missing = []

    for skill in required_skills:
        if skill.lower() in student_skills:
            matched.append(skill)
        else:
            missing.append(skill)

    if required_skills:
        readiness_score = round(
            (len(matched) / len(required_skills)) * 100
        )
    else:
        readiness_score = 0

    roadmap = []

    if missing:
        for index, skill in enumerate(missing, start=1):
            roadmap.append({
                "step": index,
                "skill": skill,
                "message": f"Learn {skill} and build a small project using it."
            })
    else:
        roadmap.append({
            "step": 1,
            "skill": "Advanced Projects",
            "message": "You have the required basic skills. Start building advanced real-world projects."
        })

    if readiness_score >= 80:
        recommendation = "Excellent! You are highly job-ready."
    elif readiness_score >= 50:
        recommendation = "Good progress! Learn the missing skills."
    else:
        recommendation = "You need to strengthen your core skills."

    return {
        "student_name": student.name,
        "career": student.career,
        "matched_skills": matched,
        "missing_skills": missing,
        "readiness_score": readiness_score,
        "recommendation": recommendation,
        "roadmap": roadmap
    }


app.mount(
    "/static",
    StaticFiles(directory=BASE_DIR / "frontend"),
    name="static"
)