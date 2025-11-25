/**
 * Rate Limiter
 *
 * Sliding window rate limiter with automatic cleanup and blocking.
 * Uses in-memory storage for fast performance without Redis dependency.
 */

import type {
  RateLimitConfig,
  RateLimitStrategy,
  RateLimitResult,
  RateLimitEntry,
  RequestRecord,
  RateLimiterStats,
} from './types';

export class RateLimiter {
  private entries = new Map<string, RateLimitEntry>();
  private stats = {
    totalRequests: 0,
    totalViolations: 0,
  };
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(private config: RateLimitConfig) {
    // Start automatic cleanup
    if (config.cleanupInterval > 0) {
      this.startCleanup();
    }

    // Graceful shutdown
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }

  /**
   * Check if request should be rate limited
   *
   * Returns result with allowed status and metadata
   */
  check(clientId: string, strategy: RateLimitStrategy): RateLimitResult {
    // Check if rate limiting is disabled
    if (!this.config.enabled) {
      return {
        allowed: true,
        current: 0,
        limit: strategy.limit,
        resetIn: 0,
        retryAfter: 0,
      };
    }

    // Check if client is whitelisted
    if (this.config.whitelistedIps.includes(clientId)) {
      return {
        allowed: true,
        current: 0,
        limit: strategy.limit,
        resetIn: 0,
        retryAfter: 0,
      };
    }

    const now = Date.now();

    // Get or create entry
    let entry = this.entries.get(clientId);
    if (!entry) {
      entry = {
        requests: [],
        blockedUntil: null,
        totalRequests: 0,
        firstRequest: now,
        lastRequest: now,
      };
      this.entries.set(clientId, entry);
    }

    // Check if client is blocked
    if (entry.blockedUntil && now < entry.blockedUntil) {
      const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
      return {
        allowed: false,
        reason: 'blocked',
        current: entry.requests.length,
        limit: strategy.limit,
        resetIn: entry.blockedUntil - now,
        retryAfter,
      };
    }

    // Clear block if expired
    if (entry.blockedUntil && now >= entry.blockedUntil) {
      entry.blockedUntil = null;
    }

    // Remove requests outside the sliding window
    const windowStart = now - strategy.window;
    entry.requests = entry.requests.filter((req) => req.timestamp > windowStart);

    // Check if limit exceeded
    if (entry.requests.length >= strategy.limit) {
      // Block the client
      const blockDuration = strategy.blockDuration || this.config.blockDuration;
      entry.blockedUntil = now + blockDuration;

      this.stats.totalViolations++;

      const retryAfter = Math.ceil(blockDuration / 1000);
      return {
        allowed: false,
        reason: 'limit_exceeded',
        current: entry.requests.length,
        limit: strategy.limit,
        resetIn: blockDuration,
        retryAfter,
      };
    }

    // Request allowed - add to history
    entry.requests.push({
      timestamp: now,
    });
    entry.totalRequests++;
    entry.lastRequest = now;

    this.stats.totalRequests++;

    // Calculate reset time (when oldest request expires)
    const oldestRequest = entry.requests[0]?.timestamp || now;
    const resetIn = strategy.window - (now - oldestRequest);

    return {
      allowed: true,
      current: entry.requests.length,
      limit: strategy.limit,
      resetIn: Math.max(0, resetIn),
      retryAfter: 0,
    };
  }

  /**
   * Record a request (updates history without checking limit)
   *
   * Useful for tracking requests that bypass rate limiting
   */
  record(clientId: string, metadata?: Partial<RequestRecord>): void {
    const now = Date.now();

    let entry = this.entries.get(clientId);
    if (!entry) {
      entry = {
        requests: [],
        blockedUntil: null,
        totalRequests: 0,
        firstRequest: now,
        lastRequest: now,
      };
      this.entries.set(clientId, entry);
    }

    entry.requests.push({
      timestamp: now,
      ...metadata,
    });
    entry.totalRequests++;
    entry.lastRequest = now;

    this.stats.totalRequests++;
  }

  /**
   * Reset rate limit for a specific client
   */
  reset(clientId: string): void {
    this.entries.delete(clientId);
  }

  /**
   * Block a client for a specific duration
   */
  block(clientId: string, durationMs: number): void {
    const now = Date.now();

    let entry = this.entries.get(clientId);
    if (!entry) {
      entry = {
        requests: [],
        blockedUntil: now + durationMs,
        totalRequests: 0,
        firstRequest: now,
        lastRequest: now,
      };
      this.entries.set(clientId, entry);
    } else {
      entry.blockedUntil = now + durationMs;
    }
  }

  /**
   * Unblock a client
   */
  unblock(clientId: string): void {
    const entry = this.entries.get(clientId);
    if (entry) {
      entry.blockedUntil = null;
    }
  }

  /**
   * Check if client is currently blocked
   */
  isBlocked(clientId: string): boolean {
    const entry = this.entries.get(clientId);
    if (!entry || !entry.blockedUntil) return false;

    const now = Date.now();
    if (now >= entry.blockedUntil) {
      entry.blockedUntil = null;
      return false;
    }

    return true;
  }

  /**
   * Get current stats for a client
   */
  getClientStats(clientId: string): RateLimitEntry | null {
    return this.entries.get(clientId) || null;
  }

  /**
   * Get overall rate limiter statistics
   */
  getStats(): RateLimiterStats {
    let blockedClients = 0;
    const now = Date.now();

    for (const entry of this.entries.values()) {
      if (entry.blockedUntil && now < entry.blockedUntil) {
        blockedClients++;
      }
    }

    return {
      totalClients: this.entries.size,
      blockedClients,
      totalRequests: this.stats.totalRequests,
      totalViolations: this.stats.totalViolations,
      memoryEntries: this.entries.size,
    };
  }

  /**
   * Clean up old entries to prevent memory leaks
   */
  cleanup(): void {
    const now = Date.now();
    const maxAge = Math.max(
      ...Object.values(this.config.strategies).map((s) => s.window)
    );

    // Remove entries that are:
    // 1. Not blocked
    // 2. Have no recent requests (older than max window)
    for (const [clientId, entry] of this.entries.entries()) {
      const isBlocked = entry.blockedUntil && now < entry.blockedUntil;
      const hasRecentRequests = entry.lastRequest > now - maxAge;

      if (!isBlocked && !hasRecentRequests) {
        this.entries.delete(clientId);
      }
    }
  }

  /**
   * Start automatic cleanup timer
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);

    // Don't prevent process from exiting
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  /**
   * Stop cleanup timer
   */
  private stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Shutdown rate limiter
   */
  shutdown(): void {
    this.stopCleanup();
  }

  /**
   * Clear all entries (for testing)
   */
  clear(): void {
    this.entries.clear();
    this.stats = {
      totalRequests: 0,
      totalViolations: 0,
    };
  }
}

/**
 * Global rate limiter instance
 *
 * Note: Import from security/index.ts, not directly from this file
 */
let rateLimiterInstance: RateLimiter | null = null;

export function getRateLimiter(config: RateLimitConfig): RateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new RateLimiter(config);
  }
  return rateLimiterInstance;
}
