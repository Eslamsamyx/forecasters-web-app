/**
 * CSRF Protection Types
 *
 * Type definitions for Cross-Site Request Forgery protection.
 */

/**
 * CSRF validation result
 */
export interface CSRFValidationResult {
  valid: boolean;
  reason?:
    | 'missing_token'
    | 'invalid_token'
    | 'origin_mismatch'
    | 'missing_origin'
    | 'null_origin'
    | 'validation_skipped';
  details?: {
    origin?: string;
    expectedOrigins?: string[];
    hasToken?: boolean;
    hasSession?: boolean;
    procedureType?: string;
  };
}

/**
 * CSRF configuration
 */
export interface CSRFConfig {
  /** Enable CSRF protection */
  enabled: boolean;

  /** Require CSRF token validation (if false, only log violations) */
  requireToken: boolean;

  /** Check Origin/Referer headers */
  checkOrigin: boolean;

  /** Allowed origins for requests */
  allowedOrigins: string[];

  /** Skip CSRF validation for public procedures (no session) */
  skipPublicProcedures: boolean;

  /** Skip CSRF validation for query operations (read-only) */
  skipQueries: boolean;
}

/**
 * CSRF token pair (cookie and header)
 */
export interface CSRFTokenPair {
  cookieToken: string | null;
  headerToken: string | null;
}

/**
 * CSRF validation context
 */
export interface CSRFValidationContext {
  /** Request origin header */
  origin: string | null;

  /** Request referer header */
  referer: string | null;

  /** CSRF token from cookie */
  csrfCookie: string | null;

  /** CSRF token from header */
  csrfHeader: string | null;

  /** Whether user has active session */
  hasSession: boolean;

  /** tRPC procedure type (query or mutation) */
  procedureType: 'query' | 'mutation' | 'subscription';

  /** Request path */
  path: string;

  /** Request method */
  method: string;
}
