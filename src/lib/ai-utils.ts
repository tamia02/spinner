import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Common configuration for AI models to ensure consistency across the app.
 */
export const AI_CONFIG = {
    // Switching to gemini-1.5-flash which has a much higher free tier quota than 2.0 or 2.5
    DEFAULT_MODEL: "gemini-1.5-flash",
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
            // Also retry on 500, 503, etc. if needed.
            const isRetryable = error?.message?.includes('429') ||
                error?.message?.includes('Too Many Requests') ||
                error?.message?.includes('quota') ||
                error?.status === 429;

            if (!isRetryable || attempt === maxRetries) {
                throw error;
            }

            // Exponential backoff
            const delay = initialDelay * Math.pow(2, attempt);
            console.warn(`AI API Error (Attempt ${attempt + 1}/${maxRetries + 1}): ${error.message}. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}

/**
 * Helper to get the Gemini model instance.
 */
export function getGeminiModel(modelName: string = AI_CONFIG.DEFAULT_MODEL) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is not set.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    console.log(`[AI-UTILS] Initializing Gemini model: ${modelName}`);
    return genAI.getGenerativeModel({ model: modelName });
}
