/**
 * AI Sanitizer
 *
 * Main class for detecting and sanitizing malicious AI inputs.
 * Protects against prompt injection, jailbreaks, and data exfiltration.
 */

import type {
  InputContent,
  DetectedThreat,
  SanitizationResult,
  SanitizationConfig,
  SanitizerStats,
} from './types';
import { ALL_PATTERNS, PATTERN_VERSION } from './patterns';
import { calculateThreatScore, determineAction, shouldEscalateToBlock } from './scorer';
import {
  sanitizeContent,
  isSanitizedContentUsable,
  extractContext,
  decodeContent,
} from './sanitizer';
import { getSanitizationCache } from './cache';

export class AiSanitizer {
  private stats: SanitizerStats = {
    totalRequests: 0,
    allowedRequests: 0,
    sanitizedRequests: 0,
    blockedRequests: 0,
    averageScore: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageProcessingTimeMs: 0,
    patternVersion: PATTERN_VERSION,
  };

  constructor(private config: SanitizationConfig) {}

  /**
   * Analyze input content for threats
   *
   * Main entry point for sanitization
   */
  async analyze(input: InputContent): Promise<SanitizationResult> {
    const startTime = performance.now();
    this.stats.totalRequests++;

    // If disabled, allow everything
    if (!this.config.enabled) {
      return this.createAllowResult(input.transcript, startTime, false);
    }

    // Check cache first
    if (this.config.cacheEnabled) {
      const cache = getSanitizationCache();
      const cached = cache.get(input.transcript);

      if (cached) {
        this.stats.cacheHits++;
        this.updateStats(cached.action);
        return cached;
      }

      this.stats.cacheMisses++;
    }

    // Detect threats in content
    const threats = this.detectThreats(input.transcript);

    // Check decoded variants
    const decodedVariants = decodeContent(input.transcript);
    for (const variant of decodedVariants) {
      if (variant !== input.transcript) {
        const decodedThreats = this.detectThreats(variant);
        threats.push(...decodedThreats);
      }
    }

    // Calculate threat score
    const score = calculateThreatScore(threats, input.transcript, this.config);

    // Determine action
    let action = determineAction(score, this.config);

    // Sanitize if needed
    let sanitizedContent: string | undefined;
    let sectionsRemoved = 0;

    if (action === 'SANITIZE') {
      const result = sanitizeContent(input.transcript, threats);
      sanitizedContent = result.sanitized;
      sectionsRemoved = result.sectionsRemoved;

      // Check if sanitization removed too much
      if (!isSanitizedContentUsable(sanitizedContent, input.transcript)) {
        action = 'BLOCK';
      }

      // Check if should escalate to BLOCK
      if (shouldEscalateToBlock(input.transcript.length, sanitizedContent.length, threats)) {
        action = 'BLOCK';
      }
    }

    // Build result
    const processingTime = performance.now() - startTime;
    const result: SanitizationResult = {
      action,
      score,
      threats,
      originalContent: input.transcript,
      sanitizedContent,
      metadata: {
        processedAt: new Date(),
        processingTimeMs: processingTime,
        contentLength: input.transcript.length,
        threatsDetected: threats.length,
        sanitizedSections: sectionsRemoved,
        cacheHit: false,
        patternVersion: PATTERN_VERSION,
      },
    };

    // Update stats
    this.updateStats(action);
    this.updateAverageScore(score);
    this.updateAverageProcessingTime(processingTime);

    // Cache result
    if (this.config.cacheEnabled) {
      const cache = getSanitizationCache();
      cache.set(input.transcript, result);
    }

    return result;
  }

  /**
   * Detect threats in content using pattern matching
   */
  private detectThreats(content: string): DetectedThreat[] {
    const threats: DetectedThreat[] = [];

    // Check each pattern
    for (const pattern of ALL_PATTERNS) {
      const matches = content.matchAll(new RegExp(pattern.regex, 'g'));

      for (const match of matches) {
        if (match.index !== undefined) {
          threats.push({
            pattern: pattern.name,
            category: pattern.category,
            severity: pattern.severity,
            score: pattern.score,
            match: match[0],
            position: match.index,
            context: extractContext(content, match.index, match[0].length),
          });
        }
      }
    }

    return threats;
  }

  /**
   * Create result for allowed content
   */
  private createAllowResult(
    content: string,
    startTime: number,
    fromCache: boolean
  ): SanitizationResult {
    const processingTime = performance.now() - startTime;

    this.stats.allowedRequests++;
    this.updateAverageProcessingTime(processingTime);

    return {
      action: 'ALLOW',
      score: 0,
      threats: [],
      originalContent: content,
      metadata: {
        processedAt: new Date(),
        processingTimeMs: processingTime,
        contentLength: content.length,
        threatsDetected: 0,
        sanitizedSections: 0,
        cacheHit: fromCache,
        patternVersion: PATTERN_VERSION,
      },
    };
  }

  /**
   * Update statistics for action
   */
  private updateStats(action: 'ALLOW' | 'SANITIZE' | 'BLOCK'): void {
    switch (action) {
      case 'ALLOW':
        this.stats.allowedRequests++;
        break;
      case 'SANITIZE':
        this.stats.sanitizedRequests++;
        break;
      case 'BLOCK':
        this.stats.blockedRequests++;
        break;
    }
  }

  /**
   * Update average score
   */
  private updateAverageScore(score: number): void {
    const total = this.stats.totalRequests;
    this.stats.averageScore = (this.stats.averageScore * (total - 1) + score) / total;
  }

  /**
   * Update average processing time
   */
  private updateAverageProcessingTime(time: number): void {
    const total = this.stats.totalRequests;
    this.stats.averageProcessingTimeMs =
      (this.stats.averageProcessingTimeMs * (total - 1) + time) / total;
  }

  /**
   * Get current statistics
   */
  getStats(): SanitizerStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics (for testing)
   */
  resetStats(): void {
    this.stats = {
      totalRequests: 0,
      allowedRequests: 0,
      sanitizedRequests: 0,
      blockedRequests: 0,
      averageScore: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageProcessingTimeMs: 0,
      patternVersion: PATTERN_VERSION,
    };
  }
}

/**
 * Global sanitizer instance (singleton)
 */
let sanitizerInstance: AiSanitizer | null = null;

export function getAiSanitizer(config: SanitizationConfig): AiSanitizer {
  if (!sanitizerInstance) {
    sanitizerInstance = new AiSanitizer(config);
  }
  return sanitizerInstance;
}

/**
 * Reset global instance (for testing)
 */
export function resetGlobalSanitizer(): void {
  sanitizerInstance = null;
}
