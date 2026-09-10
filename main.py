from fastapi import FastAPI, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pathlib import Path
from pypdf import PdfReader
from docx import Document
import io


app = FastAPI(title="SkillBridge AI")


# =========================
# PATH SETTINGS
# =========================

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR / "frontend"


# =========================
# CAREER SKILLS DATABASE
# =========================

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


# =========================
# SKILLS FOR RESUME DETECTION
# =========================

KNOWN_SKILLS = [

    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Angular",

    "Python",
    "Java",
    "C",
    "C++",

    "SQL",
    "MySQL",
    "MongoDB",

    "FastAPI",
    "Node.js",
    "Node",

    "PHP",

    "Git",
    "GitHub",

    "API",

    "Pandas",
    "NumPy",

    "Power BI",
    "Excel",

    "Machine Learning",
    "Deep Learning",

    "Statistics"
]


# =========================
# STUDENT MODEL
# =========================

class StudentData(BaseModel):

    name: str
    skills: str
    career: str


# =========================
# STATIC FILES
# =========================

app.mount(
    "/static",
    StaticFiles(directory=str(FRONTEND_DIR)),
    name="static"
)


# =========================
# HOME PAGE
# =========================

@app.get("/")
def home():

    return FileResponse(
        FRONTEND_DIR / "index.html"
    )


# =========================
# SKILL GAP ANALYSIS
# =========================

@app.post("/api/analyze")
def analyze_skills(student: StudentData):

    # Convert student skills into list

    student_skills = [

        skill.strip().lower()

        for skill in student.skills.split(",")

        if skill.strip()

    ]


    # Get required skills

    required_skills = career_skills.get(
        student.career,
        []
    )


    matched = []
    missing = []


    # Compare skills

    for skill in required_skills:

        if skill.lower() in student_skills:

            matched.append(skill)

        else:

            missing.append(skill)


    # Calculate readiness score

    if required_skills:

        readiness_score = round(

            (len(matched) / len(required_skills)) * 100

        )

    else:

        readiness_score = 0


    # Create roadmap

    roadmap = []


    if missing:

        for index, skill in enumerate(
            missing,
            start=1
        ):

            roadmap.append({

                "step": index,

                "skill": skill,

                "message":
                    f"Learn {skill} and build a practical project using it."

            })

    else:

        roadmap.append({

            "step": 1,

            "skill": "Advanced Projects",

            "message":
                "You have the required skills. Build advanced real-world projects and prepare for interviews."

        })


    # Recommendation

    if readiness_score >= 80:

        recommendation = (
            "Excellent! You are highly job-ready. "
            "Focus on projects, internships and interview preparation."
        )

    elif readiness_score >= 50:

        recommendation = (
            "Good progress! Learn the missing skills "
            "and build projects to improve your career readiness."
        )

    else:

        recommendation = (
            "You need to strengthen your core technical skills. "
            "Follow the personalized roadmap step by step."
        )


    # Return result

    return {

        "student_name": student.name,

        "career": student.career,

        "matched_skills": matched,

        "missing_skills": missing,

        "readiness_score": readiness_score,

        "recommendation": recommendation,

        "roadmap": roadmap
    }


# =========================
# RESUME UPLOAD API
# =========================

@app.post("/api/resume")
async def analyze_resume(
    file: UploadFile = File(...)
):

    filename = file.filename.lower()


    # File validation

    if not filename.endswith(
        (".pdf", ".docx")
    ):

        return {

            "success": False,

            "message":
                "Please upload only PDF or DOCX files."

        }


    # Read uploaded file

    content = await file.read()


    text = ""


    try:


        # =====================
        # PDF READING
        # =====================

        if filename.endswith(".pdf"):

            pdf_file = io.BytesIO(content)

            reader = PdfReader(pdf_file)


            for page in reader.pages:

                extracted_text = page.extract_text()


                if extracted_text:

                    text += extracted_text + " "


        # =====================
        # DOCX READING
        # =====================

        elif filename.endswith(".docx"):

            doc_file = io.BytesIO(content)

            document = Document(doc_file)


            for paragraph in document.paragraphs:

                text += paragraph.text + " "


    except Exception as error:

        print("Resume Error:", error)


        return {

            "success": False,

            "message":
                "Could not read this resume. Please try another file."

        }


    # =========================
    # DETECT SKILLS
    # =========================

    detected_skills = []


    text_lower = text.lower()


    for skill in KNOWN_SKILLS:

        if skill.lower() in text_lower:

            detected_skills.append(skill)


    # Remove duplicate skills

    detected_skills = list(
        dict.fromkeys(detected_skills)
    )


    return {

        "success": True,

        "message":
            "Resume analyzed successfully!",

        "detected_skills":
            detected_skills
    }