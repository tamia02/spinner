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
        // 2. Surgical cleanup for common AI JSON mistakes
        try {
            // Handle unescaped newlines and control characters
            let fixed = cleaned
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r')
                .replace(/\t/g, '\\t');

            // Try parsing after basic control char cleanup
            try {
                return JSON.parse(fixed) as T;
            } catch (e) {
                // 3. More aggressive: deal with unescaped double quotes inside values
                // We'll replace quotes only if they're not part of JSON syntax (e.g., ":")
                // This is a heuristic that works well for post content.
                fixed = fixed.replace(/"([^"]*)"/g, (match, inner) => {
                    // Re-escape the inner content's double quotes
                    return '"' + inner.replace(/(?<!\\)"/g, '\\"') + '"';
                });
                return JSON.parse(fixed) as T;
            }
        } catch (innerError) {
            console.error("[JSON-PARSE-ERROR] Raw text:", text);
            throw new Error(`Failed to parse AI response: ${error.message}`);
        }
    }
}
