import { NextResponse } from "next/server";

export async function GET() {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = "http://localhost:3000/api/auth/callback/linkedin";
    const scope = "w_member_social profile openid email";
    const state = "splinter_auth_" + Math.random().toString(36).substring(7);

    if (!clientId) {
        return NextResponse.json({ error: "Missing LINKEDIN_CLIENT_ID" }, { status: 500 });
    }

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;

    return NextResponse.redirect(authUrl);
}
