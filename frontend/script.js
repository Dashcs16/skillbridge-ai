async function analyzeSkills() {

    const name = document.getElementById("name").value.trim();

    const skills = document.getElementById("skills").value.trim();

    const career = document.getElementById("career").value;


    // Validation

    if (!name || !skills || !career) {

        alert("Please fill all the details!");

        return;
    }


    // Show loading

    document.getElementById("loading").style.display = "block";

    document.getElementById("result").style.display = "none";


    try {

        // Send data to Python Backend

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


        const data = await response.json();


        // Hide loading

        document.getElementById("loading").style.display = "none";


        // Show result

        document.getElementById("result").style.display = "block";


        // Welcome

        document.getElementById("welcome").innerText =
            "Hello " + data.student_name + "! 👋";


        // Score

        document.getElementById("score").innerText =
            data.readiness_score + "%";


        // Matched skills

        const matchedContainer =
            document.getElementById("matchedSkills");

        matchedContainer.innerHTML = "";


        if (data.matched_skills.length === 0) {

            matchedContainer.innerHTML =
                "<p>No matching skills found yet.</p>";

        } else {

            data.matched_skills.forEach(skill => {

                matchedContainer.innerHTML +=
                    `<span class="skill matched">${skill}</span>`;

            });

        }


        // Missing skills

        const missingContainer =
            document.getElementById("missingSkills");

        missingContainer.innerHTML = "";


        data.missing_skills.forEach(skill => {

            missingContainer.innerHTML +=
                `<span class="skill missing">${skill}</span>`;

        });


        // Recommendation

        document.getElementById("recommendationText").innerText =
            data.recommendation;


        // Roadmap

        const roadmapContainer =
            document.getElementById("roadmapSteps");

        roadmapContainer.innerHTML = "";


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


        // Scroll to result

        document.getElementById("result").scrollIntoView({

            behavior: "smooth"

        });


    }

    catch (error) {

        document.getElementById("loading").style.display = "none";

        alert("Server connection error! Make sure Python server is running.");

        console.error(error);

    }

}