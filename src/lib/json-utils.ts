/**
 * Utility for safely parsing JSON from AI responses.
 * Handles markdown blocks and common formatting errors.
 */

export function parseAiJson<T>(text: string): T {
    let cleaned = text.trim();

    // 1. Remove markdown code blocks if present
    if (cleaned.includes('```')) {
        const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
        if (match && match[1]) {
            cleaned = match[1].trim();
        } else {
            cleaned = cleaned.replace(/^```[a-z]*\s*\n/i, '').replace(/\n```$/, '').trim();
        }
    }

    try {
        return JSON.parse(cleaned) as T;
    } catch (error: any) {
        // 2. If it fails, it might be due to raw control characters (like newlines) inside strings
        // We can try to escape them. This is a common AI error.
        try {
            // Replace literal newlines/tabs with escaped versions IF they are inside quotes
            // This regex handles characters inside double quotes
            const fixed = cleaned.replace(/"([^"]*)"/g, (match, content) => {
                return '"' + content
                    .replace(/\n/g, '\\n')
                    .replace(/\r/g, '\\r')
                    .replace(/\t/g, '\\t') + '"';
            });
            return JSON.parse(fixed) as T;
        } catch (innerError) {
            console.error("[JSON-PARSE-ERROR] Raw text:", text);
            console.error("[JSON-PARSE-ERROR] Cleaned text:", cleaned);
            throw new Error(`Failed to parse AI response: ${error.message}`);
        }
    }
}
