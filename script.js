// ========================================
// SKILLBRIDGE AI - SCRIPT.JS
// ========================================


// ========================================
// SKILL GAP ANALYSIS
// ========================================

async function analyzeSkills() {

    const name = document.getElementById("name").value.trim();
    const skills = document.getElementById("skills").value.trim();
    const career = document.getElementById("career").value;

    if (!name || !skills || !career) {
        alert("Please fill all the details!");
        return;
    }

    const loading = document.getElementById("loading");
    const result = document.getElementById("result");

    loading.style.display = "block";
    result.style.display = "none";

    try {

        const response = await fetch("/api/analyze", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name: name,
                skills: skills,
                career: career
            })
        });

        if (!response.ok) {
            throw new Error("Skill analysis failed");
        }

        const data = await response.json();

        loading.style.display = "none";
        result.style.display = "block";


        // Welcome

        document.getElementById("welcome").innerText =
            `Hello ${data.student_name}! 👋`;


        // Score

        document.getElementById("score").innerText =
            `${data.readiness_score}%`;


        // Matched Skills

        const matchedContainer =
            document.getElementById("matchedSkills");

        matchedContainer.innerHTML = "";

        if (!data.matched_skills || data.matched_skills.length === 0) {

            matchedContainer.innerHTML =
                "<p>No matching skills found yet.</p>";

        } else {

            data.matched_skills.forEach(skill => {

                matchedContainer.innerHTML +=
                    `<span class="skill matched">${skill}</span>`;

            });

        }


        // Missing Skills

        const missingContainer =
            document.getElementById("missingSkills");

        missingContainer.innerHTML = "";

        if (data.missing_skills && data.missing_skills.length > 0) {

            data.missing_skills.forEach(skill => {

                missingContainer.innerHTML +=
                    `<span class="skill missing">${skill}</span>`;

            });

        }


        // Recommendation

        document.getElementById("recommendationText").innerText =
            data.recommendation || "Keep improving your skills.";


        // Roadmap

        const roadmapContainer =
            document.getElementById("roadmapSteps");

        roadmapContainer.innerHTML = "";

        if (data.roadmap) {

            data.roadmap.forEach(item => {

                roadmapContainer.innerHTML += `

                    <div class="roadmap-step">

                        <div class="step-number">
                            ${item.step}
                        </div>

                        <div>
                            <h4>${item.skill}</h4>
                            <p>${item.message}</p>
                        </div>

                    </div>

                `;

            });

        }


        result.scrollIntoView({
            behavior: "smooth"
        });

    }

    catch (error) {

        console.error("Analysis Error:", error);

        loading.style.display = "none";

        alert("Skill analysis failed. Please try again.");

    }

}


// ========================================
// RESUME FILE SELECTION
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    const resumeInput = document.getElementById("resume");
    const fileName = document.getElementById("fileName");

    if (resumeInput && fileName) {

        resumeInput.addEventListener("change", function () {

            if (resumeInput.files.length > 0) {

                fileName.innerText =
                    "📄 Selected: " + resumeInput.files[0].name;

            }

            else {

                fileName.innerText =
                    "PDF or DOCX • Max 5 MB";

            }

        });

    }

});


// ========================================
// RESUME UPLOAD AND ANALYSIS
// ========================================

async function uploadResume() {

    console.log("Upload Resume button clicked");


    const resumeInput =
        document.getElementById("resume");

    const fileName =
        document.getElementById("fileName");

    const resumeResult =
        document.getElementById("resumeResult");


    // Check elements

    if (!resumeInput) {

        alert("Resume input not found!");

        return;

    }


    const file = resumeInput.files[0];


    // Check file

    if (!file) {

        alert("Please choose a PDF or DOCX resume first!");

        return;

    }


    // Check file size - 5 MB

    if (file.size > 5 * 1024 * 1024) {

        alert("File size should be less than 5 MB!");

        return;

    }


    // Show loading

    fileName.innerText =
        "🤖 AI is analyzing your resume...";

    resumeResult.innerHTML = `

        <div class="resume-loading">

            ⏳ Extracting technical skills...

        </div>

    `;


    // Create FormData

    const formData = new FormData();


    // IMPORTANT:
    // "file" MUST match main.py parameter name

    formData.append("file", file);


    try {


        // IMPORTANT:
        // This endpoint matches main.py

        const response = await fetch("/api/resume", {

            method: "POST",

            body: formData

        });


        console.log("Response status:", response.status);


        // Read response

        const data = await response.json();

        console.log("Resume response:", data);


        // Check response

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Resume server error"
            );

        }


        // Check success

        if (data.success !== true) {

            throw new Error(
                data.message ||
                "Resume analysis failed"
            );

        }


        // Get detected skills safely

        const detectedSkills =
            Array.isArray(data.detected_skills)
                ? data.detected_skills
                : [];


        // Success message

        fileName.innerText =
            "✅ Resume analyzed successfully!";


        // Create skills HTML

        let skillsHTML = "";


        if (detectedSkills.length === 0) {

            skillsHTML = `

                <p>
                    No technical skills were detected.
                    Try a resume containing technical skills.
                </p>

            `;

        }

        else {

            detectedSkills.forEach(skill => {

                skillsHTML += `

                    <span class="skill matched">
                        ${skill}
                    </span>

                `;

            });

        }


        // Display Result

        resumeResult.innerHTML = `

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


        // Auto-fill skill analysis input

        const skillsInput =
            document.getElementById("skills");


        if (
            skillsInput &&
            detectedSkills.length > 0
        ) {

            skillsInput.value =
                detectedSkills.join(", ");

        }


        // Scroll to result

        resumeResult.scrollIntoView({

            behavior: "smooth",

            block: "center"

        });


    }

    catch (error) {


        console.error(
            "Resume Upload Error:",
            error
        );


        fileName.innerText =
            "❌ Resume analysis failed";


        resumeResult.innerHTML = `

            <div class="resume-error">

                <h3>
                    ❌ Resume Analysis Failed
                </h3>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }

}