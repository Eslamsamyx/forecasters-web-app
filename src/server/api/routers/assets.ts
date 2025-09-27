import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  adminProcedure,
} from "../trpc";
import { PriceTrackingService } from "../../services/priceTracking";
import { TRPCError } from "@trpc/server";

const priceTracker = new PriceTrackingService();

export const assetsRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        type: z.enum(["CRYPTO", "STOCK", "ETF", "COMMODITY"]).optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, offset, type, search } = input;

      const where: any = {};

      if (type) where.type = type;
      if (search) {
        where.OR = [
          { symbol: { contains: search, mode: "insensitive" } },
          { metadata: { path: ["name"], string_contains: search } },
        ];
      }

      const [assets, total] = await Promise.all([
        ctx.prisma.asset.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: {
            symbol: "asc",
          },
        }),
        ctx.prisma.asset.count({ where }),
      ]);

      return {
        assets,
        total,
        hasMore: offset + limit < total,
      };
    }),

  getById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const asset = await ctx.prisma.asset.findUnique({
        where: { id: input },
        include: {
          _count: {
            select: { predictions: true },
          },
        },
      });

      if (!asset) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Asset not found",
        });
      }

      return asset;
    }),

  getBySymbol: publicProcedure
    .input(
      z.object({
        symbol: z.string(),
        type: z.enum(["CRYPTO", "STOCK", "ETF", "COMMODITY"]),
      })
    )
    .query(async ({ ctx, input }) => {
      const asset = await ctx.prisma.asset.findUnique({
        where: {
          symbol_type: {
            symbol: input.symbol,
            type: input.type,
          },
        },
        include: {
          _count: {
            select: { predictions: true },
          },
        },
      });

      if (!asset) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Asset not found",
        });
      }

      return asset;
    }),

  getPriceHistory: publicProcedure
    .input(
      z.object({
        assetId: z.string(),
        hours: z.number().min(1).max(720).default(24),
      })
    )
    .query(async ({ ctx, input }) => {
      const { assetId, hours } = input;

      // Verify asset exists
      const asset = await ctx.prisma.asset.findUnique({
        where: { id: assetId },
      });

      if (!asset) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Asset not found",
        });
      }

      const history = await priceTracker.getPriceHistory(assetId, hours);

      return {
        asset,
        history,
      };
    }),

  create: adminProcedure
    .input(
      z.object({
        symbol: z.string().toUpperCase(),
        type: z.enum(["CRYPTO", "STOCK", "ETF", "COMMODITY"]),
        name: z.string().optional(),
        exchange: z.string().optional(),
        sector: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if asset already exists
      const existing = await ctx.prisma.asset.findFirst({
        where: {
          symbol: input.symbol,
          type: input.type,
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Asset already exists",
        });
      }

      const asset = await ctx.prisma.asset.create({
        data: {
          symbol: input.symbol,
          type: input.type,
          metadata: {
            name: input.name || null,
            exchange: input.exchange || null,
            sector: input.sector || null,
            marketCap: null,
          },
          priceData: {
            price: null,
            change24h: null,
            volume24h: null,
            updatedAt: null,
            source: null,
          },
        },
      });

      // Fetch initial price data
      await priceTracker.updateAssetPrices(input.type as "CRYPTO" | "STOCK");

      return asset;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        exchange: z.string().optional(),
        sector: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      const existing = await ctx.prisma.asset.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Asset not found",
        });
      }

      const currentMetadata = existing.metadata as any;

      const asset = await ctx.prisma.asset.update({
        where: { id },
        data: {
          metadata: {
            ...currentMetadata,
            ...(updates.name && { name: updates.name }),
            ...(updates.exchange && { exchange: updates.exchange }),
            ...(updates.sector && { sector: updates.sector }),
          },
        },
      });

      return asset;
    }),

  delete: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const asset = await ctx.prisma.asset.findUnique({
        where: { id: input },
      });

      if (!asset) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Asset not found",
        });
      }

      await ctx.prisma.asset.delete({
        where: { id: input },
      });

      return { success: true };
    }),

  updatePrices: adminProcedure
    .input(
      z.object({
        type: z.enum(["CRYPTO", "STOCK"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await priceTracker.updateAssetPrices(input.type);

      return { success: true };
    }),

  identifyAssetsInText: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const symbols = await priceTracker.identifyAssetsInText(input);

      const assets = await ctx.prisma.asset.findMany({
        where: {
          symbol: { in: symbols },
        },
      });

      return {
        identified: symbols,
        existing: assets,
      };
    }),
});