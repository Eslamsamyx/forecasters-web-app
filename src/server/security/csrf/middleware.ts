/**
 * CSRF Protection Middleware for tRPC
 *
 * Validates CSRF tokens and request origins for mutation operations.
 * Integrates with NextAuth CSRF tokens and SecurityLogger.
 */

import { TRPCError } from '@trpc/server';
import { securityConfig } from '../config';
import { securityLogger } from '../logging/SecurityLogger';
import type { CSRFValidationContext } from './types';
import {
  validateCsrf,
  getCsrfTokenFromCookies,
  getCsrfErrorMessage,
} from './validator';

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
 * Create CSRF protection middleware for tRPC
 *
 * Usage:
 * ```typescript
 * import { createCsrfMiddleware } from '@/server/security';
 *
 * const csrfProtection = createCsrfMiddleware(t);
 *
 * export const protectedProcedure = t.procedure
 *   .use(enforceUserIsAuthed)
 *   .use(csrfProtection);
 * ```
 */
export const createCsrfMiddleware = (t: any) => {
  return t.middleware(async ({ ctx, next, path, type }: any) => {
    // Skip if CSRF protection is disabled
    if (!securityConfig.csrf.enabled) {
      return next();
    }

    const req = ctx.req;
    const ipAddress = getIpAddress(req);
    const userAgent = req?.headers?.['user-agent'];
    const userId = ctx.session?.user?.id;

    // Build validation context
    const validationContext: CSRFValidationContext = {
      origin: req?.headers?.origin || null,
      referer: req?.headers?.referer || req?.headers?.referrer || null,
      csrfCookie: getCsrfTokenFromCookies(req?.cookies || {}),
      csrfHeader: req?.headers?.['x-csrf-token'] || null,
      hasSession: !!ctx.session?.user,
      procedureType: type as 'query' | 'mutation' | 'subscription',
      path: path || 'unknown',
      method: req?.method || 'UNKNOWN',
    };

    // Perform CSRF validation
    const validationResult = validateCsrf(
      validationContext,
      securityConfig.csrf
    );

    // If validation passed or was skipped, continue
    if (validationResult.valid) {
      // Log skipped validations for monitoring
      if (validationResult.reason === 'validation_skipped') {
        // Only log in development for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log('[CSRF] Validation skipped:', {
            path,
            type,
            hasSession: validationContext.hasSession,
          });
        }
      }

      return next();
    }

    // Validation failed - log the violation
    await securityLogger.logCsrfViolation(
      ipAddress,
      path,
      getCsrfErrorMessage(validationResult),
      userId
    );

    // Log additional details for analysis
    await securityLogger.log({
      type: 'CSRF_VIOLATION',
      severity: 'HIGH',
      category: 'CSRF',
      userId,
      ipAddress,
      userAgent,
      action: 'csrf_validation_failed',
      resource: path,
      method: validationContext.method,
      path: `/api/trpc/${path}`,
      success: false,
      metadata: {
        reason: validationResult.reason,
        origin: validationContext.origin,
        referer: validationContext.referer,
        hasSession: validationContext.hasSession,
        procedureType: validationContext.procedureType,
        hasCsrfCookie: !!validationContext.csrfCookie,
        hasCsrfHeader: !!validationContext.csrfHeader,
        expectedOrigins: securityConfig.csrf.allowedOrigins,
      },
    });

    // Throw CSRF error
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: getCsrfErrorMessage(validationResult),
    });
  });
};

/**
 * CSRF middleware instance (for convenience)
 *
 * Note: This requires tRPC instance to be passed.
 * Use createCsrfMiddleware(t) in your tRPC setup.
 */
export const csrfMiddleware = createCsrfMiddleware;
