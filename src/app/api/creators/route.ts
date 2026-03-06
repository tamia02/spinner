import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const creatorSchema = z.object({
    url: z.string().url("Valid URL required"),
    name: z.string().optional(),
});

export async function GET(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const creators = await prisma.monitoredCreator.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, data: creators });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Limit to 5 creators
        const count = await prisma.monitoredCreator.count({ where: { userId: user.id } });
        if (count >= 5) {
            return NextResponse.json({ error: "Monitor limit reached. Max 5 creators." }, { status: 400 });
        }

        const body = await req.json();
        const { url, name } = creatorSchema.parse(body);

        const creator = await prisma.monitoredCreator.create({
            data: {
                userId: user.id,
                url,
                name: name || "Top Creator"
            }
        });

        return NextResponse.json({ success: true, data: creator });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await prisma.monitoredCreator.delete({
            where: { id, userId: user.id }
        });

        return NextResponse.json({ success: true, message: "Creator removed" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
