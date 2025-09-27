# Channel Collection System Migration Guide

This document outlines the complete migration from the old profile-based content collection system to the new ForecasterChannel table-based system.

## Overview

The new system provides:
- **Individual channel intervals**: Each channel can have its own `checkInterval` (not just hourly)
- **Keyword-based filtering**: Secondary channels only collect content matching specific keywords
- **Automatic collection triggers**: Channels are automatically collected after creation
- **Comprehensive edge case handling**: Rate limiting, API failures, duplicate detection
- **Detailed job tracking**: All collection activities are logged with statistics

## Database Schema Changes

The system now uses these existing tables:
- `ForecasterChannel`: Channel configuration with `isPrimary` flag and collection settings
- `ChannelKeyword`: Keywords for secondary channel filtering
- `ChannelCollectionJob`: Track collection job execution and results

## Architecture Changes

### Old System (Profile-based)
```typescript
// Old: Profile JSON structure
forecaster.profile = {
  channels: {
    youtube: { channelId: "...", channelName: "..." },
    twitter: { username: "..." }
  }
}

// Collection every hour for all channels
cron.schedule("0 * * * *", collectContent);
```

### New System (Table-based)
```typescript
// New: Structured database tables
ForecasterChannel {
  channelType: "YOUTUBE" | "TWITTER"
  isPrimary: boolean
  collectionSettings: {
    checkInterval: number // seconds
    lastChecked: string
    enabled: boolean
  }
}

// Dynamic collection based on individual intervals
processScheduledCollection() // Runs every 10 minutes, checks which channels are due
```

## Key Features

### 1. Dynamic Collection Intervals
- **Primary channels**: Collect ALL content (no filtering)
- **Secondary channels**: Only collect content matching keywords
- **Custom intervals**: Each channel can have different `checkInterval` (60s minimum)
- **Smart scheduling**: Cron runs every 10 minutes, but only processes channels due for collection

### 2. Keyword-Based Filtering
```typescript
// Secondary channels filter content by keywords
if (!channel.isPrimary) {
  const keywords = channel.keywords.map(k => k.keyword);
  if (!matchesKeywords(title, description, keywords)) {
    filtered++; // Skip this content
    continue;
  }
}
```

### 3. Automatic Collection Triggers
```typescript
// After channel creation, trigger immediate collection
setImmediate(async () => {
  await cronService.triggerChannelCollection(channel.id);
});
```

### 4. Edge Case Handling

#### Rate Limiting
- 2-second delays between API requests
- 1-second delays between individual items
- Exponential backoff for API errors

#### Duplicate Detection
- Check for duplicates within last 7 days
- Based on `sourceType + sourceId + forecasterId`

#### API Failure Recovery
- Graceful error handling for each channel
- Continue processing other channels if one fails
- Detailed error logging in collection jobs

#### Content Validation
- Minimum text length requirements (50 characters)
- Keyword matching for secondary channels
- Source URL validation

## Implementation Files

### Core Services
1. **`ChannelCollectionService`** (`/src/server/services/channelCollectionService.ts`)
   - Main collection logic
   - YouTube and Twitter collectors with keyword filtering
   - Duplicate detection and rate limiting

2. **Updated `CronService`** (`/src/server/services/cron.ts`)
   - New `collectChannelContent()` method
   - `triggerChannelCollection()` for immediate collection
   - Legacy fallback for backwards compatibility

3. **Updated Services Index** (`/src/server/services/index.ts`)
   - Added `ChannelCollectionService` to service registry
   - Updated cron service dependencies

### API Updates
4. **Updated Forecasters Router** (`/src/server/api/routers/forecasters.ts`)
   - Automatic collection trigger after channel creation
   - Enhanced channel management endpoints
   - Collection job management

## Migration Steps

### Phase 1: Deploy New System (Backwards Compatible)
1. ✅ Deploy new `ChannelCollectionService`
2. ✅ Update `CronService` with fallback to legacy system
3. ✅ Update API endpoints for automatic triggers
4. ✅ Test new channels use new system, existing use legacy

### Phase 2: Data Migration (Optional)
```sql
-- Migrate existing profile channels to ForecasterChannel table
INSERT INTO "ForecasterChannel" (
  "forecasterId", "channelType", "channelId", "channelName",
  "channelUrl", "isPrimary", "isActive", "collectionSettings"
)
SELECT
  f.id,
  'YOUTUBE',
  (f.profile->'channels'->'youtube'->>'channelId'),
  (f.profile->'channels'->'youtube'->>'channelName'),
  CONCAT('https://youtube.com/channel/', (f.profile->'channels'->'youtube'->>'channelId')),
  true,
  true,
  '{"checkInterval":3600,"lastChecked":null,"enabled":true}'::jsonb
FROM "Forecaster" f
WHERE f.profile->'channels'->'youtube' IS NOT NULL;
```

### Phase 3: Remove Legacy System
1. Remove `collectContentLegacy()` method from CronService
2. Remove profile-based channel references
3. Update documentation

## Testing Strategy

### Unit Tests (`channelCollection.test.ts`)
- ✅ Channel due checking logic
- ✅ Keyword matching functionality
- ✅ Duplicate detection
- ✅ Rate limiting delays
- ✅ Error handling for API failures
- ✅ YouTube and Twitter collection logic

### Integration Tests (`channelCollection.integration.test.ts`)
- ✅ End-to-end collection flow
- ✅ Database job tracking
- ✅ Channel interval respecting
- ✅ Statistics accuracy
- ✅ Cron service integration

### Manual Testing Checklist
- [ ] Create new forecaster with channels → automatic collection triggered
- [ ] Add secondary channel with keywords → only matching content collected
- [ ] Verify different checkInterval settings work
- [ ] Test API rate limiting doesn't break collection
- [ ] Confirm duplicate content is properly filtered
- [ ] Check collection job statistics are accurate

## Monitoring and Observability

### Collection Job Tracking
```typescript
// Every collection creates a job record
ChannelCollectionJob {
  channelId: string
  jobType: "FULL_SCAN" | "KEYWORD_SCAN" | "INCREMENTAL"
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED"
  videosFound: number
  videosProcessed: number
  predictionsExtracted: number
  error?: string
}
```

### Statistics API
```typescript
// Get collection statistics
const stats = await channelCollectionService.getCollectionStats();
// Returns: { channels: {total, active}, jobs: {recent}, content: {total} }
```

### Log Monitoring
```bash
# Key log patterns to monitor
grep "📥 Collecting from" logs/app.log  # Collection starts
grep "✅ Collection completed" logs/app.log  # Successful collections
grep "❌ Collection failed" logs/app.log  # Failed collections
grep "⚠️ Failed to trigger collection" logs/app.log  # Auto-trigger failures
```

## Performance Considerations

### Resource Usage
- **Memory**: Minimal impact, processes channels sequentially
- **Database**: Additional queries for channel configuration, but optimized with proper indexes
- **API**: Respects rate limits with built-in delays
- **CPU**: Light processing, most time spent on I/O operations

### Scaling
- **Horizontal**: Service can run on multiple instances (channels distributed naturally)
- **Vertical**: Rate limiting prevents overwhelming external APIs
- **Database**: Proper indexes on `ForecasterChannel.isActive` and collection job status

### Optimizations
- Collections run in parallel for different forecasters
- Duplicate checking limited to last 7 days
- Old collection jobs automatically cleaned up after 30 days

## Troubleshooting

### Common Issues

1. **Collection not triggering after channel creation**
   ```typescript
   // Check if cronService is properly initialized
   import { cronService } from "@/server/services";
   await cronService.triggerChannelCollection(channelId);
   ```

2. **Secondary channel not filtering correctly**
   ```sql
   -- Verify keywords exist and are active
   SELECT * FROM "ChannelKeyword"
   WHERE "channelId" = ? AND "isActive" = true;
   ```

3. **API rate limiting causing failures**
   ```typescript
   // Check rate limiting delays are working
   // Increase RATE_LIMIT_DELAY if needed
   private static readonly RATE_LIMIT_DELAY = 2000; // Increase if needed
   ```

4. **Duplicate content not being filtered**
   ```typescript
   // Check duplicate detection window
   private static readonly DUPLICATE_CHECK_DAYS = 7; // Adjust if needed
   ```

### Debug Tools

```typescript
// Force collection for specific channel
await cronService.triggerChannelCollection(channelId);

// Get channel configuration
const channel = await prisma.forecasterChannel.findUnique({
  where: { id: channelId },
  include: { keywords: true }
});

// Check recent collection jobs
const jobs = await prisma.channelCollectionJob.findMany({
  where: { channelId },
  orderBy: { createdAt: 'desc' },
  take: 10
});
```

## Future Enhancements

1. **Advanced Keyword Matching**
   - Regex pattern support
   - Negative keywords (exclusions)
   - Sentiment-based filtering

2. **Smart Interval Adjustment**
   - Automatically adjust intervals based on content frequency
   - Burst detection for trending topics

3. **Multi-Platform Support**
   - LinkedIn, TikTok, Reddit integration
   - Podcast and newsletter collection

4. **Machine Learning Integration**
   - Content quality scoring
   - Prediction relevance detection
   - Automatic keyword suggestion

## Conclusion

The new channel collection system provides a robust, scalable foundation for content collection with proper edge case handling, keyword-based filtering, and comprehensive monitoring. The implementation maintains backwards compatibility while enabling advanced features for future growth.

Key benefits:
- ✅ Individual channel intervals for optimal collection timing
- ✅ Keyword-based filtering for targeted content collection
- ✅ Automatic collection triggers for immediate feedback
- ✅ Comprehensive error handling and recovery
- ✅ Detailed tracking and monitoring capabilities
- ✅ Production-ready with proper testing coverage