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

        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                email: true,
                name: true,
                linkedinToken: true,
                twitterToken: true
            }
        });

        return NextResponse.json({
            success: true,
            user: {
                ...dbUser,
                linkedinToken: !!dbUser?.linkedinToken, // boolean flag only for security
                twitterToken: !!dbUser?.twitterToken
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
