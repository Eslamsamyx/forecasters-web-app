import { api } from "@/utils/api";

export interface MarketSentimentData {
  marketContext: 'EXTREME_FEAR' | 'FEAR' | 'NEUTRAL' | 'GREED' | 'EXTREME_GREED';
  sentimentScore: number;
  classification: string;
  timestamp: Date;
  lastUpdated: Date;
  emoji: string;
  description: string;
  difficultyMultiplier: number;
  cacheInfo?: {
    isCached: boolean;
    lastFetch: Date | null;
    expiresAt: Date | null;
  };
}

export function useMarketSentiment() {
  return api.market.getSentiment.useQuery(undefined, {
    retry: 1,
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
    staleTime: 15 * 60 * 1000, // Consider data stale after 15 minutes
  });
}

export function useMarketSentimentFresh() {
  return api.market.getFreshSentiment.useQuery(undefined, {
    retry: 1,
    enabled: false, // Only fetch when manually triggered
  });
}

export function useMarketHealth() {
  return api.market.getHealth.useQuery(undefined, {
    retry: 1,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}