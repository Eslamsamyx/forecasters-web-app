import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from "../trpc";
import { TRPCError } from "@trpc/server";

export const commentsRouter = createTRPCRouter({
  // Get comments for an article
  getByArticleId: publicProcedure
    .input(
      z.object({
        articleId: z.string(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { articleId, limit, offset } = input;

      const [comments, total] = await Promise.all([
        ctx.prisma.comment.findMany({
          where: {
            articleId,
            status: "PUBLISHED",
            parentId: null, // Only top-level comments
          },
          include: {
            author: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
            replies: {
              where: { status: "PUBLISHED" },
              include: {
                author: {
                  select: {
                    id: true,
                    fullName: true,
                    avatarUrl: true,
                  },
                },
              },
              orderBy: { createdAt: "asc" },
              take: 5, // Limit replies shown initially
            },
          },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        }),
        ctx.prisma.comment.count({
          where: {
            articleId,
            status: "PUBLISHED",
            parentId: null,
          },
        }),
      ]);

      return {
        comments,
        total,
        hasMore: offset + limit < total,
      };
    }),

  // Create a new comment
  create: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1).max(1000),
        articleId: z.string(),
        parentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { content, articleId, parentId } = input;

      // Verify article exists
      const article = await ctx.prisma.article.findUnique({
        where: { id: articleId },
      });

      if (!article) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }

      // If it's a reply, verify parent comment exists
      if (parentId) {
        const parentComment = await ctx.prisma.comment.findUnique({
          where: { id: parentId },
        });

        if (!parentComment || parentComment.articleId !== articleId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Parent comment not found",
          });
        }
      }

      // Create the comment
      const comment = await ctx.prisma.comment.create({
        data: {
          content,
          articleId,
          authorId: ctx.session.user.id,
          parentId,
        },
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Update reply count for parent comment if this is a reply
      if (parentId) {
        await ctx.prisma.comment.update({
          where: { id: parentId },
          data: { replyCount: { increment: 1 } },
        });
      }

      return comment;
    }),

  // Update a comment (only by author)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string().min(1).max(1000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, content } = input;

      const existingComment = await ctx.prisma.comment.findUnique({
        where: { id },
      });

      if (!existingComment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      // Only allow author or admin to update
      if (
        existingComment.authorId !== ctx.session.user.id &&
        ctx.session.user.role !== "ADMIN"
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own comments",
        });
      }

      const comment = await ctx.prisma.comment.update({
        where: { id },
        data: {
          content,
          isEdited: true,
        },
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      });

      return comment;
    }),

  // Delete a comment (only by author or admin)
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: id }) => {
      const comment = await ctx.prisma.comment.findUnique({
        where: { id },
      });

      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      // Only allow author or admin to delete
      if (
        comment.authorId !== ctx.session.user.id &&
        ctx.session.user.role !== "ADMIN"
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own comments",
        });
      }

      // Delete the comment and all its replies
      await ctx.prisma.comment.deleteMany({
        where: {
          OR: [
            { id },
            { parentId: id },
          ],
        },
      });

      // Update reply count for parent comment if this was a reply
      if (comment.parentId) {
        await ctx.prisma.comment.update({
          where: { id: comment.parentId },
          data: { replyCount: { decrement: 1 } },
        });
      }

      return { success: true };
    }),

  // Admin: Hide/unhide comment
  moderate: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["PUBLISHED", "HIDDEN", "PENDING"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, status } = input;

      const comment = await ctx.prisma.comment.update({
        where: { id },
        data: { status },
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      });

      return comment;
    }),

  // Get replies for a comment
  getReplies: publicProcedure
    .input(
      z.object({
        commentId: z.string(),
        limit: z.number().min(1).max(50).default(10),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { commentId, limit, offset } = input;

      const [replies, total] = await Promise.all([
        ctx.prisma.comment.findMany({
          where: {
            parentId: commentId,
            status: "PUBLISHED",
          },
          include: {
            author: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
          take: limit,
          skip: offset,
        }),
        ctx.prisma.comment.count({
          where: {
            parentId: commentId,
            status: "PUBLISHED",
          },
        }),
      ]);

      return {
        replies,
        total,
        hasMore: offset + limit < total,
      };
    }),
});