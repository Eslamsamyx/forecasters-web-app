/**
 * CSRF Protection Tests
 *
 * Comprehensive tests for CSRF validation logic and middleware.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateOrigin,
  validateCsrfToken,
  extractCsrfTokenValue,
  getCsrfTokenFromCookies,
  shouldSkipValidation,
  validateCsrf,
  getCsrfErrorMessage,
} from '../validator';
import type { CSRFValidationContext, CSRFConfig } from '../types';

describe('CSRF Validator Tests', () => {
  describe('extractCsrfTokenValue()', () => {
    it('should extract value from NextAuth format', () => {
      const token = 'abc123def456|hash_value_here';
      const value = extractCsrfTokenValue(token);
      expect(value).toBe('abc123def456');
    });

    it('should handle token without hash', () => {
      const token = 'abc123def456';
      const value = extractCsrfTokenValue(token);
      expect(value).toBe('abc123def456');
    });

    it('should return null for null token', () => {
      const value = extractCsrfTokenValue(null);
      expect(value).toBeNull();
    });

    it('should return null for empty token', () => {
      const value = extractCsrfTokenValue('');
      expect(value).toBeNull();
    });
  });

  describe('getCsrfTokenFromCookies()', () => {
    it('should get token from __Host prefix cookie', () => {
      const cookies = {
        '__Host-next-auth.csrf-token': 'token_value',
      };
      const token = getCsrfTokenFromCookies(cookies);
      expect(token).toBe('token_value');
    });

    it('should get token from __Secure prefix cookie', () => {
      const cookies = {
        '__Secure-next-auth.csrf-token': 'token_value',
      };
      const token = getCsrfTokenFromCookies(cookies);
      expect(token).toBe('token_value');
    });

    it('should get token from standard cookie', () => {
      const cookies = {
        'next-auth.csrf-token': 'token_value',
      };
      const token = getCsrfTokenFromCookies(cookies);
      expect(token).toBe('token_value');
    });

    it('should prioritize __Host prefix', () => {
      const cookies = {
        '__Host-next-auth.csrf-token': 'host_token',
        '__Secure-next-auth.csrf-token': 'secure_token',
        'next-auth.csrf-token': 'standard_token',
      };
      const token = getCsrfTokenFromCookies(cookies);
      expect(token).toBe('host_token');
    });

    it('should return null if no CSRF cookie found', () => {
      const cookies = {
        'other-cookie': 'value',
      };
      const token = getCsrfTokenFromCookies(cookies);
      expect(token).toBeNull();
    });
  });

  describe('validateOrigin()', () => {
    const allowedOrigins = ['https://opinionpointer.com', 'http://localhost:3000'];

    it('should accept valid origin', () => {
      const result = validateOrigin('https://opinionpointer.com', null, allowedOrigins);
      expect(result.valid).toBe(true);
    });

    it('should accept origin with trailing slash', () => {
      const result = validateOrigin('https://opinionpointer.com/', null, allowedOrigins);
      expect(result.valid).toBe(true);
    });

    it('should accept localhost', () => {
      const result = validateOrigin('http://localhost:3000', null, allowedOrigins);
      expect(result.valid).toBe(true);
    });

    it('should reject different origin', () => {
      const result = validateOrigin('https://evil.com', null, allowedOrigins);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('origin_mismatch');
    });

    it('should reject null origin', () => {
      const result = validateOrigin('null', null, allowedOrigins);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('null_origin');
    });

    it('should fall back to referer if origin missing', () => {
      const result = validateOrigin(
        null,
        'https://opinionpointer.com/some/page',
        allowedOrigins
      );
      expect(result.valid).toBe(true);
    });

    it('should reject if both origin and referer missing', () => {
      const result = validateOrigin(null, null, allowedOrigins);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('missing_origin');
    });

    it('should extract origin from referer URL', () => {
      const result = validateOrigin(
        null,
        'http://localhost:3000/dashboard',
        allowedOrigins
      );
      expect(result.valid).toBe(true);
    });

    it('should reject invalid referer URL', () => {
      const result = validateOrigin(null, 'not-a-valid-url', allowedOrigins);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('missing_origin');
    });

    it('should reject subdomain if not explicitly allowed', () => {
      const result = validateOrigin('https://evil.opinionpointer.com', null, allowedOrigins);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('origin_mismatch');
    });
  });

  describe('validateCsrfToken()', () => {
    it('should accept matching tokens', () => {
      const cookie = 'abc123|hash1';
      const header = 'abc123|hash2';
      const result = validateCsrfToken(cookie, header);
      expect(result.valid).toBe(true);
    });

    it('should reject mismatched tokens', () => {
      const cookie = 'abc123|hash1';
      const header = 'xyz789|hash2';
      const result = validateCsrfToken(cookie, header);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('invalid_token');
    });

    it('should reject missing cookie', () => {
      const result = validateCsrfToken(null, 'abc123|hash');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('missing_token');
    });

    it('should reject missing header', () => {
      const result = validateCsrfToken('abc123|hash', null);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('missing_token');
    });

    it('should reject both missing', () => {
      const result = validateCsrfToken(null, null);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('missing_token');
    });

    it('should accept tokens without hash', () => {
      const cookie = 'abc123';
      const header = 'abc123';
      const result = validateCsrfToken(cookie, header);
      expect(result.valid).toBe(true);
    });
  });

  describe('shouldSkipValidation()', () => {
    const baseConfig: CSRFConfig = {
      enabled: true,
      requireToken: true,
      checkOrigin: true,
      allowedOrigins: ['https://opinionpointer.com'],
      skipPublicProcedures: true,
      skipQueries: true,
    };

    const baseContext: CSRFValidationContext = {
      origin: 'https://opinionpointer.com',
      referer: null,
      csrfCookie: 'token',
      csrfHeader: 'token',
      hasSession: true,
      procedureType: 'mutation',
      path: '/api/test',
      method: 'POST',
    };

    it('should skip if CSRF disabled', () => {
      const config = { ...baseConfig, enabled: false };
      const result = shouldSkipValidation(baseContext, config);
      expect(result).toBe(true);
    });

    it('should skip for queries', () => {
      const context = { ...baseContext, procedureType: 'query' as const };
      const result = shouldSkipValidation(context, baseConfig);
      expect(result).toBe(true);
    });

    it('should skip for public procedures (no session)', () => {
      const context = { ...baseContext, hasSession: false };
      const result = shouldSkipValidation(context, baseConfig);
      expect(result).toBe(true);
    });

    it('should not skip for authenticated mutations', () => {
      const result = shouldSkipValidation(baseContext, baseConfig);
      expect(result).toBe(false);
    });

    it('should not skip if skipQueries is false', () => {
      const config = { ...baseConfig, skipQueries: false };
      const context = { ...baseContext, procedureType: 'query' as const };
      const result = shouldSkipValidation(context, config);
      expect(result).toBe(false);
    });

    it('should not skip if skipPublicProcedures is false', () => {
      const config = { ...baseConfig, skipPublicProcedures: false };
      const context = { ...baseContext, hasSession: false };
      const result = shouldSkipValidation(context, config);
      expect(result).toBe(false);
    });
  });

  describe('validateCsrf()', () => {
    const config: CSRFConfig = {
      enabled: true,
      requireToken: true,
      checkOrigin: true,
      allowedOrigins: ['https://opinionpointer.com'],
      skipPublicProcedures: true,
      skipQueries: true,
    };

    it('should pass full validation with valid request', () => {
      const context: CSRFValidationContext = {
        origin: 'https://opinionpointer.com',
        referer: null,
        csrfCookie: 'token123|hash',
        csrfHeader: 'token123|hash',
        hasSession: true,
        procedureType: 'mutation',
        path: '/api/test',
        method: 'POST',
      };

      const result = validateCsrf(context, config);
      expect(result.valid).toBe(true);
    });

    it('should fail on wrong origin', () => {
      const context: CSRFValidationContext = {
        origin: 'https://evil.com',
        referer: null,
        csrfCookie: 'token123|hash',
        csrfHeader: 'token123|hash',
        hasSession: true,
        procedureType: 'mutation',
        path: '/api/test',
        method: 'POST',
      };

      const result = validateCsrf(context, config);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('origin_mismatch');
    });

    it('should fail on missing token', () => {
      const context: CSRFValidationContext = {
        origin: 'https://opinionpointer.com',
        referer: null,
        csrfCookie: null,
        csrfHeader: null,
        hasSession: true,
        procedureType: 'mutation',
        path: '/api/test',
        method: 'POST',
      };

      const result = validateCsrf(context, config);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('missing_token');
    });

    it('should skip validation for queries', () => {
      const context: CSRFValidationContext = {
        origin: 'https://evil.com', // Would fail if not skipped
        referer: null,
        csrfCookie: null,
        csrfHeader: null,
        hasSession: true,
        procedureType: 'query',
        path: '/api/test',
        method: 'GET',
      };

      const result = validateCsrf(context, config);
      expect(result.valid).toBe(true);
      expect(result.reason).toBe('validation_skipped');
    });

    it('should skip validation for public procedures', () => {
      const context: CSRFValidationContext = {
        origin: 'https://opinionpointer.com',
        referer: null,
        csrfCookie: null,
        csrfHeader: null,
        hasSession: false,
        procedureType: 'mutation',
        path: '/api/register',
        method: 'POST',
      };

      const result = validateCsrf(context, config);
      expect(result.valid).toBe(true);
      expect(result.reason).toBe('validation_skipped');
    });

    it('should skip origin check if disabled', () => {
      const customConfig = { ...config, checkOrigin: false };
      const context: CSRFValidationContext = {
        origin: 'https://evil.com',
        referer: null,
        csrfCookie: 'token123|hash',
        csrfHeader: 'token123|hash',
        hasSession: true,
        procedureType: 'mutation',
        path: '/api/test',
        method: 'POST',
      };

      const result = validateCsrf(context, customConfig);
      expect(result.valid).toBe(true);
    });

    it('should skip token check if disabled', () => {
      const customConfig = { ...config, requireToken: false };
      const context: CSRFValidationContext = {
        origin: 'https://opinionpointer.com',
        referer: null,
        csrfCookie: null,
        csrfHeader: null,
        hasSession: true,
        procedureType: 'mutation',
        path: '/api/test',
        method: 'POST',
      };

      const result = validateCsrf(context, customConfig);
      expect(result.valid).toBe(true);
    });
  });

  describe('getCsrfErrorMessage()', () => {
    it('should return appropriate message for missing_token', () => {
      const result = { valid: false, reason: 'missing_token' as const };
      const message = getCsrfErrorMessage(result);
      expect(message).toContain('CSRF token is missing');
      expect(message).toContain('refresh');
    });

    it('should return appropriate message for invalid_token', () => {
      const result = { valid: false, reason: 'invalid_token' as const };
      const message = getCsrfErrorMessage(result);
      expect(message).toContain('CSRF token is invalid');
    });

    it('should return appropriate message for origin_mismatch', () => {
      const result = { valid: false, reason: 'origin_mismatch' as const };
      const message = getCsrfErrorMessage(result);
      expect(message).toContain('origin is not allowed');
    });

    it('should return appropriate message for missing_origin', () => {
      const result = { valid: false, reason: 'missing_origin' as const };
      const message = getCsrfErrorMessage(result);
      expect(message).toContain('origin could not be determined');
    });

    it('should return appropriate message for null_origin', () => {
      const result = { valid: false, reason: 'null_origin' as const };
      const message = getCsrfErrorMessage(result);
      expect(message).toContain('not allowed');
    });

    it('should return generic message for unknown reason', () => {
      const result = { valid: false };
      const message = getCsrfErrorMessage(result);
      expect(message).toContain('CSRF validation failed');
    });
  });
});
