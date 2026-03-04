import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// GET all scheduled posts
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const posts = await prisma.scheduledPost.findMany({
        where: { userId: user.id },
        orderBy: { scheduledAt: "asc" },
    });
    return NextResponse.json(posts);
}

// POST create a scheduled post
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { platform, content, scheduledAt } = await request.json();

    if (!platform || !content || !scheduledAt) {
        return NextResponse.json({ error: "platform, content, and scheduledAt are required" }, { status: 400 });
    }

    const post = await prisma.scheduledPost.create({
        data: {
            userId: user.id,
            platform,
            content,
            scheduledAt: new Date(scheduledAt),
            status: "PENDING",
        }
    });

    return NextResponse.json(post);
}

// DELETE a scheduled post
export async function DELETE(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await prisma.scheduledPost.deleteMany({ where: { id, userId: user.id } });
    return NextResponse.json({ success: true });
}
