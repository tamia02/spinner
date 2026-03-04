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

        // Get stored LinkedIn access token
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        if (!dbUser?.linkedinToken) {
            return NextResponse.json({ error: "LinkedIn account not connected. Please connect in settings." }, { status: 403 });
        }

        // Post to LinkedIn Share API v2
        const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
            headers: { Authorization: `Bearer ${dbUser.linkedinToken}` }
        });
        const profile = await profileRes.json();
        const personUrn = `urn:li:person:${profile.sub}`;

        const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${dbUser.linkedinToken}`,
                "Content-Type": "application/json",
                "X-Restli-Protocol-Version": "2.0.0"
            },
            body: JSON.stringify({
                author: personUrn,
                lifecycleState: "PUBLISHED",
                specificContent: {
                    "com.linkedin.ugc.ShareContent": {
                        shareCommentary: { text: content },
                        shareMediaCategory: "NONE"
                    }
                },
                visibility: {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                }
            })
        });

        if (!postRes.ok) {
            const errorData = await postRes.json();
            console.error("LinkedIn post error:", errorData);
            return NextResponse.json({ error: "LinkedIn posting failed", details: errorData }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Posted to LinkedIn successfully!" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
