/**
 * HaveIBeenPwned Breach Checker
 *
 * Checks passwords against the HaveIBeenPwned database using k-anonymity model.
 * This ensures password privacy - only first 5 chars of SHA-1 hash are sent.
 *
 * API Documentation: https://haveibeenpwned.com/API/v3#PwnedPasswords
 */

import { securityConfig } from '../config';
import crypto from 'crypto';

export interface BreachCheckResult {
  isBreached: boolean;
  occurrences: number;
  error?: string;
}

/**
 * Check if password has been found in data breaches
 * Uses k-anonymity model - only sends first 5 chars of hash
 */
export async function checkPasswordBreach(password: string): Promise<BreachCheckResult> {
  try {
    // Generate SHA-1 hash of password
    const sha1Hash = crypto
      .createHash('sha1')
      .update(password)
      .digest('hex')
      .toUpperCase();

    // Split hash: first 5 chars (prefix) and rest (suffix)
    const hashPrefix = sha1Hash.substring(0, 5);
    const hashSuffix = sha1Hash.substring(5);

    // Call HaveIBeenPwned API with only the prefix (k-anonymity)
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      securityConfig.password.breachApiTimeout
    );

    const response = await fetch(
      `${securityConfig.password.breachApiUrl}/${hashPrefix}`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'OpinionPointer-Security-Check',
        },
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      // API error - fail open (allow password but log)
      console.warn('[BreachCheck] API returned non-200:', response.status);
      return {
        isBreached: false,
        occurrences: 0,
        error: `API returned ${response.status}`,
      };
    }

    // Parse response - format: "SUFFIX:COUNT\r\n"
    const responseText = await response.text();
    const hashes = responseText.split('\r\n');

    // Search for our hash suffix
    for (const line of hashes) {
      const [suffix, countStr] = line.split(':');
      if (suffix === hashSuffix) {
        const occurrences = parseInt(countStr || '0', 10);
        return {
          isBreached: true,
          occurrences,
        };
      }
    }

    // Password not found in breaches
    return {
      isBreached: false,
      occurrences: 0,
    };
  } catch (error) {
    // Network error, timeout, etc. - fail open (allow password but log)
    console.error('[BreachCheck] Error:', error);
    return {
      isBreached: false,
      occurrences: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check multiple passwords in parallel (for testing/migration)
 */
export async function checkMultiplePasswords(
  passwords: string[]
): Promise<Map<string, BreachCheckResult>> {
  const results = new Map<string, BreachCheckResult>();

  // Check in parallel but limit concurrency
  const batchSize = 10;
  for (let i = 0; i < passwords.length; i += batchSize) {
    const batch = passwords.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (password) => ({
        password,
        result: await checkPasswordBreach(password),
      }))
    );

    for (const { password, result } of batchResults) {
      results.set(password, result);
    }

    // Rate limiting: wait 100ms between batches to be nice to API
    if (i + batchSize < passwords.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return results;
}
