import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

/**
 * Common configuration for AI models to ensure consistency across the app.
 */
export const AI_CONFIG = {
    DEFAULT_PROVIDER: "gemini" as "openai" | "gemini" | "huggingface",
    DEFAULT_MODEL: "gemini-2.0-flash",
    GEMINI_FALLBACK_MODEL: "gemini-2.0-flash",
    HF_MODEL: "meta-llama/Llama-3.3-70B-Instruct", // OpenAI compatible endpoint
    MAX_RETRIES: 3,
    INITIAL_DELAY: 1000,
};

/**
 * Utility to run an AI generation task with exponential backoff and provider fallback.
 */
export async function withRetry<T>(
    operation: (provider: "gemini" | "huggingface") => Promise<T>,
    maxRetries: number = AI_CONFIG.MAX_RETRIES,
    initialDelay: number = AI_CONFIG.INITIAL_DELAY
): Promise<T> {
    let lastError: any;
    let currentProvider: "gemini" | "huggingface" = "gemini";

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation(currentProvider);
        } catch (error: any) {
            lastError = error;

            const isQuotaError = error?.message?.includes('429') ||
                error?.message?.includes('Too Many Requests') ||
                error?.message?.includes('quota') ||
                error?.status === 429;

            if (isQuotaError && currentProvider === "gemini") {
                console.warn(`[AI-UTILS] Gemini quota hit. Falling back to Hugging Face (Llama-3)...`);
                currentProvider = "huggingface";
                attempt--; // Don't count the fallback move as a retry attempt for the new provider
                continue;
            }

            if (!isQuotaError || attempt === maxRetries) {
                console.error(`[AI-UTILS] Error: ${error.message}`, error);
                throw error;
            }

            const delay = initialDelay * Math.pow(2, attempt);
            console.warn(`[AI-UTILS] Rate Limit hit on ${currentProvider} (Attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}

/**
 * Helper to get an OpenAI client instance.
 */
export function getOpenAI() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("OPENAI_API_KEY environment variable is not set.");
    }
    return new OpenAI({ apiKey });
}

/**
 * Helper to get a Hugging Face client (using OpenAI compatibility layer).
 */
export function getHFClient() {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
        throw new Error("HUGGINGFACE_API_KEY environment variable is not set.");
    }
    return new OpenAI({
        apiKey,
        baseURL: "https://api-inference.huggingface.co/v1/"
    });
}

/**
 * Helper to get the Gemini model instance.
 */
export function getGeminiModel(modelName: string = AI_CONFIG.GEMINI_FALLBACK_MODEL) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is not set.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: modelName });
}

/**
 * Unified generation helper to handle all the boilerplate.
 */
export async function generateContentSmart(prompt: string): Promise<string> {
    return withRetry(async (provider) => {
        if (provider === "gemini") {
            const model = getGeminiModel();
            const result = await model.generateContent(prompt);
            return result.response.text();
        } else {
            const hf = getHFClient();
            const completion = await hf.chat.completions.create({
                model: AI_CONFIG.HF_MODEL,
                messages: [{ role: "user", content: prompt }],
                max_tokens: 2048,
            });
            return completion.choices[0].message.content || "";
        }
    });
}
