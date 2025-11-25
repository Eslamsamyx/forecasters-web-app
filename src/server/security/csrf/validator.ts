/**
 * CSRF Validator
 *
 * Core validation logic for CSRF protection using double-submit cookie pattern.
 * Integrates with NextAuth CSRF tokens.
 */

import type {
  CSRFValidationResult,
  CSRFValidationContext,
  CSRFConfig,
} from './types';

/**
 * Validate request origin against allowed origins
 */
export function validateOrigin(
  origin: string | null,
  referer: string | null,
  allowedOrigins: string[]
): CSRFValidationResult {
  // No origin header - try referer as fallback
  if (!origin) {
    if (!referer) {
      return {
        valid: false,
        reason: 'missing_origin',
        details: {
          expectedOrigins: allowedOrigins,
        },
      };
    }

    // Extract origin from referer URL
    try {
      const refererUrl = new URL(referer);
      origin = refererUrl.origin;
    } catch {
      return {
        valid: false,
        reason: 'missing_origin',
        details: {
          expectedOrigins: allowedOrigins,
        },
      };
    }
  }

  // Reject null origins (privacy mode or file:// protocol)
  if (origin === 'null') {
    return {
      valid: false,
      reason: 'null_origin',
      details: {
        origin,
        expectedOrigins: allowedOrigins,
      },
    };
  }

  // Check if origin is in allowed list
  const isAllowed = allowedOrigins.some((allowed) => {
    // Normalize origins (remove trailing slashes)
    const normalizedOrigin = origin!.replace(/\/$/, '');
    const normalizedAllowed = allowed.replace(/\/$/, '');
    return normalizedOrigin === normalizedAllowed;
  });

  if (!isAllowed) {
    return {
      valid: false,
      reason: 'origin_mismatch',
      details: {
        origin,
        expectedOrigins: allowedOrigins,
      },
    };
  }

  return { valid: true };
}

/**
 * Extract CSRF token value from NextAuth cookie format
 *
 * NextAuth uses format: "value|hash" where hash is HMAC-SHA256 of value
 * We only need the value part for comparison
 */
export function extractCsrfTokenValue(token: string | null): string | null {
  if (!token) return null;

  // NextAuth format: "value|hash"
  const parts = token.split('|');
  if (parts.length === 0) return null;

  return parts[0] || null;
}

/**
 * Get CSRF token from cookies
 *
 * Checks multiple possible cookie names (production prefixes)
 */
export function getCsrfTokenFromCookies(
  cookies: Record<string, string>
): string | null {
  // Try different cookie name formats
  return (
    cookies['__Host-next-auth.csrf-token'] ||
    cookies['__Secure-next-auth.csrf-token'] ||
    cookies['next-auth.csrf-token'] ||
    null
  );
}

/**
 * Validate CSRF token matches between cookie and header
 */
export function validateCsrfToken(
  csrfCookie: string | null,
  csrfHeader: string | null
): CSRFValidationResult {
  // Both must be present
  if (!csrfCookie || !csrfHeader) {
    return {
      valid: false,
      reason: 'missing_token',
      details: {
        hasToken: !!(csrfCookie && csrfHeader),
      },
    };
  }

  // Extract values from NextAuth format
  const cookieValue = extractCsrfTokenValue(csrfCookie);
  const headerValue = extractCsrfTokenValue(csrfHeader);

  if (!cookieValue || !headerValue) {
    return {
      valid: false,
      reason: 'invalid_token',
    };
  }

  // Compare values (constant-time comparison would be better for security)
  if (cookieValue !== headerValue) {
    return {
      valid: false,
      reason: 'invalid_token',
    };
  }

  return { valid: true };
}

/**
 * Check if CSRF validation should be skipped for this request
 */
export function shouldSkipValidation(
  context: CSRFValidationContext,
  config: CSRFConfig
): boolean {
  // Skip if CSRF protection is disabled
  if (!config.enabled) {
    return true;
  }

  // Skip for query operations (read-only)
  if (config.skipQueries && context.procedureType === 'query') {
    return true;
  }

  // Skip for requests without session (public procedures)
  if (config.skipPublicProcedures && !context.hasSession) {
    return true;
  }

  return false;
}

/**
 * Perform complete CSRF validation
 *
 * Validates both origin and token according to configuration
 */
export function validateCsrf(
  context: CSRFValidationContext,
  config: CSRFConfig
): CSRFValidationResult {
  // Check if validation should be skipped
  if (shouldSkipValidation(context, config)) {
    return {
      valid: true,
      reason: 'validation_skipped',
      details: {
        hasSession: context.hasSession,
        procedureType: context.procedureType,
      },
    };
  }

  // Validate origin if enabled
  if (config.checkOrigin) {
    const originResult = validateOrigin(
      context.origin,
      context.referer,
      config.allowedOrigins
    );

    if (!originResult.valid) {
      return originResult;
    }
  }

  // Validate CSRF token if enabled
  if (config.requireToken) {
    const tokenResult = validateCsrfToken(
      context.csrfCookie,
      context.csrfHeader
    );

    if (!tokenResult.valid) {
      return tokenResult;
    }
  }

  return { valid: true };
}

/**
 * Get user-friendly error message for CSRF validation failure
 */
export function getCsrfErrorMessage(result: CSRFValidationResult): string {
  switch (result.reason) {
    case 'missing_token':
      return 'CSRF token is missing. Please refresh the page and try again.';
    case 'invalid_token':
      return 'CSRF token is invalid. Please refresh the page and try again.';
    case 'origin_mismatch':
      return 'Request origin is not allowed. Please access the application from the correct URL.';
    case 'missing_origin':
      return 'Request origin could not be determined. Please ensure your browser allows origin headers.';
    case 'null_origin':
      return 'Request origin is not allowed. Please disable privacy mode or use a supported browser.';
    default:
      return 'CSRF validation failed. Please refresh the page and try again.';
  }
}
