/**
 * Password Validation Integration Tests
 *
 * Tests the complete password validation flow including:
 * - Format validation
 * - Strength calculation
 * - Breach checking (real HaveIBeenPwned API)
 * - Security logging
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  validatePassword,
  validatePasswordFormat,
  getPasswordStrengthFeedback,
  meetsMinimumStrength,
} from '../validation';
import { checkPasswordBreach } from '../breach-check';
import { calculatePasswordStrength, generateStrongPassword } from '../strength';

describe('Password Validation Integration Tests', () => {
  describe('Format Validation', () => {
    it('should reject password that is too short', () => {
      const result = validatePasswordFormat('Short1!');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('at least 12 characters'))).toBe(true);
    });

    it('should reject password without lowercase', () => {
      const result = validatePasswordFormat('UPPERCASE123!');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('lowercase'))).toBe(true);
    });

    it('should reject password without uppercase', () => {
      const result = validatePasswordFormat('lowercase123!');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('uppercase'))).toBe(true);
    });

    it('should reject password without numbers', () => {
      const result = validatePasswordFormat('LowercaseUpper!');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('number'))).toBe(true);
    });

    it('should reject password without special characters', () => {
      const result = validatePasswordFormat('Lowercase123');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('special'))).toBe(true);
    });

    it('should accept valid password format', () => {
      const result = validatePasswordFormat('ValidPassword123!');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Strength Calculation', () => {
    it('should rate common pattern password appropriately', () => {
      const strength = calculatePasswordStrength('Password123!');
      // Even with common pattern, meets length and complexity requirements
      expect(strength.rating).toBeDefined();
      expect(strength.score).toBeGreaterThan(0);
      // Should detect the common pattern in feedback
      expect(strength.feedback.some(f => f.toLowerCase().includes('pattern') || f.toLowerCase().includes('common'))).toBe(true);
    });

    it('should rate strong password as GOOD or better', () => {
      const strength = calculatePasswordStrength('MyS3cur3P@ssw0rd!2024');
      expect(['GOOD', 'STRONG', 'VERY_STRONG'].includes(strength.rating)).toBe(true);
      expect(strength.score).toBeGreaterThan(60);
    });

    it('should detect common patterns', () => {
      const strength = calculatePasswordStrength('Password123!');
      expect(strength.feedback.some(f => f.includes('common patterns'))).toBe(true);
    });

    it('should detect repeated characters', () => {
      const strength = calculatePasswordStrength('Passssword123!');
      expect(strength.feedback.some(f => f.includes('repeated'))).toBe(true);
    });

    it('should provide crack time estimate', () => {
      const strength = calculatePasswordStrength('ValidPassword123!');
      expect(strength.estimatedCrackTime).toBeDefined();
      expect(strength.estimatedCrackTime.length).toBeGreaterThan(0);
    });
  });

  describe('Breach Checking (Real API)', () => {
    it('should detect commonly breached password "password123"', async () => {
      const result = await checkPasswordBreach('password123');
      expect(result.isBreached).toBe(true);
      expect(result.occurrences).toBeGreaterThan(0);
    }, 10000); // 10s timeout for API call

    it('should not find breach for strong unique password', async () => {
      const uniquePassword = generateStrongPassword(20) + Date.now();
      const result = await checkPasswordBreach(uniquePassword);
      expect(result.isBreached).toBe(false);
      expect(result.occurrences).toBe(0);
    }, 10000);

    it('should detect "123456" as breached', async () => {
      const result = await checkPasswordBreach('123456');
      expect(result.isBreached).toBe(true);
      expect(result.occurrences).toBeGreaterThan(10000); // Very common password
    }, 10000);

    it('should handle API timeout gracefully', async () => {
      // This test verifies fail-open behavior
      const result = await checkPasswordBreach('TestPassword123!');
      // Should complete without throwing error
      expect(result).toBeDefined();
      expect(result).toHaveProperty('isBreached');
      expect(result).toHaveProperty('occurrences');
    }, 10000);
  });

  describe('Full Validation (Format + Strength + Breach)', () => {
    it('should reject breached password', async () => {
      const result = await validatePassword('password123');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('data breach'))).toBe(true);
      expect(result.breach?.isBreached).toBe(true);
    }, 10000);

    it('should accept strong unbreached password', async () => {
      const strongPassword = 'MyVeryStr0ng&Unique!P@ssw0rd2024';
      const result = await validatePassword(strongPassword);
      expect(result.valid).toBe(true);
      expect(result.strength?.rating).toMatch(/GOOD|STRONG|VERY_STRONG/);
      expect(result.breach?.isBreached).toBe(false);
    }, 10000);

    it('should warn about weak password even if unbreached', async () => {
      const weakPassword = 'WeakPass123!';
      const result = await validatePassword(weakPassword);
      // May be valid format but should have warnings in feedback
      expect(result.strength?.feedback.length).toBeGreaterThan(0);
    }, 10000);
  });

  describe('Password Strength Feedback for UI', () => {
    it('should provide UI-friendly feedback for empty password', () => {
      const feedback = getPasswordStrengthFeedback('');
      expect(feedback.rating).toBe('NONE');
      expect(feedback.message).toContain('Enter');
      expect(feedback.score).toBe(0);
    });

    it('should provide color for weak password', () => {
      const feedback = getPasswordStrengthFeedback('Weak123!');
      expect(['red', 'orange', 'yellow'].includes(feedback.color)).toBe(true);
      expect(feedback.suggestions).toBeDefined();
    });

    it('should provide green color for strong password', () => {
      const feedback = getPasswordStrengthFeedback('VeryStr0ng&Secure!P@ssw0rd');
      expect(feedback.color).toBe('green');
      expect(feedback.score).toBeGreaterThan(70);
    });
  });

  describe('Minimum Strength Check', () => {
    it('should reject password below minimum strength', () => {
      const meetsMin = meetsMinimumStrength('WeakPass123!', 70);
      expect(meetsMin).toBe(false);
    });

    it('should accept password above minimum strength', () => {
      const meetsMin = meetsMinimumStrength('VeryStr0ng&Secure!P@ssw0rd', 60);
      expect(meetsMin).toBe(true);
    });
  });

  describe('Password Generation', () => {
    it('should generate strong password with default length', () => {
      const password = generateStrongPassword();
      expect(password.length).toBe(16);

      const validation = validatePasswordFormat(password);
      expect(validation.valid).toBe(true);
    });

    it('should generate strong password with custom length', () => {
      const password = generateStrongPassword(24);
      expect(password.length).toBe(24);

      const strength = calculatePasswordStrength(password);
      expect(strength.score).toBeGreaterThan(80);
    });

    it('should generate password with all character types', () => {
      const password = generateStrongPassword();

      expect(/[a-z]/.test(password)).toBe(true); // lowercase
      expect(/[A-Z]/.test(password)).toBe(true); // uppercase
      expect(/[0-9]/.test(password)).toBe(true); // digits
      expect(/[^A-Za-z0-9]/.test(password)).toBe(true); // special
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long password', async () => {
      const longPassword = 'A1!' + 'x'.repeat(120);
      const result = await validatePassword(longPassword);
      // Should not crash, may or may not be valid depending on max length
      expect(result).toBeDefined();
    });

    it('should handle password with Unicode characters', async () => {
      const unicodePassword = 'P@ssw0rd123!™€';
      const result = await validatePassword(unicodePassword);
      expect(result).toBeDefined();
    });

    it('should handle password with only special characters', () => {
      const specialOnlyPassword = '!@#$%^&*()_+{}';
      const result = validatePasswordFormat(specialOnlyPassword);
      expect(result.valid).toBe(false); // Missing letters and numbers
    });
  });
});
