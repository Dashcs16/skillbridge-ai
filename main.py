from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI(title="SkillBridge AI")


# Career-wise industry required skills
career_skills = {
    "Frontend Developer": [
        "HTML",
        "CSS",
        "JavaScript",
        "React",
        "Git",
        "API"
    ],

    "Backend Developer": [
        "Python",
        "SQL",
        "FastAPI",
        "API",
        "Git"
    ],

    "Full Stack Developer": [
        "HTML",
        "CSS",
        "JavaScript",
        "React",
        "Python",
        "SQL",
        "Git",
        "API"
    ],

    "Data Analyst": [
        "Python",
        "SQL",
        "Excel",
        "Power BI",
        "Pandas",
        "Statistics"
    ],

    "AI/ML Engineer": [
        "Python",
        "Machine Learning",
        "Pandas",
        "NumPy",
        "Statistics",
        "Deep Learning"
    ]
}


class StudentData(BaseModel):
    name: str
    skills: str
    career: str


@app.post("/api/analyze")
def analyze_skills(student: StudentData):

    # Student skills convert into list
    student_skills = [
        skill.strip().lower()
        for skill in student.skills.split(",")
        if skill.strip()
    ]

    # Required skills
    required_skills = career_skills.get(student.career, [])

    # Convert required skills to lowercase for comparison
    required_lower = [skill.lower() for skill in required_skills]

    matched = []
    missing = []

    for skill in required_skills:

        if skill.lower() in student_skills:
            matched.append(skill)

        else:
            missing.append(skill)

    # Calculate readiness percentage
    if len(required_skills) > 0:

        readiness_score = round(
            (len(matched) / len(required_skills)) * 100
        )

    else:
        readiness_score = 0


    # Personalized roadmap
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


    # Recommendation
    if readiness_score >= 80:
        recommendation = "Excellent! You are highly job-ready. Focus on projects, internships and interview preparation."

    elif readiness_score >= 50:
        recommendation = "Good progress! Learn the missing skills and build projects to improve your job readiness."

    else:
        recommendation = "You need to strengthen your core skills. Follow the personalized roadmap step by step."


    return {
        "student_name": student.name,
        "career": student.career,
        "matched_skills": matched,
        "missing_skills": missing,
        "readiness_score": readiness_score,
        "recommendation": recommendation,
        "roadmap": roadmap
    }


# Serve frontend
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")