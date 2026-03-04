import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
        return NextResponse.redirect(new URL(`/setup?error=${error}`, request.url));
    }

    if (code) {
        try {
            const supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // In production, exchange `code` for an access_token here.
                // For demonstration, we save a simulated token to prove the DB wiring works.
                await prisma.user.update({
                    where: { id: user.id },
                    data: { twitterToken: "mock_twitter_token_" + code }
                });
            }
            return NextResponse.redirect(new URL("/setup?connected=twitter", request.url));
        } catch (err) {
            console.error("Twitter Auth Error:", err);
            return NextResponse.redirect(new URL("/setup?error=server_error", request.url));
        }
    }

    return NextResponse.redirect(new URL("/setup?error=missing_code", request.url));
}
