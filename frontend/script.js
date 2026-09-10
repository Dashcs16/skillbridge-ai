// ==========================================
// RESUME FILE SELECTION
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const resumeInput = document.getElementById("resume");

    if (resumeInput) {

        resumeInput.addEventListener("change", function () {

            const file = this.files[0];

            const fileName =
                document.getElementById("fileName");

            if (file) {

                fileName.innerText =
                    "📄 Selected: " + file.name;

            } else {

                fileName.innerText =
                    "📄 PDF or DOCX • Max 5 MB";

            }

        });

    }

});


// ==========================================
// RESUME UPLOAD
// ==========================================

async function uploadResume() {

    const fileInput =
        document.getElementById("resume");

    const file =
        fileInput.files[0];

    const result =
        document.getElementById("resumeResult");

    const fileName =
        document.getElementById("fileName");


    // Check if file selected

    if (!file) {

        alert("Please select your resume first!");

        return;

    }


    // Check file type

    const allowedTypes =
        ["application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];


    if (!allowedTypes.includes(file.type)) {

        alert("Please upload only PDF or DOCX file!");

        return;

    }


    // Check file size

    if (file.size > 5 * 1024 * 1024) {

        alert("File size should be less than 5 MB!");

        return;

    }


    // Loading message

    fileName.innerText =
        "🤖 AI is analyzing your resume...";


    result.innerHTML = `

        <div class="resume-success">

            <h3>⏳ Please Wait...</h3>

            <p>
                Extracting technical skills from your resume...
            </p>

        </div>

    `;


    // Create FormData

    const formData =
        new FormData();


    // IMPORTANT:
    // Backend expects parameter name "file"

    formData.append("file", file);


    try {

        // Send resume to FastAPI backend

        const response =
            await fetch("/api/resume", {

                method: "POST",

                body: formData

            });


        // Check HTTP error

        if (!response.ok) {

            throw new Error(
                "Server error: " +
                response.status
            );

        }


        // Get backend response

        const data =
            await response.json();


        // Backend success check

        if (data.success !== true) {

            fileName.innerText =
                "❌ Resume analysis failed";


            result.innerHTML = `

                <div class="resume-error">

                    <h3>
                        ❌ Analysis Failed
                    </h3>

                    <p>
                        ${data.message ||
                        "Could not analyze resume."}
                    </p>

                </div>

            `;

            return;

        }


        // Get detected skills

        const detectedSkills =
            Array.isArray(data.detected_skills)
                ? data.detected_skills
                : [];


        // Success

        fileName.innerText =
            "✅ Resume analyzed successfully";


        // Create skills HTML

        let skillsHTML = "";


        if (detectedSkills.length > 0) {

            detectedSkills.forEach(function (skill) {

                skillsHTML += `

                    <span class="skill matched">

                        ${skill}

                    </span>

                `;

            });

        } else {

            skillsHTML = `

                <p>
                    No technical skills detected in this resume.
                </p>

            `;

        }


        // Display result

        result.innerHTML = `

            <div class="resume-success">

                <h3>
                    🤖 Resume Analysis Complete!
                </h3>

                <p>
                    ${data.message}
                </p>

                <h4>
                    🎯 Detected Technical Skills
                </h4>

                <div class="skills-container">

                    ${skillsHTML}

                </div>

            </div>

        `;


        // Auto-fill skills field

        const skillsInput =
            document.getElementById("skills");


        if (
            skillsInput &&
            detectedSkills.length > 0
        ) {

            skillsInput.value =
                detectedSkills.join(", ");

        }


    } catch (error) {

        console.error(
            "Resume Error:",
            error
        );


        fileName.innerText =
            "❌ Resume upload failed";


        result.innerHTML = `

            <div class="resume-error">

                <h3>
                    ❌ Resume Upload Failed
                </h3>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }

}


// ==========================================
// SKILL ANALYSIS
// ==========================================

async function analyzeSkills() {

    const name =
        document.getElementById("name")
            .value.trim();


    const skills =
        document.getElementById("skills")
            .value.trim();


    const career =
        document.getElementById("career")
            .value;


    // Validation

    if (!name || !skills || !career) {

        alert(
            "Please fill all the details!"
        );

        return;

    }


    const loading =
        document.getElementById("loading");


    const resultBox =
        document.getElementById("result");


    // Show loading

    loading.style.display =
        "block";


    resultBox.style.display =
        "none";


    try {

        const response =
            await fetch("/api/analyze", {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    name: name,

                    skills: skills,

                    career: career

                })

            });


        if (!response.ok) {

            throw new Error(
                "Analysis failed"
            );

        }


        const data =
            await response.json();


        // Hide loading

        loading.style.display =
            "none";


        // Show result

        resultBox.style.display =
            "block";


        // Welcome

        document.getElementById("welcome")
            .innerText =
            `Hello ${data.student_name}! 👋`;


        // Score animation

        animateScore(
            data.readiness_score
        );


        // ==================================
        // MATCHED SKILLS
        // ==================================

        const matchedContainer =
            document.getElementById(
                "matchedSkills"
            );


        matchedContainer.innerHTML = "";


        if (
            !data.matched_skills ||
            data.matched_skills.length === 0
        ) {

            matchedContainer.innerHTML =
                "<p>No matching skills found yet.</p>";

        } else {

            data.matched_skills.forEach(
                function (skill) {

                    matchedContainer.innerHTML += `

                        <span class="skill matched">

                            ${skill}

                        </span>

                    `;

                }
            );

        }


        // ==================================
        // MISSING SKILLS
        // ==================================

        const missingContainer =
            document.getElementById(
                "missingSkills"
            );


        missingContainer.innerHTML = "";


        if (
            !data.missing_skills ||
            data.missing_skills.length === 0
        ) {

            missingContainer.innerHTML =
                "<p>🎉 No important skills are missing!</p>";

        } else {

            data.missing_skills.forEach(
                function (skill) {

                    missingContainer.innerHTML += `

                        <span class="skill missing">

                            ${skill}

                        </span>

                    `;

                }
            );

        }


        // ==================================
        // RECOMMENDATION
        // ==================================

        document.getElementById(
            "recommendationText"
        ).innerText =
            data.recommendation;


        // ==================================
        // ROADMAP
        // ==================================

        const roadmapContainer =
            document.getElementById(
                "roadmapSteps"
            );


        roadmapContainer.innerHTML = "";


        data.roadmap.forEach(
            function (item) {

                roadmapContainer.innerHTML += `

                    <div class="roadmap-step">

                        <div class="step-number">

                            ${item.step}

                        </div>

                        <div>

                            <h4>

                                ${item.skill}

                            </h4>

                            <p>

                                ${item.message}

                            </p>

                        </div>

                    </div>

                `;

            }
        );


        // Scroll to result

        setTimeout(function () {

            resultBox.scrollIntoView({

                behavior: "smooth"

            });

        }, 300);


    } catch (error) {

        console.error(
            "Analysis Error:",
            error
        );


        loading.style.display =
            "none";


        alert(
            "Server connection error!"
        );

    }

}


// ==========================================
// SCORE ANIMATION
// ==========================================

function animateScore(targetScore) {

    const scoreElement =
        document.getElementById("score");


    let currentScore = 0;


    scoreElement.innerText =
        "0%";


    const interval =
        setInterval(function () {

            currentScore++;


            scoreElement.innerText =
                currentScore + "%";


            if (
                currentScore >= targetScore
            ) {

                clearInterval(interval);

            }

        }, 20);

}