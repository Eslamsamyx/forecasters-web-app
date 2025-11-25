/**
 * Security Logger
 *
 * Async batch logger for security events with fallback mechanisms.
 * Buffers events and writes to database in batches for performance.
 */

import { prisma } from '../../db';
import { securityConfig } from '../config';
import type {
  SecurityEventData,
  SecurityLoggerStats,
  SecurityEventType,
} from './types';
import * as fs from 'fs';
import * as path from 'path';

export class SecurityLogger {
  private buffer: SecurityEventData[] = [];
  private stats: SecurityLoggerStats = {
    totalEvents: 0,
    eventsInBuffer: 0,
    lastFlushTime: null,
    failedWrites: 0,
    alertsSent: 0,
  };
  private flushTimer: NodeJS.Timeout | null = null;
  private isFlushing: boolean = false;

  constructor() {
    // Start periodic flush
    this.startPeriodicFlush();

    // Graceful shutdown handler
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }

  /**
   * Log a security event
   */
  async log(event: SecurityEventData): Promise<void> {
    try {
      // Add timestamp if not provided
      if (!event.timestamp) {
        event.timestamp = new Date();
      }

      // Generate correlation ID if not provided
      if (!event.correlationId) {
        event.correlationId = this.generateCorrelationId();
      }

      // Add to buffer
      this.buffer.push(event);
      this.stats.totalEvents++;
      this.stats.eventsInBuffer = this.buffer.length;

      // Flush if buffer is full
      if (this.buffer.length >= securityConfig.logging.batchSize) {
        await this.flush();
      }
    } catch (error) {
      console.error('[SecurityLogger] Failed to log event:', error);
      this.fallbackLog(event);
    }
  }

  /**
   * Log authentication success
   */
  async logAuthSuccess(userId: string, ipAddress: string, userAgent?: string): Promise<void> {
    await this.log({
      type: 'AUTH_SUCCESS',
      severity: 'LOW',
      category: 'AUTH',
      userId,
      ipAddress,
      userAgent,
      action: 'login',
      resource: 'auth',
      method: 'POST',
      path: '/api/trpc/auth.signin',
      success: true,
    });
  }

  /**
   * Log authentication failure
   */
  async logAuthFailure(
    email: string,
    ipAddress: string,
    reason: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      type: 'AUTH_FAILURE',
      severity: 'MEDIUM',
      category: 'AUTH',
      ipAddress,
      userAgent,
      action: 'login_attempt',
      resource: 'auth',
      method: 'POST',
      path: '/api/trpc/auth.signin',
      success: false,
      errorMessage: reason,
      metadata: { email },
    });
  }

  /**
   * Log rate limit exceeded
   */
  async logRateLimitExceeded(
    ipAddress: string,
    endpoint: string,
    limit: number,
    window: number
  ): Promise<void> {
    await this.log({
      type: 'RATE_LIMIT_EXCEEDED',
      severity: 'HIGH',
      category: 'RATE_LIMIT',
      ipAddress,
      action: 'rate_limit_exceeded',
      resource: endpoint,
      method: 'ANY',
      path: endpoint,
      success: false,
      metadata: { limit, window },
    });
  }

  /**
   * Log CSRF violation
   */
  async logCsrfViolation(
    ipAddress: string,
    path: string,
    reason: string,
    userId?: string
  ): Promise<void> {
    await this.log({
      type: 'CSRF_VIOLATION',
      severity: 'HIGH',
      category: 'CSRF',
      userId,
      ipAddress,
      action: 'csrf_violation',
      resource: path,
      method: 'POST',
      path,
      success: false,
      errorMessage: reason,
    });
  }

  /**
   * Log AI injection attempt
   */
  async logAiInjectionAttempt(
    input: string,
    score: number,
    ipAddress: string,
    userId?: string
  ): Promise<void> {
    await this.log({
      type: 'AI_INJECTION_ATTEMPT',
      severity: 'CRITICAL',
      category: 'AI_SAFETY',
      userId,
      ipAddress,
      action: 'ai_injection_attempt',
      resource: 'ai_extraction',
      method: 'POST',
      path: '/api/trpc/predictions.extract',
      success: false,
      metadata: {
        inputLength: input.length,
        suspicionScore: score,
        preview: input.substring(0, 200),
      },
    });
  }

  /**
   * Log API request
   */
  async logApiRequest(
    path: string,
    method: string,
    statusCode: number,
    duration: number,
    userId?: string,
    ipAddress?: string
  ): Promise<void> {
    // Only log errors or suspicious requests to avoid noise
    if (statusCode >= 400 || duration > 5000) {
      await this.log({
        type: 'API_REQUEST',
        severity: statusCode >= 500 ? 'HIGH' : 'LOW',
        category: 'API_ACCESS',
        userId,
        ipAddress: ipAddress || 'unknown',
        action: 'api_request',
        resource: path,
        method,
        path,
        statusCode,
        duration,
        success: statusCode < 400,
      });
    }
  }

  /**
   * Flush buffer to database
   */
  private async flush(): Promise<void> {
    if (this.isFlushing || this.buffer.length === 0) {
      return;
    }

    this.isFlushing = true;

    try {
      // Get events from buffer
      const events = [...this.buffer];
      this.buffer = [];
      this.stats.eventsInBuffer = 0;

      // Transform to Prisma format
      const prismaEvents = events.map(event => ({
        type: event.type,
        severity: event.severity,
        category: event.category,
        userId: event.userId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        sessionId: event.sessionId,
        action: event.action,
        resource: event.resource,
        method: event.method,
        statusCode: event.statusCode,
        timestamp: event.timestamp || new Date(),
        duration: event.duration,
        path: event.path,
        endpoint: event.endpoint,
        metadata: event.metadata || {},
        correlationId: event.correlationId,
        success: event.success,
        errorMessage: event.errorMessage,
        stackTrace: event.stackTrace,
      }));

      // Batch write to database
      await prisma.securityEvent.createMany({
        data: prismaEvents,
        skipDuplicates: true,
      });

      this.stats.lastFlushTime = new Date();
      console.log(`[SecurityLogger] Flushed ${events.length} events to database`);
    } catch (error) {
      console.error('[SecurityLogger] Failed to flush events:', error);
      this.stats.failedWrites++;

      // Fallback: write to file
      if (securityConfig.logging.fallbackToFile) {
        this.fallbackLog(this.buffer);
      }
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Start periodic flush timer
   */
  private startPeriodicFlush(): void {
    this.flushTimer = setInterval(
      () => this.flush(),
      securityConfig.logging.flushInterval
    );
  }

  /**
   * Stop periodic flush timer
   */
  private stopPeriodicFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Fallback: write to file if database fails
   */
  private fallbackLog(events: SecurityEventData | SecurityEventData[]): void {
    try {
      const eventsArray = Array.isArray(events) ? events : [events];
      const logDir = path.dirname(securityConfig.logging.logFilePath);

      // Ensure log directory exists
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      // Append to log file
      const logEntries = eventsArray.map(e => JSON.stringify(e)).join('\n') + '\n';
      fs.appendFileSync(securityConfig.logging.logFilePath, logEntries);
    } catch (error) {
      console.error('[SecurityLogger] Fallback logging failed:', error);
    }
  }

  /**
   * Generate correlation ID for request tracing
   */
  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Get logger statistics
   */
  getStats(): SecurityLoggerStats {
    return { ...this.stats };
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    console.log('[SecurityLogger] Shutting down...');
    this.stopPeriodicFlush();
    await this.flush();
    console.log('[SecurityLogger] Shutdown complete');
  }
}

// Singleton instance
export const securityLogger = new SecurityLogger();
