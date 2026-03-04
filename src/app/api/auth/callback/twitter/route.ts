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
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError) {
                console.error("Twitter Callback - Supabase User Error:", userError.message);
                return NextResponse.redirect(new URL("/setup?error=auth_failed", request.url));
            }

            if (user) {
                try {
                    console.log("Twitter Callback - Syncing user to DB:", user.id);
                    await prisma.user.upsert({
                        where: { id: user.id },
                        update: { twitterToken: "mock_twitter_token_" + code },
                        create: {
                            id: user.id,
                            email: user.email || "",
                            twitterToken: "mock_twitter_token_" + code
                        }
                    });
                } catch (dbError) {
                    console.error("Twitter Callback - Prisma Upsert Error:", dbError);
                    return NextResponse.redirect(new URL("/setup?connected=twitter&db_status=failed", request.url));
                }
            } else {
                console.warn("Twitter Callback - No user found in session");
                return NextResponse.redirect(new URL("/setup?error=unauthorized", request.url));
            }
            return NextResponse.redirect(new URL("/setup?connected=twitter", request.url));
        } catch (err) {
            console.error("Twitter Callback - Unexpected Exception:", err);
            return NextResponse.redirect(new URL("/setup?error=server_error", request.url));
        }
    }

    return NextResponse.redirect(new URL("/setup?error=missing_code", request.url));
}
