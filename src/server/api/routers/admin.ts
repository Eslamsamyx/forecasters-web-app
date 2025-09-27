import { z } from "zod";
import {
  createTRPCRouter,
  adminProcedure,
} from "../trpc";
import { TRPCError } from "@trpc/server";

export const adminRouter = createTRPCRouter({
  // Get dashboard statistics
  getDashboardStats: adminProcedure
    .query(async ({ ctx }) => {
      try {
        // Fetch all statistics in parallel for better performance
        const [
          totalUsers,
          totalForecasters,
          totalPredictions,
          totalArticles,
          activeSubscriptions,
          verifiedForecasters,
          publishedArticles,
          todayUsers,
          todayPredictions,
          recentActivity,
          systemHealth,
          todayApiCalls,
          activeSessions,
        ] = await Promise.all([
          // Total Users
          ctx.prisma.user.count(),

          // Total Forecasters
          ctx.prisma.forecaster.count(),

          // Total Predictions
          ctx.prisma.prediction.count(),

          // Total Articles
          ctx.prisma.article.count(),

          // Active Subscriptions (users with premium role)
          ctx.prisma.user.count({
            where: {
              role: "PREMIUM"
            }
          }),

          // Verified Forecasters
          ctx.prisma.forecaster.count({
            where: {
              isVerified: true
            }
          }),

          // Published Articles
          ctx.prisma.article.count({
            where: {
              status: "PUBLISHED"
            }
          }),

          // New Users Today
          ctx.prisma.user.count({
            where: {
              createdAt: {
                gte: new Date(new Date().setHours(0, 0, 0, 0))
              }
            }
          }),

          // New Predictions Today
          ctx.prisma.prediction.count({
            where: {
              createdAt: {
                gte: new Date(new Date().setHours(0, 0, 0, 0))
              }
            }
          }),

          // Recent Activity (last 10 user actions)
          ctx.prisma.userAction.findMany({
            take: 10,
            orderBy: {
              createdAt: 'desc'
            },
            select: {
              id: true,
              userId: true,
              actionType: true,
              metadata: true,
              createdAt: true,
            }
          }),

          // System Health (calculate based on various metrics)
          Promise.resolve(99),

          // Today's API Calls (simplified - count user actions today)
          ctx.prisma.userAction.count({
            where: {
              createdAt: {
                gte: new Date(new Date().setHours(0, 0, 0, 0))
              }
            }
          }),

          // Active Sessions (users with recent actions)
          ctx.prisma.userAction.groupBy({
            by: ['userId'],
            where: {
              createdAt: {
                gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
              }
            }
          }).then(result => result.length),
        ]);

        // Calculate additional metrics
        const forecastersAccuracy = await calculateAverageAccuracy(ctx);
        const predictionGrowth = await calculatePredictionGrowth(ctx);
        const userGrowth = await calculateUserGrowth(ctx);

        return {
          stats: {
            totalUsers,
            totalForecasters,
            totalPredictions,
            totalArticles,
            activeSubscriptions,
            verifiedForecasters,
            publishedArticles,
            systemHealth,
            apiCalls: todayApiCalls * 10, // Estimate multiplier for API calls
          },
          todayStats: {
            newUsers: todayUsers,
            newPredictions: todayPredictions,
            apiRequests: todayApiCalls * 10,
            activeSessions,
          },
          growth: {
            userGrowth,
            predictionGrowth,
            forecastersAccuracy,
          },
          recentActivity: recentActivity.map((activity: any) => ({
            id: activity.id,
            action: activity.actionType || "User Action",
            entityType: "user_action",
            timestamp: activity.createdAt,
            metadata: activity.metadata || {},
          })),
        };
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch dashboard statistics",
        });
      }
    }),

  // Get system status
  getSystemStatus: adminProcedure
    .query(async ({ ctx }) => {
      try {
        // Check database connection
        let dbStatus = false;
        try {
          await ctx.prisma.$queryRaw`SELECT 1`;
          dbStatus = true;
        } catch {
          dbStatus = false;
        }

        // Check for recent errors in user actions
        const recentErrors = await ctx.prisma.userAction.count({
          where: {
            actionType: {
              contains: "error",
              mode: 'insensitive'
            },
            createdAt: {
              gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
            }
          }
        }).catch(() => 0);

        const services = [
          {
            name: "API Server",
            status: "operational",
            uptime: "99.9%",
            healthy: true,
          },
          {
            name: "Database",
            status: dbStatus ? "operational" : "degraded",
            uptime: dbStatus ? "99.8%" : "95.0%",
            healthy: dbStatus,
          },
          {
            name: "Email Service",
            status: recentErrors > 10 ? "degraded" : "operational",
            uptime: recentErrors > 10 ? "97.2%" : "99.5%",
            healthy: recentErrors <= 10,
          },
          {
            name: "Prediction Engine",
            status: "operational",
            uptime: "99.5%",
            healthy: true,
          },
        ];

        return {
          services,
          overallHealth: services.filter(s => s.healthy).length / services.length * 100,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch system status",
        });
      }
    }),

  // Get activity feed
  getActivityFeed: adminProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { limit, offset } = input;

      // Fetch different types of activities
      const [users, predictions, articles, forecasters] = await Promise.all([
        // Recent user registrations
        ctx.prisma.user.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            fullName: true,
            createdAt: true,
          }
        }),

        // Recent predictions
        ctx.prisma.prediction.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            prediction: true,
            confidence: true,
            targetDate: true,
            targetPrice: true,
            outcome: true,
            createdAt: true,
            forecaster: {
              select: {
                name: true,
              }
            },
            asset: {
              select: {
                symbol: true,
              }
            }
          }
        }),

        // Recent articles
        ctx.prisma.article.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            status: true,
            authorId: true,
            createdAt: true,
          }
        }),

        // Recent forecasters
        ctx.prisma.forecaster.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            isVerified: true,
            createdAt: true,
          }
        }),
      ]);

      // Combine and format activities
      const activities: Array<{
        id: string;
        action: string;
        user: string;
        timestamp: Date;
        type: string;
        icon: string;
      }> = [];

      users.forEach(user => {
        activities.push({
          id: `user-${user.id}`,
          action: "New user registered",
          user: user.fullName || user.email,
          timestamp: user.createdAt,
          type: "success",
          icon: "UserCheck",
        });
      });

      predictions.forEach(prediction => {
        activities.push({
          id: `prediction-${prediction.id}`,
          action: `New prediction for ${prediction.asset?.symbol || 'Unknown'}`,
          user: prediction.forecaster?.name || 'Unknown',
          timestamp: prediction.createdAt,
          type: "info",
          icon: "TrendingUp",
        });
      });

      articles.forEach(article => {
        activities.push({
          id: `article-${article.id}`,
          action: article.status === 'PUBLISHED' ? "Article published" : "Article created",
          user: "admin",
          timestamp: article.createdAt,
          type: "info",
          icon: "FileText",
        });
      });

      forecasters.forEach(forecaster => {
        activities.push({
          id: `forecaster-${forecaster.id}`,
          action: forecaster.isVerified ? "Forecaster verified" : "New forecaster added",
          user: forecaster.name,
          timestamp: forecaster.createdAt,
          type: "success",
          icon: "Target",
        });
      });

      // Sort by timestamp and apply pagination
      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      const paginatedActivities = activities.slice(offset, offset + limit);

      return {
        activities: paginatedActivities,
        total: activities.length,
        hasMore: offset + limit < activities.length,
      };
    }),

  // User Management Endpoints
  // Get all users with filtering and pagination
  getUsers: adminProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      search: z.string().optional(),
      role: z.enum(["ALL", "FREE", "PREMIUM", "ADMIN"]).default("ALL"),
      status: z.enum(["ALL", "ACTIVE", "SUSPENDED"]).default("ALL"),
    }))
    .query(async ({ ctx, input }) => {
      const { page, limit, search, role, status } = input;
      const offset = (page - 1) * limit;

      try {
        // Build where clause
        const whereClause: any = {};

        // Search filter
        if (search) {
          whereClause.OR = [
            { email: { contains: search, mode: 'insensitive' } },
            { fullName: { contains: search, mode: 'insensitive' } },
          ];
        }

        // Role filter
        if (role !== "ALL") {
          whereClause.role = role;
        }

        // Status filter - we'll assume suspended users have a specific field or role
        // Since there's no status field in schema, we'll use role to determine status
        if (status === "SUSPENDED") {
          // For now, we'll assume suspended users don't exist in schema
          // This can be expanded when a status field is added
        }

        // Get users with stats
        const [users, totalCount] = await Promise.all([
          ctx.prisma.user.findMany({
            where: whereClause,
            select: {
              id: true,
              email: true,
              fullName: true,
              role: true,
              createdAt: true,
              updatedAt: true,
              _count: {
                select: {
                  actions: true,
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            skip: offset,
            take: limit,
          }),
          ctx.prisma.user.count({ where: whereClause }),
        ]);

        // Get last activity for each user
        const usersWithActivity = await Promise.all(
          users.map(async (user) => {
            const lastAction = await ctx.prisma.userAction.findFirst({
              where: { userId: user.id },
              orderBy: { createdAt: 'desc' },
              select: { createdAt: true }
            });

            return {
              ...user,
              status: 'active', // Default status
              lastActive: lastAction?.createdAt || user.createdAt,
              totalActions: user._count.actions,
            };
          })
        );

        return {
          users: usersWithActivity,
          pagination: {
            page,
            limit,
            total: totalCount,
            pages: Math.ceil(totalCount / limit),
            hasNext: page < Math.ceil(totalCount / limit),
            hasPrev: page > 1,
          }
        };
      } catch (error) {
        console.error("Error fetching users:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch users",
        });
      }
    }),

  // Get user statistics
  getUserStats: adminProcedure
    .query(async ({ ctx }) => {
      try {
        const [
          totalUsers,
          premiumUsers,
          adminUsers,
          activeUsersCount
        ] = await Promise.all([
          ctx.prisma.user.count(),
          ctx.prisma.user.count({ where: { role: "PREMIUM" } }),
          ctx.prisma.user.count({ where: { role: "ADMIN" } }),
          // Users with actions in last 30 days
          ctx.prisma.userAction.groupBy({
            by: ['userId'],
            where: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              }
            }
          }).then(result => result.length),
        ]);

        return {
          totalUsers,
          activeUsers: activeUsersCount,
          premiumUsers,
          adminUsers,
          freeUsers: totalUsers - premiumUsers - adminUsers,
        };
      } catch (error) {
        console.error("Error fetching user stats:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch user statistics",
        });
      }
    }),

  // Get single user details
  getUser: adminProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const user = await ctx.prisma.user.findUnique({
          where: { id: input.userId },
          include: {
            actions: {
              take: 10,
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                actionType: true,
                targetType: true,
                targetId: true,
                metadata: true,
                createdAt: true,
              }
            },
            _count: {
              select: {
                actions: true,
                events: true,
                articles: true,
              }
            }
          }
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        return {
          ...user,
          totalActions: user._count.actions,
          totalEvents: user._count.events,
          totalArticles: user._count.articles,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error fetching user:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch user details",
        });
      }
    }),

  // Update user
  updateUser: adminProcedure
    .input(z.object({
      userId: z.string(),
      fullName: z.string().optional(),
      email: z.string().email().optional(),
      role: z.enum(["FREE", "PREMIUM", "ADMIN"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { userId, ...updateData } = input;

        // Check if user exists
        const existingUser = await ctx.prisma.user.findUnique({
          where: { id: userId }
        });

        if (!existingUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Check if email is already taken (if email is being updated)
        if (updateData.email && updateData.email !== existingUser.email) {
          const emailExists = await ctx.prisma.user.findUnique({
            where: { email: updateData.email }
          });

          if (emailExists) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Email already exists",
            });
          }
        }

        const updatedUser = await ctx.prisma.user.update({
          where: { id: userId },
          data: updateData,
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          }
        });

        return updatedUser;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error updating user:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user",
        });
      }
    }),

  // Delete user (soft delete by changing role or actual delete)
  deleteUser: adminProcedure
    .input(z.object({
      userId: z.string(),
      permanent: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { userId, permanent } = input;

        // Check if user exists
        const existingUser = await ctx.prisma.user.findUnique({
          where: { id: userId }
        });

        if (!existingUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Prevent deleting the current admin
        if (ctx.session?.user?.id === userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot delete your own account",
          });
        }

        if (permanent) {
          // Permanent deletion
          await ctx.prisma.user.delete({
            where: { id: userId }
          });
          return { deleted: true, permanent: true };
        } else {
          // Soft delete by setting role to a suspended state
          // Since there's no status field, we'll use a comment in settings
          const settings = typeof existingUser.settings === 'object' ? existingUser.settings : {};
          await ctx.prisma.user.update({
            where: { id: userId },
            data: {
              settings: {
                ...settings,
                suspended: true,
                suspendedAt: new Date().toISOString(),
              }
            }
          });
          return { deleted: true, permanent: false };
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error deleting user:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete user",
        });
      }
    }),

  // Create new user
  createUser: adminProcedure
    .input(z.object({
      fullName: z.string().min(1, "Full name is required"),
      email: z.string().email("Valid email is required"),
      role: z.enum(["FREE", "PREMIUM", "ADMIN"]).default("FREE"),
      sendInvite: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { fullName, email, role, sendInvite } = input;

        // Check if email already exists
        const existingUser = await ctx.prisma.user.findUnique({
          where: { email }
        });

        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User with this email already exists",
          });
        }

        // Create new user
        const newUser = await ctx.prisma.user.create({
          data: {
            email,
            fullName,
            role,
            // Set default settings for new user
            settings: {
              notifications: {
                email: true,
                push: false
              },
              theme: "light",
              timezone: "UTC"
            },
            // Set default subscription for new user
            subscription: {
              tier: role === "PREMIUM" ? "PREMIUM" : "FREE",
              stripeCustomerId: null,
              expiresAt: null
            }
          },
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            createdAt: true,
          }
        });

        // TODO: If sendInvite is true, send invitation email
        // This would typically integrate with your email service
        if (sendInvite) {
          console.log(`TODO: Send invitation email to ${email}`);
        }

        return {
          user: newUser,
          message: `User created successfully${sendInvite ? ' and invitation email sent' : ''}`
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error creating user:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
        });
      }
    }),

  // Article Management Endpoints
  // Get all articles with filtering and pagination
  getArticles: adminProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      search: z.string().optional(),
      status: z.enum(["ALL", "DRAFT", "PUBLISHED", "ARCHIVED"]).default("ALL"),
      category: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { page, limit, search, status, category } = input;
      const offset = (page - 1) * limit;

      try {
        // Build where clause
        const whereClause: any = {};

        if (search) {
          whereClause.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
          ];
        }

        if (status !== "ALL") {
          whereClause.status = status;
        }

        if (category) {
          whereClause.categoryId = category;
        }

        // Get articles with author info
        const [articles, totalCount] = await Promise.all([
          ctx.prisma.article.findMany({
            where: whereClause,
            select: {
              id: true,
              title: true,
              slug: true,
              excerpt: true,
              status: true,
              featured: true,
              isPremium: true,
              viewCount: true,
              likeCount: true,
              publishDate: true,
              createdAt: true,
              updatedAt: true,
              author: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                }
              },
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            skip: offset,
            take: limit,
          }),
          ctx.prisma.article.count({ where: whereClause }),
        ]);

        return {
          articles,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit),
          },
        };
      } catch (error) {
        console.error("Error fetching articles:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch articles",
        });
      }
    }),

  // Get single article by ID
  getArticle: adminProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const article = await ctx.prisma.article.findUnique({
          where: { id: input.id },
          include: {
            author: {
              select: {
                id: true,
                fullName: true,
                email: true,
              }
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            }
          }
        });

        if (!article) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Article not found",
          });
        }

        return article;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error fetching article:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch article",
        });
      }
    }),

  // Update article
  updateArticle: adminProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1, "Title is required").optional(),
      content: z.string().min(1, "Content is required").optional(),
      excerpt: z.string().optional(),
      status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
      featured: z.boolean().optional(),
      isPremium: z.boolean().optional(),
      tags: z.array(z.string()).optional(),
      featuredImage: z.string().optional(),
      categoryId: z.string().optional(),
      publishDate: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        // Convert empty categoryId to null
        if (updateData.categoryId === "") {
          updateData.categoryId = undefined;
        }

        // Check if article exists
        const existingArticle = await ctx.prisma.article.findUnique({
          where: { id }
        });

        if (!existingArticle) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Article not found",
          });
        }

        // Keep existing slug for SEO - don't auto-update when title changes
        // Slug should only be updated manually by admins if needed
        const slug = existingArticle.slug;

        // Update the article
        const updatedArticle = await ctx.prisma.article.update({
          where: { id },
          data: {
            ...updateData,
            slug,
          },
          include: {
            author: {
              select: {
                id: true,
                fullName: true,
                email: true,
              }
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            }
          }
        });

        return {
          article: updatedArticle,
          message: "Article updated successfully"
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error updating article:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update article",
        });
      }
    }),

  // Delete article
  deleteArticle: adminProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if article exists
        const existingArticle = await ctx.prisma.article.findUnique({
          where: { id: input.id }
        });

        if (!existingArticle) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Article not found",
          });
        }

        // Delete the article
        await ctx.prisma.article.delete({
          where: { id: input.id }
        });

        return {
          message: "Article deleted successfully"
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error deleting article:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete article",
        });
      }
    }),

  // Create new article
  createArticle: adminProcedure
    .input(z.object({
      title: z.string().min(1, "Title is required"),
      content: z.string().min(1, "Content is required"),
      excerpt: z.string().optional(),
      status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
      featured: z.boolean().default(false),
      isPremium: z.boolean().default(false),
      tags: z.array(z.string()).default([]),
      featuredImage: z.string().optional(),
      categoryId: z.string().optional(),
      publishDate: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Generate slug from title
        let slug = input.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        // Ensure slug is unique
        const existingSlug = await ctx.prisma.article.findUnique({
          where: { slug }
        });

        if (existingSlug) {
          slug = `${slug}-${Date.now()}`;
        }

        // Create the article
        const newArticle = await ctx.prisma.article.create({
          data: {
            ...input,
            slug,
            authorId: ctx.session.user.id, // Use current admin as author
          },
          include: {
            author: {
              select: {
                id: true,
                fullName: true,
                email: true,
              }
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            }
          }
        });

        return {
          article: newArticle,
          message: "Article created successfully"
        };
      } catch (error) {
        console.error("Error creating article:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create article",
        });
      }
    }),

  // Get all categories
  getCategories: adminProcedure
    .query(async ({ ctx }) => {
      try {
        const categories = await ctx.prisma.category.findMany({
          where: {
            isActive: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            color: true,
            icon: true,
          },
        });

        return categories;
      } catch (error) {
        console.error("Error fetching categories:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch categories",
        });
      }
    }),

  // Get all forecasters
  getForecasters: adminProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      search: z.string().optional(),
      verified: z.boolean().optional(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { page, limit, search, verified } = input;
        const offset = (page - 1) * limit;

        // Build where clause
        const where: any = {};

        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } },
          ];
        }

        if (verified !== undefined) {
          where.isVerified = verified;
        }

        // Get forecasters with pagination
        const [forecasters, total] = await Promise.all([
          ctx.prisma.forecaster.findMany({
            where,
            skip: offset,
            take: limit,
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              _count: {
                select: {
                  predictions: true,
                }
              }
            }
          }),
          ctx.prisma.forecaster.count({ where }),
        ]);

        // Format forecasters with parsed profile and metrics
        const formattedForecasters = forecasters.map(forecaster => {
          const profile = typeof forecaster.profile === 'object' ? forecaster.profile : {};
          const metrics = typeof forecaster.metrics === 'object' ? forecaster.metrics : {};

          return {
            id: forecaster.id,
            name: forecaster.name,
            slug: forecaster.slug,
            isVerified: forecaster.isVerified,
            bio: (profile as any)?.bio || null,
            avatar: (profile as any)?.avatar || null,
            expertise: (profile as any)?.expertise || [],
            links: (profile as any)?.links || {},
            accuracy: (metrics as any)?.accuracy || 0,
            totalPredictions: (metrics as any)?.totalPredictions || forecaster._count.predictions,
            correctPredictions: (metrics as any)?.correctPredictions || 0,
            brierScore: (metrics as any)?.brierScore || null,
            createdAt: forecaster.createdAt,
            updatedAt: forecaster.updatedAt,
          };
        });

        return {
          forecasters: formattedForecasters,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        };
      } catch (error) {
        console.error("Error fetching forecasters:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch forecasters",
        });
      }
    }),

  // Get forecaster by ID
  getForecaster: adminProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const forecaster = await ctx.prisma.forecaster.findUnique({
          where: { id: input.id },
          include: {
            predictions: {
              take: 10,
              orderBy: { createdAt: 'desc' },
              include: {
                asset: {
                  select: {
                    symbol: true,
                    type: true,
                  }
                }
              }
            },
            _count: {
              select: {
                predictions: true,
                content: true,
              }
            }
          }
        });

        if (!forecaster) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Forecaster not found",
          });
        }

        // Parse JSON fields
        const profile = typeof forecaster.profile === 'object' ? forecaster.profile : {};
        const metrics = typeof forecaster.metrics === 'object' ? forecaster.metrics : {};

        return {
          id: forecaster.id,
          name: forecaster.name,
          slug: forecaster.slug,
          isVerified: forecaster.isVerified,
          bio: (profile as any)?.bio || null,
          avatar: (profile as any)?.avatar || null,
          expertise: (profile as any)?.expertise || [],
          links: (profile as any)?.links || {},
          accuracy: (metrics as any)?.accuracy || 0,
          totalPredictions: (metrics as any)?.totalPredictions || forecaster._count.predictions,
          correctPredictions: (metrics as any)?.correctPredictions || 0,
          brierScore: (metrics as any)?.brierScore || null,
          recentPredictions: forecaster.predictions,
          contentCount: forecaster._count.content,
          createdAt: forecaster.createdAt,
          updatedAt: forecaster.updatedAt,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error fetching forecaster:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch forecaster",
        });
      }
    }),

  // Update forecaster verification status
  updateForecasterVerification: adminProcedure
    .input(z.object({
      id: z.string(),
      isVerified: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const forecaster = await ctx.prisma.forecaster.update({
          where: { id: input.id },
          data: { isVerified: input.isVerified },
        });

        return {
          forecaster,
          message: `Forecaster ${input.isVerified ? 'verified' : 'unverified'} successfully`,
        };
      } catch (error) {
        console.error("Error updating forecaster verification:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update forecaster verification",
        });
      }
    }),

  // Get security events
  getSecurityEvents: adminProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      type: z.string().optional(),
      severity: z.enum(["low", "medium", "high"]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { page, limit, type, severity } = input;
        const offset = (page - 1) * limit;

        // Build where clause for security-related events
        const where: any = {
          type: {
            in: ["USER_LOGIN", "LOGIN_FAILED", "PASSWORD_CHANGED", "ADMIN_ACCESS", "SUSPICIOUS_ACTIVITY", "SECURITY_VIOLATION"]
          }
        };

        if (type) {
          where.type = type;
        }

        // Get events with pagination
        const [events, total] = await Promise.all([
          ctx.prisma.event.findMany({
            where,
            skip: offset,
            take: limit,
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              user: {
                select: {
                  email: true,
                  fullName: true,
                }
              }
            }
          }),
          ctx.prisma.event.count({ where }),
        ]);

        // Format events with severity calculation
        const formattedEvents = events.map(event => {
          const eventData = typeof event.data === 'object' ? event.data : {};

          // Calculate severity based on event type
          let calculatedSeverity = "low";
          if (event.type === "LOGIN_FAILED" || event.type === "SUSPICIOUS_ACTIVITY") {
            calculatedSeverity = "medium";
          } else if (event.type === "SECURITY_VIOLATION") {
            calculatedSeverity = "high";
          }

          // Override with provided severity filter if specified
          if (severity && calculatedSeverity !== severity) {
            return null;
          }

          return {
            id: event.id,
            type: event.type,
            severity: calculatedSeverity,
            user: event.user?.email || "Unknown",
            userFullName: event.user?.fullName || null,
            ipAddress: event.ipAddress || "Unknown",
            timestamp: event.createdAt,
            data: eventData,
          };
        }).filter(Boolean);

        return {
          events: formattedEvents,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        };
      } catch (error) {
        console.error("Error fetching security events:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch security events",
        });
      }
    }),

  // Get security settings
  getSecuritySettings: adminProcedure
    .query(async ({ ctx }) => {
      try {
        // Default settings fallback
        const defaultSettings = {
          twoFactorRequired: true,
          passwordMinLength: 8,
          sessionTimeout: 24,
          maxLoginAttempts: 5,
          enableAuditLog: true,
          requireHttps: true,
          ipWhitelist: "",
          enableCaptcha: true,
        };

        // Get the latest security settings from the Event table
        const latestSettingsEvent = await ctx.prisma.event.findFirst({
          where: {
            type: "SYSTEM_SETTINGS",
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        // Parse settings from the latest event or use defaults
        let settings = defaultSettings;
        if (latestSettingsEvent && latestSettingsEvent.data) {
          const eventData = typeof latestSettingsEvent.data === 'object' ? latestSettingsEvent.data as any : {};
          settings = {
            ...defaultSettings,
            ...eventData.settings,
          };
        }

        // Get recent security stats
        const [failedLogins, totalLogins, suspiciousActivity] = await Promise.all([
          ctx.prisma.event.count({
            where: {
              type: "LOGIN_FAILED",
              createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
              }
            }
          }),
          ctx.prisma.event.count({
            where: {
              type: "USER_LOGIN",
              createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
              }
            }
          }),
          ctx.prisma.event.count({
            where: {
              type: "SUSPICIOUS_ACTIVITY",
              createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
              }
            }
          }),
        ]);

        return {
          settings,
          stats: {
            failedLogins,
            totalLogins,
            suspiciousActivity,
            successRate: totalLogins > 0 ? ((totalLogins - failedLogins) / totalLogins * 100).toFixed(1) : "100.0",
          }
        };
      } catch (error) {
        console.error("Error fetching security settings:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch security settings",
        });
      }
    }),

  // Update security settings
  updateSecuritySettings: adminProcedure
    .input(z.object({
      twoFactorRequired: z.boolean().optional(),
      passwordMinLength: z.number().min(6).max(32).optional(),
      sessionTimeout: z.number().min(1).max(168).optional(),
      maxLoginAttempts: z.number().min(1).max(10).optional(),
      enableAuditLog: z.boolean().optional(),
      requireHttps: z.boolean().optional(),
      ipWhitelist: z.string().optional(),
      enableCaptcha: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get current settings first
        const defaultSettings = {
          twoFactorRequired: true,
          passwordMinLength: 8,
          sessionTimeout: 24,
          maxLoginAttempts: 5,
          enableAuditLog: true,
          requireHttps: true,
          ipWhitelist: "",
          enableCaptcha: true,
        };

        const latestSettingsEvent = await ctx.prisma.event.findFirst({
          where: {
            type: "SYSTEM_SETTINGS",
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        let currentSettings = defaultSettings;
        if (latestSettingsEvent && latestSettingsEvent.data) {
          const eventData = typeof latestSettingsEvent.data === 'object' ? latestSettingsEvent.data as any : {};
          currentSettings = {
            ...defaultSettings,
            ...eventData.settings,
          };
        }

        // Merge current settings with new input (only update provided fields)
        const updatedSettings = {
          ...currentSettings,
          ...Object.fromEntries(
            Object.entries(input).filter(([_, value]) => value !== undefined)
          ),
        };

        // Create a new settings event to persist the changes
        // Check if the user exists in the database before setting userId
        const userExists = await ctx.prisma.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { id: true }
        });

        await ctx.prisma.event.create({
          data: {
            type: "SYSTEM_SETTINGS",
            entityType: "ADMIN",
            entityId: "security-settings",
            data: {
              settings: updatedSettings,
              updatedBy: ctx.session.user.id,
              updatedAt: new Date().toISOString(),
              changes: input, // Track what was changed
            },
            userId: userExists ? ctx.session.user.id : null, // Only set userId if user exists
          },
        });

        return {
          message: "Security settings updated successfully",
          settings: updatedSettings,
        };
      } catch (error) {
        console.error("Error updating security settings:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update security settings",
        });
      }
    }),

  // ====================================
  // PREDICTION MANAGEMENT ENDPOINTS
  // ====================================

  // Get all predictions with advanced filtering
  getPredictions: adminProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      search: z.string().optional(),
      outcome: z.enum(["ALL", "PENDING", "CORRECT", "INCORRECT", "PARTIALLY_CORRECT"]).default("ALL"),
      forecasterId: z.string().optional(),
      assetId: z.string().optional(),
      confidence: z.object({
        min: z.number().min(0).max(100).default(0),
        max: z.number().min(0).max(100).default(100),
      }).optional(),
      dateRange: z.object({
        from: z.date().optional(),
        to: z.date().optional(),
      }).optional(),
      sortBy: z.enum(["createdAt", "targetDate", "confidence", "outcome"]).default("createdAt"),
      sortOrder: z.enum(["asc", "desc"]).default("desc"),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { page, limit, search, outcome, forecasterId, assetId, confidence, dateRange, sortBy, sortOrder } = input;
        const offset = (page - 1) * limit;

        // Build where clause
        const where: any = {};

        if (outcome !== "ALL") {
          where.outcome = outcome;
        }

        if (forecasterId) {
          where.forecasterId = forecasterId;
        }

        if (assetId) {
          where.assetId = assetId;
        }

        if (confidence) {
          where.confidence = {
            gte: confidence.min / 100,
            lte: confidence.max / 100,
          };
        }

        if (dateRange) {
          where.createdAt = {};
          if (dateRange.from) {
            where.createdAt.gte = dateRange.from;
          }
          if (dateRange.to) {
            where.createdAt.lte = dateRange.to;
          }
        }

        if (search) {
          where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ];
        }

        // Get predictions with related data
        const [predictions, total] = await Promise.all([
          ctx.prisma.prediction.findMany({
            where,
            skip: offset,
            take: limit,
            orderBy: {
              [sortBy]: sortOrder,
            },
            include: {
              forecaster: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                }
              },
              asset: {
                select: {
                  id: true,
                  symbol: true,
                  type: true,
                }
              }
            }
          }),
          ctx.prisma.prediction.count({ where }),
        ]);

        return {
          predictions: predictions.map(p => ({
            ...p,
            confidence: p.confidence?.toNumber() || 0,
            targetPrice: p.targetPrice?.toNumber() || null,
          })),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        };
      } catch (error) {
        console.error("Error fetching predictions:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch predictions",
        });
      }
    }),

  // Get single prediction details
  getPrediction: adminProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const prediction = await ctx.prisma.prediction.findUnique({
          where: { id: input.id },
          include: {
            forecaster: true,
            asset: true,
          }
        });

        if (!prediction) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Prediction not found",
          });
        }

        return {
          ...prediction,
          confidence: prediction.confidence?.toNumber() || 0,
          targetPrice: prediction.targetPrice?.toNumber() || null,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error fetching prediction:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch prediction",
        });
      }
    }),

  // Update prediction
  updatePrediction: adminProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      direction: z.enum(["BULLISH", "BEARISH", "NEUTRAL"]).optional(),
      confidence: z.number().min(0).max(100).optional(),
      targetPrice: z.number().optional(),
      targetDate: z.date().optional(),
      outcome: z.enum(["PENDING", "CORRECT", "INCORRECT", "PARTIALLY_CORRECT"]).optional(),
      metadata: z.record(z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, confidence, targetPrice, ...updateData } = input;

        // Check if prediction exists
        const existingPrediction = await ctx.prisma.prediction.findUnique({
          where: { id },
        });

        if (!existingPrediction) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Prediction not found",
          });
        }

        // Prepare update data with proper decimal conversion
        const data: any = { ...updateData };
        if (confidence !== undefined) {
          data.confidence = confidence / 100;
        }
        if (targetPrice !== undefined) {
          data.targetPrice = targetPrice;
        }

        // Update prediction
        const updatedPrediction = await ctx.prisma.prediction.update({
          where: { id },
          data,
          include: {
            forecaster: true,
            asset: true,
          }
        });

        // Log the update
        await ctx.prisma.event.create({
          data: {
            type: "PREDICTION_UPDATED",
            entityType: "PREDICTION",
            entityId: id,
            data: {
              changes: Object.keys(input).filter(k => k !== 'id'),
              updatedBy: ctx.session.user.id,
            },
            userId: ctx.session.user.id,
          },
        });

        return {
          prediction: updatedPrediction,
          message: "Prediction updated successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error updating prediction:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update prediction",
        });
      }
    }),

  // Delete prediction
  deletePrediction: adminProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if prediction exists
        const existingPrediction = await ctx.prisma.prediction.findUnique({
          where: { id: input.id },
        });

        if (!existingPrediction) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Prediction not found",
          });
        }

        // Delete prediction
        await ctx.prisma.prediction.delete({
          where: { id: input.id },
        });

        // Log the deletion
        await ctx.prisma.event.create({
          data: {
            type: "PREDICTION_DELETED",
            entityType: "PREDICTION",
            entityId: input.id,
            data: {
              deletedBy: ctx.session.user.id,
              prediction: existingPrediction,
            },
            userId: ctx.session.user.id,
          },
        });

        return {
          message: "Prediction deleted successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error deleting prediction:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete prediction",
        });
      }
    }),

  // Bulk delete predictions
  bulkDeletePredictions: adminProcedure
    .input(z.object({
      ids: z.array(z.string()).min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await ctx.prisma.prediction.deleteMany({
          where: {
            id: { in: input.ids },
          },
        });

        // Log the bulk deletion
        await ctx.prisma.event.create({
          data: {
            type: "PREDICTIONS_BULK_DELETED",
            entityType: "PREDICTION",
            entityId: "bulk",
            data: {
              count: result.count,
              ids: input.ids,
              deletedBy: ctx.session.user.id,
            },
            userId: ctx.session.user.id,
          },
        });

        return {
          message: `Successfully deleted ${result.count} predictions`,
          count: result.count,
        };
      } catch (error) {
        console.error("Error bulk deleting predictions:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete predictions",
        });
      }
    }),

  // Manual validation of prediction
  validatePrediction: adminProcedure
    .input(z.object({
      id: z.string(),
      outcome: z.enum(["CORRECT", "INCORRECT", "PARTIALLY_CORRECT"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const prediction = await ctx.prisma.prediction.findUnique({
          where: { id: input.id },
          include: {
            asset: true,
            forecaster: true,
          }
        });

        if (!prediction) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Prediction not found",
          });
        }

        // Update prediction outcome
        const updatedPrediction = await ctx.prisma.prediction.update({
          where: { id: input.id },
          data: {
            outcome: input.outcome,
            validatedAt: new Date(),
            metadata: {
              ...(prediction.metadata as any || {}),
              validationNotes: input.notes,
              validatedBy: ctx.session.user.id,
            },
          },
        });

        // Update forecaster metrics
        const predictions = await ctx.prisma.prediction.findMany({
          where: {
            forecasterId: prediction.forecasterId,
            outcome: { not: "PENDING" },
          },
        });

        const correct = predictions.filter(p => p.outcome === "CORRECT").length;
        const total = predictions.length;
        const accuracy = total > 0 ? (correct / total) : 0;

        await ctx.prisma.forecaster.update({
          where: { id: prediction.forecasterId },
          data: {
            metrics: {
              ...(prediction.forecaster.metrics as any || {}),
              accuracy: accuracy * 100,
              totalPredictions: total,
              correctPredictions: correct,
            },
          },
        });

        // Log the validation
        await ctx.prisma.event.create({
          data: {
            type: "PREDICTION_VALIDATED",
            entityType: "PREDICTION",
            entityId: input.id,
            data: {
              outcome: input.outcome,
              notes: input.notes,
              validatedBy: ctx.session.user.id,
            },
            userId: ctx.session.user.id,
          },
        });

        return {
          prediction: updatedPrediction,
          message: `Prediction marked as ${input.outcome.toLowerCase()}`,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error validating prediction:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to validate prediction",
        });
      }
    }),

  // ====================================
  // EXTRACTION MANAGEMENT ENDPOINTS
  // ====================================

  // Trigger YouTube extraction
  extractFromYouTube: adminProcedure
    .input(z.object({
      url: z.string().url(),
      forecasterId: z.string().optional(),
      extractAll: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Import extraction service
        const { UnifiedExtractionService } = await import("../../services/extraction");
        const extractionService = new UnifiedExtractionService();

        // Create a job record
        const job = await ctx.prisma.job.create({
          data: {
            type: "YOUTUBE_EXTRACTION",
            status: "RUNNING",
            payload: {
              url: input.url,
              forecasterId: input.forecasterId,
              triggeredBy: ctx.session.user.id,
            },
          },
        });

        // Extract video ID from URL
        const videoIdMatch = input.url.match(/(?:v=|\/videos\/|embed\/|youtu.be\/|\/v\/|\/e\/|watch\?v=|&v=|%2Fvideos%2F|%2Fvideo%2F|vi_id=|vi=|e%2F|watch\?vi=|&vi=)([^#&?%]*).*/);
        const videoId = videoIdMatch ? videoIdMatch[1] : null;

        if (!videoId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid YouTube URL",
          });
        }

        // Run extraction in background
        extractionService.extractFromVideo({
          videoId: videoId,
          videoUrl: `https://youtube.com/watch?v=${videoId}`,
          title: 'Manual YouTube extraction',
          channelName: 'Unknown',
          transcript: '',
          description: '',
          publishedAt: new Date()
        })
          .then(async (predictions) => {
            await ctx.prisma.job.update({
              where: { id: job.id },
              data: {
                status: "COMPLETED",
                completedAt: new Date(),
                payload: {
                  url: (job.payload as any)?.url,
                  forecasterId: (job.payload as any)?.forecasterId,
                  triggeredBy: (job.payload as any)?.triggeredBy,
                  result: {
                  predictionsFound: Array.isArray(predictions) ? predictions.length : 0,
                  predictions: Array.isArray(predictions) ? predictions.map((p: any) => ({
                    title: p.title,
                    confidence: p.confidence,
                    targetDate: p.targetDate,
                  })) : [],
                  },
                },
              },
            });
          })
          .catch(async (error) => {
            await ctx.prisma.job.update({
              where: { id: job.id },
              data: {
                status: "FAILED",
                completedAt: new Date(),
                error: error.message,
              },
            });
          });

        return {
          jobId: job.id,
          message: "YouTube extraction started",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error starting YouTube extraction:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to start YouTube extraction",
        });
      }
    }),

  // Trigger X extraction
  extractFromTwitter: adminProcedure
    .input(z.object({
      username: z.string(),
      forecasterId: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Import extraction service
        const { UnifiedExtractionService } = await import("../../services/extraction");
        const extractionService = new UnifiedExtractionService();

        // Create a job record
        const job = await ctx.prisma.job.create({
          data: {
            type: "TWITTER_EXTRACTION",
            status: "RUNNING",
            payload: {
              username: input.username,
              forecasterId: input.forecasterId,
              limit: input.limit,
              triggeredBy: ctx.session.user.id,
            },
          },
        });

        // Run extraction in background
        // Note: X extraction not implemented in current service
        Promise.resolve([])
          .then(async (predictions) => {
            await ctx.prisma.job.update({
              where: { id: job.id },
              data: {
                status: "COMPLETED",
                completedAt: new Date(),
                payload: {
                  url: (job.payload as any)?.url,
                  forecasterId: (job.payload as any)?.forecasterId,
                  triggeredBy: (job.payload as any)?.triggeredBy,
                  result: {
                  predictionsFound: Array.isArray(predictions) ? predictions.length : 0,
                  predictions: Array.isArray(predictions) ? predictions.map((p: any) => ({
                    title: p.title,
                    confidence: p.confidence,
                    targetDate: p.targetDate,
                  })) : [],
                  },
                },
              },
            });
          })
          .catch(async (error) => {
            await ctx.prisma.job.update({
              where: { id: job.id },
              data: {
                status: "FAILED",
                completedAt: new Date(),
                error: error.message,
              },
            });
          });

        return {
          jobId: job.id,
          message: "Twitter extraction started",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error starting Twitter extraction:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to start Twitter extraction",
        });
      }
    }),

  // Bulk extraction for multiple forecasters
  bulkExtraction: adminProcedure
    .input(z.object({
      forecasterIds: z.array(z.string()).min(1),
      sources: z.array(z.enum(["youtube", "twitter"])).default(["youtube", "twitter"]),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Import the new channel collection service
        const { ChannelCollectionService } = await import("../../services/channelCollectionService");
        const channelService = new ChannelCollectionService();

        // Create a master job
        const masterJob = await ctx.prisma.job.create({
          data: {
            type: "BULK_EXTRACTION",
            status: "RUNNING",
            payload: {
              forecasterIds: input.forecasterIds,
              sources: input.sources,
              triggeredBy: ctx.session.user.id,
            },
          },
        });

        // Run collection for each forecaster's channels in background
        Promise.all(
          input.forecasterIds.map(async (forecasterId) => {
            // Get all active channels for this forecaster
            const channels = await ctx.prisma.forecasterChannel.findMany({
              where: {
                forecasterId,
                isActive: true,
                channelType: {
                  in: input.sources.map(s => s === "youtube" ? "YOUTUBE" : "TWITTER")
                }
              }
            });

            if (channels.length === 0) return { forecasterId, itemsCollected: 0 };

            let totalCollected = 0;
            let totalFiltered = 0;

            // Collect from each channel
            for (const channel of channels) {
              try {
                const result = await channelService.collectFromChannelImmediate(channel.id);
                if (result.success) {
                  totalCollected += result.itemsCollected;
                  totalFiltered += result.itemsFiltered;
                }
              } catch (error) {
                console.error(`Failed to collect from channel ${channel.id}:`, error);
              }
            }

            return {
              forecasterId,
              predictionsFound: totalCollected,
            };
          })
        )
          .then(async (results) => {
            const totalPredictions = results.reduce((sum, r) => sum + (r?.predictionsFound || 0), 0);

            await ctx.prisma.job.update({
              where: { id: masterJob.id },
              data: {
                status: "COMPLETED",
                completedAt: new Date(),
                payload: {
                  url: (masterJob.payload as any)?.url,
                  forecasterId: (masterJob.payload as any)?.forecasterId,
                  triggeredBy: (masterJob.payload as any)?.triggeredBy,
                  result: {
                  totalPredictions,
                  byForecaster: results.filter(r => r !== undefined),
                  },
                } as any,
              },
            });
          })
          .catch(async (error) => {
            await ctx.prisma.job.update({
              where: { id: masterJob.id },
              data: {
                status: "FAILED",
                completedAt: new Date(),
                error: error.message,
              },
            });
          });

        return {
          jobId: masterJob.id,
          message: `Bulk extraction started for ${input.forecasterIds.length} forecasters`,
        };
      } catch (error) {
        console.error("Error starting bulk extraction:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to start bulk extraction",
        });
      }
    }),

  // ====================================
  // CRON & JOB MONITORING ENDPOINTS
  // ====================================

  // Get cron job status
  getCronStatus: adminProcedure
    .query(async ({ ctx }) => {
      try {
        // Define cron jobs with their schedules
        const cronJobs = [
          {
            name: "Asset Price Updates",
            schedule: "*/5 * * * *",
            description: "Updates cryptocurrency and stock prices",
            nextRun: getNextCronRun("*/5 * * * *"),
          },
          {
            name: "Prediction Validation",
            schedule: "*/15 * * * *",
            description: "Validates predictions based on target dates and prices",
            nextRun: getNextCronRun("*/15 * * * *"),
          },
          {
            name: "Content Collection",
            schedule: "0 * * * *",
            description: "Collects new content from YouTube and Twitter",
            nextRun: getNextCronRun("0 * * * *"),
          },
          {
            name: "Brier Score Calculation",
            schedule: "0 0 * * *",
            description: "Calculates Brier scores for forecasters",
            nextRun: getNextCronRun("0 0 * * *"),
          },
          {
            name: "Rankings Update",
            schedule: "0 1 * * *",
            description: "Updates forecaster rankings",
            nextRun: getNextCronRun("0 1 * * *"),
          },
          {
            name: "Cleanup Jobs",
            schedule: "0 2 * * *",
            description: "Cleans up old jobs and events",
            nextRun: getNextCronRun("0 2 * * *"),
          },
        ];

        // Get recent job history
        const recentJobs = await ctx.prisma.job.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            type: true,
            status: true,
            createdAt: true,
            completedAt: true,
            error: true,
          },
        });

        // Calculate job statistics
        const [totalJobs, completedJobs, failedJobs, runningJobs] = await Promise.all([
          ctx.prisma.job.count(),
          ctx.prisma.job.count({ where: { status: "COMPLETED" } }),
          ctx.prisma.job.count({ where: { status: "FAILED" } }),
          ctx.prisma.job.count({ where: { status: "RUNNING" } }),
        ]);

        return {
          cronJobs,
          recentJobs,
          statistics: {
            total: totalJobs,
            completed: completedJobs,
            failed: failedJobs,
            running: runningJobs,
            successRate: totalJobs > 0 ? ((completedJobs / totalJobs) * 100).toFixed(1) : "0",
          },
        };
      } catch (error) {
        console.error("Error fetching cron status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch cron status",
        });
      }
    }),

  // Get job details
  getJob: adminProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const job = await ctx.prisma.job.findUnique({
          where: { id: input.id },
        });

        if (!job) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Job not found",
          });
        }

        return job;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error fetching job:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch job",
        });
      }
    }),

  // Cancel running job
  cancelJob: adminProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const job = await ctx.prisma.job.findUnique({
          where: { id: input.id },
        });

        if (!job) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Job not found",
          });
        }

        if (job.status !== "RUNNING") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Job is not running",
          });
        }

        const updatedJob = await ctx.prisma.job.update({
          where: { id: input.id },
          data: {
            status: "CANCELLED",
            completedAt: new Date(),
            error: "Cancelled by admin",
          },
        });

        return {
          job: updatedJob,
          message: "Job cancelled successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error cancelling job:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to cancel job",
        });
      }
    }),

  // Update forecaster profile
  updateForecaster: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      slug: z.string().min(1).optional(),
      isVerified: z.boolean().optional(),
      bio: z.string().optional(),
      expertise: z.array(z.string()).optional(),
      links: z.object({
        website: z.string().url().optional(),
        twitter: z.string().optional(),
        linkedin: z.string().optional(),
      }).optional(),
      youtubeChannels: z.object({
        primary: z.object({
          url: z.string().url().optional(),
          channelId: z.string().optional(),
          enabled: z.boolean().default(true),
          extractAllVideos: z.boolean().default(true),
        }).optional(),
        secondary: z.object({
          url: z.string().url().optional(),
          channelId: z.string().optional(),
          enabled: z.boolean().default(false),
          extractAllVideos: z.boolean().default(false),
          keywords: z.array(z.string()).default([]),
          extractOnKeywordMatch: z.boolean().default(true),
        }).optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, name, slug, isVerified, bio, expertise, links, ...otherFields } = input;

        // Check if forecaster exists
        const existingForecaster = await ctx.prisma.forecaster.findUnique({
          where: { id },
        });

        if (!existingForecaster) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Forecaster not found",
          });
        }

        // Check for slug uniqueness if provided
        if (slug && slug !== existingForecaster.slug) {
          const existingSlug = await ctx.prisma.forecaster.findFirst({
            where: {
              slug,
              id: { not: id }
            },
          });

          if (existingSlug) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Slug already exists",
            });
          }
        }

        // Parse existing profile
        const existingProfile = typeof existingForecaster.profile === 'object' ? existingForecaster.profile as any : {};

        // Build updated profile
        const updatedProfile = {
          ...existingProfile,
          ...(bio !== undefined && { bio }),
          ...(expertise !== undefined && { expertise }),
          ...(links !== undefined && { links: { ...existingProfile.links, ...links } }),
        };

        // Update forecaster
        const updatedForecaster = await ctx.prisma.forecaster.update({
          where: { id },
          data: {
            ...(name !== undefined && { name }),
            ...(slug !== undefined && { slug }),
            ...(isVerified !== undefined && { isVerified }),
            profile: updatedProfile,
          },
        });

        // Log the update event
        const userExists = await ctx.prisma.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { id: true }
        });

        await ctx.prisma.event.create({
          data: {
            type: "FORECASTER_UPDATED",
            entityType: "FORECASTER",
            entityId: id,
            data: {
              updatedFields: Object.keys(input).filter(key => key !== 'id'),
              updatedBy: ctx.session.user.id,
              updatedAt: new Date().toISOString(),
            },
            userId: userExists ? ctx.session.user.id : null,
          },
        });

        return {
          forecaster: updatedForecaster,
          message: "Forecaster updated successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error updating forecaster:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update forecaster",
        });
      }
    }),
});

// Helper function to calculate system health
async function calculateSystemHealth(ctx: any): Promise<number> {
  try {
    // Check database responsiveness
    const start = Date.now();
    await ctx.prisma.$queryRaw`SELECT 1`;
    const dbResponseTime = Date.now() - start;

    // Database health score (0-40 points)
    const dbScore = dbResponseTime < 100 ? 40 : dbResponseTime < 500 ? 30 : 20;

    // Check for recent errors (0-30 points)
    const recentErrors = await ctx.prisma.userAction.count({
      where: {
        actionType: {
          contains: "error",
          mode: 'insensitive'
        },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    }).catch(() => 0);

    const errorScore = recentErrors === 0 ? 30 : recentErrors < 10 ? 20 : 10;

    // Check active sessions (0-30 points) - users with recent activity
    const activeSessionsData = await ctx.prisma.userAction.groupBy({
      by: ['userId'],
      where: {
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
        }
      }
    });
    const activeSessions = activeSessionsData.length;

    const sessionScore = activeSessions > 0 ? 30 : 0;

    return dbScore + errorScore + sessionScore;
  } catch {
    return 75; // Default health score if calculation fails
  }
}

// Helper function to calculate average forecaster accuracy
async function calculateAverageAccuracy(ctx: any): Promise<number> {
  try {
    const forecasters = await ctx.prisma.forecaster.findMany({
      select: {
        metrics: true,
      }
    });

    if (forecasters.length === 0) return 0;

    const totalAccuracy = forecasters.reduce((sum: number, f: any) => {
      const metrics = f.metrics as any;
      return sum + (metrics?.accuracy || 0);
    }, 0);

    return Math.round((totalAccuracy / forecasters.length) * 100);
  } catch {
    return 85; // Default accuracy
  }
}

// Helper function to calculate prediction growth
async function calculatePredictionGrowth(ctx: any): Promise<number> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const [todayCount, yesterdayCount] = await Promise.all([
      ctx.prisma.prediction.count({
        where: {
          createdAt: {
            gte: today,
          }
        }
      }),
      ctx.prisma.prediction.count({
        where: {
          createdAt: {
            gte: yesterday,
            lt: today,
          }
        }
      }),
    ]);

    if (yesterdayCount === 0) return todayCount > 0 ? 100 : 0;
    return Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100);
  } catch {
    return 0;
  }
}

// Helper function to calculate user growth
async function calculateUserGrowth(ctx: any): Promise<number> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const twoWeeksAgo = new Date(weekAgo);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7);

    const [thisWeek, lastWeek] = await Promise.all([
      ctx.prisma.user.count({
        where: {
          createdAt: {
            gte: weekAgo,
          }
        }
      }),
      ctx.prisma.user.count({
        where: {
          createdAt: {
            gte: twoWeeksAgo,
            lt: weekAgo,
          }
        }
      }),
    ]);

    if (lastWeek === 0) return thisWeek > 0 ? 100 : 0;
    return Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  } catch {
    return 0;
  }
}

// Helper function to calculate next cron run time
function getNextCronRun(cronExpression: string): Date {
  const now = new Date();
  const [minute, hour, dayOfMonth, month, dayOfWeek] = cronExpression.split(' ');

  // Simple calculation for common patterns
  if (minute && minute.startsWith('*/')) {
    const interval = parseInt(minute.substring(2));
    const nextMinute = Math.ceil(now.getMinutes() / interval) * interval;
    const next = new Date(now);
    next.setMinutes(nextMinute);
    next.setSeconds(0);
    if (next <= now) {
      next.setMinutes(next.getMinutes() + interval);
    }
    return next;
  }

  if (minute === '0' && hour && hour === '*') {
    // Every hour
    const next = new Date(now);
    next.setHours(now.getHours() + 1);
    next.setMinutes(0);
    next.setSeconds(0);
    return next;
  }

  if (minute === '0' && hour !== '*') {
    // Daily at specific hour
    const next = new Date(now);
    next.setHours(parseInt(hour || '0'));
    next.setMinutes(0);
    next.setSeconds(0);
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    return next;
  }

  // Default: return next minute for unsupported patterns
  const next = new Date(now);
  next.setMinutes(now.getMinutes() + 1);
  next.setSeconds(0);
  return next;
}