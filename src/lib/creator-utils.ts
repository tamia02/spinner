/**
 * Utility for fetching latest posts from monitored creator profiles.
 * Uses Jina Reader for profile scraping.
 */

export interface CreatorPost {
    content: string;
    url: string;
    publishedAt?: string;
}

/**
 * Scrapes the latest posts from a creator's profile URL.
 * @param url The profile URL (LinkedIn etc.)
 */
export async function fetchLatestCreatorPosts(url: string): Promise<CreatorPost[]> {
    try {
        console.log(`[CREATOR-UTILS] Fetching latest posts from: ${url}`);

        // Using Jina Reader to get markdown content of the profile
        const jinaResponse = await fetch(`https://r.jina.ai/${url}`, {
            headers: {
                'Accept': 'text/plain',
                'X-Return-Format': 'markdown',
                'X-With-Images-Summary': 'false',
                'X-With-Links-Summary': 'true'
            }
        });

        if (!jinaResponse.ok) {
            console.warn(`[CREATOR-UTILS] Jina Reader failed for ${url} with status:`, jinaResponse.status);
            return [];
        }

        const markdown = await jinaResponse.text();

        // Heuristic: Looking for post-like structures in the markdown
        // Typically, posts in Jina markdown are separated by horizontal rules or headers
        // We'll split by common patterns and try to extract 2-3 significant blocks

        const possiblePosts = markdown
            .split(/\n---\n|\n### |\n## /)
            .filter(block => block.trim().length > 100) // At least some content
            .slice(0, 5); // Take top few chunks

        const posts: CreatorPost[] = possiblePosts.map((content, index) => ({
            content: content.trim(),
            url: `${url}/posts/${index}`, // Synthetic URL if we can't find real one
        }));

        console.log(`[CREATOR-UTILS] Extracted ${posts.length} potential posts from ${url}`);
        return posts;
    } catch (error) {
        console.error(`[CREATOR-UTILS] Error fetching from ${url}:`, error);
        return [];
    }
}
