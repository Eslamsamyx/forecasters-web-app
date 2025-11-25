/**
 * Sanitization Result Cache
 *
 * LRU cache for sanitization results to improve performance on repeated content.
 */

import crypto from 'crypto';
import type { CacheEntry, SanitizationResult } from './types';
import { PATTERN_VERSION } from './patterns';

export class SanitizationCache {
  private cache = new Map<string, CacheEntry>();
  private readonly maxSize: number;
  private readonly ttl: number;
  private hits = 0;
  private misses = 0;

  constructor(maxSize = 1000, ttl = 24 * 60 * 60 * 1000) {
    // Default: 1000 entries, 24 hour TTL
    this.maxSize = maxSize;
    this.ttl = ttl;

    // Start cleanup timer
    this.startCleanupTimer();
  }

  /**
   * Generate cache key from content
   */
  private generateKey(content: string): string {
    // Use SHA-256 hash for consistent key generation
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Get cached result if valid
   */
  get(content: string): SanitizationResult | null {
    const key = this.generateKey(content);
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Check if pattern version changed (invalidates all cache)
    if (entry.patternVersion !== PATTERN_VERSION) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;

    // Update cache hit flag in metadata
    const result = { ...entry.result };
    result.metadata = { ...result.metadata, cacheHit: true };

    return result;
  }

  /**
   * Store result in cache
   */
  set(content: string, result: SanitizationResult): void {
    const key = this.generateKey(content);

    // Enforce max size (LRU eviction)
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      // Remove oldest entry (first in Map)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    // Store with current timestamp and pattern version
    const entry: CacheEntry = {
      result: { ...result },
      timestamp: Date.now(),
      patternVersion: PATTERN_VERSION,
    };

    this.cache.set(key, entry);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: hitRate.toFixed(2) + '%',
      patternVersion: PATTERN_VERSION,
    };
  }

  /**
   * Start automatic cleanup timer
   */
  private startCleanupTimer(): void {
    // Clean expired entries every hour
    setInterval(() => {
      this.cleanupExpired();
    }, 60 * 60 * 1000);
  }

  /**
   * Remove expired entries
   */
  private cleanupExpired(): void {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl || entry.patternVersion !== PATTERN_VERSION) {
        this.cache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`[SanitizationCache] Cleaned ${removed} expired entries`);
    }
  }

  /**
   * Get cache size in bytes (approximate)
   */
  getMemoryUsage(): number {
    let size = 0;

    for (const entry of this.cache.values()) {
      // Approximate size of entry
      size += JSON.stringify(entry).length;
    }

    return size;
  }
}

/**
 * Global cache instance (singleton)
 */
let cacheInstance: SanitizationCache | null = null;

export function getSanitizationCache(maxSize?: number, ttl?: number): SanitizationCache {
  if (!cacheInstance) {
    cacheInstance = new SanitizationCache(maxSize, ttl);
  }
  return cacheInstance;
}

/**
 * Clear global cache (for testing)
 */
export function clearGlobalCache(): void {
  if (cacheInstance) {
    cacheInstance.clear();
  }
}
