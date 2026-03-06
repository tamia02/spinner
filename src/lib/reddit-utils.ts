/**
 * Utility for fetching content from Reddit without an API key using the .json endpoint.
 */

export interface RedditPost {
    title: string;
    selftext: string;
    url: string;
    score: number;
    num_comments: number;
    subreddit: string;
    permalink: string;
}

/**
 * Fetches top posts from a specific subreddit.
 * @param subreddit The subreddit name (e.g., 'artificial')
 * @param limit Number of posts to fetch (max 100)
 * @param timeframe 'day', 'week', 'month', 'year', 'all'
 */
export async function getTopSubredditPosts(
    subreddit: string,
    limit: number = 10,
    timeframe: string = 'week'
): Promise<RedditPost[]> {
    try {
        const url = `https://www.reddit.com/r/${subreddit}/top.json?limit=${limit}&t=${timeframe}`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'SplinterContentEngine/1.0.0'
            }
        });

        if (!response.ok) {
            throw new Error(`Reddit API failed with status: ${response.status}`);
        }

        const data = await response.json();
        return data.data.children.map((child: any) => ({
            title: child.data.title,
            selftext: child.data.selftext,
            url: child.data.url,
            score: child.data.score,
            num_comments: child.data.num_comments,
            subreddit: child.data.subreddit,
            permalink: `https://reddit.com${child.data.permalink}`
        }));
    } catch (error) {
        console.error(`Error fetching from r/${subreddit}:`, error);
        return [];
    }
}

/**
 * Searches Reddit for specific keywords.
 */
export async function searchReddit(
    query: string,
    limit: number = 10,
    sort: string = 'relevance',
    timeframe: string = 'week'
): Promise<RedditPost[]> {
    try {
        const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=${limit}&sort=${sort}&t=${timeframe}`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'SplinterContentEngine/1.0.0'
            }
        });

        if (!response.ok) {
            throw new Error(`Reddit Search failed with status: ${response.status}`);
        }

        const data = await response.json();
        return data.data.children.map((child: any) => ({
            title: child.data.title,
            selftext: child.data.selftext,
            url: child.data.url,
            score: child.data.score,
            num_comments: child.data.num_comments,
            subreddit: child.data.subreddit,
            permalink: `https://reddit.com${child.data.permalink}`
        }));
    } catch (error) {
        console.error(`Error searching Reddit for "${query}":`, error);
        return [];
    }
}
