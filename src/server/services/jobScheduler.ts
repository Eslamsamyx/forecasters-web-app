import { prisma } from "../db";
import { PriceTrackingService } from "./priceTracking";
import { YouTubeCollector, TwitterCollector } from "./collectors";
import { UnifiedExtractionService } from "./extraction";

const priceTracker = new PriceTrackingService();
const youtubeCollector = new YouTubeCollector();
const twitterCollector = new TwitterCollector();
const extractionService = new UnifiedExtractionService();

export class JobScheduler {
  private isRunning = false;
  private intervalHandles: NodeJS.Timeout[] = [];

  // Start all scheduled jobs
  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Schedule price updates every 5 minutes
    this.intervalHandles.push(
      setInterval(() => this.updatePrices(), 5 * 60 * 1000)
    );

    // Schedule content collection every 30 minutes
    this.intervalHandles.push(
      setInterval(() => this.collectContent(), 30 * 60 * 1000)
    );

    // Schedule prediction validation every hour
    this.intervalHandles.push(
      setInterval(() => this.validatePredictions(), 60 * 60 * 1000)
    );

    // Schedule job cleanup daily
    this.intervalHandles.push(
      setInterval(() => this.cleanupJobs(), 24 * 60 * 60 * 1000)
    );

    console.log("Job scheduler started");

    // Run initial tasks
    this.updatePrices();
  }

  // Stop all scheduled jobs
  stop() {
    this.isRunning = false;
    this.intervalHandles.forEach(handle => clearInterval(handle));
    this.intervalHandles = [];
    console.log("Job scheduler stopped");
  }

  // Update asset prices
  private async updatePrices() {
    try {
      await this.createJob("UPDATE_PRICES", async () => {
        await priceTracker.updateAssetPrices("CRYPTO");
        await priceTracker.updateAssetPrices("STOCK");
      });
    } catch (error) {
      console.error("Price update failed:", error);
    }
  }

  // Collect content from scheduled sources
  private async collectContent() {
    try {
      await this.createJob("COLLECT_CONTENT", async () => {
        // Get pending content collection tasks
        const pendingContent = await prisma.content.findMany({
          where: {
            status: "PENDING",
          },
          take: 10,
        });

        for (const content of pendingContent) {
          if (content.sourceType === "YOUTUBE") {
            await youtubeCollector.collectVideo(
              content.sourceId,
              content.forecasterId || undefined
            );
          } else if (content.sourceType === "TWITTER") {
            await twitterCollector.collectTweet(
              content.sourceId,
              content.forecasterId || undefined
            );
          }

          // Extract predictions from collected content
          const contentData = content.data as any;
          const contentText = `${contentData.title || ""}\n${contentData.text || ""}\n${contentData.transcript || ""}`;

          if (contentText.trim()) {
            await extractionService.extractFromContent(
              contentText,
              content.sourceType as "YOUTUBE" | "TWITTER",
              content.forecasterId || undefined
            );
          }

          // Mark as processed
          await prisma.content.update({
            where: { id: content.id },
            data: {
              status: "PROCESSED",
              processedAt: new Date(),
            },
          });
        }
      });
    } catch (error) {
      console.error("Content collection failed:", error);
    }
  }

  // Validate predictions that have reached their target date
  private async validatePredictions() {
    try {
      await this.createJob("VALIDATE_PREDICTIONS", async () => {
        const now = new Date();

        // Get predictions that need validation
        const predictionsToValidate = await prisma.prediction.findMany({
          where: {
            outcome: "PENDING",
            targetDate: {
              lte: now,
            },
            validatedAt: null,
          },
          include: {
            asset: true,
          },
        });

        for (const prediction of predictionsToValidate) {
          // Auto-validate based on price if asset exists
          if (prediction.asset && prediction.targetPrice) {
            const currentPrice = (prediction.asset.priceData as any)?.price;

            if (currentPrice) {
              const targetPrice = prediction.targetPrice.toNumber();
              const tolerance = targetPrice * 0.05; // 5% tolerance

              let outcome: string;
              if (Math.abs(currentPrice - targetPrice) <= tolerance) {
                outcome = "CORRECT";
              } else if (Math.abs(currentPrice - targetPrice) <= tolerance * 2) {
                outcome = "PARTIALLY_CORRECT";
              } else {
                outcome = "INCORRECT";
              }

              await prisma.prediction.update({
                where: { id: prediction.id },
                data: {
                  outcome,
                  validatedAt: new Date(),
                },
              });

              // Update forecaster metrics
              await this.updateForecasterMetrics(prediction.forecasterId);
            }
          }
        }
      });
    } catch (error) {
      console.error("Prediction validation failed:", error);
    }
  }

  // Update forecaster metrics after validation
  private async updateForecasterMetrics(forecasterId: string) {
    const predictions = await prisma.prediction.findMany({
      where: {
        forecasterId,
        validatedAt: { not: null },
      },
    });

    const totalValidated = predictions.length;
    const correctPredictions = predictions.filter(
      p => p.outcome === "CORRECT"
    ).length;

    const accuracy = totalValidated > 0 ? correctPredictions / totalValidated : 0;

    await prisma.forecaster.update({
      where: { id: forecasterId },
      data: {
        metrics: {
          accuracy,
          totalPredictions: totalValidated,
          correctPredictions,
          brierScore: null,
        },
      },
    });
  }

  // Clean up old completed jobs
  private async cleanupJobs() {
    try {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

      await prisma.job.deleteMany({
        where: {
          status: "COMPLETED",
          completedAt: {
            lt: threeDaysAgo,
          },
        },
      });

      // Clean up failed jobs older than 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      await prisma.job.deleteMany({
        where: {
          status: "FAILED",
          createdAt: {
            lt: sevenDaysAgo,
          },
        },
      });
    } catch (error) {
      console.error("Job cleanup failed:", error);
    }
  }

  // Create and execute a job
  private async createJob(type: string, handler: () => Promise<void>) {
    const job = await prisma.job.create({
      data: {
        type,
        status: "PROCESSING",
        startedAt: new Date(),
      },
    });

    try {
      await handler();

      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });
    } catch (error) {
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: "FAILED",
          error: error instanceof Error ? error.message : String(error),
          completedAt: new Date(),
        },
      });
      throw error;
    }
  }

  // Process a single job by ID (for manual execution)
  async processJob(jobId: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new Error("Job not found");
    }

    switch (job.type) {
      case "UPDATE_PRICES":
        await this.updatePrices();
        break;
      case "COLLECT_CONTENT":
        await this.collectContent();
        break;
      case "VALIDATE_PREDICTIONS":
        await this.validatePredictions();
        break;
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }
  }
}

// Export singleton instance
export const jobScheduler = new JobScheduler();