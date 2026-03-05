import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { platform } = body;

        if (!platform || (platform !== 'linkedin' && platform !== 'twitter')) {
            return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (platform === 'linkedin') {
            await prisma.user.update({
                where: { id: user.id },
                data: { linkedinToken: null }
            });
        } else if (platform === 'twitter') {
            await prisma.user.update({
                where: { id: user.id },
                data: { twitterToken: null }
            });
        }

        return NextResponse.json({ success: true, platform });
    } catch (error: any) {
        console.error("Disconnect API error:", error);
        return NextResponse.json({
            error: "Failed to disconnect account",
            details: error.message
        }, { status: 500 });
    }
}
