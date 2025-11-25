/**
 * Password Validation with Zod
 *
 * Production-ready password validation combining:
 * - Strength calculation (entropy-based)
 * - Breach checking (HaveIBeenPwned)
 * - Format requirements (length, complexity)
 */

import { z } from 'zod';
import { checkPasswordBreach } from './breach-check';
import { calculatePasswordStrength } from './strength';
import { securityConfig } from '../config';

/**
 * Password validation result
 */
export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  strength?: {
    score: number;
    rating: string;
    entropy: number;
    feedback: string[];
    estimatedCrackTime: string;
  };
  breach?: {
    isBreached: boolean;
    occurrences: number;
  };
}

/**
 * Base password schema - format requirements only
 * Use this for quick synchronous validation
 */
export const passwordFormatSchema = z
  .string()
  .min(
    securityConfig.password.minLength,
    `Password must be at least ${securityConfig.password.minLength} characters`
  )
  .max(
    securityConfig.password.maxLength,
    `Password must be no more than ${securityConfig.password.maxLength} characters`
  )
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

/**
 * Full password schema - includes async breach checking
 * Use this for registration/password change
 */
export const passwordSchema = passwordFormatSchema.superRefine(
  async (password, ctx) => {
    // Skip breach checking if disabled
    if (!securityConfig.password.checkBreaches) {
      return;
    }

    try {
      // Check if password has been breached
      const breachResult = await checkPasswordBreach(password);

      if (breachResult.isBreached) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `This password has been found in ${breachResult.occurrences.toLocaleString()} data breaches. Please choose a different password.`,
          path: [],
        });
      }
    } catch (error) {
      // Log error but don't fail validation (fail-open approach)
      console.error('[PasswordValidation] Breach check failed:', error);
      // Breach check failure should not block user registration
    }
  }
);

/**
 * Password confirmation schema
 * Use this for password + confirmation validation
 */
export const passwordConfirmationSchema = z
  .object({
    password: passwordFormatSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/**
 * Full password confirmation schema with breach checking
 */
export const passwordConfirmationWithBreachSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/**
 * Validate password format only (synchronous)
 * Returns validation result with strength analysis
 */
export function validatePasswordFormat(
  password: string
): PasswordValidationResult {
  const errors: string[] = [];

  try {
    passwordFormatSchema.parse(password);
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map((e) => e.message));
    }
  }

  // Calculate strength
  const strength = calculatePasswordStrength(password);

  // Add strength-based feedback as warnings (not errors)
  if (strength.rating === 'VERY_WEAK' || strength.rating === 'WEAK') {
    errors.push(
      `Password is ${strength.rating.toLowerCase().replace('_', ' ')}. Consider making it stronger.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    strength: {
      score: strength.score,
      rating: strength.rating,
      entropy: strength.entropy,
      feedback: strength.feedback,
      estimatedCrackTime: strength.estimatedCrackTime,
    },
  };
}

/**
 * Validate password with breach checking (asynchronous)
 * Returns comprehensive validation result
 */
export async function validatePassword(
  password: string
): Promise<PasswordValidationResult> {
  const errors: string[] = [];

  // First, check format
  try {
    passwordFormatSchema.parse(password);
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map((e) => e.message));
    }
  }

  // Calculate strength
  const strength = calculatePasswordStrength(password);

  // Warn about weak passwords
  if (strength.rating === 'VERY_WEAK' || strength.rating === 'WEAK') {
    errors.push(
      `Password is ${strength.rating.toLowerCase().replace('_', ' ')}. Consider making it stronger.`
    );
  }

  // Check for breaches if enabled
  let breachResult;
  if (securityConfig.password.checkBreaches) {
    try {
      breachResult = await checkPasswordBreach(password);

      if (breachResult.isBreached) {
        errors.push(
          `This password has been found in ${breachResult.occurrences.toLocaleString()} data breaches. Please choose a different password.`
        );
      }
    } catch (error) {
      // Log error but don't fail validation (fail-open)
      console.error('[PasswordValidation] Breach check failed:', error);
      breachResult = {
        isBreached: false,
        occurrences: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    strength: {
      score: strength.score,
      rating: strength.rating,
      entropy: strength.entropy,
      feedback: strength.feedback,
      estimatedCrackTime: strength.estimatedCrackTime,
    },
    breach: breachResult,
  };
}

/**
 * Validate password and confirmation together
 */
export async function validatePasswordWithConfirmation(
  password: string,
  confirmPassword: string
): Promise<PasswordValidationResult> {
  // First validate the password itself
  const result = await validatePassword(password);

  // Then check if passwords match
  if (password !== confirmPassword) {
    result.errors.push('Passwords do not match');
    result.valid = false;
  }

  return result;
}

/**
 * Check if password meets minimum strength requirements
 * Used for additional business logic (e.g., admin accounts requiring stronger passwords)
 */
export function meetsMinimumStrength(
  password: string,
  minScore: number = 60
): boolean {
  const strength = calculatePasswordStrength(password);
  return strength.score >= minScore;
}

/**
 * Get password strength feedback for UI
 * Returns user-friendly feedback for password strength indicator
 */
export function getPasswordStrengthFeedback(password: string) {
  if (!password || password.length === 0) {
    return {
      score: 0,
      rating: 'NONE',
      color: 'gray',
      message: 'Enter a password',
      suggestions: [],
    };
  }

  const strength = calculatePasswordStrength(password);

  // Map rating to UI-friendly colors
  const colorMap = {
    VERY_WEAK: 'red',
    WEAK: 'orange',
    FAIR: 'yellow',
    GOOD: 'blue',
    STRONG: 'green',
    VERY_STRONG: 'green',
  };

  // Map rating to user-friendly messages
  const messageMap = {
    VERY_WEAK: 'Very weak - please strengthen',
    WEAK: 'Weak - add more complexity',
    FAIR: 'Fair - could be stronger',
    GOOD: 'Good password',
    STRONG: 'Strong password',
    VERY_STRONG: 'Very strong password',
  };

  return {
    score: strength.score,
    rating: strength.rating,
    color: colorMap[strength.rating],
    message: messageMap[strength.rating],
    suggestions: strength.feedback,
    entropy: strength.entropy,
    estimatedCrackTime: strength.estimatedCrackTime,
  };
}

/**
 * Validate multiple passwords in batch (for testing/migration)
 * Returns validation results for each password
 */
export async function validateMultiplePasswords(
  passwords: string[]
): Promise<Map<string, PasswordValidationResult>> {
  const results = new Map<string, PasswordValidationResult>();

  // Validate in parallel but limit concurrency
  const batchSize = 10;
  for (let i = 0; i < passwords.length; i += batchSize) {
    const batch = passwords.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (password) => ({
        password,
        result: await validatePassword(password),
      }))
    );

    for (const { password, result } of batchResults) {
      results.set(password, result);
    }

    // Rate limiting: wait 100ms between batches
    if (i + batchSize < passwords.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return results;
}
