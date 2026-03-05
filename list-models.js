const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

// Load .env.local
dotenv.config({ path: path.join(__dirname, ".env.local") });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("Error: GEMINI_API_KEY is not set in .env.local");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        // We use the underlying client to list models as the high-level SDK doesn't always expose it clearly
        // but actually the SDK usually has a listModels method on the genAI object or similar.
        // In @google/generative-ai, you can iterate through models using the ListModels API via the underlying service.
        // For simplicity, let's try a common ones first, then list if possible.

        console.log("Checking available models...");
        // The SDK doesn't have a direct listModels export easily found in some docs, 
        // but we can try fetching from the REST API manually with the key.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods.join(", ")})`);
            });
        } else {
            console.log("No models returned. Response:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("Failed to list models:", error.message);
    }
}

listModels();
