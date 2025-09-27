import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from "../trpc";
import { UnifiedExtractionService } from "../../services/extraction";
import { YouTubeCollector, TwitterCollector } from "../../services/collectors";

const extractionService = new UnifiedExtractionService();
const youtubeCollector = new YouTubeCollector();
const twitterCollector = new TwitterCollector();

export const predictionsRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const prediction = await ctx.prisma.prediction.findUnique({
        where: { id: input },
        include: {
          forecaster: {
            select: {
              id: true,
              name: true,
              slug: true,
              profile: true,
              metrics: true,
            },
          },
          asset: true,
        },
      });

      if (!prediction) {
        throw new Error("Prediction not found");
      }

      return prediction;
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        outcome: z.enum(["PENDING", "CORRECT", "INCORRECT", "PARTIALLY_CORRECT"]).optional(),
        forecasterId: z.string().optional(),
        assetId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, offset, outcome, forecasterId, assetId } = input;

      const where = {
        ...(outcome && { outcome }),
        ...(forecasterId && { forecasterId }),
        ...(assetId && { assetId }),
      };

      const [predictions, total] = await Promise.all([
        ctx.prisma.prediction.findMany({
          where,
          take: limit,
          skip: offset,
          include: {
            forecaster: {
              select: {
                id: true,
                name: true,
                slug: true,
                profile: true,
              },
            },
            asset: {
              select: {
                id: true,
                symbol: true,
                type: true,
                metadata: true,
                priceData: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
        ctx.prisma.prediction.count({ where }),
      ]);

      return {
        predictions,
        total,
        hasMore: offset + limit < total,
      };
    }),

  extractFromYouTube: adminProcedure
    .input(
      z.object({
        videoId: z.string(),
        forecasterId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { videoId, forecasterId } = input;

      // Collect video content
      const content = await youtubeCollector.collectVideo(videoId, forecasterId);
      if (!content) {
        throw new Error("Failed to collect YouTube video");
      }

      // Extract predictions
      const contentText = `${content.title}\n\n${content.text}\n\n${content.transcript || ""}`;
      const predictions = await extractionService.extractFromContent(
        contentText,
        "YOUTUBE",
        forecasterId
      );

      // Update content status
      await ctx.prisma.content.updateMany({
        where: {
          sourceType: "YOUTUBE",
          sourceId: videoId,
        },
        data: {
          status: "PROCESSED",
          processedAt: new Date(),
        },
      });

      return {
        success: true,
        predictionsCount: predictions.length,
        predictions,
      };
    }),

  extractFromTwitter: adminProcedure
    .input(
      z.object({
        tweetId: z.string(),
        forecasterId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { tweetId, forecasterId } = input;

      // Collect tweet
      const content = await twitterCollector.collectTweet(tweetId, forecasterId);
      if (!content) {
        throw new Error("Failed to collect tweet");
      }

      // Extract predictions
      const predictions = await extractionService.extractFromContent(
        content.text || "",
        "TWITTER",
        forecasterId
      );

      // Update content status
      await ctx.prisma.content.updateMany({
        where: {
          sourceType: "TWITTER",
          sourceId: tweetId,
        },
        data: {
          status: "PROCESSED",
          processedAt: new Date(),
        },
      });

      return {
        success: true,
        predictionsCount: predictions.length,
        predictions,
      };
    }),


  validatePrediction: adminProcedure
    .input(
      z.object({
        predictionId: z.string(),
        outcome: z.enum(["CORRECT", "INCORRECT", "PARTIALLY_CORRECT"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { predictionId, outcome } = input;

      const prediction = await ctx.prisma.prediction.update({
        where: { id: predictionId },
        data: {
          outcome,
          validatedAt: new Date(),
        },
        include: {
          forecaster: true,
        },
      });

      // Update forecaster metrics
      if (prediction.forecaster) {
        const allPredictions = await ctx.prisma.prediction.findMany({
          where: {
            forecasterId: prediction.forecasterId,
            validatedAt: { not: null },
          },
        });

        const totalValidated = allPredictions.length;
        const correctPredictions = allPredictions.filter(
          (p) => p.outcome === "CORRECT"
        ).length;

        const accuracy = totalValidated > 0 ? correctPredictions / totalValidated : 0;

        await ctx.prisma.forecaster.update({
          where: { id: prediction.forecasterId },
          data: {
            metrics: {
              accuracy,
              totalPredictions: totalValidated,
              correctPredictions,
              brierScore: null, // Calculate if needed
            },
          },
        });
      }

      return prediction;
    }),
});