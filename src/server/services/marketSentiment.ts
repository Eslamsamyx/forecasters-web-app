/**
 * Market Sentiment Service
 * Integrates with free Fear & Greed Index API to determine market context
 * Uses alternative.me API - no authentication required
 */

import axios from 'axios';

interface FearGreedResponse {
  data: [{
    value: number;
    value_classification: string;
    timestamp: number;
  }];
}

export interface MarketSentimentData {
  marketContext: MarketContext;
  sentimentScore: number;
  classification: string;
  timestamp: Date;
  lastUpdated: Date;
}

export const MARKET_CONTEXT = {
  EXTREME_FEAR: 'EXTREME_FEAR',
  FEAR: 'FEAR',
  NEUTRAL: 'NEUTRAL',
  GREED: 'GREED',
  EXTREME_GREED: 'EXTREME_GREED'
} as const;

export type MarketContext = typeof MARKET_CONTEXT[keyof typeof MARKET_CONTEXT];

class MarketSentimentService {
  private readonly API_URL = 'https://api.alternative.me/fng/';
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

  private cachedData: MarketSentimentData | null = null;
  private lastFetch: Date | null = null;

  /**
   * Get current market sentiment from Fear & Greed Index
   */
  async getCurrentMarketContext(): Promise<MarketSentimentData> {
    // Check if cached data is still valid
    if (this.cachedData && this.lastFetch &&
        (Date.now() - this.lastFetch.getTime()) < this.CACHE_DURATION) {
      console.log('🔍 [MarketSentiment] Using cached market context:', this.cachedData.marketContext);
      return this.cachedData;
    }

    try {
      console.log('🔍 [MarketSentiment] Fetching Fear & Greed Index from API...');
      const response = await axios.get<FearGreedResponse>(this.API_URL, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Prediction-Prism-Analytics/1.0'
        }
      });

      if (!response.data?.data?.[0]) {
        throw new Error('Invalid API response format');
      }

      const fngData = response.data.data[0];
      const marketContext = this.mapScoreToMarketContext(fngData.value);

      this.cachedData = {
        marketContext,
        sentimentScore: fngData.value,
        classification: fngData.value_classification,
        timestamp: new Date(fngData.timestamp * 1000),
        lastUpdated: new Date()
      };

      this.lastFetch = new Date();

      console.log('✅ [MarketSentiment] Updated market context:', {
        context: marketContext,
        score: fngData.value,
        classification: fngData.value_classification
      });

      return this.cachedData;

    } catch (error) {
      console.error('❌ [MarketSentiment] Failed to fetch Fear & Greed Index:', error);

      // Return cached data if available, otherwise default to NEUTRAL
      if (this.cachedData) {
        console.log('⚠️ [MarketSentiment] Using stale cached data due to API error');
        return this.cachedData;
      }

      // Fallback to neutral sentiment
      const fallbackData: MarketSentimentData = {
        marketContext: MARKET_CONTEXT.NEUTRAL,
        sentimentScore: 50,
        classification: 'Neutral (API Error)',
        timestamp: new Date(),
        lastUpdated: new Date()
      };

      console.log('🔄 [MarketSentiment] Using fallback neutral sentiment');
      return fallbackData;
    }
  }

  /**
   * Map Fear & Greed Index score (0-100) to MarketContext enum
   * 0-24: Extreme Fear
   * 25-44: Fear
   * 45-54: Neutral
   * 55-74: Greed
   * 75-100: Extreme Greed
   */
  private mapScoreToMarketContext(score: number): MarketContext {
    if (score <= 24) return MARKET_CONTEXT.EXTREME_FEAR;
    if (score <= 44) return MARKET_CONTEXT.FEAR;
    if (score <= 54) return MARKET_CONTEXT.NEUTRAL;
    if (score <= 74) return MARKET_CONTEXT.GREED;
    return MARKET_CONTEXT.EXTREME_GREED;
  }

  /**
   * Get market context without caching (for testing)
   */
  async fetchFreshMarketContext(): Promise<MarketSentimentData> {
    this.cachedData = null;
    this.lastFetch = null;
    return this.getCurrentMarketContext();
  }

  /**
   * Get cached data information
   */
  getCacheInfo(): { isCached: boolean; lastFetch: Date | null; expiresAt: Date | null } {
    return {
      isCached: this.cachedData !== null,
      lastFetch: this.lastFetch,
      expiresAt: this.lastFetch ? new Date(this.lastFetch.getTime() + this.CACHE_DURATION) : null
    };
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.cachedData = null;
    this.lastFetch = null;
    console.log('🗑️ [MarketSentiment] Cache cleared');
  }

  /**
   * Get difficulty multiplier based on market context
   * Extreme fear/greed = more difficult to predict due to extreme emotions
   */
  getDifficultyMultiplier(marketContext: MarketContext): number {
    const multipliers = {
      [MARKET_CONTEXT.EXTREME_FEAR]: 1.4,  // Very difficult - panic conditions
      [MARKET_CONTEXT.FEAR]: 1.2,         // Moderately difficult - fear-driven
      [MARKET_CONTEXT.NEUTRAL]: 1.0,      // Baseline difficulty
      [MARKET_CONTEXT.GREED]: 1.3,        // Difficult - euphoria can be unpredictable
      [MARKET_CONTEXT.EXTREME_GREED]: 1.5  // Very difficult - bubble conditions
    };

    return multipliers[marketContext];
  }

  /**
   * Get market context emoji for display
   */
  getMarketContextEmoji(marketContext: MarketContext): string {
    const emojis = {
      [MARKET_CONTEXT.EXTREME_FEAR]: '🔴',
      [MARKET_CONTEXT.FEAR]: '🟡',
      [MARKET_CONTEXT.NEUTRAL]: '⚪',
      [MARKET_CONTEXT.GREED]: '🟢',
      [MARKET_CONTEXT.EXTREME_GREED]: '🟢'
    };

    return emojis[marketContext];
  }

  /**
   * Get human-readable market context description
   */
  getMarketContextDescription(marketContext: MarketContext): string {
    const descriptions = {
      [MARKET_CONTEXT.EXTREME_FEAR]: 'Extreme Fear - Market panic, oversold conditions',
      [MARKET_CONTEXT.FEAR]: 'Fear - Caution dominates, selling pressure',
      [MARKET_CONTEXT.NEUTRAL]: 'Neutral - Balanced market sentiment',
      [MARKET_CONTEXT.GREED]: 'Greed - Optimism prevails, buying pressure',
      [MARKET_CONTEXT.EXTREME_GREED]: 'Extreme Greed - Market euphoria, overbought conditions'
    };

    return descriptions[marketContext];
  }
}

// Export singleton instance
export const marketSentimentService = new MarketSentimentService();