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

                    // Exchange the auth code for a real Access Token
                    const clientId = process.env.TWITTER_CLIENT_ID || "";
                    const clientSecret = process.env.TWITTER_CLIENT_SECRET || "";
                    const protocol = request.headers.get("x-forwarded-proto") || "http";
                    const host = request.headers.get("host");
                    const redirectUri = `${protocol}://${host}/api/auth/callback/twitter`;

                    const tokenResponse = await fetch("https://api.twitter.com/2/oauth2/token", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
                        },
                        body: new URLSearchParams({
                            code: code,
                            grant_type: "authorization_code",
                            client_id: clientId,
                            redirect_uri: redirectUri,
                            // This MUST exactly match the codeChallenge used in api/auth/twitter/route.ts
                            code_verifier: "splinter_challenge_must_be_43_characters_long_minimum"
                        })
                    });

                    if (!tokenResponse.ok) {
                        const errorData = await tokenResponse.text();
                        console.error("Twitter Token Exchange Failed:", tokenResponse.status, errorData);
                        return NextResponse.redirect(new URL("/setup?error=auth_failed&reason=token_exchange", request.url));
                    }

                    const tokenData = await tokenResponse.json();
                    const realAccessToken = tokenData.access_token;
                    const refreshToken = tokenData.refresh_token;
                    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

                    await prisma.user.upsert({
                        where: { id: user.id },
                        update: {
                            twitterToken: realAccessToken,
                            twitterRefreshToken: refreshToken,
                            twitterExpiresAt: expiresAt
                        },
                        create: {
                            id: user.id,
                            email: user.email || "",
                            twitterToken: realAccessToken,
                            twitterRefreshToken: refreshToken,
                            twitterExpiresAt: expiresAt
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
