/**
 * Security Logging Types
 *
 * Type definitions for security events and logging.
 */

export type SecurityEventType =
  // Authentication
  | 'AUTH_SUCCESS'
  | 'AUTH_FAILURE'
  | 'AUTH_LOGOUT'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET_COMPLETE'
  | 'PASSWORD_CHANGE'

  // Rate Limiting
  | 'RATE_LIMIT_EXCEEDED'
  | 'RATE_LIMIT_WARNING'
  | 'IP_BLOCKED'
  | 'IP_UNBLOCKED'

  // CSRF
  | 'CSRF_VIOLATION'
  | 'CSRF_TOKEN_MISSING'
  | 'CSRF_TOKEN_INVALID'

  // Input Validation
  | 'VALIDATION_FAILURE'
  | 'WEAK_PASSWORD_REJECTED'
  | 'BREACHED_PASSWORD_REJECTED'

  // AI Safety
  | 'AI_INJECTION_ATTEMPT'
  | 'AI_INPUT_SANITIZED'
  | 'AI_INPUT_REJECTED'
  | 'SUSPICIOUS_AI_INPUT'

  // API Access
  | 'API_REQUEST'
  | 'API_ERROR'
  | 'UNAUTHORIZED_ACCESS'
  | 'FORBIDDEN_ACCESS'

  // Admin Actions
  | 'ADMIN_ACCESS'
  | 'ADMIN_ACTION'
  | 'ADMIN_CONFIG_CHANGE'

  // System
  | 'SECURITY_ALERT'
  | 'SECURITY_SCAN'
  | 'ANOMALY_DETECTED';

export type SecuritySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SecurityCategory =
  | 'AUTH'
  | 'RATE_LIMIT'
  | 'CSRF'
  | 'INPUT_VALIDATION'
  | 'AI_SAFETY'
  | 'API_ACCESS'
  | 'ADMIN'
  | 'SYSTEM';

export interface SecurityEventData {
  // Event classification
  type: SecurityEventType;
  severity: SecuritySeverity;
  category: SecurityCategory;

  // Who
  userId?: string;
  ipAddress: string;
  userAgent?: string;
  sessionId?: string;

  // What
  action: string;
  resource: string;
  method: string;
  statusCode?: number;

  // When
  timestamp?: Date;
  duration?: number;

  // Where
  path: string;
  endpoint?: string;

  // Context
  metadata?: Record<string, any>;
  correlationId?: string;

  // Result
  success: boolean;
  errorMessage?: string;
  stackTrace?: string;
}

export interface AlertRule {
  threshold: number;
  window: number; // milliseconds
  severity: SecuritySeverity;
}

export interface AlertTrigger {
  rule: string;
  count: number;
  threshold: number;
  window: number;
  events: SecurityEventData[];
  triggeredAt: Date;
}

export interface SecurityLoggerStats {
  totalEvents: number;
  eventsInBuffer: number;
  lastFlushTime: Date | null;
  failedWrites: number;
  alertsSent: number;
}
