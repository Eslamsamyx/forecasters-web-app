import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { EmailService } from "../../services/email";

export const contactRouter = createTRPCRouter({
  submit: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email address"),
        subject: z.string().min(1, "Subject is required"),
        message: z.string().min(10, "Message must be at least 10 characters"),
        type: z.enum(["general", "support", "business", "feedback"]).default("general"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, email, subject, message, type } = input;

      try {
        // Store contact submission in database
        const contact = await ctx.prisma.event.create({
          data: {
            type: "CONTACT_FORM",
            entityType: "CONTACT",
            data: {
              name,
              email,
              subject,
              message,
              type,
              timestamp: new Date().toISOString(),
            },
            ipAddress: "unknown", // IP address not available in tRPC context
          },
        });

        // Send email notification to admin
        const emailService = new EmailService();

        // Send to admin
        await emailService.sendEmail({
          to: process.env.ADMIN_EMAIL || "admin@predictionprism.com",
          subject: `New Contact Form: ${subject}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Type:</strong> ${type}</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
            <hr>
            <p><small>Submitted at: ${new Date().toISOString()}</small></p>
          `,
          text: `New contact from ${name} (${email}): ${message}`,
        });

        // Send confirmation to user
        await emailService.sendEmail({
          to: email,
          subject: "We've received your message",
          html: `
            <h2>Thank you for contacting us!</h2>
            <p>Hi ${name},</p>
            <p>We've received your message and will get back to you within 24-48 hours.</p>
            <p><strong>Your message:</strong></p>
            <blockquote style="border-left: 3px solid #ccc; padding-left: 10px; margin: 10px 0;">
              ${message}
            </blockquote>
            <p>Best regards,<br>The Prediction Prism Team</p>
          `,
          text: `Hi ${name}, We've received your message and will get back to you soon. Your message: ${message}`,
        });

        return {
          success: true,
          message: "Your message has been sent successfully. We'll get back to you soon!",
          contactId: contact.id,
        };
      } catch (error) {
        console.error("Contact form error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit contact form. Please try again later.",
        });
      }
    }),

  // Admin endpoint to get contact submissions
  getContactSubmissions: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        type: z.enum(["all", "general", "support", "business", "feedback"]).default("all"),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      });

      if (user?.role !== "ADMIN") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only admins can view contact submissions",
        });
      }

      const where = {
        type: "CONTACT_FORM",
        ...(input.type !== "all" && {
          data: {
            path: ["type"],
            equals: input.type,
          },
        }),
      };

      const [submissions, total] = await Promise.all([
        ctx.prisma.event.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.prisma.event.count({ where }),
      ]);

      return {
        submissions: submissions.map(sub => ({
          id: sub.id,
          data: sub.data as any,
          createdAt: sub.createdAt,
          ipAddress: sub.ipAddress,
        })),
        total,
        hasMore: input.offset + submissions.length < total,
      };
    }),
});