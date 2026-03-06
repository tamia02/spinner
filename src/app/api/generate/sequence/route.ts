import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getGeminiModel, withRetry } from "@/lib/ai-utils";
import { getStyleProfile } from "@/lib/style-profiles";
import { parseAiJson } from "@/lib/json-utils";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { topic, styleProfileId } = await req.json();
        if (!topic) return NextResponse.json({ error: "Topic is required" }, { status: 400 });

        const style = getStyleProfile(styleProfileId);

        // Prompt for 7-day 0-to-1 education
        const prompt = `
You are a master LinkedIn strategist specializing in the "${style.name}" writing style.
Your goal is to educate an audience on "${topic}" from level 0 (absolute beginner) to level 1 (practitioner) over 7 days.

CLIENT VOICE PROFILE (${style.name}):
- Hook Style: ${style.patterns.hookStyle}
- Spacing: ${style.patterns.spacing}
- CTA: ${style.patterns.ctaStyle}
- Tone: ${style.patterns.tone}
- Forbidden Words: ${style.patterns.forbiddenWords.join(", ")}

STRUCTURE:
- 7 Days total.
- 2 HIGH-IMPACT posts per day (Morning & Afternoon).
- Total: 14 unique posts.
- Progression:
    Day 1: Awareness & The "Why"
    Day 2: The Foundation (Core concepts)
    Day 3: The Framework (Step-by-step logic)
    Day 4: Common Mistakes & Pitfalls
    Day 5: Case Studies / Real-world examples
    Day 6: Advanced Optimization
    Day 7: The Masterclass / Final Transformation

STRICT RULES:
- NO hashtags.
- NO AI jargon.
- Format as JSON array of 14 objects: [{"day": 1, "session": "morning", "content": "..."}, {"day": 1, "session": "afternoon", "content": "..."}, ...]

DO NOT include markdown code blocks, just raw JSON.
`;

        const model = getGeminiModel();
        const result = await withRetry(() => model.generateContent(prompt));
        const responseText = result.response.text();
        const sequence = parseAiJson<any[]>(responseText);

        // Schedule these 14 posts
        const now = new Date();
        const schedulePromises = sequence.map((post: any, index: number) => {
            const scheduledDate = new Date(now);
            scheduledDate.setDate(now.getDate() + post.day);
            // Morning at 9am, Afternoon at 4pm
            scheduledDate.setHours(post.session === "morning" ? 9 : 16, 0, 0, 0);

            return prisma.scheduledPost.create({
                data: {
                    userId: user.id,
                    content: post.content,
                    platform: "LINKEDIN",
                    scheduledAt: scheduledDate,
                    status: "PENDING"
                }
            });
        });

        await Promise.all(schedulePromises);

        return NextResponse.json({
            success: true,
            message: `Successfully scheduled 7-day ${topic} sequence in ${style.name} style!`,
            data: sequence
        });

    } catch (error: any) {
        console.error("[SEQUENCE-ERROR]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
