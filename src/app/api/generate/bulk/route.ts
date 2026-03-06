import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getGeminiModel, withRetry } from "@/lib/ai-utils";
import { getTopSubredditPosts } from "@/lib/reddit-utils";
import { z } from "zod";

const bulkGenerateSchema = z.object({
    topic: z.string().min(1, "Topic is required"),
    competitorUrls: z.array(z.string()).optional(),
    subreddits: z.array(z.string()).optional(),
    profileId: z.string().uuid().optional(),
    count: z.number().default(30),
});

async function scrapeCompetitorStyle(urls: string[]): Promise<string> {
    if (!urls || urls.length === 0) return "";
    let styles = "";
    for (const url of urls) {
        try {
            const res = await fetch(`https://r.jina.ai/${url}`, {
                headers: { 'Accept': 'text/plain', 'X-Return-Format': 'markdown' }
            });
            if (res.ok) {
                const text = await res.text();
                styles += `\nExample Post from ${url}:\n${text.substring(0, 2000)}\n`;
            }
        } catch (e) {
            console.error(`Failed to scrape style from ${url}:`, e);
        }
    }
    return styles;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { topic, competitorUrls, subreddits, profileId, count } = bulkGenerateSchema.parse(body);

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // 1. Gather Intelligence (Reddit)
        let redditContext = "";
        if (subreddits && subreddits.length > 0) {
            for (const sub of subreddits) {
                const posts = await getTopSubredditPosts(sub, 5, 'week');
                redditContext += `\nTrending in r/${sub}:\n` + posts.map(p => `- ${p.title}`).join('\n');
            }
        }

        // 2. Analyze Style (Competitors)
        const competitorStyle = await scrapeCompetitorStyle(competitorUrls || []);

        // 3. Fetch Voice Profile
        let writingStyle = "";
        if (profileId) {
            const vp = await prisma.voiceProfile.findUnique({ where: { id: profileId, userId: user.id } });
            writingStyle = (vp as any)?.writingStyle || "";
        }

        // 4. Generate Bulk Content with Gemini
        const model = getGeminiModel();
        const prompt = `
You are a master LinkedIn content strategist. Your goal is to generate a ${count}-day content calendar for a person established in the "${topic}" niche.

INTEL FROM REDDIT (Use these for trending topics/angles):
${redditContext}

COMPETITOR STYLE (Mimic the formatting and hook style but NOT the content):
${competitorStyle}

USER'S OWN WRITING STYLE:
${writingStyle}

INSTRUCTIONS:
- Generate ${count} distinct, high-quality LinkedIn posts.
- Ensure a mix of content types: educational breakdowns, opinionated takes, personal stories (invent realistic ones based on the topic), and "what's coming next" predictions.
- Each post must have a magnetic hook, value-dense body, and a call-to-action or question.
- Format the output as a JSON array of objects: [{"day": 1, "content": "..."}, {"day": 2, "content": "..."}]
- Do NOT include markdown code blocks (like \`\`\`json) in your response, just the raw JSON.
- Strictly NO hashtags.
- Use a human, non-corporate tone.

OUTPUT:
`;

        const result = await withRetry(() => model.generateContent(prompt));
        const responseText = result.response.text().trim();

        // Basic cleanup if AI adds markdown blocks anyway
        const jsonContent = responseText.replace(/^```json/, '').replace(/```$/, '').trim();
        const generatedPosts = JSON.parse(jsonContent);

        // 5. Schedule Posts
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 1); // Start tomorrow
        startDate.setHours(10, 0, 0, 0); // 10 AM

        const schedulePromises = generatedPosts.map((post: { day: number, content: string }, index: number) => {
            const scheduledAt = new Date(startDate);
            scheduledAt.setDate(startDate.getDate() + index);

            return prisma.scheduledPost.create({
                data: {
                    userId: user.id,
                    platform: "LinkedIn",
                    content: post.content,
                    scheduledAt: scheduledAt,
                    status: "PENDING"
                }
            });
        });

        await Promise.all(schedulePromises);

        return NextResponse.json({
            success: true,
            message: `Successfully generated and scheduled ${generatedPosts.length} posts.`,
            data: generatedPosts
        });

    } catch (error: any) {
        console.error("Bulk Generation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
