import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { sampleText, profileId } = await request.json();
        if (!sampleText || sampleText.trim().length < 20) {
            return NextResponse.json({ error: "Please paste at least one sample post (minimum 20 characters)." }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY not set" }, { status: 500 });

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are an expert writing analyst. Analyze the writing style of these sample posts written by a real person.

SAMPLE POSTS:
"""
${sampleText.substring(0, 3000)}
"""

Return a JSON object with these exact keys:
{
  "styleDescription": "A 2-3 sentence description of how this person writes. Be very specific — mention their sentence length, punctuation habits, vocabulary level, energy, and any patterns. This will be used to guide an AI to write EXACTLY like them.",
  "formality": <number 0-100, 0=super casual, 100=very formal>,
  "humor": <number 0-100, 0=no humor, 100=very witty>,
  "emoji": <number 0-100, 0=never uses emoji, 100=uses emoji constantly>
}

Return ONLY the JSON object, no markdown code block, no explanation.`;

        const result = await model.generateContent(prompt);
        const raw = result.response.text().trim()
            .replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");

        let parsed: { styleDescription: string; formality: number; humor: number; emoji: number };
        try {
            parsed = JSON.parse(raw);
        } catch {
            return NextResponse.json({ error: "Failed to parse AI response. Try pasting cleaner text." }, { status: 500 });
        }

        // Save the sample and style to the profile if profileId was provided
        if (profileId) {
            try {
                await (prisma.voiceProfile as any).update({
                    where: { id: profileId, userId: user.id },
                    data: {
                        writingSample: sampleText.substring(0, 2000),
                        writingStyle: parsed.styleDescription,
                        formality: Math.max(0, Math.min(100, parsed.formality)),
                        humor: Math.max(0, Math.min(100, parsed.humor)),
                        emoji: Math.max(0, Math.min(100, parsed.emoji)),
                    }
                });
            } catch (e) {
                console.warn("Could not save to profile:", e);
            }
        }

        return NextResponse.json({
            success: true,
            styleDescription: parsed.styleDescription,
            formality: parsed.formality,
            humor: parsed.humor,
            emoji: parsed.emoji,
        });
    } catch (error: any) {
        console.error("Analyze voice error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
