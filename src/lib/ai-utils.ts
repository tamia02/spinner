import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

/**
 * Common configuration for AI models to ensure consistency across the app.
 */
export const AI_CONFIG = {
    // Reverting to Gemini for written content as per user request
    DEFAULT_PROVIDER: "gemini" as "openai" | "gemini",
    DEFAULT_MODEL: "gemini-2.0-flash",
    GEMINI_FALLBACK_MODEL: "gemini-2.0-flash",
    MAX_RETRIES: 3,
    INITIAL_DELAY: 1000, // 1 second
};

/**
 * Utility to run an AI generation task with exponential backoff on retryable errors.
 */
export async function withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = AI_CONFIG.MAX_RETRIES,
    initialDelay: number = AI_CONFIG.INITIAL_DELAY
): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error: any) {
            lastError = error;

            // 429 is the main error we want to retry on (quota/rate limit)
            const isRetryable = error?.message?.includes('429') ||
                error?.message?.includes('Too Many Requests') ||
                error?.message?.includes('quota') ||
                error?.status === 429;

            if (!isRetryable || attempt === maxRetries) {
                console.error(`[AI-UTILS] Non-retryable or fatal error: ${error.message}`, error);
                throw error;
            }

            // Exponential backoff
            const delay = initialDelay * Math.pow(2, attempt);
            console.warn(`[AI-UTILS] Quota/Rate Limit hit (Attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${delay}ms...`);
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
 * Helper to get the Gemini model instance.
 */
export function getGeminiModel(modelName: string = AI_CONFIG.GEMINI_FALLBACK_MODEL) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is not set.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    console.log(`[AI-UTILS-V3] Initializing Gemini model: ${modelName} (RANDOM_ID: 998877)`);
    return genAI.getGenerativeModel({ model: modelName });
}
