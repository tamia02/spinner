import { NextResponse, NextRequest } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const clientId = process.env.TWITTER_CLIENT_ID;

    // Dynamically build the redirect URI based on the current host
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host");
    const baseUrl = `${protocol}://${host}`;
    const redirectUri = `${baseUrl}/api/auth/callback/twitter`;

    const scope = "tweet.read tweet.write users.read offline.access";
    const state = "splinter_auth_" + Math.random().toString(36).substring(7);
    // Twitter PKCE requires the code_challenge to be between 43 and 128 characters long
    const codeChallenge = "splinter_challenge_must_be_43_characters_long_minimum";
    const codeChallengeMethod = "plain";

    if (!clientId) {
        return NextResponse.json({ error: "Missing TWITTER_CLIENT_ID" }, { status: 500 });
    }

    const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=${codeChallengeMethod}`;

    return NextResponse.redirect(authUrl);
}
