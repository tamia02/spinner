import { NextResponse } from "next/server";

export async function GET() {
    const clientId = process.env.TWITTER_CLIENT_ID;
    const redirectUri = "http://localhost:3000/api/auth/callback/twitter";
    const scope = "tweet.read tweet.write users.read offline.access";
    const state = "splinter_auth_" + Math.random().toString(36).substring(7);
    const codeChallenge = "splinter_challenge"; // Using plain for the demonstration
    const codeChallengeMethod = "plain";

    if (!clientId) {
        return NextResponse.json({ error: "Missing TWITTER_CLIENT_ID" }, { status: 500 });
    }

    const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=${codeChallengeMethod}`;

    return NextResponse.redirect(authUrl);
}
