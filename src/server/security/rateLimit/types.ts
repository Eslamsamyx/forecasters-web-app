/**
 * Rate Limiting Types
 *
 * Type definitions for request rate limiting using sliding window algorithm.
 */

/**
 * Rate limit strategy configuration
 */
export interface RateLimitStrategy {
  /** Maximum number of requests allowed */
  limit: number;

  /** Time window in milliseconds */
  window: number;

  /** Optional custom block duration (overrides default) */
  blockDuration?: number;
}

/**
 * Rate limit strategies for different operation types
 */
export interface RateLimitStrategies {
  auth: RateLimitStrategy;
  queries: RateLimitStrategy;
  mutations: RateLimitStrategy;
  admin: RateLimitStrategy;
  aiExtraction: RateLimitStrategy;
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /** Enable rate limiting */
  enabled: boolean;

  /** Rate limit strategies by operation type */
  strategies: RateLimitStrategies;

  /** Duration to block after limit exceeded (ms) */
  blockDuration: number;

  /** Interval to clean up old entries (ms) */
  cleanupInterval: number;

  /** Use user ID for limiting (in addition to IP) */
  limitByUser: boolean;

  /** Whitelist IPs (never rate limited) */
  whitelistedIps: string[];
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  /** Whether request is allowed */
  allowed: boolean;

  /** Reason for denial (if not allowed) */
  reason?: 'limit_exceeded' | 'blocked';

  /** Current request count */
  current: number;

  /** Maximum allowed requests */
  limit: number;

  /** Time until reset (ms) */
  resetIn: number;

  /** Retry after (seconds) */
  retryAfter: number;
}

/**
 * Request record for sliding window
 */
export interface RequestRecord {
  /** Timestamp of request */
  timestamp: number;

  /** Request path */
  path?: string;

  /** Request type */
  type?: string;
}

/**
 * Rate limit entry
 */
export interface RateLimitEntry {
  /** Request history (sliding window) */
  requests: RequestRecord[];

  /** Block until timestamp (if blocked) */
  blockedUntil: number | null;

  /** Total requests made */
  totalRequests: number;

  /** First request timestamp */
  firstRequest: number;

  /** Last request timestamp */
  lastRequest: number;
}

/**
 * Rate limiter stats
 */
export interface RateLimiterStats {
  /** Total unique clients tracked */
  totalClients: number;

  /** Currently blocked clients */
  blockedClients: number;

  /** Total requests tracked */
  totalRequests: number;

  /** Total rate limit violations */
  totalViolations: number;

  /** Memory usage (entries) */
  memoryEntries: number;
}

/**
 * Rate limit context for middleware
 */
export interface RateLimitContext {
  /** Client identifier (IP or user ID) */
  clientId: string;

  /** Request IP address */
  ipAddress: string;

  /** User ID (if authenticated) */
  userId?: string;

  /** Request path */
  path: string;

  /** Request type (query/mutation) */
  type: 'query' | 'mutation' | 'subscription';

  /** Rate limit strategy to apply */
  strategy: keyof RateLimitStrategies;
}
