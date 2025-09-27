import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    NEXTAUTH_SECRET: z.string().min(1),
    NEXTAUTH_URL: z.string().url().optional(),
    GOOGLE_API_KEY: z.string().min(1),
    OPENAI_API_KEY: z.string().min(1),
    RAPIDAPI_KEY: z.string().min(1),
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
    // Email configuration
    SMTP_HOST: z.string().min(1).optional(),
    SMTP_PORT: z.string().regex(/^\d+$/).optional(),
    SMTP_USER: z.string().min(1).optional(),
    SMTP_PASSWORD: z.string().min(1).optional(),
    SMTP_FROM: z.string().email().optional(),
    ADMIN_EMAIL: z.string().email().optional(),
    // Public URL for emails
    NEXT_PUBLIC_URL: z.string().url().optional(),
  },
  client: {
    // Add client-side env variables here
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    RAPIDAPI_KEY: process.env.RAPIDAPI_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    // Email configuration
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_FROM: process.env.SMTP_FROM,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    // Public URL for emails
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});