import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// GET all generated content for the logged-in user
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const content = await prisma.generatedContent.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(content);
}
