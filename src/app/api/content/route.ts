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

    // Shape for the library UI: wrap single `platform` into `platforms[]` and expose `sourceStr`
    const shaped = content.map(item => ({
        id: item.id,
        sourceStr: item.source,
        platforms: [item.platform],
        createdAt: item.createdAt,
    }));

    return NextResponse.json(shaped);
}
