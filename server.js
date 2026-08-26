const express = require("express");
const multer = require("multer");
const dotenv = require("dotenv");
const { GoogleGenAI, Type } = require("@google/genai");

dotenv.config();

const app = express();
const PORT = 3000;

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const upload = multer({
    storage: multer.memoryStorage()
});

app.use(express.static(__dirname));

app.post("/diagnose", upload.single("cropImage"), async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                error: "No crop image uploaded."
            });
        }

        const imageBase64 = req.file.buffer.toString("base64");

        const prompt = `
You are Crop Doctor, an AI agricultural assistant designed for Indian farmers.

Carefully analyze the uploaded crop image.

Identify the crop and determine whether there is a visible disease,
pest problem, nutrient deficiency, or physiological problem.

If the image is unclear, give low confidence and explain that the
image should be retaken with better lighting and focus.

Use simple language suitable for an Indian farmer.

Do not provide dangerous or highly specific pesticide dosage instructions.
For chemical treatment decisions, recommend consulting a local
agricultural officer or agronomist.
`;

        const response = await ai.models.generateContent({

            model: "gemini-3.5-flash-lite",

            contents: [
                {
                    inlineData: {
                        mimeType: req.file.mimetype,
                        data: imageBase64
                    }
                },
                {
                    text: prompt
                }
            ],

            config: {

                responseMimeType: "application/json",

                responseSchema: {
                    type: Type.OBJECT,

                    properties: {

                        crop: {
                            type: Type.STRING
                        },

                        problem: {
                            type: Type.STRING
                        },

                        confidence: {
                            type: Type.STRING
                        },

                        severity: {
                            type: Type.STRING
                        },

                        symptoms: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING
                            }
                        },

                        immediate_actions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING
                            }
                        },

                        prevention: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING
                            }
                        }

                    },

                    required: [
                        "crop",
                        "problem",
                        "confidence",
                        "severity",
                        "symptoms",
                        "immediate_actions",
                        "prevention"
                    ]
                }
            }
        });

        const diagnosis = JSON.parse(response.text);

        console.log("✅ Diagnosis received");

        res.json({
            success: true,
            diagnosis: diagnosis
        });

    } catch (error) {

        console.error("❌ AI Error:", error);

        res.status(500).json({
            error: "Unable to analyze the crop image."
        });
    }
});


app.listen(PORT, () => {

    console.log(
        `🌾 Crop Doctor running at http://localhost:${PORT}`
    );

});