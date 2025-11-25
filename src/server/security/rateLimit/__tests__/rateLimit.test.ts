/**
 * Rate Limiter Tests
 *
 * Comprehensive tests for sliding window rate limiting.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RateLimiter } from '../RateLimiter';
import type { RateLimitConfig, RateLimitStrategy } from '../types';

describe('RateLimiter Tests', () => {
  let rateLimiter: RateLimiter;
  let config: RateLimitConfig;

  beforeEach(() => {
    config = {
      enabled: true,
      limitByUser: false,
      whitelistedIps: [],
      strategies: {
        auth: { limit: 5, window: 900000 },
        queries: { limit: 100, window: 60000 },
        mutations: { limit: 30, window: 60000 },
        admin: { limit: 50, window: 60000 },
        aiExtraction: { limit: 10, window: 3600000 },
      },
      blockDuration: 3600000,
      cleanupInterval: 60000,
    };

    rateLimiter = new RateLimiter(config);
  });

  afterEach(() => {
    rateLimiter.shutdown();
    rateLimiter.clear();
  });

  describe('Basic Rate Limiting', () => {
    it('should allow requests within limit', () => {
      const strategy: RateLimitStrategy = { limit: 5, window: 60000 };

      for (let i = 0; i < 5; i++) {
        const result = rateLimiter.check('client1', strategy);
        expect(result.allowed).toBe(true);
        expect(result.current).toBe(i + 1);
      }
    });

    it('should block requests exceeding limit', () => {
      const strategy: RateLimitStrategy = { limit: 3, window: 60000 };

      // Make 3 requests (allowed)
      for (let i = 0; i < 3; i++) {
        const result = rateLimiter.check('client1', strategy);
        expect(result.allowed).toBe(true);
      }

      // 4th request should be blocked
      const result = rateLimiter.check('client1', strategy);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('limit_exceeded');
      expect(result.current).toBe(3);
    });

    it('should track different clients separately', () => {
      const strategy: RateLimitStrategy = { limit: 2, window: 60000 };

      // Client 1 makes 2 requests
      rateLimiter.check('client1', strategy);
      rateLimiter.check('client1', strategy);

      // Client 2 should still be allowed
      const result = rateLimiter.check('client2', strategy);
      expect(result.allowed).toBe(true);
      expect(result.current).toBe(1);
    });

    it('should return correct metadata', () => {
      const strategy: RateLimitStrategy = { limit: 5, window: 60000 };

      const result = rateLimiter.check('client1', strategy);

      expect(result).toHaveProperty('allowed');
      expect(result).toHaveProperty('current');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('resetIn');
      expect(result).toHaveProperty('retryAfter');
      expect(result.limit).toBe(5);
    });
  });

  describe('Sliding Window', () => {
    it('should allow requests after window expires', async () => {
      // Use shorter block duration for this test
      const shortConfig = {
        ...config,
        blockDuration: 150, // 150ms block
      };
      const limiter = new RateLimiter(shortConfig);
      const strategy: RateLimitStrategy = { limit: 2, window: 100 }; // 100ms window

      // Make 2 requests (hit limit)
      limiter.check('client1', strategy);
      limiter.check('client1', strategy);

      // 3rd request should be blocked
      let result = limiter.check('client1', strategy);
      expect(result.allowed).toBe(false);

      // Wait for block to expire
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Should be allowed again
      result = limiter.check('client1', strategy);
      expect(result.allowed).toBe(true);

      limiter.shutdown();
    });

    it('should maintain sliding window correctly', async () => {
      // Use shorter block duration for this test
      const shortConfig = {
        ...config,
        blockDuration: 300, // 300ms block
      };
      const limiter = new RateLimiter(shortConfig);
      const strategy: RateLimitStrategy = { limit: 3, window: 200 }; // 200ms window

      // Request at t=0
      limiter.check('client1', strategy);

      // Request at t=50
      await new Promise((resolve) => setTimeout(resolve, 50));
      limiter.check('client1', strategy);

      // Request at t=100
      await new Promise((resolve) => setTimeout(resolve, 50));
      limiter.check('client1', strategy);

      // Request at t=150 should be blocked (3 requests in last 200ms)
      await new Promise((resolve) => setTimeout(resolve, 50));
      let result = limiter.check('client1', strategy);
      expect(result.allowed).toBe(false);

      // Wait for block to expire (t=450+)
      await new Promise((resolve) => setTimeout(resolve, 350));

      // Should be allowed now (block expired and window reset)
      result = limiter.check('client1', strategy);
      expect(result.allowed).toBe(true);

      limiter.shutdown();
    });
  });

  describe('Blocking', () => {
    it('should block client after limit exceeded', () => {
      const strategy: RateLimitStrategy = { limit: 2, window: 60000 };

      // Hit limit
      rateLimiter.check('client1', strategy);
      rateLimiter.check('client1', strategy);
      rateLimiter.check('client1', strategy); // Blocks client

      // Should remain blocked
      const result = rateLimiter.check('client1', strategy);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('blocked');
    });

    it('should unblock after block duration expires', async () => {
      const shortConfig = {
        ...config,
        blockDuration: 100, // 100ms block
      };
      const limiter = new RateLimiter(shortConfig);
      const strategy: RateLimitStrategy = { limit: 1, window: 50 }; // Short window to ensure it expires

      // Hit limit and get blocked
      limiter.check('client1', strategy);
      limiter.check('client1', strategy);

      // Should be blocked
      let result = limiter.check('client1', strategy);
      expect(result.allowed).toBe(false);

      // Wait for block to expire (longer than blockDuration and window)
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Should be unblocked and window should have reset
      result = limiter.check('client1', strategy);
      expect(result.allowed).toBe(true);

      limiter.shutdown();
    });

    it('should manually block client', () => {
      rateLimiter.block('client1', 60000);

      const result = rateLimiter.check('client1', { limit: 10, window: 60000 });
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('blocked');
    });

    it('should manually unblock client', () => {
      // Block client
      rateLimiter.block('client1', 60000);

      // Verify blocked
      let result = rateLimiter.check('client1', { limit: 10, window: 60000 });
      expect(result.allowed).toBe(false);

      // Unblock
      rateLimiter.unblock('client1');

      // Should be allowed now
      result = rateLimiter.check('client1', { limit: 10, window: 60000 });
      expect(result.allowed).toBe(true);
    });

    it('should check if client is blocked', () => {
      rateLimiter.block('client1', 60000);

      expect(rateLimiter.isBlocked('client1')).toBe(true);
      expect(rateLimiter.isBlocked('client2')).toBe(false);
    });
  });

  describe('Reset and Clear', () => {
    it('should reset rate limit for specific client', () => {
      const strategy: RateLimitStrategy = { limit: 2, window: 60000 };

      // Hit limit
      rateLimiter.check('client1', strategy);
      rateLimiter.check('client1', strategy);

      // Reset
      rateLimiter.reset('client1');

      // Should be allowed again
      const result = rateLimiter.check('client1', strategy);
      expect(result.allowed).toBe(true);
      expect(result.current).toBe(1);
    });

    it('should clear all entries', () => {
      const strategy: RateLimitStrategy = { limit: 5, window: 60000 };

      rateLimiter.check('client1', strategy);
      rateLimiter.check('client2', strategy);

      rateLimiter.clear();

      const stats = rateLimiter.getStats();
      expect(stats.totalClients).toBe(0);
      expect(stats.totalRequests).toBe(0);
    });
  });

  describe('Whitelist', () => {
    it('should allow whitelisted IPs without limit', () => {
      const whitelistConfig = {
        ...config,
        whitelistedIps: ['192.168.1.100'],
      };
      const limiter = new RateLimiter(whitelistConfig);
      const strategy: RateLimitStrategy = { limit: 1, window: 60000 };

      // Should allow unlimited requests for whitelisted IP
      for (let i = 0; i < 10; i++) {
        const result = limiter.check('192.168.1.100', strategy);
        expect(result.allowed).toBe(true);
      }

      limiter.shutdown();
    });

    it('should rate limit non-whitelisted IPs', () => {
      const whitelistConfig = {
        ...config,
        whitelistedIps: ['192.168.1.100'],
      };
      const limiter = new RateLimiter(whitelistConfig);
      const strategy: RateLimitStrategy = { limit: 1, window: 60000 };

      // First request allowed
      let result = limiter.check('192.168.1.200', strategy);
      expect(result.allowed).toBe(true);

      // Second request blocked
      result = limiter.check('192.168.1.200', strategy);
      expect(result.allowed).toBe(false);

      limiter.shutdown();
    });
  });

  describe('Statistics', () => {
    it('should track overall stats', () => {
      const strategy: RateLimitStrategy = { limit: 5, window: 60000 };

      rateLimiter.check('client1', strategy);
      rateLimiter.check('client2', strategy);
      rateLimiter.check('client1', strategy);

      const stats = rateLimiter.getStats();

      expect(stats.totalClients).toBe(2);
      expect(stats.totalRequests).toBe(3);
      expect(stats.memoryEntries).toBe(2);
    });

    it('should track violations', () => {
      const strategy: RateLimitStrategy = { limit: 1, window: 60000 };

      rateLimiter.check('client1', strategy); // Allowed
      rateLimiter.check('client1', strategy); // Blocked - violation

      const stats = rateLimiter.getStats();
      expect(stats.totalViolations).toBe(1);
    });

    it('should track blocked clients', () => {
      rateLimiter.block('client1', 60000);
      rateLimiter.block('client2', 60000);

      const stats = rateLimiter.getStats();
      expect(stats.blockedClients).toBe(2);
    });

    it('should get client-specific stats', () => {
      const strategy: RateLimitStrategy = { limit: 5, window: 60000 };

      rateLimiter.check('client1', strategy);
      rateLimiter.check('client1', strategy);

      const clientStats = rateLimiter.getClientStats('client1');

      expect(clientStats).toBeDefined();
      expect(clientStats?.requests).toHaveLength(2);
      expect(clientStats?.totalRequests).toBe(2);
      expect(clientStats?.blockedUntil).toBeNull();
    });

    it('should return null for non-existent client', () => {
      const clientStats = rateLimiter.getClientStats('nonexistent');
      expect(clientStats).toBeNull();
    });
  });

  describe('Cleanup', () => {
    it('should remove old entries on cleanup', async () => {
      const shortConfig = {
        ...config,
        blockDuration: 50, // 50ms block
        strategies: {
          // Use short windows so maxAge is small
          auth: { limit: 5, window: 100 },
          queries: { limit: 100, window: 100 },
          mutations: { limit: 30, window: 100 },
          admin: { limit: 50, window: 100 },
          aiExtraction: { limit: 10, window: 100 },
        },
      };
      const limiter = new RateLimiter(shortConfig);
      const strategy: RateLimitStrategy = { limit: 5, window: 100 }; // 100ms window

      limiter.check('client1', strategy);

      // Wait for entries to become old (past maxAge of 100ms)
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Cleanup
      limiter.cleanup();

      const stats = limiter.getStats();
      expect(stats.totalClients).toBe(0);

      limiter.shutdown();
    });

    it('should not remove blocked clients during cleanup', () => {
      rateLimiter.block('client1', 60000);

      rateLimiter.cleanup();

      const stats = rateLimiter.getStats();
      expect(stats.totalClients).toBe(1);
      expect(stats.blockedClients).toBe(1);
    });

    it('should not remove clients with recent activity', () => {
      const strategy: RateLimitStrategy = { limit: 5, window: 60000 };

      rateLimiter.check('client1', strategy);

      // Cleanup immediately
      rateLimiter.cleanup();

      const stats = rateLimiter.getStats();
      expect(stats.totalClients).toBe(1);
    });
  });

  describe('Record Function', () => {
    it('should record request without checking limit', () => {
      rateLimiter.record('client1');
      rateLimiter.record('client1');
      rateLimiter.record('client1');

      const clientStats = rateLimiter.getClientStats('client1');
      expect(clientStats?.requests).toHaveLength(3);
    });

    it('should record with metadata', () => {
      rateLimiter.record('client1', {
        path: '/api/test',
        type: 'query',
      });

      const clientStats = rateLimiter.getClientStats('client1');
      expect(clientStats?.requests[0]?.path).toBe('/api/test');
      expect(clientStats?.requests[0]?.type).toBe('query');
    });
  });

  describe('Disabled Rate Limiting', () => {
    it('should allow all requests when disabled', () => {
      const disabledConfig = {
        ...config,
        enabled: false,
      };
      const limiter = new RateLimiter(disabledConfig);
      const strategy: RateLimitStrategy = { limit: 1, window: 60000 };

      // Should allow unlimited requests
      for (let i = 0; i < 10; i++) {
        const result = limiter.check('client1', strategy);
        expect(result.allowed).toBe(true);
      }

      limiter.shutdown();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very short windows', async () => {
      const shortConfig = {
        ...config,
        blockDuration: 20, // 20ms block
      };
      const limiter = new RateLimiter(shortConfig);
      const strategy: RateLimitStrategy = { limit: 2, window: 10 }; // 10ms window

      limiter.check('client1', strategy);
      limiter.check('client1', strategy);

      // Should be blocked
      let result = limiter.check('client1', strategy);
      expect(result.allowed).toBe(false);

      // Wait for block to expire
      await new Promise((resolve) => setTimeout(resolve, 30));

      // Should be allowed again
      result = limiter.check('client1', strategy);
      expect(result.allowed).toBe(true);

      limiter.shutdown();
    });

    it('should handle very large limits', () => {
      const strategy: RateLimitStrategy = { limit: 1000000, window: 60000 };

      for (let i = 0; i < 100; i++) {
        const result = rateLimiter.check('client1', strategy);
        expect(result.allowed).toBe(true);
      }
    });

    it('should handle zero limit', () => {
      const strategy: RateLimitStrategy = { limit: 0, window: 60000 };

      const result = rateLimiter.check('client1', strategy);
      expect(result.allowed).toBe(false);
    });
  });
});
