import nodemailer from "nodemailer";
import { prisma } from "../db";

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure email transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  // Email Templates (made public getter to access templates)
  public get templates() {
    return {
    welcome: (name: string): EmailTemplate => ({
      subject: "Welcome to Prediction Prism Analytics!",
      html: `
        <h1>Welcome ${name}!</h1>
        <p>Thank you for joining Prediction Prism Analytics. We're excited to have you on board!</p>
        <p>Start exploring market predictions from top forecasters and track their accuracy.</p>
        <a href="${process.env.NEXT_PUBLIC_URL}/dashboard">Go to Dashboard</a>
      `,
      text: `Welcome ${name}! Thank you for joining Prediction Prism Analytics.`,
    }),

    passwordReset: (name: string, resetLink: string): EmailTemplate => ({
      subject: "Reset Your Password",
      html: `
        <h1>Password Reset Request</h1>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the link below to reset it:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
      text: `Hi ${name}, Reset your password here: ${resetLink}`,
    }),

    predictionAlert: (prediction: any): EmailTemplate => ({
      subject: `New Prediction: ${prediction.asset} by ${prediction.forecaster}`,
      html: `
        <h2>New Prediction Alert</h2>
        <p><strong>Forecaster:</strong> ${prediction.forecaster}</p>
        <p><strong>Asset:</strong> ${prediction.asset}</p>
        <p><strong>Prediction:</strong> ${prediction.text}</p>
        <p><strong>Target Price:</strong> $${prediction.targetPrice}</p>
        <p><strong>Confidence:</strong> ${Math.round(Number(prediction.confidence || 0) * 100)}%</p>
        <a href="${process.env.NEXT_PUBLIC_URL}/predictions/${prediction.id}">View Prediction</a>
      `,
      text: `New prediction for ${prediction.asset} by ${prediction.forecaster}: ${prediction.text}`,
    }),

    subscriptionRenewal: (name: string, plan: string, nextBilling: string): EmailTemplate => ({
      subject: "Subscription Renewal Confirmation",
      html: `
        <h1>Subscription Renewed</h1>
        <p>Hi ${name},</p>
        <p>Your ${plan} subscription has been renewed successfully.</p>
        <p>Next billing date: ${nextBilling}</p>
        <a href="${process.env.NEXT_PUBLIC_URL}/settings/billing">Manage Subscription</a>
      `,
      text: `Hi ${name}, Your ${plan} subscription has been renewed. Next billing: ${nextBilling}`,
    }),

    validationComplete: (prediction: any): EmailTemplate => ({
      subject: `Prediction Validated: ${prediction.outcome}`,
      html: `
        <h2>Prediction Validation Complete</h2>
        <p>Your prediction has been validated!</p>
        <p><strong>Prediction:</strong> ${prediction.text}</p>
        <p><strong>Outcome:</strong> ${prediction.outcome}</p>
        <p><strong>Target Price:</strong> $${prediction.targetPrice}</p>
        <p><strong>Actual Price:</strong> $${prediction.actualPrice}</p>
        <a href="${process.env.NEXT_PUBLIC_URL}/predictions/${prediction.id}">View Details</a>
      `,
      text: `Prediction validated: ${prediction.outcome}. ${prediction.text}`,
    }),

    weeklyDigest: (userData: any): EmailTemplate => ({
      subject: "Your Weekly Prediction Digest",
      html: `
        <h1>Weekly Digest</h1>
        <h2>Top Predictions This Week</h2>
        <ul>
          ${userData.predictions.map((p: any) => `
            <li>${p.asset} - ${p.forecaster}: ${p.text}</li>
          `).join("")}
        </ul>
        <h2>Top Performing Forecasters</h2>
        <ul>
          ${userData.forecasters.map((f: any) => `
            <li>${f.name} - ${f.accuracy}% accuracy</li>
          `).join("")}
        </ul>
        <a href="${process.env.NEXT_PUBLIC_URL}/dashboard">View Full Dashboard</a>
      `,
      text: "Check out this week's top predictions and forecasters.",
    }),
    };
  }

  // Send Email (overloaded to support both signatures)
  async sendEmail(toOrOptions: string | { to: string; subject: string; html: string; text: string }, template?: EmailTemplate) {
    try {
      let mailOptions;

      if (typeof toOrOptions === 'string' && template) {
        // Called with (to, template)
        mailOptions = {
          from: process.env.SMTP_FROM || "noreply@predictionprism.com",
          to: toOrOptions,
          subject: template.subject,
          text: template.text,
          html: template.html,
        };
      } else if (typeof toOrOptions === 'object') {
        // Called with options object (used by auth and contact routers)
        mailOptions = {
          from: process.env.SMTP_FROM || "noreply@predictionprism.com",
          ...toOrOptions,
        };
      } else {
        throw new Error('Invalid sendEmail parameters');
      }

      const info = await this.transporter.sendMail(mailOptions);

      // Log email sent
      await prisma.event.create({
        data: {
          type: "EMAIL_SENT",
          entityType: "EMAIL",
          entityId: info.messageId,
          data: {
            to: mailOptions.to,
            subject: mailOptions.subject,
            timestamp: new Date().toISOString(),
          },
        },
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Email send error:", error);

      // Log email failure
      const toAddress = typeof toOrOptions === 'string' ? toOrOptions : toOrOptions.to;
      const subject = typeof toOrOptions === 'string' && template ? template.subject : (toOrOptions as any).subject;

      await prisma.event.create({
        data: {
          type: "EMAIL_FAILED",
          entityType: "EMAIL",
          entityId: "failed",
          data: {
            to: toAddress,
            subject: subject,
            error: (error as Error).message,
            timestamp: new Date().toISOString(),
          },
        },
      });

      return { success: false, error: (error as Error).message };
    }
  }

  // Public methods for specific email types
  async sendWelcomeEmail(email: string, name: string) {
    return this.sendEmail(email, this.templates.welcome(name));
  }

  async sendPasswordResetEmail(email: string, name: string, resetToken: string) {
    const resetLink = `${process.env.NEXT_PUBLIC_URL}/auth/reset-password?token=${resetToken}`;
    return this.sendEmail(email, this.templates.passwordReset(name, resetLink));
  }

  async sendPredictionAlert(email: string, prediction: any) {
    return this.sendEmail(email, this.templates.predictionAlert(prediction));
  }

  async sendSubscriptionRenewal(email: string, name: string, plan: string, nextBilling: Date) {
    return this.sendEmail(
      email,
      this.templates.subscriptionRenewal(name, plan, nextBilling.toLocaleDateString())
    );
  }

  async sendValidationComplete(email: string, prediction: any) {
    return this.sendEmail(email, this.templates.validationComplete(prediction));
  }

  async sendWeeklyDigest(email: string, userData: any) {
    return this.sendEmail(email, this.templates.weeklyDigest(userData));
  }

  // Bulk email sending
  async sendBulkEmails(recipients: string[], template: EmailTemplate) {
    const results = [];

    for (const email of recipients) {
      try {
        const result = await this.sendEmail(email, template);
        results.push({ email, ...result });
      } catch (error) {
        results.push({ email, success: false, error: (error as Error).message });
      }
    }

    return results;
  }

  // Send notification to users based on preferences
  async sendNotification(userId: string, type: string, data: any) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return;

    const settings = (user.settings as any) || {};
    const notifications = settings.notifications || {};

    // Check if user wants this type of notification
    if (!notifications.email) return;

    switch (type) {
      case "PREDICTION_ALERT":
        if (notifications.predictions) {
          await this.sendPredictionAlert(user.email, data);
        }
        break;

      case "VALIDATION_COMPLETE":
        if (notifications.validations) {
          await this.sendValidationComplete(user.email, data);
        }
        break;

      case "WEEKLY_DIGEST":
        if (notifications.digest) {
          await this.sendWeeklyDigest(user.email, data);
        }
        break;
    }
  }

  // Queue emails for batch sending
  async queueEmail(to: string, type: string, data: any, scheduledFor?: Date) {
    await prisma.job.create({
      data: {
        type: "SEND_EMAIL",
        status: "PENDING",
        payload: { to, type, data },
        scheduledFor: scheduledFor || new Date(),
      },
    });
  }

  // Process email queue
  async processEmailQueue() {
    const jobs = await prisma.job.findMany({
      where: {
        type: "SEND_EMAIL",
        status: "PENDING",
        scheduledFor: { lte: new Date() },
      },
      take: 50, // Process 50 emails at a time
    });

    for (const job of jobs) {
      try {
        const { to, type, data } = job.payload as any;

        // Send email based on type
        let result;
        switch (type) {
          case "welcome":
            result = await this.sendWelcomeEmail(to, data.name);
            break;
          case "passwordReset":
            result = await this.sendPasswordResetEmail(to, data.name, data.token);
            break;
          case "predictionAlert":
            result = await this.sendPredictionAlert(to, data);
            break;
          // Add more cases as needed
        }

        // Update job status
        await prisma.job.update({
          where: { id: job.id },
          data: {
            status: result?.success ? "COMPLETED" : "FAILED",
            completedAt: result?.success ? new Date() : null,
            error: result?.success ? null : result?.error || "Email processing failed",
          },
        });
      } catch (error) {
        console.error(`Failed to process email job ${job.id}:`, error);

        await prisma.job.update({
          where: { id: job.id },
          data: {
            status: "FAILED",
            error: (error as Error).message,
            attempts: (job.attempts || 0) + 1,
          },
        });
      }
    }
  }
}