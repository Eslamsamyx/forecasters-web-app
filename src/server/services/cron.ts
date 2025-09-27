import { prisma } from "../db";
import { AssetService } from "./assets";
import { PredictionValidationService } from "./validation";
import { ContentCollectionService } from "./collectors";
import { ChannelCollectionService } from "./channelCollectionService";
import { BrierScoreService } from "./brierScore";
import { RankingService } from "./ranking";

interface CronJob {
  name: string;
  schedule: string; // cron expression
  handler: () => Promise<void>;
  enabled: boolean;
}

export class CronService {
  private jobs: CronJob[] = [];
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private assetService: AssetService,
    private validationService: PredictionValidationService,
    private collectionService: ContentCollectionService,
    private channelCollectionService: ChannelCollectionService,
    private brierScoreService: BrierScoreService,
    private rankingService: RankingService
  ) {
    this.initializeJobs();
  }

  private initializeJobs() {
    this.jobs = [
      {
        name: "updateAssetPrices",
        schedule: "*/5 * * * *", // Every 5 minutes
        handler: async () => await this.updateAssetPrices(),
        enabled: true,
      },
      {
        name: "validatePredictions",
        schedule: "*/15 * * * *", // Every 15 minutes
        handler: async () => await this.validatePredictions(),
        enabled: true,
      },
      {
        name: "collectChannelContent",
        schedule: "*/10 * * * *", // Every 10 minutes (more frequent for dynamic intervals)
        handler: async () => await this.collectChannelContent(),
        enabled: true,
      },
      {
        name: "calculateBrierScores",
        schedule: "0 0 * * *", // Daily at midnight
        handler: async () => await this.calculateBrierScores(),
        enabled: true,
      },
      {
        name: "updateRankings",
        schedule: "0 1 * * *", // Daily at 1 AM
        handler: async () => await this.updateRankings(),
        enabled: true,
      },
      {
        name: "cleanupOldJobs",
        schedule: "0 2 * * *", // Daily at 2 AM
        handler: async () => await this.cleanupOldJobs(),
        enabled: true,
      },
    ];
  }

  async start() {
    console.log("🚀 Starting Cron Service...");

    for (const job of this.jobs) {
      if (!job.enabled) continue;

      // Convert cron expression to milliseconds (simplified)
      const interval = this.cronToMs(job.schedule);

      const intervalId = setInterval(async () => {
        try {
          console.log(`⚡ Running job: ${job.name}`);
          await job.handler();

          // Log job execution
          await prisma.job.create({
            data: {
              type: job.name.toUpperCase(),
              status: "COMPLETED",
              payload: {},
              completedAt: new Date(),
            },
          });
        } catch (error) {
          console.error(`❌ Job failed: ${job.name}`, error);

          // Log job failure
          await prisma.job.create({
            data: {
              type: job.name.toUpperCase(),
              status: "FAILED",
              payload: { error: (error as Error).message },
            },
          });
        }
      }, interval);

      this.intervals.set(job.name, intervalId);
      console.log(`✅ Scheduled job: ${job.name} (${job.schedule})`);
    }
  }

  stop() {
    console.log("🛑 Stopping Cron Service...");
    for (const [name, intervalId] of this.intervals) {
      clearInterval(intervalId);
      console.log(`✅ Stopped job: ${name}`);
    }
    this.intervals.clear();
  }

  private cronToMs(cron: string): number {
    // Simplified cron to milliseconds conversion
    const parts = cron.split(" ");
    const minutes = parts[0];

    if (minutes && minutes.startsWith("*/")) {
      const interval = parseInt(minutes.substring(2));
      return interval * 60 * 1000;
    }

    // Default to hourly
    return 60 * 60 * 1000;
  }

  private async updateAssetPrices() {
    console.log("📊 Updating asset prices...");

    const assets = await prisma.asset.findMany();

    for (const asset of assets) {
      try {
        await this.assetService.updatePrice(asset.id);
      } catch (error) {
        console.error(`Failed to update ${asset.symbol}:`, error);
      }
    }
  }

  private async validatePredictions() {
    console.log("✅ Validating predictions...");

    const predictions = await prisma.prediction.findMany({
      where: {
        outcome: "PENDING",
        targetDate: { lte: new Date() },
      },
      include: { asset: true },
    });

    for (const prediction of predictions) {
      try {
        await this.validationService.validate(prediction.id);
      } catch (error) {
        console.error(`Failed to validate prediction ${prediction.id}:`, error);
      }
    }
  }

  /**
   * NEW: Channel-based content collection
   * Replaces the old profile-based collection system
   */
  private async collectChannelContent() {
    console.log("📥 Collecting content from channels...");

    try {
      await this.channelCollectionService.processScheduledCollection();
    } catch (error) {
      console.error("Failed to process channel collection:", error);

      // Fallback to legacy collection for backwards compatibility
      console.log("🔄 Falling back to legacy collection...");
      await this.collectContentLegacy();
    }
  }

  /**
   * LEGACY: Keep old collection method as fallback
   * TODO: Remove after migration is complete
   */
  private async collectContentLegacy() {
    console.log("📥 [LEGACY] Collecting content from profile sources...");

    const forecasters = await prisma.forecaster.findMany({
      where: { isVerified: true },
      take: 10, // Limit to prevent rate limiting
    });

    for (const forecaster of forecasters) {
      try {
        console.log(`📊 Processing forecaster: ${forecaster.name}`);

        // Get all active channels for this forecaster using new ForecasterChannel system
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
          await this.collectionService.collectYouTube(channel.channelId, forecaster.id);
        }

        // Collect from X channels
        const twitterChannels = channels.filter(ch => ch.channelType === 'TWITTER');
        for (const channel of twitterChannels) {
          console.log(`🐦 Collecting from X channel: ${channel.channelName || channel.channelId}`);
          const twitterData = { username: channel.channelId };
          await this.collectionService.collectTwitter(twitterData, forecaster.id);
        }

        console.log(`✅ Completed collection for ${forecaster.name}: ${youtubeChannels.length} YouTube + ${twitterChannels.length} X channels`);
      } catch (error) {
        console.error(`Failed to collect content for ${forecaster.name}:`, error);
      }
    }
  }

  private async calculateBrierScores() {
    console.log("📈 Calculating Brier scores...");

    const forecasters = await prisma.forecaster.findMany({
      where: { isVerified: true },
    });

    for (const forecaster of forecasters) {
      try {
        await this.brierScoreService.calculate(forecaster.id);
      } catch (error) {
        console.error(`Failed to calculate Brier score for ${forecaster.name}:`, error);
      }
    }
  }

  private async updateRankings() {
    console.log("🏆 Updating rankings...");

    await this.rankingService.updateAll();
  }

  private async cleanupOldJobs() {
    console.log("🧹 Cleaning up old jobs...");

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await prisma.job.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
        status: { in: ["COMPLETED", "FAILED"] },
      },
    });

    // Cleanup old events
    await prisma.event.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
      },
    });

    // Cleanup old channel collection jobs
    await prisma.channelCollectionJob.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
        status: { in: ["COMPLETED", "FAILED"] },
      },
    });
  }

  // Manual job execution
  async executeJob(jobName: string) {
    const job = this.jobs.find(j => j.name === jobName);
    if (!job) {
      throw new Error(`Job ${jobName} not found`);
    }

    console.log(`⚡ Manually executing job: ${jobName}`);
    await job.handler();
  }

  /**
   * NEW: Trigger immediate collection for a specific channel
   * Used after channel creation/update
   */
  async triggerChannelCollection(channelId: string) {
    console.log(`🚀 Triggering immediate collection for channel: ${channelId}`);

    try {
      const result = await this.channelCollectionService.collectFromChannelImmediate(channelId);

      // Log the collection job
      await prisma.job.create({
        data: {
          type: "CHANNEL_COLLECTION",
          status: result.success ? "COMPLETED" : "FAILED",
          payload: {
            channelId,
            itemsCollected: result.itemsCollected,
            itemsFiltered: result.itemsFiltered,
            error: result.error
          },
          completedAt: new Date(),
        },
      });

      return result;
    } catch (error) {
      console.error(`Failed to trigger collection for channel ${channelId}:`, error);

      // Log the failure
      await prisma.job.create({
        data: {
          type: "CHANNEL_COLLECTION",
          status: "FAILED",
          payload: {
            channelId,
            error: (error as Error).message
          },
        },
      });

      throw error;
    }
  }
}