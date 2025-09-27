import { z } from "zod";
import bcrypt from "bcryptjs";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "../trpc";
import { TRPCError } from "@trpc/server";

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        fullName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { email, password, fullName } = input;

      const exists = await ctx.prisma.user.findUnique({
        where: { email },
      });

      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists",
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await ctx.prisma.user.create({
        data: {
          email,
          passwordHash,
          fullName,
          role: "FREE",
          settings: {
            notifications: { email: true, push: false },
            theme: "light",
            timezone: "UTC",
          },
          subscription: {
            tier: "FREE",
            stripeCustomerId: null,
            expiresAt: null,
          },
        },
        select: {
          id: true,
          email: true,
          role: true,
          fullName: true,
          createdAt: true,
        },
      });

      return {
        success: true,
        user,
      };
    }),

  getMe: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        avatarUrl: true,
        bio: true,
        settings: true,
        subscription: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return user;
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        fullName: z.string().optional(),
        bio: z.string().optional(),
        avatarUrl: z.string().url().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: input,
        select: {
          id: true,
          email: true,
          fullName: true,
          bio: true,
          avatarUrl: true,
          updatedAt: true,
        },
      });

      return user;
    }),

  updateSettings: protectedProcedure
    .input(
      z.object({
        notifications: z
          .object({
            email: z.boolean().optional(),
            push: z.boolean().optional(),
          })
          .optional(),
        theme: z.enum(["light", "dark"]).optional(),
        timezone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const currentUser = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { settings: true },
      });

      if (!currentUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const currentSettings = currentUser.settings as any;
      const updatedSettings = {
        ...currentSettings,
        ...input,
        notifications: {
          ...currentSettings.notifications,
          ...input.notifications,
        },
      };

      const user = await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          settings: updatedSettings,
        },
        select: {
          id: true,
          settings: true,
          updatedAt: true,
        },
      });

      return user;
    }),

  deleteAccount: protectedProcedure
    .input(
      z.object({
        confirmPassword: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user || !user.passwordHash) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const isValid = await bcrypt.compare(
        input.confirmPassword,
        user.passwordHash
      );

      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid password",
        });
      }

      await ctx.prisma.user.delete({
        where: { id: ctx.session.user.id },
      });

      return { success: true };
    }),

  forgotPassword: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { email } = input;

      const user = await ctx.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          fullName: true,
        },
      });

      // Always return success even if user doesn't exist (security best practice)
      if (!user) {
        return {
          success: true,
          message: "If an account exists with this email, you will receive password reset instructions.",
        };
      }

      // Generate reset token
      const resetToken = await bcrypt.hash(
        `${user.id}-${Date.now()}-${Math.random()}`,
        10
      );
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      // Store reset token in user's settings
      const currentSettings = await ctx.prisma.user.findUnique({
        where: { id: user.id },
        select: { settings: true },
      });

      const updatedSettings = {
        ...(currentSettings?.settings as any || {}),
        resetToken,
        resetTokenExpiry: resetTokenExpiry.toISOString(),
      };

      await ctx.prisma.user.update({
        where: { id: user.id },
        data: { settings: updatedSettings },
      });

      // Send reset email
      const { EmailService } = await import("../../services/email");
      const emailService = new EmailService();
      const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${encodeURIComponent(resetToken)}`;

      await emailService.sendEmail({
        to: user.email,
        ...emailService.templates.passwordReset(user.fullName || "User", resetLink),
      });

      // Log the event
      await ctx.prisma.event.create({
        data: {
          type: "PASSWORD_RESET_REQUEST",
          entityType: "USER",
          entityId: user.id,
          data: {
            email: user.email,
            timestamp: new Date().toISOString(),
          },
        },
      });

      return {
        success: true,
        message: "If an account exists with this email, you will receive password reset instructions.",
      };
    }),

  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        newPassword: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { token, newPassword } = input;

      // Find user with matching reset token
      const users = await ctx.prisma.user.findMany({
        where: {
          settings: {
            path: ["resetToken"],
            equals: token,
          },
        },
      });

      if (!users.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired reset token",
        });
      }

      const user = users[0];
      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired reset token",
        });
      }

      const settings = user.settings as any;

      // Check if token is expired
      if (!settings.resetTokenExpiry || new Date(settings.resetTokenExpiry) < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Reset token has expired",
        });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Remove reset token and update password
      const { resetToken, resetTokenExpiry, ...cleanSettings } = settings;

      await ctx.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          settings: cleanSettings,
        },
      });

      // Log the event
      await ctx.prisma.event.create({
        data: {
          type: "PASSWORD_RESET_COMPLETE",
          entityType: "USER",
          entityId: user.id,
          data: {
            timestamp: new Date().toISOString(),
          },
        },
      });

      return {
        success: true,
        message: "Your password has been reset successfully. You can now sign in with your new password.",
      };
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { currentPassword, newPassword } = input;

      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user || !user.passwordHash) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);

      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Current password is incorrect",
        });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      await ctx.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });

      // Log the event
      await ctx.prisma.event.create({
        data: {
          type: "PASSWORD_CHANGED",
          entityType: "USER",
          entityId: user.id,
          data: {
            timestamp: new Date().toISOString(),
          },
        },
      });

      return {
        success: true,
        message: "Your password has been changed successfully.",
      };
    }),
});