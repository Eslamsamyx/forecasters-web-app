/**
 * Channel URL Parser Utility
 * Extracts channel ID and metadata from various YouTube and X URL formats
 */

export interface ParsedChannel {
  type: "YOUTUBE" | "TWITTER";
  channelId: string;
  channelName?: string;
  channelUrl: string;
  originalUrl: string;
}

/**
 * Parse YouTube URLs and extract channel information
 * Supports:
 * - https://youtube.com/channel/UCxxxxxxxxx
 * - https://youtube.com/c/channelname
 * - https://youtube.com/@username
 * - https://www.youtube.com/user/username
 * - https://youtube.com/watch?v=xxx (extracts channel from video - requires API)
 * - https://youtu.be/xxx (short links)
 */
export function parseYouTubeUrl(url: string): ParsedChannel | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Ensure it's a YouTube URL
    if (!hostname.includes('youtube.com') && !hostname.includes('youtu.be')) {
      return null;
    }

    let channelId = '';
    let channelName = '';
    let channelUrl = '';

    // Channel ID format: /channel/UCxxxxxxxxx
    if (urlObj.pathname.startsWith('/channel/')) {
      channelId = urlObj.pathname.split('/')[2] || '';
      channelUrl = `https://youtube.com/channel/${channelId}`;
    }
    // Custom URL format: /c/channelname
    else if (urlObj.pathname.startsWith('/c/')) {
      channelName = urlObj.pathname.split('/')[2] || '';
      channelId = channelName; // We'll use the custom name as ID for now
      channelUrl = `https://youtube.com/c/${channelName}`;
    }
    // Handle format: /@username
    else if (urlObj.pathname.startsWith('/@')) {
      channelName = urlObj.pathname.substring(2).split('/')[0] || '';
      channelId = `@${channelName}`; // Use handle as ID
      channelUrl = `https://youtube.com/@${channelName}`;
    }
    // Legacy user format: /user/username
    else if (urlObj.pathname.startsWith('/user/')) {
      channelName = urlObj.pathname.split('/')[2] || '';
      channelId = channelName; // Use username as ID for now
      channelUrl = `https://youtube.com/user/${channelName}`;
    }
    // Video URL - we can extract channel info but would need API call
    else if (urlObj.pathname === '/watch' && urlObj.searchParams.has('v')) {
      // For video URLs, we'd need to make an API call to get channel info
      // For now, return null and handle this case separately
      return null;
    }
    // Short URL format
    else if (hostname.includes('youtu.be')) {
      // Short URLs are for videos, would need API call
      return null;
    }
    // Direct channel URL without path
    else if (urlObj.pathname === '/' && urlObj.searchParams.has('channel')) {
      channelId = urlObj.searchParams.get('channel') || '';
      channelUrl = `https://youtube.com/channel/${channelId}`;
    }
    else {
      return null;
    }

    if (!channelId) {
      return null;
    }

    return {
      type: "YOUTUBE",
      channelId,
      channelName: channelName || undefined,
      channelUrl,
      originalUrl: url
    };
  } catch (error) {
    console.error('Error parsing YouTube URL:', error);
    return null;
  }
}

/**
 * Parse X URLs and extract username
 * Supports:
 * - https://twitter.com/username
 * - https://x.com/username
 * - https://twitter.com/username/status/xxx (extracts username)
 * - @username (just the handle)
 */
export function parseTwitterUrl(url: string): ParsedChannel | null {
  try {
    // Handle direct @username input
    if (url.startsWith('@')) {
      const username = url.substring(1).split(/[^a-zA-Z0-9_]/)[0] || '';
      if (!username) return null;
      return {
        type: "TWITTER",
        channelId: username,
        channelName: username,
        channelUrl: `https://twitter.com/${username}`,
        originalUrl: url
      };
    }

    // Handle plain username without @ or URL
    if (!url.includes('/') && !url.includes('.') && /^[a-zA-Z0-9_]+$/.test(url)) {
      return {
        type: "TWITTER",
        channelId: url,
        channelName: url,
        channelUrl: `https://twitter.com/${url}`,
        originalUrl: url
      };
    }

    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Ensure it's an X URL
    if (!hostname.includes('twitter.com') && !hostname.includes('x.com')) {
      return null;
    }

    // Extract username from path
    const pathParts = urlObj.pathname.split('/').filter(p => p);
    if (pathParts.length === 0) {
      return null;
    }

    const username = pathParts[0] || '';
    if (!username) return null;

    // Validate username (X usernames can only contain letters, numbers, and underscores)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return null;
    }

    return {
      type: "TWITTER",
      channelId: username,
      channelName: username,
      channelUrl: `https://twitter.com/${username}`,
      originalUrl: url
    };
  } catch (error) {
    // If it's not a valid URL, try treating it as a username
    if (typeof url === 'string' && url.length > 0) {
      const username = url.replace('@', '').split(/[^a-zA-Z0-9_]/)[0] || '';
      if (username && /^[a-zA-Z0-9_]+$/.test(username)) {
        return {
          type: "TWITTER",
          channelId: username,
          channelName: username,
          channelUrl: `https://twitter.com/${username}`,
          originalUrl: url
        };
      }
    }
    return null;
  }
}

/**
 * Automatically detect and parse channel URL
 * Tries to determine if it's YouTube or X based on the URL
 */
export function parseChannelUrl(url: string): ParsedChannel | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const trimmedUrl = url.trim();

  // Try to detect the platform
  const lowerUrl = trimmedUrl.toLowerCase();

  // Check for X indicators
  if (
    lowerUrl.includes('twitter.com') ||
    lowerUrl.includes('x.com') ||
    lowerUrl.startsWith('@') ||
    (lowerUrl.length < 30 && /^[a-zA-Z0-9_]+$/.test(lowerUrl)) // Likely an X username
  ) {
    return parseTwitterUrl(trimmedUrl);
  }

  // Check for YouTube indicators
  if (
    lowerUrl.includes('youtube.com') ||
    lowerUrl.includes('youtu.be') ||
    lowerUrl.includes('/channel/') ||
    lowerUrl.includes('/c/') ||
    lowerUrl.includes('/user/')
  ) {
    return parseYouTubeUrl(trimmedUrl);
  }

  // Try both parsers
  const youtubeResult = parseYouTubeUrl(trimmedUrl);
  if (youtubeResult) return youtubeResult;

  const twitterResult = parseTwitterUrl(trimmedUrl);
  if (twitterResult) return twitterResult;

  return null;
}

/**
 * Validate if a URL is a supported channel URL
 */
export function isValidChannelUrl(url: string): boolean {
  return parseChannelUrl(url) !== null;
}

/**
 * Extract channel type from URL
 */
export function getChannelType(url: string): "YOUTUBE" | "TWITTER" | null {
  const parsed = parseChannelUrl(url);
  return parsed?.type || null;
}