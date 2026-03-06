import { NextResponse } from "next/server";
import { getTopSubredditPosts, searchReddit } from "@/lib/reddit-utils";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");
        const subreddit = searchParams.get("subreddit");
        const limit = parseInt(searchParams.get("limit") || "10");
        const timeframe = searchParams.get("t") || "week";

        if (subreddit) {
            const posts = await getTopSubredditPosts(subreddit, limit, timeframe);
            return NextResponse.json({ success: true, data: posts });
        }

        if (query) {
            const posts = await searchReddit(query, limit, "relevance", timeframe);
            return NextResponse.json({ success: true, data: posts });
        }

        return NextResponse.json({ error: "Missing query or subreddit parameter" }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
