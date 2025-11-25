/**
 * Security Configuration
 *
 * Central configuration for all security features.
 * Use environment variables to enable/disable features.
 */

export const securityConfig = {
  // Feature flags
  features: {
    logging: process.env.ENABLE_SECURITY_LOGGING !== 'false', // Default: ON
    rateLimiting: process.env.ENABLE_RATE_LIMITING === 'true',
    csrf: process.env.ENABLE_CSRF === 'true',
    strictPasswords: process.env.ENABLE_STRICT_PASSWORDS === 'true',
    aiSanitization: process.env.ENABLE_AI_SANITIZATION === 'true',
  },

  // Logging configuration
  logging: {
    batchSize: 100, // Write to DB after 100 events
    flushInterval: 5000, // Or every 5 seconds
    fallbackToFile: true, // Write to file if DB fails
    logFilePath: './logs/security.log',
  },

  // Alert configuration
  alerts: {
    rules: {
      AUTH_FAILURE: { threshold: 5, window: 900000, severity: 'MEDIUM' }, // 5 in 15min
      RATE_LIMIT_EXCEEDED: { threshold: 10, window: 60000, severity: 'HIGH' }, // 10 in 1min
      CSRF_VIOLATION: { threshold: 3, window: 300000, severity: 'HIGH' }, // 3 in 5min
      AI_INJECTION_ATTEMPT: { threshold: 1, window: 3600000, severity: 'CRITICAL' }, // 1 in 1hr
      ADMIN_ACCESS: { threshold: 1, window: 0, severity: 'INFO' }, // Always log
    },
    emailTo: process.env.ADMIN_EMAIL || 'admin@opinionpointer.com',
    webhookUrl: process.env.SECURITY_WEBHOOK_URL,
  },

  // Rate limiting configuration
  rateLimiting: {
    enabled: process.env.ENABLE_RATE_LIMITING === 'true', // Default: OFF (for gradual rollout)
    limitByUser: process.env.RATE_LIMIT_BY_USER === 'true', // Default: OFF (IP-based only)
    whitelistedIps: process.env.RATE_LIMIT_WHITELIST?.split(',').map((ip) => ip.trim()) || [],
    strategies: {
      auth: { limit: 5, window: 900000 }, // 5 per 15 minutes
      queries: { limit: 100, window: 60000 }, // 100 per minute
      mutations: { limit: 30, window: 60000 }, // 30 per minute
      admin: { limit: 50, window: 60000 }, // 50 per minute
      aiExtraction: { limit: 10, window: 3600000 }, // 10 per hour
    },
    blockDuration: 3600000, // Block for 1 hour
    cleanupInterval: 60000, // Clean old entries every minute
  },

  // Password validation configuration
  password: {
    minLength: 12,
    maxLength: 128,
    checkBreaches: true,
    breachApiTimeout: 3000, // 3 seconds
    breachApiUrl: 'https://api.pwnedpasswords.com/range',
  },

  // CSRF protection configuration
  csrf: {
    enabled: process.env.ENABLE_CSRF === 'true', // Default: OFF (for gradual rollout)
    requireToken: process.env.CSRF_REQUIRE_TOKEN !== 'false', // Default: ON
    checkOrigin: process.env.CSRF_CHECK_ORIGIN !== 'false', // Default: ON
    allowedOrigins:
      process.env.CSRF_ALLOWED_ORIGINS?.split(',').map((o) => o.trim()) || [
        process.env.NEXTAUTH_URL || 'http://localhost:3000',
      ],
    skipPublicProcedures:
      process.env.CSRF_SKIP_PUBLIC_PROCEDURES !== 'false', // Default: ON
    skipQueries: process.env.CSRF_SKIP_QUERIES !== 'false', // Default: ON
  },

  // AI sanitization configuration
  aiSanitization: {
    enabled: process.env.ENABLE_AI_SANITIZATION === 'true', // Default: OFF (for gradual rollout)
    blockThreshold: parseInt(process.env.AI_BLOCK_THRESHOLD || '75'),
    sanitizeThreshold: parseInt(process.env.AI_SANITIZE_THRESHOLD || '50'),
    warnThreshold: parseInt(process.env.AI_WARN_THRESHOLD || '25'),
    maxInputLength: parseInt(process.env.AI_MAX_INPUT_LENGTH || '100000'), // 100k characters
    maxRepeatedChars: parseInt(process.env.AI_MAX_REPEATED_CHARS || '50'),
    cacheEnabled: process.env.AI_CACHE_ENABLED !== 'false', // Default: ON
    cacheTtl: parseInt(process.env.AI_CACHE_TTL_HOURS || '24') * 60 * 60 * 1000, // Default: 24 hours
    logAllAttempts: process.env.AI_LOG_ALL_ATTEMPTS === 'true', // Default: OFF (only log >= WARN)
  },
};

export type SecurityConfig = typeof securityConfig;
