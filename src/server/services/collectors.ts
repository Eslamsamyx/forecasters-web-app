import { env } from "@/env.mjs";
import { prisma } from "../db";

interface ContentData {
  sourceType: "YOUTUBE" | "TWITTER";
  sourceId: string;
  sourceUrl?: string;
  title?: string;
  text?: string;
  transcript?: string;
  publishedAt?: Date;
  forecasterId?: string;
}

export class YouTubeCollector {
  private apiKey = env.GOOGLE_API_KEY;
  private baseUrl = "https://www.googleapis.com/youtube/v3";

  async collectVideo(videoId: string, forecasterId?: string): Promise<ContentData | null> {
    try {
      // Check if content already exists and resume from last step
      const existingContent = await prisma.content.findUnique({
        where: {
          sourceType_sourceId_forecasterId: {
            sourceType: "YOUTUBE",
            sourceId: videoId,
            forecasterId: forecasterId || "",
          },
        },
      });

      // If content exists and has a transcript, skip collection
      if (existingContent) {
        const data = existingContent.data as any;
        if (data.transcript && existingContent.status === "TRANSCRIBED") {
          console.log(`[YouTubeCollector] Content ${videoId} already transcribed, skipping collection`);
          return null;
        }
      }

      // Get video details
      const videoResponse = await fetch(
        `${this.baseUrl}/videos?part=snippet&id=${videoId}&key=${this.apiKey}`
      );
      const videoData = await videoResponse.json();

      if (!videoData.items?.[0]) return null;

      const video = videoData.items[0].snippet;

      // Get transcript with resume support
      const transcript = await this.getTranscript(videoId, forecasterId);

      const content: ContentData = {
        sourceType: "YOUTUBE",
        sourceId: videoId,
        sourceUrl: `https://youtube.com/watch?v=${videoId}`,
        title: video.title,
        text: video.description,
        transcript: transcript || undefined,
        publishedAt: new Date(video.publishedAt),
        forecasterId,
      };

      await this.storeContent(content);

      // Run prediction extraction if we have a transcript
      if (content.transcript && content.forecasterId) {
        console.log(`[YouTubeCollector] Running prediction extraction for video: ${videoId}`);
        try {
          const { UnifiedExtractionService } = await import('./extraction');
          const extractionService = new UnifiedExtractionService();

          const videoData = {
            videoId,
            videoUrl: content.sourceUrl || `https://youtube.com/watch?v=${videoId}`,
            title: content.title || '',
            description: content.text || '',
            channelName: 'Unknown Channel',
            publishedAt: content.publishedAt || new Date(),
            transcript: content.transcript,
            transcriptWithTimestamps: []
          };

          const result = await extractionService.extractFromVideo(videoData);
          console.log(`[YouTubeCollector] Extracted ${result.predictions.length} predictions from video ${videoId}`);

          // Store predictions with source information
          if (result.predictions.length > 0) {
            await extractionService.storePredictions(
              result.predictions.map(p => ({
                prediction: p.prediction.text,
                confidence: p.prediction.confidence / 100,
                targetDate: p.prediction.targetDate ? new Date(p.prediction.targetDate) : null,
                targetPrice: p.prediction.targetPrice,
                assetSymbol: p.asset.symbol,
                assetType: p.asset.type,
                reasoning: p.context.reasoning,
                tags: p.context.technicalIndicators || [],
                aiDirection: p.prediction.direction?.toUpperCase() || 'NEUTRAL',
                sourceType: 'YOUTUBE',
                sourceUrl: content.sourceUrl
              })),
              content.forecasterId
            );
            console.log(`[YouTubeCollector] Stored ${result.predictions.length} predictions to database`);
          }
        } catch (error) {
          console.error(`[YouTubeCollector] Extraction failed for video ${videoId}:`, error);
        }
      }

      return content;
    } catch (error) {
      console.error("YouTube collection failed:", error);
      return null;
    }
  }

  private async getTranscript(videoId: string, forecasterId?: string): Promise<string | null> {
    try {
      const { TranscriptionService } = await import('./transcription');
      const transcriptionService = new TranscriptionService();

      const videoUrl = `https://youtube.com/watch?v=${videoId}`;
      const contentId = forecasterId ? `${forecasterId}_${videoId}` : videoId;
      const result = await transcriptionService.getTranscriptForVideo(videoUrl, contentId);

      console.log(`[YouTubeCollector] Transcript extraction result: ${result.provenance} (${result.transcript.length} characters)`);

      return result.transcript || null;
    } catch (error) {
      console.error(`[YouTubeCollector] Transcript extraction failed for ${videoId}:`, error);
      return null;
    }
  }

  private async storeContent(data: ContentData): Promise<void> {
    await prisma.content.upsert({
      where: {
        sourceType_sourceId_forecasterId: {
          sourceType: data.sourceType,
          sourceId: data.sourceId,
          forecasterId: data.forecasterId || "",
        },
      },
      update: {
        data: {
          title: data.title,
          text: data.text,
          transcript: data.transcript,
          publishedAt: data.publishedAt?.toISOString(),
        },
        processedAt: new Date(),
      },
      create: {
        sourceType: data.sourceType,
        sourceId: data.sourceId,
        sourceUrl: data.sourceUrl,
        forecasterId: data.forecasterId,
        data: {
          title: data.title,
          text: data.text,
          transcript: data.transcript,
          publishedAt: data.publishedAt?.toISOString(),
        },
        status: "COLLECTED",
      },
    });
  }
}

export class TwitterCollector {
  private rapidApiKey = env.RAPIDAPI_KEY;
  private baseUrl = "https://twitter241.p.rapidapi.com/api/v2";

  async collectTweet(tweetId: string, forecasterId?: string): Promise<ContentData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/tweets/${tweetId}`, {
        headers: {
          "X-RapidAPI-Key": this.rapidApiKey,
          "X-RapidAPI-Host": "twitter241.p.rapidapi.com",
        },
      });

      const data = await response.json();

      if (!data.data) return null;

      const tweet = data.data;
      const content: ContentData = {
        sourceType: "TWITTER",
        sourceId: tweetId,
        sourceUrl: `https://twitter.com/i/status/${tweetId}`,
        text: tweet.text,
        publishedAt: new Date(tweet.created_at),
        forecasterId,
      };

      await this.storeContent(content);

      // Run prediction extraction for Twitter content
      if (content.text && content.forecasterId) {
        console.log(`[TwitterCollector] Running prediction extraction for tweet: ${tweetId}`);
        try {
          const { UnifiedExtractionService } = await import('./extraction');
          const extractionService = new UnifiedExtractionService();

          // Since extractFromContent doesn't support source info, we need to manually add predictions
          // Let's temporarily store them with source info directly
          const videoData = {
            videoId: `twitter_${tweetId}`,
            videoUrl: content.sourceUrl || `https://x.com/status/${tweetId}`,
            title: content.text.substring(0, 100),
            description: content.text,
            channelName: 'X Platform',
            publishedAt: content.publishedAt || new Date(),
            transcript: content.text,
            transcriptWithTimestamps: []
          };

          const result = await extractionService.extractFromVideo(videoData);

          if (result.predictions.length > 0) {
            await extractionService.storePredictions(
              result.predictions.map(p => ({
                prediction: p.prediction.text,
                confidence: p.prediction.confidence / 100,
                targetDate: p.prediction.targetDate ? new Date(p.prediction.targetDate) : null,
                targetPrice: p.prediction.targetPrice,
                assetSymbol: p.asset.symbol,
                assetType: p.asset.type,
                reasoning: p.context.reasoning,
                tags: p.context.technicalIndicators || [],
                aiDirection: p.prediction.direction?.toUpperCase() || 'NEUTRAL',
                sourceType: 'TWITTER',
                sourceUrl: content.sourceUrl
              })),
              content.forecasterId
            );
          }

          console.log(`[TwitterCollector] Extracted ${result.predictions.length} predictions from tweet ${tweetId}`);
        } catch (error) {
          console.error(`[TwitterCollector] Extraction failed for tweet ${tweetId}:`, error);
        }
      }

      return content;
    } catch (error) {
      console.error("Twitter collection failed:", error);
      return null;
    }
  }

  private async storeContent(data: ContentData): Promise<void> {
    await prisma.content.upsert({
      where: {
        sourceType_sourceId_forecasterId: {
          sourceType: data.sourceType,
          sourceId: data.sourceId,
          forecasterId: data.forecasterId || "",
        },
      },
      update: {
        data: {
          text: data.text,
          publishedAt: data.publishedAt?.toISOString(),
        },
        processedAt: new Date(),
      },
      create: {
        sourceType: data.sourceType,
        sourceId: data.sourceId,
        sourceUrl: data.sourceUrl,
        forecasterId: data.forecasterId,
        data: {
          text: data.text,
          publishedAt: data.publishedAt?.toISOString(),
        },
        status: "COLLECTED",
      },
    });
  }
}



export class ContentCollectionService {
  private youtubeCollector: YouTubeCollector;
  private twitterCollector: TwitterCollector;

  constructor() {
    this.youtubeCollector = new YouTubeCollector();
    this.twitterCollector = new TwitterCollector();
  }

  async collectContent(sourceUrl: string, forecasterId?: string): Promise<ContentData | null> {
    try {
      // Parse URL to determine source type
      const url = new URL(sourceUrl);

      // YouTube URL patterns
      if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
        const videoId = this.extractYouTubeVideoId(sourceUrl);
        if (videoId) {
          return await this.youtubeCollector.collectVideo(videoId, forecasterId);
        }
      }

      // X URL patterns
      if (url.hostname.includes('twitter.com') || url.hostname.includes('x.com')) {
        const tweetId = this.extractTwitterTweetId(sourceUrl);
        if (tweetId) {
          return await this.twitterCollector.collectTweet(tweetId, forecasterId);
        }
      }

      console.error(`Unsupported content source: ${sourceUrl}`);
      return null;
    } catch (error) {
      console.error(`Failed to collect content from ${sourceUrl}:`, error);
      return null;
    }
  }

  async processScheduledCollection(): Promise<void> {
    try {
      console.log("📥 Processing scheduled content collection...");

      // Get all active forecasters with collection schedules
      const forecasters = await prisma.forecaster.findMany({
        where: {
          isVerified: true
        },
        select: {
          id: true,
          name: true,
          profile: true
        }
      });

      for (const forecaster of forecasters) {
        console.log(`📊 Processing forecaster: ${forecaster.name}`);

        // Get all active channels for this forecaster
        const channels = await prisma.forecasterChannel.findMany({
          where: {
            forecasterId: forecaster.id,
            isActive: true
          }
        });

        // Collect from YouTube channels
        const youtubeChannels = channels.filter(ch => ch.channelType === 'YOUTUBE');
        for (const channel of youtubeChannels) {
          console.log(`📺 Collecting from YouTube channel: ${channel.channelName || channel.channelId}`);
          await this.collectYouTube(channel.channelId, forecaster.id);
        }

        // Collect from X channels
        const twitterChannels = channels.filter(ch => ch.channelType === 'TWITTER');
        for (const channel of twitterChannels) {
          console.log(`🐦 Collecting from X channel: ${channel.channelName || channel.channelId}`);
          const twitterData = { username: channel.channelId };
          await this.collectTwitter(twitterData, forecaster.id);
        }

        console.log(`✅ Completed collection for ${forecaster.name}: ${youtubeChannels.length} YouTube + ${twitterChannels.length} X channels`);
      }

      console.log("✅ Scheduled collection completed");
    } catch (error) {
      console.error("Failed to process scheduled collection:", error);
      throw error;
    }
  }

  async collectYouTube(channelData: any, forecasterId: string): Promise<void> {
    try {
      const channelId = channelData.channelId || channelData.id;
      if (!channelId) {
        console.error(`No YouTube channel ID for forecaster ${forecasterId}`);
        return;
      }

      // Get latest videos from channel
      const apiKey = env.GOOGLE_API_KEY;
      const baseUrl = "https://www.googleapis.com/youtube/v3";

      // Get channel's upload playlist
      const channelResponse = await fetch(
        `${baseUrl}/channels?part=contentDetails&id=${channelId}&key=${apiKey}`
      );
      const channelInfo = await channelResponse.json();

      if (!channelInfo.items?.[0]) {
        console.error(`Channel not found: ${channelId}`);
        return;
      }

      const uploadsPlaylistId = channelInfo.items[0].contentDetails.relatedPlaylists.uploads;

      // Get latest videos from uploads playlist (last 5)
      const videosResponse = await fetch(
        `${baseUrl}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=5&key=${apiKey}`
      );
      const videosData = await videosResponse.json();

      if (!videosData.items) {
        console.log(`No videos found for channel ${channelId}`);
        return;
      }

      // Collect each video
      for (const item of videosData.items) {
        const videoId = item.snippet.resourceId.videoId;

        // Check if already collected recently (within last 7 days)
        const existingContent = await prisma.content.findUnique({
          where: {
            sourceType_sourceId_forecasterId: {
              sourceType: "YOUTUBE",
              sourceId: videoId,
              forecasterId: forecasterId
            }
          }
        });

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        if (existingContent && existingContent.processedAt && existingContent.processedAt > sevenDaysAgo) {
          console.log(`Skipping recently collected video: ${videoId}`);
          continue;
        }

        await this.youtubeCollector.collectVideo(videoId, forecasterId);
        console.log(`✅ Collected YouTube video: ${videoId} for ${forecasterId}`);
      }
    } catch (error) {
      console.error(`Failed to collect YouTube content for forecaster ${forecasterId}:`, error);
    }
  }

  async collectTwitter(twitterData: any, forecasterId: string): Promise<void> {
    try {
      const username = twitterData.username || twitterData.handle;
      if (!username) {
        console.error(`No Twitter username for forecaster ${forecasterId}`);
        return;
      }

      // Get user's recent tweets
      const rapidApiKey = env.RAPIDAPI_KEY;
      const baseUrl = "https://twitter241.p.rapidapi.com/api/v2";

      // Get user info
      const userResponse = await fetch(
        `${baseUrl}/users/by/username/${username}`,
        {
          headers: {
            "X-RapidAPI-Key": rapidApiKey,
            "X-RapidAPI-Host": "twitter241.p.rapidapi.com",
          },
        }
      );

      const userData = await userResponse.json();
      if (!userData.data) {
        console.error(`Twitter user not found: ${username}`);
        return;
      }

      const userId = userData.data.id;

      // Get user's recent tweets (last 10)
      const tweetsResponse = await fetch(
        `${baseUrl}/users/${userId}/tweets?max_results=10`,
        {
          headers: {
            "X-RapidAPI-Key": rapidApiKey,
            "X-RapidAPI-Host": "twitter241.p.rapidapi.com",
          },
        }
      );

      const tweetsData = await tweetsResponse.json();
      if (!tweetsData.data) {
        console.log(`No tweets found for user ${username}`);
        return;
      }

      // Collect each tweet
      for (const tweet of tweetsData.data) {
        // Check if already collected recently (within last 7 days)
        const existingContent = await prisma.content.findUnique({
          where: {
            sourceType_sourceId_forecasterId: {
              sourceType: "TWITTER",
              sourceId: tweet.id,
              forecasterId: forecasterId
            }
          }
        });

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        if (existingContent && existingContent.processedAt && existingContent.processedAt > sevenDaysAgo) {
          console.log(`Skipping recently collected tweet: ${tweet.id}`);
          continue;
        }

        await this.twitterCollector.collectTweet(tweet.id, forecasterId);
        console.log(`✅ Collected X tweet: ${tweet.id} for ${forecasterId}`);
      }
    } catch (error) {
      console.error(`Failed to collect Twitter content for forecaster ${forecasterId}:`, error);
    }
  }

  // Utility methods
  private extractYouTubeVideoId(url: string): string | null {
    try {
      const urlObj = new URL(url);

      // youtube.com/watch?v=VIDEO_ID
      if (urlObj.hostname.includes('youtube.com')) {
        const videoId = urlObj.searchParams.get('v');
        if (videoId) return videoId;

        // youtube.com/embed/VIDEO_ID
        if (urlObj.pathname.includes('/embed/')) {
          const parts = urlObj.pathname.split('/');
          const embedIndex = parts.indexOf('embed');
          if (embedIndex !== -1 && embedIndex + 1 < parts.length) {
            return parts[embedIndex + 1] || null;
          }
        }
      }

      // youtu.be/VIDEO_ID
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
      }

      return null;
    } catch (error) {
      console.error('Failed to extract YouTube video ID:', error);
      return null;
    }
  }

  private extractTwitterTweetId(url: string): string | null {
    try {
      const urlObj = new URL(url);

      // twitter.com/username/status/TWEET_ID or x.com/username/status/TWEET_ID
      const match = urlObj.pathname.match(/\/status\/(\d+)/);
      return match ? match[1] || null : null;
    } catch (error) {
      console.error('Failed to extract Twitter tweet ID:', error);
      return null;
    }
  }

  // Batch collection methods
  async collectBatchYouTube(videoIds: string[], forecasterId?: string): Promise<ContentData[]> {
    const results: ContentData[] = [];

    for (const videoId of videoIds) {
      const content = await this.youtubeCollector.collectVideo(videoId, forecasterId);
      if (content) {
        results.push(content);
      }
    }

    return results;
  }

  async collectBatchTwitter(tweetIds: string[], forecasterId?: string): Promise<ContentData[]> {
    const results: ContentData[] = [];

    for (const tweetId of tweetIds) {
      const content = await this.twitterCollector.collectTweet(tweetId, forecasterId);
      if (content) {
        results.push(content);
      }
    }

    return results;
  }

  // Bulk extraction methods (called by admin.bulkExtraction)
  async collectFromYouTube(forecasterId: string): Promise<any[]> {
    try {
      console.log(`📺 Starting YouTube collection for forecaster: ${forecasterId}`);

      // Get forecaster
      const forecaster = await prisma.forecaster.findUnique({
        where: { id: forecasterId },
        select: { id: true, name: true }
      });

      if (!forecaster) {
        console.error(`Forecaster not found: ${forecasterId}`);
        return [];
      }

      // Get active YouTube channels for this forecaster
      const youtubeChannels = await prisma.forecasterChannel.findMany({
        where: {
          forecasterId,
          channelType: 'YOUTUBE',
          isActive: true
        }
      });

      if (youtubeChannels.length === 0) {
        console.log(`No active YouTube channels configured for forecaster: ${forecaster.name}`);
        return [];
      }

      // Collect content from all YouTube channels
      for (const channel of youtubeChannels) {
        console.log(`📺 Collecting from channel: ${channel.channelName || channel.channelId}`);
        await this.collectYouTube(channel.channelId, forecasterId);
      }

      // Process collected content through extraction pipeline
      const predictions = await this.processContentForExtraction(forecasterId, "YOUTUBE");

      console.log(`✅ YouTube collection complete for ${forecaster.name}: ${predictions.length} predictions from ${youtubeChannels.length} channels`);
      return predictions;

    } catch (error) {
      console.error(`Failed to collect from YouTube for forecaster ${forecasterId}:`, error);
      return [];
    }
  }

  async collectFromTwitter(forecasterId: string): Promise<any[]> {
    try {
      console.log(`🐦 Starting X collection for forecaster: ${forecasterId}`);

      // Get forecaster
      const forecaster = await prisma.forecaster.findUnique({
        where: { id: forecasterId },
        select: { id: true, name: true }
      });

      if (!forecaster) {
        console.error(`Forecaster not found: ${forecasterId}`);
        return [];
      }

      // Get active X channels for this forecaster
      const twitterChannels = await prisma.forecasterChannel.findMany({
        where: {
          forecasterId,
          channelType: 'TWITTER',
          isActive: true
        }
      });

      if (twitterChannels.length === 0) {
        console.log(`No active X channels configured for forecaster: ${forecaster.name}`);
        return [];
      }

      // Collect content from all X channels
      for (const channel of twitterChannels) {
        console.log(`🐦 Collecting from channel: ${channel.channelName || channel.channelId}`);
        const twitterData = { username: channel.channelId }; // channelId stores the X username
        await this.collectTwitter(twitterData, forecasterId);
      }

      // Process collected content through extraction pipeline
      const predictions = await this.processContentForExtraction(forecasterId, "TWITTER");

      console.log(`✅ X collection complete for ${forecaster.name}: ${predictions.length} predictions from ${twitterChannels.length} channels`);
      return predictions;

    } catch (error) {
      console.error(`Failed to collect from Twitter for forecaster ${forecasterId}:`, error);
      return [];
    }
  }

  // Process collected content through extraction pipeline
  private async processContentForExtraction(forecasterId: string, sourceType: "YOUTUBE" | "TWITTER"): Promise<any[]> {
    try {
      // PRIORITY 1: Resume content that's partially processed (failed mid-pipeline)
      const partiallyProcessedContent = await prisma.content.findMany({
        where: {
          forecasterId: forecasterId,
          sourceType: sourceType,
          status: {
            in: ['AUDIO_DOWNLOADED', 'TRANSCRIBING', 'TRANSCRIBED', 'EXTRACTING']
          }
        },
        orderBy: { createdAt: 'asc' }, // Process oldest first
        take: 5 // Process fewer at a time for partially processed content
      });

      // PRIORITY 2: Get newly collected content
      const newContent = await prisma.content.findMany({
        where: {
          forecasterId: forecasterId,
          sourceType: sourceType,
          status: 'COLLECTED'
        },
        orderBy: { createdAt: 'desc' },
        take: 10 // Process latest 10 items
      });

      // Combine with partially processed first
      const unprocessedContent = [...partiallyProcessedContent, ...newContent];

      if (unprocessedContent.length === 0) {
        console.log(`No unprocessed ${sourceType} content found for forecaster ${forecasterId}`);
        return [];
      }

      console.log(`📊 Processing queue for ${sourceType}:`);
      console.log(`  - ${partiallyProcessedContent.length} partially processed (resuming)`);
      console.log(`  - ${newContent.length} newly collected`);

      console.log(`🔄 Processing ${unprocessedContent.length} ${sourceType} content items for extraction...`);

      // Import extraction service
      const { UnifiedExtractionService } = await import('./extraction');
      const extractionService = new UnifiedExtractionService();

      const allPredictions: any[] = [];

      for (const content of unprocessedContent) {
        try {
          const contentData = content.data as any;
          console.log(`\n📝 Processing content ${content.id} (Status: ${content.status})`);

          // Handle based on current status
          if (content.status === 'AUDIO_DOWNLOADED') {
            // Resume from transcription step
            console.log(`  → Resuming from transcription (audio already downloaded)`);
            const { TranscriptionService } = await import('./transcription');
            const transcriptionService = new TranscriptionService();

            const metadata = content.processingMetadata as any;
            if (metadata?.audioPath) {
              const result = await transcriptionService.transcribeExistingAudio(
                metadata.audioPath,
                content.sourceId,
                `${forecasterId}_${content.sourceId}`
              );

              if (result?.transcript) {
                contentData.transcript = result.transcript;
                await prisma.content.update({
                  where: { id: content.id },
                  data: {
                    data: contentData,
                    status: 'TRANSCRIBED'
                  }
                });
              }
            }
          }

          // For TRANSCRIBED or newly transcribed content, proceed to extraction
          if (content.status === 'TRANSCRIBED' || contentData.transcript) {
            let textToExtract = '';
            if (sourceType === "YOUTUBE") {
              textToExtract = contentData.transcript || contentData.text || '';
            } else {
              textToExtract = contentData.text || '';
            }

            if (!textToExtract || textToExtract.length < 50) {
              console.log(`  → Skipping: insufficient text content (${textToExtract.length} chars)`);
              continue;
            }

            console.log(`  → Extracting predictions from ${textToExtract.length} characters`);
            await prisma.content.update({
              where: { id: content.id },
              data: { status: 'EXTRACTING' }
            });

            // Extract predictions using the legacy compatibility method
            const predictions = await extractionService.extractFromContent(
              textToExtract,
              sourceType,
              forecasterId
            );

            if (predictions.length > 0) {
              console.log(`  ✅ Extracted ${predictions.length} predictions`);
              allPredictions.push(...predictions);
            } else {
              console.log(`  ⚠️ No predictions found`);
            }

            // Update content status to processed
            await prisma.content.update({
              where: { id: content.id },
              data: {
                status: "PROCESSED",
                processedAt: new Date()
              }
            });
          }

          // For COLLECTED status, need full pipeline (handled by existing collection)
          if (content.status === 'COLLECTED' && sourceType === "YOUTUBE") {
            // This will be handled by the regular collection flow
            console.log(`  → Content needs full processing pipeline`);

            // For YouTube, we need to get transcript first
            const youtubeCollector = new YouTubeCollector();

            // This will trigger the full pipeline with resume support
            await youtubeCollector.collectVideo(content.sourceId, forecasterId);
          }

        } catch (extractionError) {
          console.error(`Failed to process content ${content.id}:`, extractionError);

          // Update metadata with error but don't mark as FAILED immediately
          // This allows retry on next run
          const metadata = content.processingMetadata as any || {};
          await prisma.content.update({
            where: { id: content.id },
            data: {
              processingMetadata: {
                ...metadata,
                lastError: extractionError instanceof Error ? extractionError.message : String(extractionError),
                lastErrorAt: new Date().toISOString(),
                retryCount: (metadata.retryCount || 0) + 1
              }
            }
          });

          // Only mark as FAILED after 3 retries
          if ((metadata.retryCount || 0) >= 3) {
            await prisma.content.update({
              where: { id: content.id },
              data: {
                status: "FAILED",
                processedAt: new Date()
              }
            });
          }
        }
      }

      return allPredictions;

    } catch (error) {
      console.error(`Failed to process content for extraction:`, error);
      return [];
    }
  }

  // Get collection statistics
  async getCollectionStats(): Promise<any> {
    const [totalContent, youtubeCount, twitterCount, recentContent] = await Promise.all([
      prisma.content.count(),
      prisma.content.count({ where: { sourceType: "YOUTUBE" } }),
      prisma.content.count({ where: { sourceType: "TWITTER" } }),
      prisma.content.count({
        where: {
          processedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ]);

    return {
      total: totalContent,
      bySource: {
        youtube: youtubeCount,
        twitter: twitterCount
      },
      recentlyCollected: recentContent
    };
  }
}
