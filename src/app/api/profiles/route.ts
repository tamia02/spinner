import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// GET all profiles for the logged-in user
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profiles = await prisma.voiceProfile.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(profiles);
}

// POST create a new profile
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const profile = await prisma.voiceProfile.create({
        data: {
            userId: user.id,
            name: body.name,
            audience: body.audience,
            tone: body.tone ?? "PROFESSIONAL",
            formality: body.formality ?? 50,
            humor: body.humor ?? 20,
            emoji: body.emoji ?? 10,
            isDefault: body.isDefault ?? false,
            writingSample: body.writingSample,
            writingStyle: body.writingStyle,
        },
    });
    return NextResponse.json(profile);
}
