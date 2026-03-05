import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { content } = await request.json();
        if (!content) return NextResponse.json({ error: "No content provided" }, { status: 400 });

        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        if (!dbUser?.twitterToken) {
            return NextResponse.json({ error: "X/Twitter account not connected. Please connect in settings." }, { status: 403 });
        }

        // Post tweet via Twitter API v2
        const tweetRes = await fetch("https://api.twitter.com/2/tweets", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${dbUser.twitterToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text: content.substring(0, 280) }) // Twitter char limit
        });

        if (!tweetRes.ok) {
            const errorData = await tweetRes.json().catch(() => ({ message: "Unknown Twitter API error" }));
            const message = errorData?.detail || errorData?.errors?.[0]?.message || errorData?.message || JSON.stringify(errorData);
            console.error("Twitter post error:", errorData);
            return NextResponse.json({ error: `Twitter posting failed: ${message}`, details: errorData }, { status: 500 });
        }

        const tweetData = await tweetRes.json();
        return NextResponse.json({ success: true, message: "Posted to X/Twitter successfully!", tweetId: tweetData?.data?.id });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
