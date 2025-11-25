/**
 * Security Logging Middleware for tRPC
 *
 * Logs all API requests, errors, and suspicious activity.
 */

import { TRPCError } from '@trpc/server';
import { securityLogger } from './SecurityLogger';
import { alertManager } from './AlertManager';
import { securityConfig } from '../config';
import type { SecurityEventData } from './types';

/**
 * Create security logging middleware for tRPC
 */
export const createSecurityLoggingMiddleware = (t: any) => {
  return t.middleware(async ({ ctx, next, path, type }: any) => {
    // Skip if logging disabled
    if (!securityConfig.features.logging) {
      return next();
    }

    const startTime = Date.now();
    const correlationId = generateCorrelationId();

    // Extract request metadata
    const ipAddress = getIpAddress(ctx);
    const userAgent = ctx.req?.headers['user-agent'];
    const method = ctx.req?.method || 'UNKNOWN';
    const userId = ctx.session?.user?.id;

    try {
      // Execute the procedure
      const result = await next();

      // Calculate duration
      const duration = Date.now() - startTime;

      // Log successful request (only if slow or important)
      if (duration > 3000 || type === 'mutation') {
        await securityLogger.logApiRequest(
          `/api/trpc/${path}`,
          method,
          200,
          duration,
          userId,
          ipAddress
        );
      }

      return result;
    } catch (error) {
      // Calculate duration
      const duration = Date.now() - startTime;

      // Determine error type and severity
      const isAuthError = error instanceof TRPCError &&
        (error.code === 'UNAUTHORIZED' || error.code === 'FORBIDDEN');

      const statusCode = error instanceof TRPCError ? getStatusCodeFromTRPCError(error) : 500;

      // Create security event
      const event: SecurityEventData = {
        type: isAuthError ? 'UNAUTHORIZED_ACCESS' : 'API_ERROR',
        severity: statusCode >= 500 ? 'HIGH' : 'MEDIUM',
        category: isAuthError ? 'AUTH' : 'API_ACCESS',
        userId,
        ipAddress,
        userAgent,
        action: `${type}_${path}`,
        resource: path,
        method,
        statusCode,
        timestamp: new Date(),
        duration,
        path: `/api/trpc/${path}`,
        endpoint: path,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        stackTrace: error instanceof Error ? error.stack : undefined,
        correlationId,
      };

      // Log the error
      await securityLogger.log(event);

      // Check if alert should be triggered
      await alertManager.checkAlert(event);

      // Re-throw the error
      throw error;
    }
  });
};

/**
 * Helper: Get IP address from context
 */
function getIpAddress(ctx: any): string {
  // Check various headers for real IP
  const forwarded = ctx.req?.headers['x-forwarded-for'];
  if (forwarded) {
    return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
  }

  const realIp = ctx.req?.headers['x-real-ip'];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }

  // Fallback to socket address
  return ctx.req?.socket?.remoteAddress || 'unknown';
}

/**
 * Helper: Get HTTP status code from tRPC error
 */
function getStatusCodeFromTRPCError(error: TRPCError): number {
  const codeToStatus: Record<string, number> = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    TIMEOUT: 408,
    CONFLICT: 409,
    PRECONDITION_FAILED: 412,
    PAYLOAD_TOO_LARGE: 413,
    TOO_MANY_REQUESTS: 429,
    CLIENT_CLOSED_REQUEST: 499,
    INTERNAL_SERVER_ERROR: 500,
  };

  return codeToStatus[error.code] || 500;
}

/**
 * Helper: Generate correlation ID
 */
function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
}
