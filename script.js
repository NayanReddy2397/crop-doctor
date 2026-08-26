const button = document.getElementById("diagnoseButton");
const imageInput = document.getElementById("cropImage");
const result = document.getElementById("result");
const imagePreview = document.getElementById("imagePreview");


// Show image preview
imageInput.addEventListener("change", function () {

    const file = imageInput.files[0];

    if (file) {
        imagePreview.src = URL.createObjectURL(file);
        imagePreview.style.display = "block";
    }

});


// Diagnose crop
button.addEventListener("click", async function () {

    if (imageInput.files.length === 0) {

        result.innerHTML = "⚠️ Please upload a crop image first.";

        return;
    }


    // Show loading message
    result.innerHTML = "🔍 AI is analyzing your crop...";


    // Create form data
    const formData = new FormData();

    formData.append("cropImage", imageInput.files[0]);


    try {

        const response = await fetch("/diagnose", {
            method: "POST",
            body: formData
        });


        const data = await response.json();


        if (!response.ok) {
            throw new Error(data.error || "Diagnosis failed.");
        }


        const diagnosis = data.diagnosis;


        // Display structured diagnosis
        result.innerHTML = `

            <div class="diagnosis-card">

                <h2>🌱 AI Diagnosis</h2>

                <div class="info-box">
                    <h3>🌾 Crop</h3>
                    <p>${diagnosis.crop}</p>
                </div>


                <div class="info-box">
                    <h3>⚠️ Possible Problem</h3>
                    <p>${diagnosis.problem}</p>
                </div>


                <div class="info-box">
                    <h3>🎯 Confidence</h3>
                    <p>${diagnosis.confidence}</p>
                </div>


                <div class="info-box">
                    <h3>📊 Severity</h3>
                    <p>${diagnosis.severity}</p>
                </div>


                <div class="info-box">

                    <h3>🔍 Symptoms</h3>

                    <ul>
                        ${diagnosis.symptoms.map(
                            symptom => `<li>${symptom}</li>`
                        ).join("")}
                    </ul>

                </div>


                <div class="info-box">

                    <h3>💊 What to do now</h3>

                    <ol>
                        ${diagnosis.immediate_actions.map(
                            action => `<li>${action}</li>`
                        ).join("")}
                    </ol>

                </div>


                <div class="info-box">

                    <h3>🛡️ Prevention</h3>

                    <ul>
                        ${diagnosis.prevention.map(
                            item => `<li>${item}</li>`
                        ).join("")}
                    </ul>

                </div>

            </div>

        `;

    } catch (error) {

        console.error("Diagnosis error:", error);

        result.innerHTML = `
            <p>❌ Something went wrong.</p>
            <p>Please try again.</p>
        `;

    }

});