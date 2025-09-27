import { env } from "@/env.mjs";
import { prisma } from "../db";

interface CollectionResult {
  success: boolean;
  itemsCollected: number;
  itemsFiltered: number;
  error?: string;
}

interface ChannelConfig {
  id: string;
  forecasterId: string;
  channelType: string;
  channelId: string;
  channelUrl: string;
  isPrimary: boolean;
  isActive: boolean;
  collectionSettings: {
    checkInterval: number;
    lastChecked: string | null;
    enabled: boolean;
  };
  keywords: Array<{
    id: string;
    keyword: string;
    isActive: boolean;
    isDefault: boolean;
  }>;
}

export class ChannelCollectionService {
  private static readonly RATE_LIMIT_DELAY = 2000; // 2 seconds between requests
  private static readonly MAX_RETRIES = 3;

  /**
   * Main entry point for scheduled collection
   * Replaces the old profile-based collection logic
   */
  async processScheduledCollection(): Promise<void> {
    console.log("🔄 Starting scheduled channel collection...");

    try {
      const channels = await this.getChannelsDueForCollection();
      console.log(`📋 Found ${channels.length} channels due for collection`);

      for (const channel of channels) {
        await this.collectFromChannel(channel);

        // Rate limiting between channels
        await this.delay(ChannelCollectionService.RATE_LIMIT_DELAY);
      }

      console.log("✅ Scheduled collection completed");
    } catch (error) {
      console.error("❌ Scheduled collection failed:", error);
      throw error;
    }
  }

  /**
   * Collect content from a specific channel (used after channel creation)
   */
  async collectFromChannelImmediate(channelId: string): Promise<CollectionResult> {
    console.log(`🚀 Immediate collection for channel: ${channelId}`);

    try {
      const channel = await this.getChannelConfig(channelId);
      if (!channel) {
        throw new Error(`Channel ${channelId} not found`);
      }

      return await this.collectFromChannel(channel);
    } catch (error) {
      console.error(`❌ Immediate collection failed for channel ${channelId}:`, error);
      return {
        success: false,
        itemsCollected: 0,
        itemsFiltered: 0,
        error: (error as Error).message
      };
    }
  }

  /**
   * Get channels that are due for collection based on their checkInterval
   */
  private async getChannelsDueForCollection(): Promise<ChannelConfig[]> {
    const rawChannels = await prisma.forecasterChannel.findMany({
      where: {
        isActive: true,
        forecaster: {
          isVerified: true
        }
      },
      include: {
        keywords: {
          where: { isActive: true },
          orderBy: [
            { isDefault: 'desc' },
            { createdAt: 'asc' }
          ]
        }
      }
    });

    const channelsDue: ChannelConfig[] = [];

    for (const channel of rawChannels) {
      const config = this.parseChannelConfig(channel);

      // Skip if collection is disabled
      if (!config.collectionSettings.enabled) {
        continue;
      }

      // Check if channel is due for collection
      if (this.isChannelDueForCollection(config)) {
        channelsDue.push(config);
      }
    }

    return channelsDue;
  }

  /**
   * Check if a channel is due for collection based on its checkInterval
   */
  private isChannelDueForCollection(channel: ChannelConfig): boolean {
    const { checkInterval, lastChecked } = channel.collectionSettings;

    if (!lastChecked) {
      return true; // Never collected before
    }

    const lastCheckedTime = new Date(lastChecked).getTime();
    const intervalMs = checkInterval * 1000; // Convert seconds to milliseconds
    const now = Date.now();

    return (now - lastCheckedTime) >= intervalMs;
  }

  /**
   * Get channel configuration by ID
   */
  private async getChannelConfig(channelId: string): Promise<ChannelConfig | null> {
    const channel = await prisma.forecasterChannel.findUnique({
      where: { id: channelId },
      include: {
        keywords: {
          where: { isActive: true },
          orderBy: [
            { isDefault: 'desc' },
            { createdAt: 'asc' }
          ]
        }
      }
    });

    return channel ? this.parseChannelConfig(channel) : null;
  }

  /**
   * Parse raw database channel to our typed config
   */
  private parseChannelConfig(rawChannel: any): ChannelConfig {
    return {
      id: rawChannel.id,
      forecasterId: rawChannel.forecasterId,
      channelType: rawChannel.channelType,
      channelId: rawChannel.channelId,
      channelUrl: rawChannel.channelUrl,
      isPrimary: rawChannel.isPrimary,
      isActive: rawChannel.isActive,
      collectionSettings: rawChannel.collectionSettings as any,
      keywords: rawChannel.keywords || []
    };
  }

  /**
   * Collect content from a specific channel
   */
  private async collectFromChannel(channel: ChannelConfig): Promise<CollectionResult> {
    console.log(`📥 Collecting from ${channel.channelType} channel: ${channel.channelId}`);

    try {
      // Create collection job for tracking
      const job = await prisma.channelCollectionJob.create({
        data: {
          channelId: channel.id,
          jobType: channel.isPrimary ? 'FULL_SCAN' : 'KEYWORD_SCAN',
          status: 'RUNNING',
          startedAt: new Date(),
          config: {
            keywords: channel.keywords.map(k => k.keyword),
            isPrimary: channel.isPrimary
          }
        }
      });

      let result: CollectionResult;

      // Collect based on channel type
      if (channel.channelType === 'YOUTUBE') {
        result = await this.collectYouTubeChannel(channel);
      } else if (channel.channelType === 'TWITTER') {
        result = await this.collectTwitterChannel(channel);
      } else {
        throw new Error(`Unsupported channel type: ${channel.channelType}`);
      }

      // Update collection job
      await prisma.channelCollectionJob.update({
        where: { id: job.id },
        data: {
          status: result.success ? 'COMPLETED' : 'FAILED',
          completedAt: new Date(),
          videosFound: result.itemsCollected + result.itemsFiltered,
          videosProcessed: result.itemsCollected,
          error: result.error
        }
      });

      // Update channel's lastChecked timestamp
      await this.updateChannelLastChecked(channel.id);

      console.log(`✅ Collection completed for ${channel.channelId}: ${result.itemsCollected} items collected, ${result.itemsFiltered} filtered`);
      return result;

    } catch (error) {
      console.error(`❌ Collection failed for channel ${channel.channelId}:`, error);

      return {
        success: false,
        itemsCollected: 0,
        itemsFiltered: 0,
        error: (error as Error).message
      };
    }
  }

  /**
   * Collect from YouTube channel with keyword filtering
   */
  private async collectYouTubeChannel(channel: ChannelConfig): Promise<CollectionResult> {
    const apiKey = env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('Google API key not configured');
    }

    const baseUrl = "https://www.googleapis.com/youtube/v3";
    let itemsCollected = 0;
    let itemsFiltered = 0;

    try {
      // Get channel's upload playlist
      const channelResponse = await fetch(
        `${baseUrl}/channels?part=contentDetails&id=${channel.channelId}&key=${apiKey}`
      );

      if (!channelResponse.ok) {
        throw new Error(`YouTube API error: ${channelResponse.status}`);
      }

      const channelInfo = await channelResponse.json();
      if (!channelInfo.items?.[0]) {
        throw new Error(`YouTube channel not found: ${channel.channelId}`);
      }

      const uploadsPlaylistId = channelInfo.items[0].contentDetails.relatedPlaylists.uploads;

      // Get latest videos (limit based on channel type)
      const maxResults = channel.isPrimary ? 10 : 20; // More videos for secondary channels due to filtering
      const videosResponse = await fetch(
        `${baseUrl}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${apiKey}`
      );

      if (!videosResponse.ok) {
        throw new Error(`YouTube playlist API error: ${videosResponse.status}`);
      }

      const videosData = await videosResponse.json();
      if (!videosData.items) {
        return { success: true, itemsCollected: 0, itemsFiltered: 0 };
      }

      // Process each video
      for (const item of videosData.items) {
        const videoId = item.snippet.resourceId.videoId;
        const videoTitle = item.snippet.title;
        const videoDescription = item.snippet.description;

        // Check for duplicates
        if (await this.isDuplicateContent('YOUTUBE', videoId, channel.forecasterId)) {
          itemsFiltered++;
          continue;
        }

        // Apply keyword filtering for secondary channels
        if (!channel.isPrimary) {
          const keywords = channel.keywords.map(k => k.keyword);
          if (!this.matchesKeywords(videoTitle, videoDescription, keywords)) {
            itemsFiltered++;
            continue;
          }
        }

        // Collect the video
        const collected = await this.collectYouTubeVideo(videoId, channel.forecasterId);
        if (collected) {
          itemsCollected++;
        }

        // Rate limiting between videos
        await this.delay(1000);
      }

      return {
        success: true,
        itemsCollected,
        itemsFiltered
      };

    } catch (error) {
      throw new Error(`YouTube collection failed: ${(error as Error).message}`);
    }
  }

  /**
   * Collect from X channel with keyword filtering
   */
  private async collectTwitterChannel(channel: ChannelConfig): Promise<CollectionResult> {
    const rapidApiKey = env.RAPIDAPI_KEY;
    if (!rapidApiKey) {
      throw new Error('RapidAPI key not configured');
    }

    const baseUrl = "https://twitter241.p.rapidapi.com/api/v2";
    let itemsCollected = 0;
    let itemsFiltered = 0;

    try {
      // Get user info first
      const userResponse = await fetch(
        `${baseUrl}/users/by/username/${channel.channelId}`,
        {
          headers: {
            "X-RapidAPI-Key": rapidApiKey,
            "X-RapidAPI-Host": "twitter241.p.rapidapi.com",
          },
        }
      );

      if (!userResponse.ok) {
        throw new Error(`Twitter API error: ${userResponse.status}`);
      }

      const userData = await userResponse.json();
      if (!userData.data) {
        throw new Error(`Twitter user not found: ${channel.channelId}`);
      }

      const userId = userData.data.id;

      // Get recent tweets
      const maxResults = channel.isPrimary ? 10 : 20;
      const tweetsResponse = await fetch(
        `${baseUrl}/users/${userId}/tweets?max_results=${maxResults}`,
        {
          headers: {
            "X-RapidAPI-Key": rapidApiKey,
            "X-RapidAPI-Host": "twitter241.p.rapidapi.com",
          },
        }
      );

      if (!tweetsResponse.ok) {
        throw new Error(`Twitter tweets API error: ${tweetsResponse.status}`);
      }

      const tweetsData = await tweetsResponse.json();
      if (!tweetsData.data) {
        return { success: true, itemsCollected: 0, itemsFiltered: 0 };
      }

      // Process each tweet
      for (const tweet of tweetsData.data) {
        // Check for duplicates
        if (await this.isDuplicateContent('TWITTER', tweet.id, channel.forecasterId)) {
          itemsFiltered++;
          continue;
        }

        // Apply keyword filtering for secondary channels
        if (!channel.isPrimary) {
          const keywords = channel.keywords.map(k => k.keyword);
          if (!this.matchesKeywords(tweet.text, '', keywords)) {
            itemsFiltered++;
            continue;
          }
        }

        // Collect the tweet
        const collected = await this.collectTweet(tweet.id, channel.forecasterId);
        if (collected) {
          itemsCollected++;
        }

        // Rate limiting between tweets
        await this.delay(1000);
      }

      return {
        success: true,
        itemsCollected,
        itemsFiltered
      };

    } catch (error) {
      throw new Error(`Twitter collection failed: ${(error as Error).message}`);
    }
  }

  /**
   * Check if content already exists (duplicate detection)
   * PERMANENT check - no video/tweet should ever be scraped twice
   */
  private async isDuplicateContent(sourceType: string, sourceId: string, forecasterId: string): Promise<boolean> {
    const existing = await prisma.content.findFirst({
      where: {
        sourceType,
        sourceId,
        forecasterId
        // NO date filter - check ALL historical content
      }
    });

    return existing !== null;
  }

  /**
   * Check if content matches any of the keywords (for secondary channels)
   */
  private matchesKeywords(title: string, description: string, keywords: string[]): boolean {
    if (keywords.length === 0) {
      return true; // No keywords means no filtering
    }

    const searchText = `${title} ${description}`.toLowerCase();

    return keywords.some(keyword =>
      searchText.includes(keyword.toLowerCase())
    );
  }

  /**
   * Collect a single YouTube video
   */
  private async collectYouTubeVideo(videoId: string, forecasterId: string): Promise<boolean> {
    try {
      const { YouTubeCollector } = await import('./collectors');
      const collector = new YouTubeCollector();
      const result = await collector.collectVideo(videoId, forecasterId);
      return result !== null;
    } catch (error) {
      console.error(`Failed to collect YouTube video ${videoId}:`, error);
      return false;
    }
  }

  /**
   * Collect a single tweet
   */
  private async collectTweet(tweetId: string, forecasterId: string): Promise<boolean> {
    try {
      const { TwitterCollector } = await import('./collectors');
      const collector = new TwitterCollector();
      const result = await collector.collectTweet(tweetId, forecasterId);
      return result !== null;
    } catch (error) {
      console.error(`Failed to collect tweet ${tweetId}:`, error);
      return false;
    }
  }

  /**
   * Update channel's lastChecked timestamp
   */
  private async updateChannelLastChecked(channelId: string): Promise<void> {
    const channel = await prisma.forecasterChannel.findUnique({
      where: { id: channelId }
    });

    if (channel) {
      const currentSettings = channel.collectionSettings as any;
      await prisma.forecasterChannel.update({
        where: { id: channelId },
        data: {
          collectionSettings: {
            ...currentSettings,
            lastChecked: new Date().toISOString()
          }
        }
      });
    }
  }

  /**
   * Utility: Add delay for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get collection statistics
   */
  async getCollectionStats(forecasterId?: string): Promise<any> {
    const whereClause = forecasterId ? { forecasterId } : {};

    const [
      totalChannels,
      activeChannels,
      recentJobs,
      totalContent
    ] = await Promise.all([
      prisma.forecasterChannel.count({ where: whereClause }),
      prisma.forecasterChannel.count({
        where: { ...whereClause, isActive: true }
      }),
      prisma.channelCollectionJob.count({
        where: {
          ...(forecasterId ? { channel: { forecasterId } } : {}),
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      }),
      prisma.content.count({
        where: forecasterId ? { forecasterId } : {}
      })
    ]);

    return {
      channels: {
        total: totalChannels,
        active: activeChannels
      },
      jobs: {
        recent: recentJobs
      },
      content: {
        total: totalContent
      }
    };
  }
}