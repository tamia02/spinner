import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as cheerio from "cheerio";
import { YoutubeTranscript } from "youtube-transcript";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const isValidUrl = (urlString: string) => {
    try { return Boolean(new URL(urlString)); } catch { return false; }
};

async function scrapeUrl(url: string): Promise<string> {
    try {
        let textContent = "";

        // 1. If it's a YouTube video, attempt to fetch the transcript
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            try {
                const transcript = await YoutubeTranscript.fetchTranscript(url);
                const transcriptText = transcript.map(t => t.text).join(' ');
                textContent += "YouTube Transcript:\n" + transcriptText + "\n\n";
            } catch (ytError) {
                console.error("YouTube Transcript Error:", ytError);
                textContent += "[Transcript unavailable from YouTube]\n\n";
            }
        }

        // 2. Fetch clean markdown content using Jina Reader API.
        // This effectively bypasses 403 bot-protection on Medium, Substack, etc., 
        // and returns pristine markdown. It also works as a great metadata scraper for YouTube.
        try {
            const jinaResponse = await fetch(`https://r.jina.ai/${url}`, {
                headers: {
                    'Accept': 'text/plain',
                    'X-Return-Format': 'markdown'
                }
            });
            if (jinaResponse.ok) {
                const markdown = await jinaResponse.text();
                textContent += "Page Content:\n" + markdown;
            } else {
                console.warn(`Jina Reader failed for ${url} with status:`, jinaResponse.status);
            }
        } catch (jinaError) {
            console.error("Jina Reader Exception:", jinaError);
        }

        const finalContent = textContent.trim();
        return finalContent.substring(0, 15000) || `[Failed to extract any content from: ${url}]`;

    } catch (error) {
        console.error("URL Scrape Error:", error);
        return `[Failed to scrape URL: ${url}]`;
    }
}

function getPlatformPrompt(platform: string, profile: string, sourceText: string) {
    const toneGuide = profile === 'casual' ? 'casual, witty, and highly engaging'
        : profile === 'formal' ? 'highly professional, academic, and structured'
            : 'professional yet accessible';

    const baseDirectives: Record<string, string> = {
        'twitter': `Generate a 3-tweet thread from the source content using a ${toneGuide} tone. Use the 🧵 emoji for the first tweet. Number them (1/3, 2/3, 3/3). Ensure short, punchy sentences.`,
        'linkedin': `Generate a professional LinkedIn post with heavy spacing (single sentence paragraphs) and a strong hook from the source content. Tone: ${toneGuide}. End with a question to drive engagement and 2-3 relevant hashtags.`,
        'instagram': `Generate an Instagram caption extracting the most visually interesting or emotional core concept from the source content. Tone: ${toneGuide}. Include relevant emojis and 5-10 hashtags at the bottom.`,
        'newsletter': `Generate a short, high-value newsletter summary (approx 3-4 paragraphs) from the source content. Tone: ${toneGuide}. Include a catchy subject line at the top. Use bullet points for key takeaways.`,
        'blog': `Generate a summarized blog version of the source content. Tone: ${toneGuide}. Include a catchy H1 title, a short introduction, 2-3 subheadings (H2) with meat underneath, and a brief conclusion.`
    };

    const specificInstructions = baseDirectives[platform.toLowerCase()] || `Generate a highly optimized post for ${platform} based on the input text using a ${toneGuide} tone.`;

    return `
You are a world-class expert copywriter and social media manager.
Your task is to repurpose the following source material strictly according to the instructed format.

INSTRUCTIONS:
${specificInstructions}

SOURCE MATERIAL:
"""
${sourceText}
"""

OUTPUT:
`;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { source, platforms, profile } = body;

        if (!source || !platforms || platforms.length === 0) {
            return NextResponse.json(
                { error: "Source text/URL and at least one platform are required." },
                { status: 400 }
            );
        }

        // Get user for DB save (optional - won't block generation if not authed)
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // 1. Process Input (Scrape if URL)
        let processedSource = source;
        if (isValidUrl(source.trim())) {
            processedSource = await scrapeUrl(source.trim());
        }

        // 2. AI Generation
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY environment variable is not set." },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // 3. Platform Formatter (Parallel Generation)
        const generatedPromises = platforms.map(async (p: string) => {
            try {
                const prompt = getPlatformPrompt(p, profile, processedSource);
                const result = await model.generateContent(prompt);
                const responseText = result.response.text();
                return { platform: p, content: responseText.trim() };
            } catch (err) {
                console.error(`Error generating for ${p}:`, err);
                return { platform: p, content: `[Error: Failed to generate for ${p}]` };
            }
        });

        const generated = await Promise.all(generatedPromises);

        // 4. Persist to DB if user is authenticated
        if (user) {
            const savePromises = generated.map((item: { platform: string; content: string }) =>
                prisma.generatedContent.create({
                    data: {
                        userId: user.id,
                        source: source.substring(0, 500), // Truncate long text/URLs
                        platform: item.platform,
                        content: item.content,
                    }
                })
            );
            await Promise.all(savePromises);
        }

        return NextResponse.json({ success: true, message: "Successfully generated content", data: generated });

    } catch (error: any) {
        console.error("API Route Error:", error);
        return NextResponse.json(
            { error: error?.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
