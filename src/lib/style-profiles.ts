/**
 * Style profiles for top LinkedIn creators.
 * Defines structural and tonal patterns for the AI.
 */

export interface StyleProfile {
    name: string;
    description: string;
    patterns: {
        hookStyle: string;
        spacing: string;
        ctaStyle: string;
        tone: string;
        forbiddenWords: string[];
    };
}

export const STYLE_PROFILES: Record<string, StyleProfile> = {
    "justin_welsh": {
        name: "Justin Welsh",
        description: "The Solopreneur Master. Punchy, minimalist, and value-dense.",
        patterns: {
            hookStyle: "Short, provocative statement or a specific number. (e.g. 'I quit my $4M job.')",
            spacing: "Aggressive white space. 1 sentence per paragraph max.",
            ctaStyle: "Low-friction question or a link to a newsletter.",
            tone: "Authoritative but helpful. Zero fluff.",
            forbiddenWords: ["In today's landscape", "Game-changer", "Revolutionary"]
        }
    },
    "lara_acosta": {
        name: "Lara Acosta",
        description: "The Personal Branding Queen. Conversational and high-energy.",
        patterns: {
            hookStyle: "Personal realization or a direct challenge to the reader.",
            spacing: "Mixed spacing. Short blocks mixed with single-line hooks.",
            ctaStyle: "High-engagement questions asking for personal opinions.",
            tone: "Warm, energetic, and slightly vulnerable.",
            forbiddenWords: ["Furthermore", "Moreover", "Leverage"]
        }
    },
    "jasmin_alic": {
        name: "Jasmin Alic",
        description: "The Hook Legend. Tactical, bold, and extremely practical.",
        patterns: {
            hookStyle: "Bolded keywords and immediate tactical value. (e.g. 'Do NOT do X. Do Y instead.')",
            spacing: "Structured for readability. Lots of bullet points and bold headers.",
            ctaStyle: "Instructional. 'Save this for later' or 'Repost if you agree'.",
            tone: "Direct, high-authority, and tactical.",
            forbiddenWords: ["Unlock", "Synergy", "Cutting-edge"]
        }
    }
};

/**
 * Gets a style profile by ID or returns a default "Professional" style.
 */
export function getStyleProfile(id: string): StyleProfile {
    return STYLE_PROFILES[id] || {
        name: "Standard Professional",
        description: "Clear, balanced, and professional.",
        patterns: {
            hookStyle: "Balanced headline or question.",
            spacing: "Standard professional paragraphs (2-3 sentences).",
            ctaStyle: "Standard open-ended question.",
            tone: "Polite and professional.",
            forbiddenWords: ["Delve", "Tapestry", "Landscape"]
        }
    };
}
