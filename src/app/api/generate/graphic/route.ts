import { NextResponse } from "next/server";
import { generateContentSmart } from "@/lib/ai-utils";
import { generateMinimalistGraphic } from "@/lib/image-utils";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { content } = await req.json();
        if (!content) return NextResponse.json({ error: "Content is required" }, { status: 400 });

        // 1. Extract the core insight via Gemini
        const insightPrompt = `
            Extract the single most punchy, inspirational, or educational 1-sentence insight from the following LinkedIn post.
            The goal is to put this text on a minimalist graphic.
            Target length: 3 to 7 words.
            IMPORTANT: Return ONLY the text, no quotes, no explanation.
            
            POST CONTENT:
            "${content}"
        `;

        const punchyText = await generateContentSmart(insightPrompt);
        const cleanedText = punchyText.trim().replace(/^"|"$/g, '');

        // 2. Generate the graphic via Hugging Face & Supabase
        const imageUrl = await generateMinimalistGraphic(cleanedText);

        return NextResponse.json({
            success: true,
            imageUrl,
            insight: cleanedText
        });

    } catch (error: any) {
        console.error("[GRAPHIC-GEN-ERROR]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
