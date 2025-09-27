import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "../trpc";
import { TRPCError } from "@trpc/server";

export const userActionsRouter = createTRPCRouter({
  // Bookmark a prediction
  bookmarkPrediction: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: predictionId }) => {
      const prediction = await ctx.prisma.prediction.findUnique({
        where: { id: predictionId },
      });

      if (!prediction) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Prediction not found",
        });
      }

      await ctx.prisma.userAction.upsert({
        where: {
          userId_actionType_targetType_targetId: {
            userId: ctx.session.user.id,
            actionType: "BOOKMARK",
            targetType: "PREDICTION",
            targetId: predictionId,
          },
        },
        update: {},
        create: {
          userId: ctx.session.user.id,
          actionType: "BOOKMARK",
          targetType: "PREDICTION",
          targetId: predictionId,
        },
      });

      return { success: true, bookmarked: true };
    }),

  // Remove bookmark from prediction
  unbookmarkPrediction: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: predictionId }) => {
      await ctx.prisma.userAction
        .delete({
          where: {
            userId_actionType_targetType_targetId: {
              userId: ctx.session.user.id,
              actionType: "BOOKMARK",
              targetType: "PREDICTION",
              targetId: predictionId,
            },
          },
        })
        .catch(() => {
          // Ignore if doesn't exist
        });

      return { success: true, bookmarked: false };
    }),

  // Get bookmarked predictions
  getBookmarkedPredictions: protectedProcedure.query(async ({ ctx }) => {
    const bookmarks = await ctx.prisma.userAction.findMany({
      where: {
        userId: ctx.session.user.id,
        actionType: "BOOKMARK",
        targetType: "PREDICTION",
      },
    });

    const predictionIds = bookmarks.map((b) => b.targetId);

    const predictions = await ctx.prisma.prediction.findMany({
      where: { id: { in: predictionIds } },
      include: {
        forecaster: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        asset: {
          select: {
            id: true,
            symbol: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return predictions;
  }),

  // Like an article
  likeArticle: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: articleId }) => {
      const article = await ctx.prisma.article.findUnique({
        where: { id: articleId },
      });

      if (!article) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }

      const existing = await ctx.prisma.userAction.findFirst({
        where: {
          userId: ctx.session.user.id,
          actionType: "LIKE",
          targetType: "ARTICLE",
          targetId: articleId,
        },
      });

      if (!existing) {
        await ctx.prisma.userAction.create({
          data: {
            userId: ctx.session.user.id,
            actionType: "LIKE",
            targetType: "ARTICLE",
            targetId: articleId,
          },
        });

        // Increment like count
        await ctx.prisma.article.update({
          where: { id: articleId },
          data: { likeCount: { increment: 1 } },
        });
      }

      return { success: true, liked: true };
    }),

  // Unlike an article
  unlikeArticle: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: articleId }) => {
      const deleted = await ctx.prisma.userAction
        .delete({
          where: {
            userId_actionType_targetType_targetId: {
              userId: ctx.session.user.id,
              actionType: "LIKE",
              targetType: "ARTICLE",
              targetId: articleId,
            },
          },
        })
        .catch(() => null);

      if (deleted) {
        // Decrement like count
        await ctx.prisma.article.update({
          where: { id: articleId },
          data: { likeCount: { decrement: 1 } },
        });
      }

      return { success: true, liked: false };
    }),

  // Get liked articles
  getLikedArticles: protectedProcedure.query(async ({ ctx }) => {
    const likes = await ctx.prisma.userAction.findMany({
      where: {
        userId: ctx.session.user.id,
        actionType: "LIKE",
        targetType: "ARTICLE",
      },
    });

    const articleIds = likes.map((l) => l.targetId);

    const articles = await ctx.prisma.article.findMany({
      where: { id: { in: articleIds } },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return articles;
  }),

  // Bookmark an article
  bookmarkArticle: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: articleId }) => {
      const article = await ctx.prisma.article.findUnique({
        where: { id: articleId },
      });

      if (!article) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }

      await ctx.prisma.userAction.upsert({
        where: {
          userId_actionType_targetType_targetId: {
            userId: ctx.session.user.id,
            actionType: "BOOKMARK",
            targetType: "ARTICLE",
            targetId: articleId,
          },
        },
        update: {},
        create: {
          userId: ctx.session.user.id,
          actionType: "BOOKMARK",
          targetType: "ARTICLE",
          targetId: articleId,
        },
      });

      return { success: true, bookmarked: true };
    }),

  // Remove bookmark from article
  unbookmarkArticle: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: articleId }) => {
      await ctx.prisma.userAction
        .delete({
          where: {
            userId_actionType_targetType_targetId: {
              userId: ctx.session.user.id,
              actionType: "BOOKMARK",
              targetType: "ARTICLE",
              targetId: articleId,
            },
          },
        })
        .catch(() => {
          // Ignore if doesn't exist
        });

      return { success: true, bookmarked: false };
    }),

  // Get bookmarked articles
  getBookmarkedArticles: protectedProcedure.query(async ({ ctx }) => {
    const bookmarks = await ctx.prisma.userAction.findMany({
      where: {
        userId: ctx.session.user.id,
        actionType: "BOOKMARK",
        targetType: "ARTICLE",
      },
    });

    const articleIds = bookmarks.map((b) => b.targetId);

    const articles = await ctx.prisma.article.findMany({
      where: { id: { in: articleIds } },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return articles;
  }),

  // Subscribe to asset updates
  subscribeToAsset: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: assetId }) => {
      const asset = await ctx.prisma.asset.findUnique({
        where: { id: assetId },
      });

      if (!asset) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Asset not found",
        });
      }

      await ctx.prisma.userAction.upsert({
        where: {
          userId_actionType_targetType_targetId: {
            userId: ctx.session.user.id,
            actionType: "SUBSCRIBE",
            targetType: "ASSET",
            targetId: assetId,
          },
        },
        update: {},
        create: {
          userId: ctx.session.user.id,
          actionType: "SUBSCRIBE",
          targetType: "ASSET",
          targetId: assetId,
        },
      });

      return { success: true, subscribed: true };
    }),

  // Unsubscribe from asset
  unsubscribeFromAsset: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: assetId }) => {
      await ctx.prisma.userAction
        .delete({
          where: {
            userId_actionType_targetType_targetId: {
              userId: ctx.session.user.id,
              actionType: "SUBSCRIBE",
              targetType: "ASSET",
              targetId: assetId,
            },
          },
        })
        .catch(() => {
          // Ignore if doesn't exist
        });

      return { success: true, subscribed: false };
    }),

  // Get subscribed assets
  getSubscribedAssets: protectedProcedure.query(async ({ ctx }) => {
    const subscriptions = await ctx.prisma.userAction.findMany({
      where: {
        userId: ctx.session.user.id,
        actionType: "SUBSCRIBE",
        targetType: "ASSET",
      },
    });

    const assetIds = subscriptions.map((s) => s.targetId);

    const assets = await ctx.prisma.asset.findMany({
      where: { id: { in: assetIds } },
      orderBy: { symbol: "asc" },
    });

    return assets;
  }),

  // Get all user actions for current user
  getAllActions: protectedProcedure
    .input(
      z.object({
        actionType: z.enum(["BOOKMARK", "LIKE", "SUBSCRIBE", "FOLLOW"]).optional(),
        targetType: z.enum(["PREDICTION", "ARTICLE", "ASSET", "FORECASTER"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        userId: ctx.session.user.id,
      };

      if (input.actionType) where.actionType = input.actionType;
      if (input.targetType) where.targetType = input.targetType;

      const actions = await ctx.prisma.userAction.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });

      return actions;
    }),

  // Check if user has performed an action on a target
  checkAction: protectedProcedure
    .input(
      z.object({
        actionType: z.enum(["BOOKMARK", "LIKE", "SUBSCRIBE", "FOLLOW"]),
        targetType: z.enum(["PREDICTION", "ARTICLE", "ASSET", "FORECASTER"]),
        targetId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const action = await ctx.prisma.userAction.findFirst({
        where: {
          userId: ctx.session.user.id,
          actionType: input.actionType,
          targetType: input.targetType,
          targetId: input.targetId,
        },
      });

      return { hasAction: !!action };
    }),
});