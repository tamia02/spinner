import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const [totalGenerated, totalScheduled, totalPosted, totalFailed, dbUser] = await Promise.all([
            prisma.generatedContent.count({ where: { userId: user.id } }),
            prisma.scheduledPost.count({ where: { userId: user.id, status: "PENDING" } }),
            prisma.scheduledPost.count({ where: { userId: user.id, status: "POSTED" } }),
            prisma.scheduledPost.count({ where: { userId: user.id, status: "FAILED" } }),
            prisma.user.findUnique({ where: { id: user.id }, select: { linkedinToken: true, twitterToken: true } }),
        ]);

        const connectedPlatforms = [
            dbUser?.linkedinToken ? "LinkedIn" : null,
            dbUser?.twitterToken ? "Twitter/X" : null,
        ].filter(Boolean);

        return NextResponse.json({
            totalGenerated,
            totalScheduled,
            totalPosted,
            totalFailed,
            connectedPlatforms,
        });
    } catch (error: any) {
        console.error("Analytics API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
