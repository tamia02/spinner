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
                console.error("LinkedIn Callback - Supabase User Error:", userError.message);
                return NextResponse.redirect(new URL("/setup?error=auth_failed", request.url));
            }

            if (user) {
                try {
                    console.log("LinkedIn Callback - Syncing user to DB:", user.id);
                    await prisma.user.upsert({
                        where: { id: user.id },
                        update: { linkedinToken: "mock_linkedin_token_" + code },
                        create: {
                            id: user.id,
                            email: user.email || "",
                            linkedinToken: "mock_linkedin_token_" + code
                        }
                    });
                } catch (dbError) {
                    console.error("LinkedIn Callback - Prisma Upsert Error:", dbError);
                    // If DB fails, we still want to redirect to setup so the user isn't stuck
                    return NextResponse.redirect(new URL("/setup?connected=linkedin&db_status=failed", request.url));
                }
            } else {
                console.warn("LinkedIn Callback - No user found in session");
                return NextResponse.redirect(new URL("/setup?error=unauthorized", request.url));
            }
            return NextResponse.redirect(new URL("/setup?connected=linkedin", request.url));
        } catch (err) {
            console.error("LinkedIn Callback - Unexpected Exception:", err);
            return NextResponse.redirect(new URL("/setup?error=server_error", request.url));
        }
    }

    return NextResponse.redirect(new URL("/setup?error=missing_code", request.url));
}
