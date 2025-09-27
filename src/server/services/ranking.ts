import { prisma } from "../db";
import { BrierScoreService } from "./brierScore";

interface RankingCriteria {
  accuracy: number;
  brierScore: number;
  totalPredictions: number;
  recentPerformance: number;
  consistency: number;
}

export class RankingService {
  constructor(private brierScoreService: BrierScoreService) {}

  async updateAll() {
    const forecasters = await prisma.forecaster.findMany({
      where: { isVerified: true },
    });

    const rankings = [];

    for (const forecaster of forecasters) {
      const score = await this.calculateScore(forecaster.id);
      rankings.push({
        forecasterId: forecaster.id,
        name: forecaster.name,
        score,
        ...score,
      });
    }

    // Sort by composite score
    rankings.sort((a, b) => b.score.composite - a.score.composite);

    // Update rankings in database
    for (let i = 0; i < rankings.length; i++) {
      const rank = i + 1;
      const ranking = rankings[i];
      if (!ranking) continue;

      await prisma.forecaster.update({
        where: { id: ranking.forecasterId },
        data: {
          metrics: {
            ...(await this.getMetrics(ranking.forecasterId)),
            rank,
            rankingScore: ranking.score.composite,
            lastRanked: new Date().toISOString(),
          },
        },
      });
    }

    return rankings;
  }

  private async calculateScore(forecasterId: string) {
    const metrics = await this.brierScoreService.getComprehensiveMetrics(forecasterId);

    // Get recent performance (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentPredictions = await prisma.prediction.findMany({
      where: {
        forecasterId,
        createdAt: { gte: thirtyDaysAgo },
        outcome: { not: "PENDING" },
      },
    });

    const recentCorrect = recentPredictions.filter(p => p.outcome === "CORRECT").length;
    const recentAccuracy = recentPredictions.length > 0
      ? recentCorrect / recentPredictions.length
      : 0;

    // Calculate consistency (standard deviation of monthly accuracy)
    const consistency = await this.calculateConsistency(forecasterId);

    // Composite scoring algorithm
    const weights = {
      accuracy: 0.3,
      brierScore: 0.25,
      volume: 0.15,
      recency: 0.2,
      consistency: 0.1,
    };

    // Normalize scores to 0-100 scale
    const normalizedAccuracy = metrics.accuracy * 100;
    const normalizedBrier = metrics.brierScore ? (1 - metrics.brierScore) * 100 : 50;
    const normalizedVolume = Math.min(metrics.total / 10, 100); // Cap at 1000 predictions
    const normalizedRecency = recentAccuracy * 100;
    const normalizedConsistency = consistency * 100;

    const composite =
      normalizedAccuracy * weights.accuracy +
      normalizedBrier * weights.brierScore +
      normalizedVolume * weights.volume +
      normalizedRecency * weights.recency +
      normalizedConsistency * weights.consistency;

    return {
      composite,
      accuracy: normalizedAccuracy,
      brierScore: normalizedBrier,
      volume: normalizedVolume,
      recency: normalizedRecency,
      consistency: normalizedConsistency,
      raw: metrics,
    };
  }

  private async calculateConsistency(forecasterId: string): Promise<number> {
    // Calculate monthly accuracy variance
    const predictions = await prisma.prediction.findMany({
      where: {
        forecasterId,
        outcome: { not: "PENDING" },
      },
      orderBy: { createdAt: "asc" },
    });

    if (predictions.length < 10) return 0.5; // Not enough data

    // Group by month
    const monthlyAccuracy: Record<string, { correct: number; total: number }> = {};

    for (const prediction of predictions) {
      const monthKey = `${prediction.createdAt.getFullYear()}-${prediction.createdAt.getMonth()}`;

      if (!monthlyAccuracy[monthKey]) {
        monthlyAccuracy[monthKey] = { correct: 0, total: 0 };
      }

      monthlyAccuracy[monthKey].total++;
      if (prediction.outcome === "CORRECT") {
        monthlyAccuracy[monthKey].correct++;
      }
    }

    // Calculate variance
    const accuracies = Object.values(monthlyAccuracy).map(m => m.correct / m.total);
    const mean = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
    const variance = accuracies.reduce((sum, acc) => sum + Math.pow(acc - mean, 2), 0) / accuracies.length;

    // Lower variance = higher consistency
    return Math.max(0, 1 - Math.sqrt(variance));
  }

  private async getMetrics(forecasterId: string) {
    const forecaster = await prisma.forecaster.findUnique({
      where: { id: forecasterId },
    });

    return (forecaster?.metrics as any) || {};
  }

  async getLeaderboard(limit = 10, category?: string) {
    const where: any = { isActive: true };

    if (category) {
      where.profile = {
        path: ["expertise"],
        array_contains: category,
      };
    }

    const forecasters = await prisma.forecaster.findMany({
      where,
      orderBy: {
        name: "asc",
      },
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        profile: true,
        metrics: true,
        isVerified: true,
      },
    });

    return forecasters.map((f, index) => ({
      rank: index + 1,
      id: f.id,
      name: f.name,
      slug: f.slug,
      avatar: (f.profile as any)?.avatar,
      isVerified: f.isVerified,
      metrics: f.metrics,
    }));
  }

  async getForecasterRank(forecasterId: string) {
    const forecaster = await prisma.forecaster.findUnique({
      where: { id: forecasterId },
      select: { metrics: true },
    });

    return (forecaster?.metrics as any)?.rank || null;
  }

  async getTrendingForecasters(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trending = await prisma.prediction.groupBy({
      by: ["forecasterId"],
      where: {
        createdAt: { gte: startDate },
        outcome: "CORRECT",
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    });

    const forecasterIds = trending.map(t => t.forecasterId);

    const forecasters = await prisma.forecaster.findMany({
      where: { id: { in: forecasterIds } },
      select: {
        id: true,
        name: true,
        slug: true,
        profile: true,
        metrics: true,
      },
    });

    return forecasters.map(f => ({
      ...f,
      recentCorrect: trending.find(t => t.forecasterId === f.id)?._count.id || 0,
    }));
  }
}