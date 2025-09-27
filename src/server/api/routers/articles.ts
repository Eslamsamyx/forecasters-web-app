import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from "../trpc";
import { TRPCError } from "@trpc/server";

export const articlesRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
        featured: z.boolean().optional(),
        premium: z.boolean().optional(),
        categoryId: z.string().optional(),
        authorId: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, offset, status, featured, premium, categoryId, authorId, search } = input;

      const where: any = {};

      // Only show published articles to non-admin users
      if (!ctx.session?.user || ctx.session.user.role !== "ADMIN") {
        where.status = "PUBLISHED";
      } else if (status) {
        where.status = status;
      }

      if (featured !== undefined) where.featured = featured;
      if (premium !== undefined) where.isPremium = premium;
      if (categoryId) where.categoryId = categoryId;
      if (authorId) where.authorId = authorId;

      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { excerpt: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ];
      }

      const [articles, total] = await Promise.all([
        ctx.prisma.article.findMany({
          where,
          take: limit,
          skip: offset,
          include: {
            author: {
              select: {
                id: true,
                email: true,
                fullName: true,
                avatarUrl: true,
              },
            },
            category: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
        ctx.prisma.article.count({ where }),
      ]);

      return {
        articles,
        total,
        hasMore: offset + limit < total,
      };
    }),

  getBySlug: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const article = await ctx.prisma.article.findUnique({
        where: { slug: input },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              fullName: true,
              avatarUrl: true,
              bio: true,
            },
          },
          category: true,
        },
      });

      if (!article) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }

      // Only allow non-admin users to see published articles
      if (
        article.status !== "PUBLISHED" &&
        (!ctx.session?.user || ctx.session.user.role !== "ADMIN")
      ) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }

      // Increment view count for published articles
      if (article.status === "PUBLISHED") {
        await ctx.prisma.article.update({
          where: { id: article.id },
          data: { viewCount: { increment: 1 } },
        });
      }

      return article;
    }),

  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        excerpt: z.string().optional(),
        featuredImage: z.string().url().optional(),
        status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
        featured: z.boolean().default(false),
        isPremium: z.boolean().default(false),
        tags: z.array(z.string()).default([]),
        categoryId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generate slug from title
      const baseSlug = input.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();

      // Check if slug exists and make unique if needed
      const existingSlug = await ctx.prisma.article.findFirst({
        where: { slug: baseSlug },
      });

      const slug = existingSlug ? `${baseSlug}-${Date.now()}` : baseSlug;

      const article = await ctx.prisma.article.create({
        data: {
          ...input,
          slug,
          authorId: ctx.session.user.id,
          publishDate: input.status === "PUBLISHED" ? new Date() : null,
        },
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
      });

      return article;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
        excerpt: z.string().optional(),
        featuredImage: z.string().url().optional().nullable(),
        status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
        featured: z.boolean().optional(),
        isPremium: z.boolean().optional(),
        tags: z.array(z.string()).optional(),
        categoryId: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existingArticle = await ctx.prisma.article.findUnique({
        where: { id },
      });

      if (!existingArticle) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }

      // Update publish date if changing to published
      const updateData: any = { ...data };
      if (
        data.status === "PUBLISHED" &&
        existingArticle.status !== "PUBLISHED"
      ) {
        updateData.publishDate = new Date();
      }

      const article = await ctx.prisma.article.update({
        where: { id },
        data: updateData,
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
      });

      return article;
    }),

  delete: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const article = await ctx.prisma.article.findUnique({
        where: { id: input },
      });

      if (!article) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }

      await ctx.prisma.article.delete({
        where: { id: input },
      });

      return { success: true };
    }),

  // Category management
  getCategories: publicProcedure.query(async ({ ctx }) => {
    const categories = await ctx.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    return categories;
  }),

  createCategory: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
        sortOrder: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const slug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();

      const category = await ctx.prisma.category.create({
        data: {
          ...input,
          slug,
        },
      });

      return category;
    }),
});