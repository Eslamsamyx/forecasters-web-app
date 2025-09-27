import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { marketSentimentService, MARKET_CONTEXT } from "@/server/services/marketSentiment";

export const marketRouter = createTRPCRouter({
  /**
   * Get current market sentiment from Fear & Greed Index
   */
  getSentiment: publicProcedure.query(async () => {
    try {
      const sentimentData = await marketSentimentService.getCurrentMarketContext();

      return {
        marketContext: sentimentData.marketContext,
        sentimentScore: sentimentData.sentimentScore,
        classification: sentimentData.classification,
        timestamp: sentimentData.timestamp,
        lastUpdated: sentimentData.lastUpdated,
        emoji: marketSentimentService.getMarketContextEmoji(sentimentData.marketContext),
        description: marketSentimentService.getMarketContextDescription(sentimentData.marketContext),
        difficultyMultiplier: marketSentimentService.getDifficultyMultiplier(sentimentData.marketContext),
        cacheInfo: marketSentimentService.getCacheInfo()
      };
    } catch (error) {
      console.error('❌ [MarketRouter] Failed to fetch market sentiment:', error);

      // Return fallback neutral sentiment
      return {
        marketContext: MARKET_CONTEXT.NEUTRAL,
        sentimentScore: 50,
        classification: 'Neutral (Error)',
        timestamp: new Date(),
        lastUpdated: new Date(),
        emoji: '⚪',
        description: 'Market sentiment unavailable',
        difficultyMultiplier: 1.0,
        cacheInfo: { isCached: false, lastFetch: null, expiresAt: null }
      };
    }
  }),

  /**
   * Get fresh market sentiment (bypasses cache)
   */
  getFreshSentiment: publicProcedure.query(async () => {
    try {
      const sentimentData = await marketSentimentService.fetchFreshMarketContext();

      return {
        marketContext: sentimentData.marketContext,
        sentimentScore: sentimentData.sentimentScore,
        classification: sentimentData.classification,
        timestamp: sentimentData.timestamp,
        lastUpdated: sentimentData.lastUpdated,
        emoji: marketSentimentService.getMarketContextEmoji(sentimentData.marketContext),
        description: marketSentimentService.getMarketContextDescription(sentimentData.marketContext),
        difficultyMultiplier: marketSentimentService.getDifficultyMultiplier(sentimentData.marketContext),
        fresh: true
      };
    } catch (error) {
      console.error('❌ [MarketRouter] Failed to fetch fresh market sentiment:', error);
      throw new Error('Failed to fetch fresh market sentiment data');
    }
  }),

  /**
   * Get market health status
   */
  getHealth: publicProcedure.query(async () => {
    try {
      const cacheInfo = marketSentimentService.getCacheInfo();

      return {
        status: 'operational',
        services: {
          fearGreedIndex: {
            status: 'operational',
            apiUrl: 'https://api.alternative.me/fng/',
            cache: cacheInfo
          }
        },
        lastCheck: new Date(),
        uptime: process.uptime()
      };
    } catch (error) {
      console.error('❌ [MarketRouter] Health check failed:', error);
      throw new Error('Market services health check failed');
    }
  })
});

export type MarketRouter = typeof marketRouter;