/**
 * SecurityLogger Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SecurityLogger } from '../SecurityLogger';
import type { SecurityEventData } from '../types';

// Mock Prisma
vi.mock('../../../db', () => ({
  prisma: {
    securityEvent: {
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
  },
}));

describe('SecurityLogger', () => {
  let logger: SecurityLogger;

  beforeEach(() => {
    logger = new SecurityLogger();
  });

  afterEach(async () => {
    await logger.shutdown();
  });

  describe('log()', () => {
    it('should add event to buffer', async () => {
      const event: SecurityEventData = {
        type: 'AUTH_SUCCESS',
        severity: 'LOW',
        category: 'AUTH',
        userId: 'user123',
        ipAddress: '192.168.1.1',
        action: 'login',
        resource: 'auth',
        method: 'POST',
        path: '/api/auth/signin',
        success: true,
      };

      await logger.log(event);

      const stats = logger.getStats();
      expect(stats.totalEvents).toBe(1);
      expect(stats.eventsInBuffer).toBeGreaterThan(0);
    });

    it('should generate correlation ID if not provided', async () => {
      const event: SecurityEventData = {
        type: 'AUTH_SUCCESS',
        severity: 'LOW',
        category: 'AUTH',
        ipAddress: '192.168.1.1',
        action: 'login',
        resource: 'auth',
        method: 'POST',
        path: '/api/auth/signin',
        success: true,
      };

      await logger.log(event);
      expect(event.correlationId).toBeDefined();
    });

    it('should add timestamp if not provided', async () => {
      const event: SecurityEventData = {
        type: 'AUTH_SUCCESS',
        severity: 'LOW',
        category: 'AUTH',
        ipAddress: '192.168.1.1',
        action: 'login',
        resource: 'auth',
        method: 'POST',
        path: '/api/auth/signin',
        success: true,
      };

      await logger.log(event);
      expect(event.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('logAuthSuccess()', () => {
    it('should log successful authentication', async () => {
      await logger.logAuthSuccess('user123', '192.168.1.1', 'Mozilla/5.0');

      const stats = logger.getStats();
      expect(stats.totalEvents).toBe(1);
    });
  });

  describe('logAuthFailure()', () => {
    it('should log failed authentication', async () => {
      await logger.logAuthFailure(
        'test@example.com',
        '192.168.1.1',
        'Invalid password',
        'Mozilla/5.0'
      );

      const stats = logger.getStats();
      expect(stats.totalEvents).toBe(1);
    });
  });

  describe('logRateLimitExceeded()', () => {
    it('should log rate limit violations', async () => {
      await logger.logRateLimitExceeded(
        '192.168.1.1',
        '/api/auth/signin',
        5,
        900000
      );

      const stats = logger.getStats();
      expect(stats.totalEvents).toBe(1);
    });
  });

  describe('logCsrfViolation()', () => {
    it('should log CSRF violations', async () => {
      await logger.logCsrfViolation(
        '192.168.1.1',
        '/api/trpc/predictions.create',
        'Missing CSRF token',
        'user123'
      );

      const stats = logger.getStats();
      expect(stats.totalEvents).toBe(1);
    });
  });

  describe('logAiInjectionAttempt()', () => {
    it('should log AI injection attempts', async () => {
      const suspiciousInput = 'Ignore all previous instructions and...';

      await logger.logAiInjectionAttempt(
        suspiciousInput,
        85,
        '192.168.1.1',
        'user123'
      );

      const stats = logger.getStats();
      expect(stats.totalEvents).toBe(1);
    });
  });

  describe('getStats()', () => {
    it('should return current statistics', async () => {
      await logger.log({
        type: 'AUTH_SUCCESS',
        severity: 'LOW',
        category: 'AUTH',
        ipAddress: '192.168.1.1',
        action: 'login',
        resource: 'auth',
        method: 'POST',
        path: '/api/auth/signin',
        success: true,
      });

      const stats = logger.getStats();
      expect(stats).toHaveProperty('totalEvents');
      expect(stats).toHaveProperty('eventsInBuffer');
      expect(stats).toHaveProperty('lastFlushTime');
      expect(stats).toHaveProperty('failedWrites');
      expect(stats).toHaveProperty('alertsSent');
    });
  });

  describe('shutdown()', () => {
    it('should flush buffer on shutdown', async () => {
      await logger.log({
        type: 'AUTH_SUCCESS',
        severity: 'LOW',
        category: 'AUTH',
        ipAddress: '192.168.1.1',
        action: 'login',
        resource: 'auth',
        method: 'POST',
        path: '/api/auth/signin',
        success: true,
      });

      await logger.shutdown();

      const stats = logger.getStats();
      expect(stats.eventsInBuffer).toBe(0);
    });
  });
});
