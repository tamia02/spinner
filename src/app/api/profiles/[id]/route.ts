import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// PUT update a profile
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    const body = await request.json();

    const profile = await prisma.voiceProfile.updateMany({
        where: { id, userId: user.id },
        data: {
            name: body.name,
            audience: body.audience,
            tone: body.tone,
            formality: body.formality,
            humor: body.humor,
            emoji: body.emoji,
            isDefault: body.isDefault,
        },
    });
    return NextResponse.json(profile);
}

// DELETE a profile
export async function DELETE(
    _: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    await prisma.voiceProfile.deleteMany({
        where: { id, userId: user.id },
    });
    return NextResponse.json({ success: true });
}
