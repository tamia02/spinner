import { prisma } from "./prisma";

export async function refreshTwitterToken(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twitterRefreshToken) throw new Error("No Twitter refresh token found");

    const clientId = process.env.TWITTER_CLIENT_ID || "";
    const clientSecret = process.env.TWITTER_CLIENT_SECRET || "";

    const response = await fetch("https://api.twitter.com/2/oauth2/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
        },
        body: new URLSearchParams({
            refresh_token: user.twitterRefreshToken,
            grant_type: "refresh_token",
            client_id: clientId,
        })
    });

    if (!response.ok) {
        const error = await response.text();
        console.error("Failed to refresh Twitter token:", error);
        throw new Error(`Twitter token refresh failed: ${error}`);
    }

    const data = await response.json();
    const expiresAt = new Date(Date.now() + data.expires_in * 1000);

    await prisma.user.update({
        where: { id: userId },
        data: {
            twitterToken: data.access_token,
            twitterRefreshToken: data.refresh_token,
            twitterExpiresAt: expiresAt
        }
    });

    return data.access_token;
}

export async function getValidTwitterToken(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twitterToken) return null;

    // If token expires in less than 5 minutes, refresh it
    const isExpired = user.twitterExpiresAt && (user.twitterExpiresAt.getTime() - Date.now() < 5 * 60 * 1000);

    if (isExpired || !user.twitterExpiresAt) {
        try {
            return await refreshTwitterToken(userId);
        } catch (error) {
            console.error("Automatic Twitter refresh failed:", error);
            return user.twitterToken; // Return old one as fallback, might still fail
        }
    }

    return user.twitterToken;
}
