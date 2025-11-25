/**
 * Security Module - Main Export
 *
 * Central export point for all security features.
 */

// Configuration
export { securityConfig } from './config';
export type { SecurityConfig } from './config';

// Logging
export { SecurityLogger, securityLogger } from './logging/SecurityLogger';
export { AlertManager, alertManager } from './logging/AlertManager';
export { createSecurityLoggingMiddleware } from './logging/middleware';
export type {
  SecurityEventType,
  SecuritySeverity,
  SecurityCategory,
  SecurityEventData,
  AlertRule,
  AlertTrigger,
  SecurityLoggerStats,
} from './logging/types';

// Password Validation
export {
  passwordFormatSchema,
  passwordSchema,
  passwordConfirmationSchema,
  passwordConfirmationWithBreachSchema,
  validatePasswordFormat,
  validatePassword,
  validatePasswordWithConfirmation,
  meetsMinimumStrength,
  getPasswordStrengthFeedback,
  validateMultiplePasswords,
} from './password/validation';
export type { PasswordValidationResult } from './password/validation';
export { calculatePasswordStrength, generateStrongPassword } from './password/strength';
export type { PasswordStrength } from './password/strength';
export { checkPasswordBreach, checkMultiplePasswords } from './password/breach-check';
export type { BreachCheckResult } from './password/breach-check';

// CSRF Protection
export { createCsrfMiddleware, csrfMiddleware } from './csrf/middleware';
export {
  validateCsrf,
  validateOrigin,
  validateCsrfToken,
  getCsrfTokenFromCookies,
  extractCsrfTokenValue,
  shouldSkipValidation,
  getCsrfErrorMessage,
} from './csrf/validator';
export type {
  CSRFValidationResult,
  CSRFValidationContext,
  CSRFConfig,
  CSRFTokenPair,
} from './csrf/types';

// Rate Limiting
export { RateLimiter, getRateLimiter } from './rateLimit/RateLimiter';
export { createRateLimitMiddleware, rateLimitMiddleware } from './rateLimit/middleware';
export type {
  RateLimitStrategy,
  RateLimitStrategies,
  RateLimitConfig,
  RateLimitResult,
  RateLimitEntry,
  RequestRecord,
  RateLimiterStats,
  RateLimitContext,
} from './rateLimit/types';

// AI Sanitization
export { AiSanitizer, getAiSanitizer } from './aiSanitization/AiSanitizer';
export { getSanitizationCache } from './aiSanitization/cache';
export { ALL_PATTERNS, PATTERN_VERSION } from './aiSanitization/patterns';
export type {
  InputContent,
  ThreatPattern,
  DetectedThreat,
  SanitizationResult,
  SanitizationConfig,
  SanitizerStats,
  ThreatSeverity,
  SanitizationAction,
  ThreatCategory,
} from './aiSanitization/types';
