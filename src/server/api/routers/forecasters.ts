import { createTRPCRouter, adminProcedure, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { cronService } from "@/server/services";

export const forecastersRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
        searchTerm: z.string().optional(),
        sort: z.enum(["name", "accuracy", "totalPredictions", "created"]).default("accuracy"),
        order: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, searchTerm, sort, order } = input;

      // Build where clause
      const where: any = { isVerified: true };

      if (searchTerm) {
        where.OR = [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { slug: { contains: searchTerm, mode: "insensitive" } },
        ];
      }

      // Map sort fields to actual database paths
      const sortMapping = {
        name: "name",
        accuracy: "metrics",
        totalPredictions: "metrics",
        created: "createdAt",
      };

      const actualSort = sortMapping[sort];

      // For JSON fields (metrics), we need special handling
      let orderBy: any;
      if (sort === "accuracy" || sort === "totalPredictions") {
        // For JSON sorting, we need to use raw queries or handle it differently
        // For now, let's use createdAt as fallback
        orderBy = { createdAt: order };
      } else {
        orderBy = { [actualSort]: order };
      }

      const forecasters = await ctx.prisma.forecaster.findMany({
        take: limit + 1, // Take one extra to determine if there are more
        cursor: cursor ? { id: cursor } : undefined,
        where,
        orderBy,
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
              predictions: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (forecasters.length > limit) {
        const nextItem = forecasters.pop(); // Remove the extra item
        nextCursor = nextItem!.id;
      }

      return {
        forecasters,
        nextCursor,
      };
    }),

  getBySlug: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input: slug }) => {
      const forecaster = await ctx.prisma.forecaster.findUnique({
        where: { slug },
        include: {
          predictions: {
            take: 20,
            orderBy: { createdAt: "desc" },
            include: {
              asset: true,
            },
          },
          _count: {
            select: {
              predictions: true,
              content: true,
            },
          },
        },
      });

      if (!forecaster) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Forecaster not found",
        });
      }

      return forecaster;
    }),

  getById: adminProcedure
    .input(z.string())
    .query(async ({ ctx, input: id }) => {
      const forecaster = await ctx.prisma.forecaster.findUnique({
        where: { id },
        include: {
          predictions: {
            take: 10,
            orderBy: { createdAt: "desc" },
            include: {
              asset: true,
            },
          },
          content: {
            take: 10,
            orderBy: { processedAt: "desc" },
          },
          channels: {
            include: {
              keywords: true,
              _count: {
                select: {
                  collectionJobs: true,
                },
              },
            },
          },
          _count: {
            select: {
              predictions: true,
              content: true,
            },
          },
        },
      });

      if (!forecaster) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Forecaster not found",
        });
      }

      return forecaster;
    }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        bio: z.string().optional(),
        avatar: z.string().url().optional(),
        website: z.string().url().optional(),
        twitter: z.string().optional(),
        expertise: z.array(z.string()).default([]),
        isVerified: z.boolean().default(false),
        channels: z.array(z.object({
          url: z.string(),
          isPrimary: z.boolean().default(false),
          keywords: z.array(z.string()).default([]),
        })).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const slug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();

      // Check if slug already exists
      let finalSlug = slug;
      let counter = 1;
      while (true) {
        const existing = await ctx.prisma.forecaster.findUnique({
          where: { slug: finalSlug },
        });

        if (!existing) break;

        finalSlug = `${slug}-${counter}`;
        counter++;
      }

      // Import the parser
      const { parseChannelUrl } = await import("@/utils/channelParser");

      // Use transaction to create forecaster and channels together
      const result = await ctx.prisma.$transaction(async (prisma) => {
        // Create the forecaster
        const forecaster = await prisma.forecaster.create({
          data: {
            name: input.name,
            slug: finalSlug,
            profile: {
              bio: input.bio || null,
              avatar: input.avatar || null,
              links: {
                website: input.website || null,
                twitter: input.twitter || null,
              },
              expertise: input.expertise,
            },
            metrics: {
              accuracy: 0,
              totalPredictions: 0,
              correctPredictions: 0,
              brierScore: null,
            },
            isVerified: input.isVerified,
          },
        });

        // Track created channel IDs for collection after transaction
        const createdChannelIds: string[] = [];

        // Create channels if provided
        if (input.channels && input.channels.length > 0) {
          // Track primary channels to prevent duplicates
          const primaryChannels: { [key: string]: boolean } = {};

          for (const channelInput of input.channels) {
            const parsed = parseChannelUrl(channelInput.url);
            if (!parsed) {
              console.warn(`Could not parse channel URL: ${channelInput.url}`);
              continue;
            }

            // Check for duplicate primary channels
            if (channelInput.isPrimary) {
              if (primaryChannels[parsed.type]) {
                throw new TRPCError({
                  code: "BAD_REQUEST",
                  message: `Only one primary ${parsed.type} channel allowed`,
                });
              }
              primaryChannels[parsed.type] = true;
            }

            // Create the channel
            const channel = await prisma.forecasterChannel.create({
              data: {
                forecasterId: forecaster.id,
                channelType: parsed.type,
                channelId: parsed.channelId,
                channelName: parsed.channelName || parsed.channelId,
                channelUrl: parsed.channelUrl,
                isPrimary: channelInput.isPrimary,
                isActive: true,
                collectionSettings: {
                  checkInterval: 3600, // Default 1 hour
                  lastChecked: null,
                  enabled: true,
                },
                metadata: {
                  subscribers: null,
                  verified: null,
                  description: null,
                },
              },
            });

            // Track channel ID for collection after transaction
            createdChannelIds.push(channel.id);

            // Add keywords for secondary channels
            if (!channelInput.isPrimary) {
              // Always add forecaster name as default keyword
              const keywordsToAdd = [...channelInput.keywords, forecaster.name];
              if (keywordsToAdd.length > 0) {
                await prisma.channelKeyword.createMany({
                  data: keywordsToAdd.map((keyword, index) => ({
                    channelId: channel.id,
                    keyword: keyword.trim(),
                    isActive: true,
                    isDefault: index === keywordsToAdd.length - 1, // Last one (forecaster name) is default
                  })),
                });
              }
            }
          }
        }

        return { forecaster, createdChannelIds };
      });

      // Trigger collection for all created channels after transaction commits
      if (result.createdChannelIds.length > 0) {
        setImmediate(async () => {
          for (const channelId of result.createdChannelIds) {
            try {
              await cronService.triggerChannelCollection(channelId);
              console.log(`✅ Triggered collection for new channel: ${channelId}`);
            } catch (collectionError) {
              console.warn(`⚠️ Failed to trigger collection for channel ${channelId}:`, collectionError);
              // Don't fail the entire operation if collection fails
            }
          }
        });
      }

      return result.forecaster;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        bio: z.string().optional(),
        avatar: z.string().url().optional(),
        website: z.string().url().optional(),
        twitter: z.string().optional(),
        expertise: z.array(z.string()).optional(),
        isVerified: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      // Check if forecaster exists
      const existing = await ctx.prisma.forecaster.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Forecaster not found",
        });
      }

      // If name is being updated, update slug too
      let updateData: any = {};

      if (updates.name || updates.bio || updates.avatar || updates.website || updates.twitter || updates.expertise) {
        const currentProfile = existing.profile as any;

        updateData.profile = {
          ...currentProfile,
          bio: updates.bio !== undefined ? updates.bio : currentProfile.bio,
          avatar: updates.avatar !== undefined ? updates.avatar : currentProfile.avatar,
          links: {
            ...currentProfile.links,
            website: updates.website !== undefined ? updates.website : currentProfile.links?.website,
            twitter: updates.twitter !== undefined ? updates.twitter : currentProfile.links?.twitter,
          },
          expertise: updates.expertise !== undefined ? updates.expertise : currentProfile.expertise,
        };
      }

      if (updates.name) {
        updateData.name = updates.name;

        // Generate new slug
        const slug = updates.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim();

        // Check if slug already exists (excluding current forecaster)
        let finalSlug = slug;
        let counter = 1;
        while (true) {
          const existingSlug = await ctx.prisma.forecaster.findFirst({
            where: {
              slug: finalSlug,
              id: { not: id },
            },
          });

          if (!existingSlug) break;

          finalSlug = `${slug}-${counter}`;
          counter++;
        }

        updateData.slug = finalSlug;
      }

      if (updates.isVerified !== undefined) {
        updateData.isVerified = updates.isVerified;
      }

      const forecaster = await ctx.prisma.forecaster.update({
        where: { id },
        data: updateData,
      });

      return forecaster;
    }),

  delete: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: id }) => {
      const forecaster = await ctx.prisma.forecaster.findUnique({
        where: { id },
      });

      if (!forecaster) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Forecaster not found",
        });
      }

      await ctx.prisma.forecaster.delete({
        where: { id },
      });

      return { success: true };
    }),

  // ============ CHANNEL MANAGEMENT ============

  getChannels: adminProcedure
    .input(z.string()) // forecasterId
    .query(async ({ ctx, input: forecasterId }) => {
      const channels = await ctx.prisma.forecasterChannel.findMany({
        where: { forecasterId },
        include: {
          keywords: true,
          _count: {
            select: {
              collectionJobs: true,
              keywords: true,
            },
          },
        },
        orderBy: [
          { isPrimary: "desc" },
          { channelType: "asc" },
          { createdAt: "asc" },
        ],
      });

      return channels;
    }),

  addChannel: adminProcedure
    .input(
      z.object({
        forecasterId: z.string(),
        channelType: z.enum(["YOUTUBE", "TWITTER"]),
        channelId: z.string().min(1),
        channelName: z.string().optional(),
        channelUrl: z.string().url(),
        isPrimary: z.boolean().default(false),
        isActive: z.boolean().default(true),
        checkInterval: z.number().min(60).default(3600), // seconds
        keywords: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { forecasterId, keywords, checkInterval, ...channelData } = input;

      // Check if forecaster exists
      const forecaster = await ctx.prisma.forecaster.findUnique({
        where: { id: forecasterId },
      });

      if (!forecaster) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Forecaster not found",
        });
      }

      // If this is a primary channel, ensure no other primary exists for this type
      if (input.isPrimary) {
        const existingPrimary = await ctx.prisma.forecasterChannel.findFirst({
          where: {
            forecasterId,
            channelType: input.channelType,
            isPrimary: true,
          },
        });

        if (existingPrimary) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Forecaster already has a primary ${input.channelType} channel`,
          });
        }
      }

      // Check for duplicate channel
      const existingChannel = await ctx.prisma.forecasterChannel.findFirst({
        where: {
          forecasterId,
          channelType: input.channelType,
          channelId: input.channelId,
        },
      });

      if (existingChannel) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Channel already exists for this forecaster",
        });
      }

      // Create channel with transaction
      const channel = await ctx.prisma.$transaction(async (prisma) => {
        const newChannel = await prisma.forecasterChannel.create({
          data: {
            ...channelData,
            forecasterId,
            collectionSettings: {
              checkInterval,
              lastChecked: null,
              enabled: true,
            },
            metadata: {
              subscribers: null,
              verified: null,
              description: null,
            },
          },
        });

        // Add keywords (including default forecaster name for secondary channels)
        const keywordsToAdd = [...keywords];
        if (!input.isPrimary) {
          // Add forecaster name as default keyword for secondary channels
          keywordsToAdd.push(forecaster.name);
        }

        if (keywordsToAdd.length > 0) {
          await prisma.channelKeyword.createMany({
            data: keywordsToAdd.map((keyword, index) => ({
              channelId: newChannel.id,
              keyword: keyword.trim(),
              isDefault: !input.isPrimary && index === keywordsToAdd.length - 1, // Last one (forecaster name) is default
            })),
          });
        }

        return newChannel;
      });

      // Trigger immediate collection for the new channel (async, don't wait)
      setImmediate(async () => {
        try {
          await cronService.triggerChannelCollection(channel.id);
          console.log(`✅ Triggered collection for new channel: ${channel.id}`);
        } catch (collectionError) {
          console.warn(`⚠️ Failed to trigger collection for channel ${channel.id}:`, collectionError);
        }
      });

      return channel;
    }),

  updateChannel: adminProcedure
    .input(
      z.object({
        channelId: z.string(),
        channelName: z.string().optional(),
        channelUrl: z.string().url().optional(),
        isPrimary: z.boolean().optional(),
        isActive: z.boolean().optional(),
        checkInterval: z.number().min(60).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { channelId, checkInterval, ...updates } = input;

      const existingChannel = await ctx.prisma.forecasterChannel.findUnique({
        where: { id: channelId },
      });

      if (!existingChannel) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Channel not found",
        });
      }

      // If updating isPrimary to true, ensure no other primary exists
      if (input.isPrimary === true) {
        const existingPrimary = await ctx.prisma.forecasterChannel.findFirst({
          where: {
            forecasterId: existingChannel.forecasterId,
            channelType: existingChannel.channelType,
            isPrimary: true,
            id: { not: channelId },
          },
        });

        if (existingPrimary) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Forecaster already has a primary ${existingChannel.channelType} channel`,
          });
        }
      }

      const updateData: any = { ...updates };

      // Update collection settings if checkInterval provided
      if (checkInterval !== undefined) {
        const currentSettings = existingChannel.collectionSettings as any;
        updateData.collectionSettings = {
          ...currentSettings,
          checkInterval,
        };
      }

      const channel = await ctx.prisma.forecasterChannel.update({
        where: { id: channelId },
        data: updateData,
      });

      return channel;
    }),

  deleteChannel: adminProcedure
    .input(z.string()) // channelId
    .mutation(async ({ ctx, input: channelId }) => {
      const channel = await ctx.prisma.forecasterChannel.findUnique({
        where: { id: channelId },
      });

      if (!channel) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Channel not found",
        });
      }

      await ctx.prisma.forecasterChannel.delete({
        where: { id: channelId },
      });

      return { success: true };
    }),

  // ============ KEYWORD MANAGEMENT ============

  getChannelKeywords: adminProcedure
    .input(z.string()) // channelId
    .query(async ({ ctx, input: channelId }) => {
      const keywords = await ctx.prisma.channelKeyword.findMany({
        where: { channelId },
        orderBy: [
          { isDefault: "desc" },
          { createdAt: "desc" },
        ],
      });

      return keywords;
    }),

  addChannelKeyword: adminProcedure
    .input(
      z.object({
        channelId: z.string(),
        keyword: z.string().min(1),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { channelId, keyword } = input;

      // Check if channel exists
      const channel = await ctx.prisma.forecasterChannel.findUnique({
        where: { id: channelId },
      });

      if (!channel) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Channel not found",
        });
      }

      // Check for duplicate keyword
      const existingKeyword = await ctx.prisma.channelKeyword.findFirst({
        where: {
          channelId,
          keyword: keyword.trim(),
        },
      });

      if (existingKeyword) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Keyword already exists for this channel",
        });
      }

      const channelKeyword = await ctx.prisma.channelKeyword.create({
        data: {
          channelId,
          keyword: keyword.trim(),
          isActive: input.isActive,
          isDefault: false, // User-added keywords are not default
        },
      });

      return channelKeyword;
    }),

  updateChannelKeyword: adminProcedure
    .input(
      z.object({
        keywordId: z.string(),
        keyword: z.string().min(1).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { keywordId, ...updates } = input;

      const existingKeyword = await ctx.prisma.channelKeyword.findUnique({
        where: { id: keywordId },
      });

      if (!existingKeyword) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Keyword not found",
        });
      }

      // If updating keyword text, check for duplicates
      if (updates.keyword) {
        const duplicate = await ctx.prisma.channelKeyword.findFirst({
          where: {
            channelId: existingKeyword.channelId,
            keyword: updates.keyword.trim(),
            id: { not: keywordId },
          },
        });

        if (duplicate) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Keyword already exists for this channel",
          });
        }

        updates.keyword = updates.keyword.trim();
      }

      const keyword = await ctx.prisma.channelKeyword.update({
        where: { id: keywordId },
        data: updates,
      });

      return keyword;
    }),

  deleteChannelKeyword: adminProcedure
    .input(z.string()) // keywordId
    .mutation(async ({ ctx, input: keywordId }) => {
      const keyword = await ctx.prisma.channelKeyword.findUnique({
        where: { id: keywordId },
      });

      if (!keyword) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Keyword not found",
        });
      }

      // Prevent deletion of default keywords
      if (keyword.isDefault) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot delete default keywords",
        });
      }

      await ctx.prisma.channelKeyword.delete({
        where: { id: keywordId },
      });

      return { success: true };
    }),

  // ============ COLLECTION JOBS ============

  startChannelCollection: adminProcedure
    .input(
      z.object({
        channelId: z.string(),
        jobType: z.enum(["FULL_SCAN", "KEYWORD_SCAN", "INCREMENTAL"]).default("INCREMENTAL"),
        config: z.record(z.any()).default({}),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { channelId, jobType, config } = input;

      // Check if channel exists
      const channel = await ctx.prisma.forecasterChannel.findUnique({
        where: { id: channelId },
      });

      if (!channel) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Channel not found",
        });
      }

      // Check if there's already a pending/running job for this channel
      const existingJob = await ctx.prisma.channelCollectionJob.findFirst({
        where: {
          channelId,
          status: { in: ["PENDING", "RUNNING"] },
        },
      });

      if (existingJob) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Channel already has a pending or running collection job",
        });
      }

      const job = await ctx.prisma.channelCollectionJob.create({
        data: {
          channelId,
          jobType,
          config,
          status: "PENDING",
        },
      });

      // Trigger the collection asynchronously
      setImmediate(async () => {
        try {
          await cronService.triggerChannelCollection(channelId);
          console.log(`✅ Started collection job for channel: ${channelId}`);
        } catch (error) {
          console.error(`❌ Failed to start collection for channel ${channelId}:`, error);
        }
      });

      return job;
    }),

  getChannelJobs: adminProcedure
    .input(z.string()) // channelId
    .query(async ({ ctx, input: channelId }) => {
      const jobs = await ctx.prisma.channelCollectionJob.findMany({
        where: { channelId },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      return jobs;
    }),
});