/**
 * Scorer Tests
 *
 * Tests for threat scoring and action determination.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateThreatScore,
  determineAction,
  getScoreSeverity,
  shouldEscalateToBlock,
  calculateWeightedScore,
} from '../scorer';
import type { DetectedThreat, SanitizationConfig } from '../types';

const defaultConfig: SanitizationConfig = {
  enabled: true,
  blockThreshold: 75,
  sanitizeThreshold: 50,
  warnThreshold: 25,
  maxInputLength: 100000,
  maxRepeatedChars: 50,
  cacheEnabled: true,
  cacheTtl: 86400000,
  logAllAttempts: false,
};

describe('Threat Score Calculation', () => {
  it('should calculate simple sum of threat scores', () => {
    const threats: DetectedThreat[] = [
      {
        pattern: 'test1',
        category: 'instruction_override',
        severity: 'CRITICAL',
        score: 100,
        match: 'test',
        position: 0,
      },
      {
        pattern: 'test2',
        category: 'jailbreak',
        severity: 'HIGH',
        score: 50,
        match: 'test',
        position: 10,
      },
    ];

    const score = calculateThreatScore(threats, 'test content', defaultConfig);
    expect(score).toBeGreaterThanOrEqual(150); // Sum of scores
  });

  it('should apply length penalty for excessive content', () => {
    const threats: DetectedThreat[] = [];
    const longContent = 'a'.repeat(150000); // 150k chars (over 100k limit)

    const score = calculateThreatScore(threats, longContent, defaultConfig);
    expect(score).toBeGreaterThan(0); // Should have length penalty
  });

  it('should apply repetition penalty', () => {
    const threats: DetectedThreat[] = [];
    const repetitiveContent = 'a'.repeat(200); // More than maxRepeatedChars

    const score = calculateThreatScore(threats, repetitiveContent, defaultConfig);
    expect(score).toBeGreaterThan(0); // Should have repetition penalty
  });

  it('should reduce score for whitelisted phrases', () => {
    const threats: DetectedThreat[] = [
      {
        pattern: 'medium_threat',
        category: 'output_manipulation',
        severity: 'MEDIUM',
        score: 40,
        match: 'test',
        position: 0,
      },
    ];

    const contentWithWhitelist = 'Let me show you the economic system analysis';
    const contentWithout = 'Some random content here';

    const scoreWith = calculateThreatScore(threats, contentWithWhitelist, defaultConfig);
    const scoreWithout = calculateThreatScore(threats, contentWithout, defaultConfig);

    expect(scoreWith).toBeLessThan(scoreWithout);
  });
});

describe('Action Determination', () => {
  it('should BLOCK for score >= blockThreshold', () => {
    expect(determineAction(100, defaultConfig)).toBe('BLOCK');
    expect(determineAction(75, defaultConfig)).toBe('BLOCK');
  });

  it('should SANITIZE for score >= sanitizeThreshold and < blockThreshold', () => {
    expect(determineAction(74, defaultConfig)).toBe('SANITIZE');
    expect(determineAction(50, defaultConfig)).toBe('SANITIZE');
  });

  it('should ALLOW for score < sanitizeThreshold', () => {
    expect(determineAction(49, defaultConfig)).toBe('ALLOW');
    expect(determineAction(25, defaultConfig)).toBe('ALLOW');
    expect(determineAction(0, defaultConfig)).toBe('ALLOW');
  });

  it('should ALLOW all when disabled', () => {
    const disabledConfig = { ...defaultConfig, enabled: false };

    expect(determineAction(100, disabledConfig)).toBe('ALLOW');
    expect(determineAction(75, disabledConfig)).toBe('ALLOW');
    expect(determineAction(50, disabledConfig)).toBe('ALLOW');
  });
});

describe('Score Severity Classification', () => {
  it('should classify CRITICAL for score >= 100', () => {
    expect(getScoreSeverity(100)).toBe('CRITICAL');
    expect(getScoreSeverity(150)).toBe('CRITICAL');
  });

  it('should classify HIGH for score >= 75', () => {
    expect(getScoreSeverity(75)).toBe('HIGH');
    expect(getScoreSeverity(99)).toBe('HIGH');
  });

  it('should classify MEDIUM for score >= 50', () => {
    expect(getScoreSeverity(50)).toBe('MEDIUM');
    expect(getScoreSeverity(74)).toBe('MEDIUM');
  });

  it('should classify LOW for score >= 25', () => {
    expect(getScoreSeverity(25)).toBe('LOW');
    expect(getScoreSeverity(49)).toBe('LOW');
  });

  it('should classify NONE for score < 25', () => {
    expect(getScoreSeverity(24)).toBe('NONE');
    expect(getScoreSeverity(0)).toBe('NONE');
  });
});

describe('Escalation to Block', () => {
  it('should escalate when >50% removed', () => {
    const result = shouldEscalateToBlock(1000, 400, []); // 60% removed
    expect(result).toBe(true);
  });

  it('should escalate when resulting content <100 chars', () => {
    const result = shouldEscalateToBlock(500, 50, []);
    expect(result).toBe(true);
  });

  it('should escalate when multiple CRITICAL threats', () => {
    const threats: DetectedThreat[] = [
      {
        pattern: 'critical1',
        category: 'instruction_override',
        severity: 'CRITICAL',
        score: 100,
        match: 'test',
        position: 0,
      },
      {
        pattern: 'critical2',
        category: 'data_exfiltration',
        severity: 'CRITICAL',
        score: 100,
        match: 'test',
        position: 10,
      },
    ];

    const result = shouldEscalateToBlock(1000, 800, threats);
    expect(result).toBe(true);
  });

  it('should NOT escalate for normal sanitization', () => {
    const threats: DetectedThreat[] = [
      {
        pattern: 'medium',
        category: 'output_manipulation',
        severity: 'MEDIUM',
        score: 40,
        match: 'test',
        position: 0,
      },
    ];

    const result = shouldEscalateToBlock(1000, 800, threats); // 20% removed, >100 chars
    expect(result).toBe(false);
  });
});

describe('Weighted Scoring', () => {
  it('should weight transcript highest (70%)', () => {
    const score = calculateWeightedScore(100, 0, 0);
    expect(score).toBe(70);
  });

  it('should weight title medium (20%)', () => {
    const score = calculateWeightedScore(0, 100, 0);
    expect(score).toBe(20);
  });

  it('should weight description lowest (10%)', () => {
    const score = calculateWeightedScore(0, 0, 100);
    expect(score).toBe(10);
  });

  it('should combine all weights correctly', () => {
    const score = calculateWeightedScore(100, 50, 20);
    // 100 * 0.7 + 50 * 0.2 + 20 * 0.1 = 70 + 10 + 2 = 82
    expect(score).toBe(82);
  });
});

describe('Edge Cases', () => {
  it('should handle zero threats', () => {
    const score = calculateThreatScore([], 'clean content', defaultConfig);
    expect(score).toBe(0);
  });

  it('should handle empty content', () => {
    const threats: DetectedThreat[] = [];
    const score = calculateThreatScore(threats, '', defaultConfig);
    expect(score).toBe(0);
  });

  it('should handle very high scores', () => {
    const threats: DetectedThreat[] = Array(10).fill({
      pattern: 'critical',
      category: 'instruction_override',
      severity: 'CRITICAL',
      score: 100,
      match: 'test',
      position: 0,
    });

    const score = calculateThreatScore(threats, 'content', defaultConfig);
    expect(score).toBeGreaterThanOrEqual(1000);
    expect(determineAction(score, defaultConfig)).toBe('BLOCK');
  });

  it('should handle negative scores (shouldn\'t happen but be safe)', () => {
    const action = determineAction(-10, defaultConfig);
    expect(action).toBe('ALLOW');
  });
});
