import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getValidTwitterToken } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { content } = await request.json();
        if (!content) return NextResponse.json({ error: "No content provided" }, { status: 400 });

        const accessToken = await getValidTwitterToken(user.id);
        if (!accessToken) {
            return NextResponse.json({ error: "X/Twitter account not connected. Please connect in settings." }, { status: 403 });
        }

        // Split content into thread parts (delimited by double newlines)
        const parts = content.split(/\n\n+/).filter((p: string) => p.trim() !== "");

        let lastTweetId: string | null = null;
        const postedTweets = [];

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i].trim();
            const body: any = { text: part.substring(0, 280) };

            if (lastTweetId) {
                body.reply = { in_reply_to_tweet_id: lastTweetId };
            }

            let tweetRes = await fetch("https://api.twitter.com/2/tweets", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            // Simple retry for 503
            if (tweetRes.status === 503) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                tweetRes = await fetch("https://api.twitter.com/2/tweets", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                });
            }

            if (!tweetRes.ok) {
                const errorData = await tweetRes.json().catch(() => ({ message: "Unknown Twitter API error" }));
                console.error(`Twitter thread part ${i + 1} error:`, errorData);

                if (postedTweets.length === 0) {
                    const message = errorData?.detail || errorData?.errors?.[0]?.message || errorData?.message || JSON.stringify(errorData);
                    return NextResponse.json({ error: `Twitter posting failed: ${message}`, details: errorData }, { status: 500 });
                }
                // If some were posted, we stop here but return success with what was done
                return NextResponse.json({
                    success: false,
                    error: "Partial thread posted. Error on part " + (i + 1),
                    postedCount: postedTweets.length,
                    tweetIds: postedTweets.map(p => p.id)
                }, { status: 502 });
            }

            const tweetData = await tweetRes.json();
            lastTweetId = tweetData?.data?.id;
            postedTweets.push(tweetData?.data);
        }

        return NextResponse.json({
            success: true,
            message: parts.length > 1 ? `Thread of ${parts.length} tweets posted successfully!` : "Posted to X/Twitter successfully!",
            tweetIds: postedTweets.map(p => p.id)
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
