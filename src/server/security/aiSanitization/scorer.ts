/**
 * Threat Scoring Engine
 *
 * Calculates composite threat scores from detected patterns.
 */

import type { DetectedThreat, SanitizationAction, SanitizationConfig } from './types';
import { containsWhitelistedPhrase } from './patterns';

/**
 * Calculate composite threat score from all detected threats
 *
 * Scoring rules:
 * - Simple sum for most patterns
 * - Length penalty for excessive content
 * - Repetition penalty for resource exhaustion
 * - Context-aware adjustment for whitelisted phrases
 */
export function calculateThreatScore(
  threats: DetectedThreat[],
  content: string,
  config: SanitizationConfig
): number {
  // Start with sum of all threat scores
  let score = threats.reduce((sum, threat) => sum + threat.score, 0);

  // Length penalty (content over max length)
  if (content.length > config.maxInputLength) {
    const excessChars = content.length - config.maxInputLength;
    const lengthPenalty = Math.min(25, Math.floor(excessChars / 10000) * 5);
    score += lengthPenalty;
  }

  // Repetition penalty (same character repeated excessively)
  const repetitionPenalty = calculateRepetitionPenalty(content, config.maxRepeatedChars);
  score += repetitionPenalty;

  // Context-aware adjustment
  // If content contains whitelisted phrases, reduce score slightly
  if (containsWhitelistedPhrase(content) && score < 100) {
    score = Math.max(0, score - 10);
  }

  return score;
}

/**
 * Calculate penalty for repeated characters
 *
 * Examples:
 * "aaaaaaaaaaa..." → penalty
 * "!!!!!!!!!!!" → penalty
 * "Normal text with some !!! marks" → no penalty
 */
function calculateRepetitionPenalty(content: string, maxRepeated: number): number {
  const regex = new RegExp(`(.)\\1{${maxRepeated},}`, 'g');
  const matches = content.match(regex);

  if (!matches || matches.length === 0) {
    return 0;
  }

  // Penalty increases with number and length of repetitions
  const totalRepeated = matches.reduce((sum, match) => sum + match.length, 0);
  return Math.min(20, Math.floor(totalRepeated / 100) * 5);
}

/**
 * Determine action based on threat score
 */
export function determineAction(score: number, config: SanitizationConfig): SanitizationAction {
  if (!config.enabled) {
    return 'ALLOW';
  }

  if (score >= config.blockThreshold) {
    return 'BLOCK';
  }

  if (score >= config.sanitizeThreshold) {
    return 'SANITIZE';
  }

  return 'ALLOW';
}

/**
 * Get severity level for a score
 */
export function getScoreSeverity(score: number): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' {
  if (score >= 100) return 'CRITICAL';
  if (score >= 75) return 'HIGH';
  if (score >= 50) return 'MEDIUM';
  if (score >= 25) return 'LOW';
  return 'NONE';
}

/**
 * Check if content should be escalated from SANITIZE to BLOCK
 *
 * Escalation occurs when:
 * - Too much content would be removed (>50%)
 * - Resulting content would be too short (<100 chars)
 * - Multiple high-severity threats detected
 */
export function shouldEscalateToBlock(
  originalLength: number,
  sanitizedLength: number,
  threats: DetectedThreat[]
): boolean {
  // Check if >50% of content removed
  const removalPercentage = ((originalLength - sanitizedLength) / originalLength) * 100;
  if (removalPercentage > 50) {
    return true;
  }

  // Check if resulting content too short
  if (sanitizedLength < 100) {
    return true;
  }

  // Check if multiple CRITICAL threats
  const criticalThreats = threats.filter((t) => t.severity === 'CRITICAL');
  if (criticalThreats.length >= 2) {
    return true;
  }

  return false;
}

/**
 * Calculate average score from multiple content sections
 *
 * Used when analyzing transcript + title + description
 */
export function calculateAverageScore(scores: number[]): number {
  if (scores.length === 0) return 0;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

/**
 * Combine scores from multiple content sections with weights
 *
 * Weights:
 * - Transcript: 0.7 (most important)
 * - Title: 0.2 (visible to users)
 * - Description: 0.1 (less critical)
 */
export function calculateWeightedScore(
  transcriptScore: number,
  titleScore: number,
  descriptionScore: number
): number {
  return transcriptScore * 0.7 + titleScore * 0.2 + descriptionScore * 0.1;
}
