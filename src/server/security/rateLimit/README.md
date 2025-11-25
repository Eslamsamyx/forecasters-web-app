# Rate Limiting System

## Overview

Production-ready sliding window rate limiter with automatic cleanup, blocking, and tiered strategies. Uses in-memory storage for fast performance without Redis dependency.

## Features

- ✅ **Sliding Window Algorithm** - Precise rate limiting with moving time windows
- ✅ **Tiered Strategies** - Different limits for auth, queries, mutations, admin, AI operations
- ✅ **Automatic Blocking** - Clients blocked after exceeding limits
- ✅ **IP & User-Based** - Rate limit by IP address or authenticated user ID
- ✅ **Whitelist Support** - Bypass rate limiting for trusted IPs
- ✅ **Automatic Cleanup** - Memory-efficient with automatic old entry removal
- ✅ **Comprehensive Stats** - Track violations, blocked clients, and request patterns
- ✅ **Security Logging** - Integration with SecurityLogger for monitoring
- ✅ **Feature Flags** - Enable/disable without code changes
- ✅ **Test Coverage** - 29 comprehensive tests (100% coverage)

## Architecture

```
┌─────────────────┐
│   tRPC Request  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  rateLimitMiddleware    │
│  - Extract client ID    │
│  - Determine strategy   │
│  - Check rate limit     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│    RateLimiter.check()  │
│  - Sliding window logic │
│  - Block if exceeded    │
│  - Update request log   │
└────────┬────────────────┘
         │
         ├──► ✅ Allowed → Continue
         └──► ❌ Blocked → TRPCError + Log
```

## Configuration

### Environment Variables

```bash
# Feature flag (default: OFF for gradual rollout)
ENABLE_RATE_LIMITING=true

# Rate limit by user ID instead of IP (default: OFF)
RATE_LIMIT_BY_USER=true

# Whitelist IPs (comma-separated)
RATE_LIMIT_WHITELIST=192.168.1.100,10.0.0.1
```

### Default Strategies

```typescript
strategies: {
  auth: { limit: 5, window: 900000 },        // 5 per 15 minutes
  queries: { limit: 100, window: 60000 },    // 100 per minute
  mutations: { limit: 30, window: 60000 },   // 30 per minute
  admin: { limit: 50, window: 60000 },       // 50 per minute
  aiExtraction: { limit: 10, window: 3600000 } // 10 per hour
}

blockDuration: 3600000  // Block for 1 hour after exceeding
cleanupInterval: 60000  // Clean old entries every minute
```

## Usage

### Basic Integration (tRPC)

```typescript
import { createRateLimitMiddleware } from '@/server/security';

// Create middleware
const rateLimitProtection = createRateLimitMiddleware(t);

// Apply to procedures
export const publicProcedure = t.procedure
  .use(rateLimitProtection);

export const protectedProcedure = t.procedure
  .use(enforceUserIsAuthed)
  .use(rateLimitProtection);
```

### Direct Usage (Advanced)

```typescript
import { RateLimiter } from '@/server/security';

const rateLimiter = new RateLimiter({
  enabled: true,
  strategies: {
    api: { limit: 100, window: 60000 }
  },
  blockDuration: 3600000,
  cleanupInterval: 60000,
  limitByUser: false,
  whitelistedIps: []
});

// Check rate limit
const result = rateLimiter.check('client-id', {
  limit: 100,
  window: 60000
});

if (!result.allowed) {
  console.log(`Blocked: ${result.reason}`);
  console.log(`Retry after: ${result.retryAfter} seconds`);
}

// Get statistics
const stats = rateLimiter.getStats();
console.log(`Total requests: ${stats.totalRequests}`);
console.log(`Violations: ${stats.totalViolations}`);
console.log(`Blocked clients: ${stats.blockedClients}`);

// Manual operations
rateLimiter.block('client-id', 3600000);  // Block for 1 hour
rateLimiter.unblock('client-id');          // Remove block
rateLimiter.reset('client-id');            // Reset rate limit
```

## Strategy Selection Logic

The middleware automatically selects the appropriate strategy:

```typescript
// AI extraction endpoints (most restrictive)
/extract*, /ai* → aiExtraction strategy

// Admin operations
user.role === 'ADMIN' → admin strategy

// Authentication operations
/auth*, /login*, /register* → auth strategy

// Mutations (state-changing)
type === 'mutation' → mutations strategy

// Queries (read-only)
type === 'query' → queries strategy
```

## Rate Limit Headers

Responses include rate limit information:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 2025-01-24T12:34:56.789Z
```

## Error Handling

### Rate Limit Exceeded

```typescript
// Response when limit exceeded
{
  code: 'TOO_MANY_REQUESTS',
  message: 'Rate limit exceeded. Try again in 3600 seconds.'
}
```

### Security Logging

All violations are automatically logged:

```typescript
{
  type: 'RATE_LIMIT_EXCEEDED',
  severity: 'HIGH',
  category: 'RATE_LIMIT',
  userId: 'user-123',
  ipAddress: '192.168.1.100',
  resource: '/api/trpc/forecasts.create',
  metadata: {
    reason: 'limit_exceeded',
    current: 31,
    limit: 30,
    strategy: 'mutations',
    clientId: 'user:user-123'
  }
}
```

## Sliding Window Algorithm

### How It Works

```
Time:     0ms    100ms   200ms   300ms   400ms   500ms
Request:   ●              ●       ●
Window:   [----200ms----->]      [----200ms----->]
Count:     1               2       2               1

At 300ms: 2 requests in last 200ms (request at 100ms + 300ms)
At 500ms: 1 request in last 200ms (only request at 300ms)
```

### Benefits

- **Precise**: Counts exact requests within sliding time window
- **Fair**: No burst at window boundaries (unlike fixed windows)
- **Efficient**: O(1) amortized time complexity with automatic cleanup
- **Memory-Safe**: Automatic removal of old entries

## Monitoring & Statistics

### Overall Statistics

```typescript
const stats = rateLimiter.getStats();

{
  totalClients: 150,       // Total unique clients tracked
  blockedClients: 3,       // Currently blocked clients
  totalRequests: 25430,    // All-time request count
  totalViolations: 47,     // All-time violations
  memoryEntries: 150       // Current memory usage
}
```

### Client Statistics

```typescript
const clientStats = rateLimiter.getClientStats('user:123');

{
  requests: [
    { timestamp: 1706103123000, path: '/api/trpc/user.profile' },
    { timestamp: 1706103125000, path: '/api/trpc/user.update' }
  ],
  blockedUntil: null,
  totalRequests: 47,
  firstRequest: 1706100000000,
  lastRequest: 1706103125000
}
```

## Performance Considerations

### Memory Usage

- **Per Client**: ~200-500 bytes
- **1000 Clients**: ~0.5 MB
- **10,000 Clients**: ~5 MB
- **Automatic Cleanup**: Removes inactive clients

### Computation Cost

- **Check**: O(n) where n = requests in window (typically < 100)
- **Cleanup**: O(m) where m = total clients (runs every minute)
- **Memory**: O(c × r) where c = clients, r = requests per client

### Scalability

- ✅ **Single Server**: Handles 10,000+ clients easily
- ✅ **Load Balancing**: Use `limitByUser: true` for consistency
- ⚠️ **Multi-Server**: Consider Redis for shared state
- ⚠️ **High Traffic**: Monitor memory usage, adjust cleanup interval

## Security Best Practices

### 1. Enable Gradually

```typescript
// Start with disabled, monitor logs
ENABLE_RATE_LIMITING=false

// Enable for specific endpoints
if (path.includes('/admin')) {
  // Apply rate limiting
}

// Full rollout
ENABLE_RATE_LIMITING=true
```

### 2. Whitelist Trusted IPs

```bash
# Internal services, monitoring tools
RATE_LIMIT_WHITELIST=10.0.0.1,192.168.1.100
```

### 3. Monitor Violations

```typescript
// Alert on high violation rate
const stats = rateLimiter.getStats();
if (stats.totalViolations > 100) {
  sendAlert('High rate limit violations');
}
```

### 4. Adjust Strategies

```typescript
// Lower limits for sensitive operations
aiExtraction: { limit: 5, window: 3600000 }  // 5 per hour

// Higher limits for read-only operations
queries: { limit: 500, window: 60000 }  // 500 per minute
```

### 5. Use User-Based Limiting

```bash
# More accurate for authenticated APIs
RATE_LIMIT_BY_USER=true
```

## Testing

### Run Tests

```bash
# All rate limiting tests
npm test -- src/server/security/rateLimit/__tests__/rateLimit.test.ts

# Specific test
npm test -- src/server/security/rateLimit/__tests__/rateLimit.test.ts -t "should block requests exceeding limit"
```

### Test Coverage

- ✅ Basic rate limiting (4 tests)
- ✅ Sliding window behavior (2 tests)
- ✅ Blocking/unblocking (5 tests)
- ✅ Reset and clear (2 tests)
- ✅ Whitelist (2 tests)
- ✅ Statistics (5 tests)
- ✅ Cleanup (3 tests)
- ✅ Record function (2 tests)
- ✅ Disabled mode (1 test)
- ✅ Edge cases (3 tests)

**Total: 29 tests (100% passing)**

## Troubleshooting

### Issue: Rate limits too strict

**Solution**: Adjust strategy limits

```typescript
// config.ts
strategies: {
  queries: { limit: 200, window: 60000 }  // Increase from 100
}
```

### Issue: Legitimate traffic blocked

**Solution**: Add to whitelist

```bash
RATE_LIMIT_WHITELIST=192.168.1.100,10.0.0.1
```

### Issue: Memory usage growing

**Solution**: Adjust cleanup interval

```typescript
cleanupInterval: 30000  // Clean every 30 seconds instead of 60
```

### Issue: Inconsistent limits across servers

**Solution**: Use user-based limiting

```bash
RATE_LIMIT_BY_USER=true
```

### Issue: MaxListenersExceededWarning

**Cause**: Multiple RateLimiter instances in tests

**Solution**: Use singleton pattern

```typescript
// Use getRateLimiter() instead of new RateLimiter()
const rateLimiter = getRateLimiter(config);
```

## Migration Guide

### From No Rate Limiting

1. **Deploy with feature flag OFF**
   ```bash
   ENABLE_RATE_LIMITING=false
   ```

2. **Monitor logs** for rate limit patterns

3. **Adjust strategies** based on traffic

4. **Enable gradually**
   ```bash
   ENABLE_RATE_LIMITING=true
   ```

### From Fixed Window

```typescript
// Before: Fixed window (bucket resets every minute)
limit: 100,
window: 60000,
// At 00:00:00 → 100 requests allowed
// At 00:00:59 → 100 more requests allowed (burst!)

// After: Sliding window (continuous)
limit: 100,
window: 60000,
// At 00:00:00 → 100 requests in last 60 seconds
// At 00:00:59 → Still 100 requests in last 60 seconds (fair!)
```

### From Redis-Based

```typescript
// Before: Redis storage
const rateLimiter = new RedisRateLimiter(redisClient);

// After: In-memory storage
const rateLimiter = getRateLimiter(securityConfig.rateLimiting);

// Note: For multi-server, consider keeping Redis
```

## API Reference

### RateLimiter Class

#### Constructor

```typescript
constructor(config: RateLimitConfig)
```

#### Methods

```typescript
check(clientId: string, strategy: RateLimitStrategy): RateLimitResult
record(clientId: string, metadata?: Partial<RequestRecord>): void
reset(clientId: string): void
block(clientId: string, durationMs: number): void
unblock(clientId: string): void
isBlocked(clientId: string): boolean
getClientStats(clientId: string): RateLimitEntry | null
getStats(): RateLimiterStats
cleanup(): void
shutdown(): void
clear(): void
```

### Types

```typescript
interface RateLimitStrategy {
  limit: number;           // Max requests allowed
  window: number;          // Time window in milliseconds
  blockDuration?: number;  // Override default block duration
}

interface RateLimitResult {
  allowed: boolean;        // Whether request is allowed
  reason?: 'limit_exceeded' | 'blocked';
  current: number;         // Current request count
  limit: number;           // Max allowed
  resetIn: number;         // Milliseconds until reset
  retryAfter: number;      // Seconds to wait
}

interface RateLimiterStats {
  totalClients: number;    // Unique clients tracked
  blockedClients: number;  // Currently blocked
  totalRequests: number;   // All-time requests
  totalViolations: number; // All-time violations
  memoryEntries: number;   // Memory usage
}
```

## Related Documentation

- [Security Logging](../logging/README.md)
- [CSRF Protection](../csrf/README.md)
- [Password Validation](../password/README.md)
- [AI Sanitization](../aiSanitization/README.md) (Coming Soon)

## License

Part of the Prism Security Module
