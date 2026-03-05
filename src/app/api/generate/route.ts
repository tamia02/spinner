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

function getPlatformPrompt(platform: string, profile: string, sourceText: string, writingStyle?: string | null) {
    const toneGuide = profile === 'casual' ? 'casual, direct, and conversational'
        : profile === 'formal' ? 'professional, structured, and clear'
            : 'professional yet human and readable';

    const styleInstruction = writingStyle
        ? `\nCRITICAL: Mimic this exact writing style as closely as possible:\n"${writingStyle}"\nMatch their sentence length, vocabulary, punctuation patterns, and energy.`
        : '';

    const baseDirectives: Record<string, string> = {
        'twitter': `Write exactly ONE high-impact 3-tweet thread from the source content using a ${toneGuide} tone. Use 🧵 for the first tweet. Number them (1/3, 2/3, 3/3). Short, punchy sentences. Provide only the best version. Do not offer multiple options. No hashtags.`,
        'linkedin': `Write a LinkedIn post with clear spacing (one idea per paragraph) and a strong opening line. Tone: ${toneGuide}. End with an engaging question. No hashtags.`,
        'instagram': `Write an Instagram caption that captures the most interesting or emotional angle from the source. Tone: ${toneGuide}. No hashtags.`,
        'newsletter': `Write a short newsletter summary (3-4 paragraphs) from the source. Tone: ${toneGuide}. Include a catchy subject line at the top. Use bullet points for key takeaways. No hashtags.`,
        'blog': `Write a blog post from the source content. Tone: ${toneGuide}. Include: one H1 title, a brief intro, 2-3 H2 subheadings with content, and a brief conclusion. No hashtags.`
    };

    const specificInstructions = baseDirectives[platform.toLowerCase()] || `Write a highly optimized post for ${platform} based on the input. Tone: ${toneGuide}. No hashtags.`;

    return `You are a world-class copywriter helping a real person repurpose content for social media.

STRICT RULES — follow these exactly:
- Do NOT use hashtags anywhere in the output.
- Do NOT use AI-sounding corporate jargon (avoid: "delve", "leverage", "synergy", "game-changer", "revolutionize", "cutting-edge", "unlock").
- Write like a real human, not a marketing bot.
- Keep sentences short and direct.${styleInstruction}

PLATFORM INSTRUCTIONS:
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
        const { source, platforms, profile, profileId } = body;

        if (!source || !platforms || platforms.length === 0) {
            return NextResponse.json(
                { error: "Source text/URL and at least one platform are required." },
                { status: 400 }
            );
        }

        // Get user for DB save (optional - won't block generation if not authed)
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Fetch voice profile writingStyle if profileId provided
        let writingStyle: string | null = null;
        if (profileId && user) {
            try {
                const voiceProfile = await prisma.voiceProfile.findFirst({
                    where: { id: profileId, userId: user.id }
                });
                writingStyle = (voiceProfile as any)?.writingStyle ?? null;
            } catch {
                // writingStyle stays null if column not yet migrated
            }
        }

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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // 3. Platform Formatter (Parallel Generation)
        const generatedPromises = platforms.map(async (p: string) => {
            try {
                const prompt = getPlatformPrompt(p, profile, processedSource, writingStyle);
                const result = await model.generateContent(prompt);
                const responseText = result.response.text();
                return { platform: p, content: responseText.trim() };
            } catch (err: any) {
                console.error(`Error generating for ${p}:`, err);
                return { platform: p, content: `[Error: ${err.message}]` };
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
