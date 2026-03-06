import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getGeminiModel, withRetry } from "@/lib/ai-utils";
import { fetchLatestCreatorPosts } from "@/lib/creator-utils";
import { getTopSubredditPosts } from "@/lib/reddit-utils";
import { getStyleProfile } from "@/lib/style-profiles";
import { parseAiJson } from "@/lib/json-utils";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // 1. Fetch Monitored Creators
        const monitoredCreators = await prisma.monitoredCreator.findMany({
            where: { userId: user.id },
            take: 5
        });

        if (monitoredCreators.length === 0) {
            return NextResponse.json({
                error: "No monitored creators found. Please add profiles to your monitor list.",
                data: []
            }, { status: 400 });
        }

        // 2. Fetch Latest Activity from Creators
        let creatorIntelligence = "";
        let sourceUrls: string[] = [];

        for (const creator of monitoredCreators) {
            const posts = await fetchLatestCreatorPosts(creator.url);
            if (posts.length > 0) {
                creatorIntelligence += `\nLatest from ${creator.name || creator.url}:\n` +
                    posts.map(p => `- ${p.content.substring(0, 500)}`).join('\n');
                sourceUrls.push(posts[0].url);
            }
        }

        // 3. Fetch Niche Trends (Reddit)
        const subreddits = ["artificial", "technology", "saas"]; // Defaults
        let redditContext = "";
        for (const sub of subreddits) {
            const topPosts = await getTopSubredditPosts(sub, 3, 'day');
            redditContext += `\nTrending in r/${sub}:\n` + topPosts.map(p => `- ${p.title}`).join('\n');
        }

        const { styleProfileId } = await req.json();
        const style = getStyleProfile(styleProfileId);

        // 4. Generate 2 Daily Suggestions with Gemini
        const model = getGeminiModel();
        const prompt = `
You are a world-class LinkedIn ghostwriter specializing in the "${style.name}" writing style.
Your client is a top professional who wants to build a personal brand by sharing daily insights.

CLIENT VOICE PROFILE (${style.name}):
- Hook Style: ${style.patterns.hookStyle}
- Spacing: ${style.patterns.spacing}
- CTA: ${style.patterns.ctaStyle}
- Tone: ${style.patterns.tone}
- Forbidden Words: ${style.patterns.forbiddenWords.join(", ")}

MISSION:
Generate exactly 2 high-impact LinkedIn posts for today.

SOURCES OF INTELLIGENCE:
[CREATOR ACTIVITY]
${creatorIntelligence}

[MARKET TRENDS]
${redditContext}

POST 1: "MIRROR & REPURPOSE"
- Select the most compelling insight from the [CREATOR ACTIVITY] above.
- REPURPOSE IT: Do NOT copy the creator. Instead, "mirror" the core lesson or strategy.
- Voice: Human, authority-building, and clear.
- Structure: ${style.patterns.spacing}
- Rule: If the source is a personal story from that creator, abstract the LESSON and apply it to a general professional context.

POST 2: "MARKET OPINION"
- Select a trending topic from the [MARKET TRENDS] above.
- Write a short, punchy take (max 150 words) that positions the client as a forward-thinker.
- Hook: ${style.patterns.hookStyle}

STRICT RULES:
- NO hashtags.
- NO AI-isms.
- Format as JSON array of exactly 2 objects: [{"day": 1, "content": "..."}, {"day": 2, "content": "..."}]

DO NOT include markdown code blocks, just raw JSON.
`;

        const result = await withRetry(() => model.generateContent(prompt));
        const responseText = result.response.text();
        const suggestedPosts = parseAiJson<any[]>(responseText);

        // 5. Save to DailyBriefing table
        const briefingPromises = suggestedPosts.map((post: any, i: number) =>
            prisma.dailyBriefing.create({
                data: {
                    userId: user.id,
                    content: post.content,
                    sourceUrl: sourceUrls[i % sourceUrls.length],
                    status: "PENDING"
                }
            })
        );

        await Promise.all(briefingPromises);

        return NextResponse.json({
            success: true,
            message: "Morning brief generated!",
            data: suggestedPosts
        });

    } catch (error: any) {
        console.error("[DAILY-BRIEF-ERROR]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Fetch today's briefings
        const date = new Date();
        date.setHours(0, 0, 0, 0);

        const briefings = await prisma.dailyBriefing.findMany({
            where: {
                userId: user.id,
                createdAt: { gte: date }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, data: briefings });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
