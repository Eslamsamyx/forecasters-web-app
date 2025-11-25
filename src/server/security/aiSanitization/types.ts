/**
 * AI Sanitization Types
 *
 * Type definitions for AI input sanitization and threat detection.
 */

/**
 * Input content to sanitize
 */
export interface InputContent {
  transcript: string;
  title?: string;
  description?: string;
  videoId?: string;
  channelName?: string;
}

/**
 * Severity levels for detected threats
 */
export type ThreatSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Actions to take based on threat level
 */
export type SanitizationAction = 'ALLOW' | 'SANITIZE' | 'BLOCK';

/**
 * Threat pattern definition
 */
export interface ThreatPattern {
  name: string;
  regex: RegExp;
  score: number;
  severity: ThreatSeverity;
  description: string;
  category: ThreatCategory;
}

/**
 * Categories of threats
 */
export type ThreatCategory =
  | 'instruction_override'
  | 'jailbreak'
  | 'data_exfiltration'
  | 'output_manipulation'
  | 'prediction_bias'
  | 'resource_exhaustion';

/**
 * Detected threat in content
 */
export interface DetectedThreat {
  pattern: string;
  category: ThreatCategory;
  severity: ThreatSeverity;
  score: number;
  match: string;
  position: number;
  context?: string; // Surrounding text for analysis
}

/**
 * Sanitization result
 */
export interface SanitizationResult {
  action: SanitizationAction;
  score: number;
  threats: DetectedThreat[];
  originalContent: string;
  sanitizedContent?: string;
  metadata: {
    processedAt: Date;
    processingTimeMs: number;
    contentLength: number;
    threatsDetected: number;
    sanitizedSections: number;
    cacheHit: boolean;
    patternVersion: string;
  };
}

/**
 * Sanitization configuration
 */
export interface SanitizationConfig {
  enabled: boolean;
  blockThreshold: number;
  sanitizeThreshold: number;
  warnThreshold: number;
  maxInputLength: number;
  maxRepeatedChars: number;
  cacheEnabled: boolean;
  cacheTtl: number;
  logAllAttempts: boolean;
}

/**
 * Cache entry for sanitization results
 */
export interface CacheEntry {
  result: SanitizationResult;
  timestamp: number;
  patternVersion: string;
}

/**
 * Statistics for the sanitizer
 */
export interface SanitizerStats {
  totalRequests: number;
  allowedRequests: number;
  sanitizedRequests: number;
  blockedRequests: number;
  averageScore: number;
  cacheHits: number;
  cacheMisses: number;
  averageProcessingTimeMs: number;
  patternVersion: string;
}

/**
 * Context for threat detection
 */
export interface DetectionContext {
  content: string;
  contentType: 'transcript' | 'title' | 'description';
  videoId?: string;
  channelName?: string;
}
