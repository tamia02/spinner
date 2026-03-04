import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let dbUser = null;
        try {
            dbUser = await prisma.user.findUnique({
                where: { id: user.id },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    linkedinToken: true,
                    twitterToken: true
                }
            });
        } catch (dbError) {
            console.error("Prisma lookup failed in status route:", dbError);
            // Don't crash the whole route, just proceed with null dbUser
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: dbUser?.name || user.user_metadata?.full_name,
                linkedinToken: !!dbUser?.linkedinToken,
                twitterToken: !!dbUser?.twitterToken
            }
        });
    } catch (error: any) {
        console.error("User status API error:", error);
        return NextResponse.json({
            error: "Failed to fetch user status",
            details: error.message
        }, { status: 500 });
    }
}
