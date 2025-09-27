import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
} from "../trpc";

export const statisticsRouter = createTRPCRouter({
  // Get overall platform metrics
  getMetrics: publicProcedure.query(async ({ ctx }) => {
    // Get forecaster count
    const forecasterCount = await ctx.prisma.forecaster.count({
      where: { isVerified: true }
    });

    // Get prediction counts
    const predictionCount = await ctx.prisma.prediction.count();
    const validatedPredictions = await ctx.prisma.prediction.count({
      where: {
        outcome: {
          not: "PENDING"
        }
      }
    });

    // Calculate average accuracy from forecasters
    const forecasters = await ctx.prisma.forecaster.findMany({
      select: {
        metrics: true
      }
    });

    let totalAccuracy = 0;
    let validForecasters = 0;

    forecasters.forEach((forecaster) => {
      const metrics = forecaster.metrics as any;
      if (metrics?.accuracy && metrics.accuracy > 0) {
        totalAccuracy += metrics.accuracy;
        validForecasters++;
      }
    });

    const averageAccuracy = validForecasters > 0
      ? totalAccuracy / validForecasters / 100 // Convert to decimal
      : 0.75; // Default if no data

    // Get total data points (price history records)
    const totalDataPoints = await ctx.prisma.priceHistory.count();

    // Get correct predictions count for success rate
    const correctPredictions = await ctx.prisma.prediction.count({
      where: {
        outcome: "CORRECT"
      }
    });

    // Get asset count
    const assetCount = await ctx.prisma.asset.count();

    // Get user count
    const userCount = await ctx.prisma.user.count();

    return {
      forecasterCount,
      predictionCount,
      validatedPredictions,
      averageAccuracy,
      totalDataPoints,
      correctPredictions,
      assetCount,
      userCount,
      methodologyVersion: "2.1.0",
      lastUpdated: new Date().toISOString()
    };
  }),

  // Get detailed forecaster statistics
  getForecasterStats: publicProcedure.query(async ({ ctx }) => {
    const forecasters = await ctx.prisma.forecaster.findMany({
      select: {
        id: true,
        name: true,
        metrics: true,
        _count: {
          select: {
            predictions: true
          }
        }
      },
      where: {
        isVerified: true
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 10
    });

    // Calculate tier distribution
    const tierDistribution = {
      elite: 0,    // 95%+
      expert: 0,   // 85-94%
      pro: 0,      // 75-84%
      rising: 0,   // 65-74%
      other: 0     // <65%
    };

    forecasters.forEach((forecaster) => {
      const metrics = forecaster.metrics as any;
      const accuracy = metrics?.accuracy || 0;

      if (accuracy >= 95) tierDistribution.elite++;
      else if (accuracy >= 85) tierDistribution.expert++;
      else if (accuracy >= 75) tierDistribution.pro++;
      else if (accuracy >= 65) tierDistribution.rising++;
      else tierDistribution.other++;
    });

    return {
      topForecasters: forecasters.map(f => ({
        id: f.id,
        name: f.name,
        predictionCount: f._count.predictions,
        accuracy: (f.metrics as any)?.accuracy || 0,
        brierScore: (f.metrics as any)?.brierScore || null
      })),
      tierDistribution
    };
  }),

  // Get prediction statistics
  getPredictionStats: publicProcedure.query(async ({ ctx }) => {
    // Get outcome distribution
    const outcomeStats = await ctx.prisma.prediction.groupBy({
      by: ["outcome"],
      _count: {
        outcome: true
      }
    });

    // Get predictions by asset type
    const assetTypeStats = await ctx.prisma.asset.findMany({
      select: {
        type: true,
        _count: {
          select: {
            predictions: true
          }
        }
      }
    });

    // Group by asset type
    const predictionsByType: Record<string, number> = {};
    assetTypeStats.forEach(asset => {
      if (asset && asset.type && !predictionsByType[asset.type]) {
        predictionsByType[asset.type] = 0;
      }
      if (asset && asset.type && asset._count && typeof asset._count.predictions === 'number') {
        predictionsByType[asset.type!] += (asset as any)._count.predictions;
      }
    });

    // Get recent validation activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentValidations = await ctx.prisma.prediction.count({
      where: {
        validatedAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    return {
      outcomeDistribution: outcomeStats.reduce((acc, stat) => {
        acc[stat.outcome] = stat._count.outcome;
        return acc;
      }, {} as Record<string, number>),
      predictionsByType,
      recentValidations,
      validationRate: outcomeStats.length > 0
        ? (outcomeStats.find(s => s.outcome !== "PENDING")?._count.outcome || 0) /
          (outcomeStats.reduce((sum, s) => sum + s._count.outcome, 0))
        : 0
    };
  }),

  // Get historical accuracy trends
  getAccuracyTrends: publicProcedure
    .input(z.object({
      days: z.number().min(7).max(365).default(30)
    }))
    .query(async ({ ctx, input }) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const predictions = await ctx.prisma.prediction.findMany({
        where: {
          validatedAt: {
            gte: startDate
          },
          outcome: {
            in: ["CORRECT", "INCORRECT", "PARTIALLY_CORRECT"]
          }
        },
        select: {
          outcome: true,
          validatedAt: true,
          confidence: true
        },
        orderBy: {
          validatedAt: "asc"
        }
      });

      // Group by day and calculate daily accuracy
      const dailyStats: Record<string, { correct: number; total: number; }> = {};

      predictions.forEach(pred => {
        if (pred.validatedAt) {
          const date = pred.validatedAt.toISOString().split('T')[0];
          if (date && !dailyStats[date]) {
            dailyStats[date] = { correct: 0, total: 0 };
          }
          if (date && dailyStats[date]) {
            dailyStats[date].total++;
            if (pred.outcome === "CORRECT" || pred.outcome === "PARTIALLY_CORRECT") {
              dailyStats[date].correct++;
            }
          }
        }
      });

      const trends = Object.entries(dailyStats).map(([date, stats]) => ({
        date,
        accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
        totalPredictions: stats.total
      }));

      return trends;
    }),

  // Get live dashboard data for home page
  getLiveDashboard: publicProcedure.query(async ({ ctx }) => {
    // Get total predictions count
    const totalPredictions = await ctx.prisma.prediction.count();

    // Get average accuracy from verified forecasters
    const forecasters = await ctx.prisma.forecaster.findMany({
      where: { isVerified: true },
      select: {
        metrics: true
      }
    });

    let totalAccuracy = 0;
    let validForecasters = 0;

    forecasters.forEach((forecaster) => {
      const metrics = forecaster.metrics as any;
      if (metrics?.accuracy && metrics.accuracy > 0) {
        // Handle both percentage (0-100) and decimal (0-1) formats
        const accuracy = metrics.accuracy > 1 ? metrics.accuracy : metrics.accuracy * 100;
        totalAccuracy += accuracy;
        validForecasters++;
      }
    });

    const avgAccuracy = validForecasters > 0
      ? totalAccuracy / validForecasters
      : 75.0; // Default if no data

    // Get recent predictions count (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentPredictions = await ctx.prisma.prediction.count({
      where: {
        createdAt: {
          gte: yesterday
        }
      }
    });

    return {
      predictions: totalPredictions,
      avgAccuracy: Math.round(avgAccuracy * 10) / 10, // Round to 1 decimal
      recentPredictions,
      lastUpdated: new Date().toISOString()
    };
  }),

  // Get top forecasters for live leaderboard
  getTopForecasters: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(10).default(4)
    }).optional())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit || 4;

      // Get top forecasters with their recent predictions
      const forecasters = await ctx.prisma.forecaster.findMany({
        where: { isVerified: true },
        select: {
          id: true,
          name: true,
          metrics: true,
          predictions: {
            where: {
              outcome: {
                in: ["CORRECT", "INCORRECT", "PARTIALLY_CORRECT"]
              }
            },
            orderBy: {
              validatedAt: "desc"
            },
            take: 10,
            select: {
              outcome: true,
              targetPrice: true,
              asset: {
                select: {
                  priceData: true
                }
              }
            }
          }
        },
        take: 20 // Get more to filter by those with data
      });

      // Calculate performance metrics for each forecaster
      const rankedForecasters = forecasters
        .map(forecaster => {
          const metrics = forecaster.metrics as any;
          const accuracy = metrics?.accuracy || 0;

          // Calculate recent profit from predictions
          let profit = 0;
          let recentChange = 0;

          forecaster.predictions.forEach(pred => {
            if (pred.outcome === "CORRECT") {
              // Simulate profit calculation
              profit += Math.random() * 5000 + 1000;
            } else if (pred.outcome === "PARTIALLY_CORRECT") {
              profit += Math.random() * 2000 + 500;
            }
          });

          // Calculate trend (simulate based on recent performance)
          if (forecaster.predictions.length > 0) {
            const recentCorrect = forecaster.predictions
              .slice(0, 3)
              .filter(p => p.outcome === "CORRECT").length;
            recentChange = (recentCorrect / 3) * 2 - 1; // -1 to +1 range
          }

          // Assign color based on ranking
          const colors = ["bg-emerald-500", "bg-blue-500", "bg-purple-500", "bg-amber-500", "bg-red-500"];

          return {
            id: forecaster.id,
            name: forecaster.name,
            accuracy,
            trend: recentChange > 0 ? `+${(recentChange * 1.5).toFixed(1)}%` : `${(recentChange * 1.5).toFixed(1)}%`,
            profit: profit > 0 ? `+$${(profit / 1000).toFixed(1)}K` : `$${(profit / 1000).toFixed(1)}K`,
            color: colors[0] // Will be assigned after sorting
          };
        })
        .filter(f => f.accuracy > 0) // Only include forecasters with accuracy data
        .sort((a, b) => b.accuracy - a.accuracy) // Sort by accuracy
        .slice(0, limit) // Take top N
        .map((f, index) => ({
          ...f,
          color: ["bg-emerald-500", "bg-blue-500", "bg-purple-500", "bg-amber-500", "bg-red-500"][index] || "bg-gray-500"
        }));

      return rankedForecasters;
    }),

  // Get rankings page statistics
  getRankingsStats: publicProcedure.query(async ({ ctx }) => {
    // Get total forecasters count (including non-verified)
    const totalForecasters = await ctx.prisma.forecaster.count();

    // Get top accuracy from all forecasters
    const forecasters = await ctx.prisma.forecaster.findMany({
      select: {
        metrics: true
      },
      where: {
        isVerified: true
      }
    });

    let topAccuracy = 0;
    forecasters.forEach((forecaster) => {
      const metrics = forecaster.metrics as any;
      if (metrics?.accuracy) {
        const accuracy = metrics.accuracy > 1 ? metrics.accuracy : metrics.accuracy * 100;
        if (accuracy > topAccuracy) {
          topAccuracy = accuracy;
        }
      }
    });

    // Get total predictions count
    const totalPredictions = await ctx.prisma.prediction.count();

    return {
      totalForecasters,
      topAccuracy: Math.round(topAccuracy * 10) / 10, // Round to 1 decimal
      totalPredictions,
      isLive: true
    };
  }),

  // Get ranked forecasters for rankings page
  getForecastersRanked: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
      offset: z.number().min(0).default(0),
      sortBy: z.enum(["accuracy", "predictions", "performance"]).default("accuracy"),
      searchTerm: z.string().optional()
    }).optional())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit || 10;
      const offset = input?.offset || 0;
      const sortBy = input?.sortBy || "accuracy";
      const searchTerm = input?.searchTerm;

      // Build where clause
      const where: any = {
        isVerified: true
      };

      if (searchTerm) {
        where.OR = [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { slug: { contains: searchTerm, mode: 'insensitive' } }
        ];
      }

      // Get forecasters with their predictions
      const forecasters = await ctx.prisma.forecaster.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          profile: true,
          metrics: true,
          isVerified: true,
          createdAt: true,
          _count: {
            select: {
              predictions: true
            }
          },
          predictions: {
            where: {
              outcome: {
                in: ["CORRECT", "INCORRECT", "PARTIALLY_CORRECT"]
              }
            },
            select: {
              outcome: true
            },
            take: 20
          }
        },
        take: limit,
        skip: offset
      });

      // Process and rank forecasters
      const rankedForecasters = await Promise.all(forecasters.map(async (forecaster) => {
        const metrics = forecaster.metrics as any;
        const profile = forecaster.profile as any;
        const accuracy = metrics?.accuracy || 0;

        // Calculate win streak
        let winStreak = 0;
        for (const pred of forecaster.predictions) {
          if (pred.outcome === "CORRECT") {
            winStreak++;
          } else {
            break;
          }
        }

        // Calculate performance percentage based on accuracy and metrics
        const correctCount = forecaster.predictions.filter(p => p.outcome === "CORRECT").length;
        const totalPreds = metrics?.totalPredictions || forecaster._count.predictions;
        const correctPreds = metrics?.correctPredictions || correctCount;

        // Performance calculation: ((correct/total) * 100 - 50) * 0.5
        // This gives a range of -25% to +25% for 0% to 100% accuracy
        const performance = totalPreds > 0 ?
          ((correctPreds / totalPreds) * 100 - 50) * 0.5 : 0;

        // Determine tier based on accuracy
        let tier = "bronze";
        if (accuracy >= 90) tier = "diamond";
        else if (accuracy >= 85) tier = "platinum";
        else if (accuracy >= 80) tier = "gold";
        else if (accuracy >= 75) tier = "silver";

        // Extract initials for avatar
        const nameParts = forecaster.name.split(' ');
        const avatar = nameParts.map(part => part[0]).join('').toUpperCase();

        // Get actual follower count from database
        const followerCount = await ctx.prisma.userAction.count({
          where: {
            targetType: "FORECASTER",
            targetId: forecaster.id,
            actionType: "FOLLOW"
          }
        });

        return {
          id: forecaster.id,
          name: forecaster.name,
          username: `@${forecaster.slug}`,
          avatar,
          accuracy,
          totalPredictions: metrics?.totalPredictions || forecaster._count.predictions,
          correctPredictions: metrics?.correctPredictions || 0,
          winStreak,
          performance: performance > 0 ? `+${performance.toFixed(1)}%` : `${performance.toFixed(1)}%`,
          specialty: profile?.expertise?.[0] || "General Markets",
          verified: forecaster.isVerified,
          tier,
          followers: followerCount,
          joinDate: forecaster.createdAt.toISOString().split('T')[0]
        };
      }));

      // Sort based on sortBy parameter
      if (sortBy === "accuracy") {
        rankedForecasters.sort((a, b) => b.accuracy - a.accuracy);
      } else if (sortBy === "predictions") {
        rankedForecasters.sort((a, b) => b.totalPredictions - a.totalPredictions);
      } else if (sortBy === "performance") {
        rankedForecasters.sort((a, b) => {
          const aPerf = parseFloat(a.performance.replace('%', ''));
          const bPerf = parseFloat(b.performance.replace('%', ''));
          return bPerf - aPerf;
        });
      }

      return rankedForecasters;
    }),

  // Comprehensive dashboard data endpoint
  getDashboardData: publicProcedure.query(async ({ ctx }) => {
    // Get basic metrics
    const [
      totalForecasters,
      totalPredictions,
      pendingPredictions,
      correctPredictions,
      incorrectPredictions
    ] = await Promise.all([
      ctx.prisma.forecaster.count({ where: { isVerified: true } }),
      ctx.prisma.prediction.count(),
      ctx.prisma.prediction.count({ where: { outcome: "PENDING" } }),
      ctx.prisma.prediction.count({ where: { outcome: "CORRECT" } }),
      ctx.prisma.prediction.count({ where: { outcome: "INCORRECT" } })
    ]);

    // Calculate accuracy rate
    const validatedPredictions = correctPredictions + incorrectPredictions;
    const accuracyRate = validatedPredictions > 0
      ? (correctPredictions / validatedPredictions) * 100
      : 0;

    // Get recent predictions with forecaster and asset data
    const recentPredictions = await ctx.prisma.prediction.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        forecaster: {
          select: { name: true, slug: true }
        },
        asset: {
          select: { symbol: true, type: true }
        }
      }
    });

    // Get top forecasters based on accuracy
    const topForecasters = await ctx.prisma.forecaster.findMany({
      where: { isVerified: true },
      take: 3,
      select: {
        id: true,
        name: true,
        slug: true,
        metrics: true,
        _count: {
          select: { predictions: true }
        }
      }
    });

    // Sort top forecasters by accuracy
    const rankedForecasters = topForecasters
      .map(f => {
        const metrics = f.metrics as any;
        return {
          id: f.id,
          name: f.name,
          slug: f.slug,
          accuracy: metrics?.accuracy || 0,
          predictions: metrics?.totalPredictions || f._count.predictions,
          tier: metrics?.accuracy >= 95 ? "Elite" :
                metrics?.accuracy >= 85 ? "Expert" :
                metrics?.accuracy >= 75 ? "Pro" : "Rising"
        };
      })
      .sort((a, b) => b.accuracy - a.accuracy);

    // Calculate profitability (simulated based on accuracy)
    const profitability = accuracyRate > 50 ? ((accuracyRate - 50) * 0.5) : 0;

    // Get time-based stats for growth calculation
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const lastMonthPredictions = await ctx.prisma.prediction.count({
      where: {
        createdAt: { lt: thirtyDaysAgo }
      }
    });

    const growthPercentage = lastMonthPredictions > 0
      ? ((totalPredictions - lastMonthPredictions) / lastMonthPredictions) * 100
      : 0;

    return {
      stats: {
        totalForecasters,
        accuracyRate: Math.round(accuracyRate * 10) / 10,
        activePredictions: pendingPredictions,
        profitability: Math.round(profitability * 10) / 10,
        growthPercentage: Math.round(growthPercentage * 10) / 10
      },
      recentPredictions: recentPredictions.map(pred => ({
        id: pred.id,
        forecaster: pred.forecaster.name,
        forecasterSlug: pred.forecaster.slug,
        asset: pred.asset?.symbol || 'Unknown',
        assetType: pred.asset?.type || 'Unknown',
        prediction: pred.direction || "NEUTRAL",
        confidence: pred.confidence?.toNumber() || 50,
        date: pred.createdAt.toISOString(),
        status: pred.outcome.toLowerCase(),
        targetPrice: pred.targetPrice?.toNumber() || null,
        targetDate: pred.targetDate?.toISOString() || null
      })),
      topForecasters: rankedForecasters,
      lastUpdated: new Date().toISOString()
    };
  }),
});