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
        // 2. Try to fix unescaped double quotes inside values
        // This regex looks for double quotes that aren't preceding a colony or following one (simplified heuristic)
        try {
            const fixed = cleaned
                .replace(/\\n/g, "\\n") // Preserve existing escapes
                .replace(/([^\\])"/g, '$1\\"') // Escape all quotes
                .replace(/^\\"/g, '"') // Unescape start
                .replace(/\\"\s*:/g, '":') // Unescape keys
                .replace(/:\s*\\"/g, ':"') // Unescape value starts
                .replace(/\\"\s*}/g, '"}') // Unescape value ends
                .replace(/\\"\s*,/g, '",') // Unescape separators
                .replace(/\\"\s*\]/g, '"]'); // Unescape array ends

            return JSON.parse(fixed) as T;
        } catch (innerError) {
            // 3. Fallback to a super-aggressive newline/control character fix
            try {
                const fixed = cleaned.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
                return JSON.parse(fixed) as T;
            } catch (finalError) {
                console.error("[JSON-PARSE-ERROR] Raw text:", text);
                throw new Error(`Failed to parse AI response: ${error.message}`);
            }
        }
    }
}
