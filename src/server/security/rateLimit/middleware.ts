/**
 * Rate Limiting Middleware for tRPC
 *
 * Applies rate limiting to tRPC procedures based on client IP and operation type.
 * Integrates with SecurityLogger for violation tracking.
 */

import { TRPCError } from '@trpc/server';
import { securityConfig } from '../config';
import { securityLogger } from '../logging/SecurityLogger';
import { getRateLimiter } from './RateLimiter';
import type { RateLimitContext, RateLimitStrategies } from './types';

/**
 * Extract IP address from request
 */
function getIpAddress(req: any): string {
  return (
    (req?.headers?.['x-forwarded-for'] as string) ||
    (req?.headers?.['x-real-ip'] as string) ||
    req?.socket?.remoteAddress ||
    'unknown'
  );
}

/**
 * Determine which rate limit strategy to use for this request
 */
function getStrategy(
  path: string,
  type: 'query' | 'mutation' | 'subscription',
  isAdmin: boolean,
  ctx: any
): keyof RateLimitStrategies {
  // AI extraction endpoints (highest restriction)
  if (path.includes('extract') || path.includes('ai')) {
    return 'aiExtraction';
  }

  // Admin operations
  if (isAdmin) {
    return 'admin';
  }

  // Auth operations
  if (path.includes('auth') || path.includes('login') || path.includes('register')) {
    return 'auth';
  }

  // Mutations (state-changing operations)
  if (type === 'mutation') {
    return 'mutations';
  }

  // Queries (read-only operations)
  return 'queries';
}

/**
 * Create rate limiting middleware for tRPC
 *
 * Usage:
 * ```typescript
 * import { createRateLimitMiddleware } from '@/server/security';
 *
 * const rateLimitProtection = createRateLimitMiddleware(t);
 *
 * export const publicProcedure = t.procedure.use(rateLimitProtection);
 * export const protectedProcedure = t.procedure
 *   .use(enforceUserIsAuthed)
 *   .use(rateLimitProtection);
 * ```
 */
export const createRateLimitMiddleware = (t: any) => {
  return t.middleware(async ({ ctx, next, path, type }: any) => {
    // Skip if rate limiting is disabled
    if (!securityConfig.rateLimiting.enabled) {
      return next();
    }

    const req = ctx.req;
    const ipAddress = getIpAddress(req);
    const userId = ctx.session?.user?.id;
    const userAgent = req?.headers?.['user-agent'];
    const isAdmin = ctx.session?.user?.role === 'ADMIN';

    // Determine client ID for rate limiting
    // Use user ID if available and config allows, otherwise use IP
    const clientId =
      securityConfig.rateLimiting.limitByUser && userId
        ? `user:${userId}`
        : `ip:${ipAddress}`;

    // Determine which strategy to use
    const strategyName = getStrategy(path, type, isAdmin, ctx);
    const strategy = securityConfig.rateLimiting.strategies[strategyName];

    // Get rate limiter instance
    const rateLimiter = getRateLimiter(securityConfig.rateLimiting);

    // Check rate limit
    const result = rateLimiter.check(clientId, strategy);

    // If rate limit exceeded, log and throw error
    if (!result.allowed) {
      // Log rate limit violation
      await securityLogger.logRateLimitExceeded(
        ipAddress,
        path,
        strategy.limit,
        strategy.window
      );

      // Log detailed event
      await securityLogger.log({
        type: 'RATE_LIMIT_EXCEEDED',
        severity: 'HIGH',
        category: 'RATE_LIMIT',
        userId,
        ipAddress,
        userAgent,
        action: 'rate_limit_exceeded',
        resource: path,
        method: req?.method || 'UNKNOWN',
        path: `/api/trpc/${path}`,
        success: false,
        metadata: {
          reason: result.reason,
          current: result.current,
          limit: result.limit,
          resetIn: result.resetIn,
          retryAfter: result.retryAfter,
          strategy: strategyName,
          clientId,
          blockedUntil: result.reason === 'blocked' ? Date.now() + result.resetIn : undefined,
        },
      });

      // Throw rate limit error
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
      });
    }

    // Log successful request for monitoring (optional, only in development)
    if (process.env.NODE_ENV === 'development' && result.current > strategy.limit * 0.8) {
      console.warn('[RateLimit] Approaching limit:', {
        clientId,
        path,
        current: result.current,
        limit: result.limit,
        percentage: Math.round((result.current / result.limit) * 100),
      });
    }

    // Set rate limit headers (for client visibility)
    if (ctx.res) {
      ctx.res.setHeader('X-RateLimit-Limit', strategy.limit.toString());
      ctx.res.setHeader('X-RateLimit-Remaining', Math.max(0, strategy.limit - result.current).toString());
      ctx.res.setHeader('X-RateLimit-Reset', new Date(Date.now() + result.resetIn).toISOString());
    }

    return next();
  });
};

/**
 * Rate limit middleware instance (for convenience)
 */
export const rateLimitMiddleware = createRateLimitMiddleware;
