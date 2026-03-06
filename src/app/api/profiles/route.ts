import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const profileSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    audience: z.string().max(200).optional(),
    tone: z.enum(["CASUAL", "PROFESSIONAL", "ACADEMIC", "CREATIVE"]).default("PROFESSIONAL"),
    formality: z.number().min(0).max(100).default(50),
    humor: z.number().min(0).max(100).default(20),
    emoji: z.number().min(0).max(100).default(10),
    isDefault: z.boolean().default(false),
    writingSample: z.string().max(10000).optional(),
    writingStyle: z.string().max(5000).optional(),
});

// GET all profiles for the logged-in user
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const profiles = await prisma.voiceProfile.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(profiles);
    } catch (error: any) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST create a new profile
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const result = profileSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: "Validation failed", details: result.error.format() }, { status: 400 });
        }

        const data = result.data;

        // If this is set as default, unset others first
        if (data.isDefault) {
            await prisma.voiceProfile.updateMany({
                where: { userId: user.id },
                data: { isDefault: false }
            });
        }

        const profile = await prisma.voiceProfile.create({
            data: {
                userId: user.id,
                name: data.name,
                audience: data.audience,
                tone: data.tone,
                formality: data.formality,
                humor: data.humor,
                emoji: data.emoji,
                isDefault: data.isDefault,
                writingSample: data.writingSample,
                writingStyle: data.writingStyle,
            },
        });
        return NextResponse.json(profile);
    } catch (error: any) {
        console.error("Profile creation error:", error);
        return NextResponse.json({ error: "Could not create profile" }, { status: 500 });
    }
}
