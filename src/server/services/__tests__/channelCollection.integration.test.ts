import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '../../db';
import { ChannelCollectionService } from '../channelCollectionService';
import { CronService } from '../cron';

/**
 * Integration tests for the channel collection system
 * These tests use a real database connection and test the full flow
 */

describe('Channel Collection Integration', () => {
  let testForecaster: any;
  let testChannel: any;
  let service: ChannelCollectionService;

  beforeEach(async () => {
    service = new ChannelCollectionService();

    // Create test forecaster
    testForecaster = await prisma.forecaster.create({
      data: {
        name: 'Test Forecaster',
        slug: 'test-forecaster-' + Date.now(),
        isVerified: true,
        profile: {
          bio: 'Test bio',
          avatar: null,
          links: {},
          expertise: ['crypto'],
        },
        metrics: {
          accuracy: 0,
          totalPredictions: 0,
          correctPredictions: 0,
          brierScore: null,
        },
      },
    });

    // Create test channel
    testChannel = await prisma.forecasterChannel.create({
      data: {
        forecasterId: testForecaster.id,
        channelType: 'YOUTUBE',
        channelId: 'UCtest123456',
        channelName: 'Test Channel',
        channelUrl: 'https://youtube.com/channel/UCtest123456',
        isPrimary: true,
        isActive: true,
        collectionSettings: {
          checkInterval: 3600,
          lastChecked: null,
          enabled: true,
        },
        metadata: {
          subscribers: null,
          verified: null,
          description: null,
        },
      },
    });
  });

  afterEach(async () => {
    // Cleanup test data
    if (testChannel) {
      await prisma.channelCollectionJob.deleteMany({
        where: { channelId: testChannel.id },
      });
      await prisma.channelKeyword.deleteMany({
        where: { channelId: testChannel.id },
      });
      await prisma.forecasterChannel.delete({
        where: { id: testChannel.id },
      });
    }

    if (testForecaster) {
      await prisma.content.deleteMany({
        where: { forecasterId: testForecaster.id },
      });
      await prisma.prediction.deleteMany({
        where: { forecasterId: testForecaster.id },
      });
      await prisma.forecaster.delete({
        where: { id: testForecaster.id },
      });
    }
  });

  test('should create and track collection jobs', async () => {
    // Mock the collection to avoid external API calls
    const originalMethod = (service as any).collectYouTubeChannel;
    (service as any).collectYouTubeChannel = async () => ({
      success: true,
      itemsCollected: 2,
      itemsFiltered: 1,
    });

    const result = await service.collectFromChannelImmediate(testChannel.id);

    expect(result.success).toBe(true);
    expect(result.itemsCollected).toBe(2);
    expect(result.itemsFiltered).toBe(1);

    // Verify collection job was created
    const job = await prisma.channelCollectionJob.findFirst({
      where: { channelId: testChannel.id },
    });

    expect(job).toBeTruthy();
    expect(job?.status).toBe('COMPLETED');
    expect(job?.videosProcessed).toBe(2);

    // Verify channel lastChecked was updated
    const updatedChannel = await prisma.forecasterChannel.findUnique({
      where: { id: testChannel.id },
    });

    const settings = updatedChannel?.collectionSettings as any;
    expect(settings.lastChecked).toBeTruthy();

    // Restore original method
    (service as any).collectYouTubeChannel = originalMethod;
  });

  test('should handle secondary channels with keywords', async () => {
    // Create secondary channel with keywords
    const secondaryChannel = await prisma.forecasterChannel.create({
      data: {
        forecasterId: testForecaster.id,
        channelType: 'TWITTER',
        channelId: 'testuser',
        channelName: 'Test User',
        channelUrl: 'https://twitter.com/testuser',
        isPrimary: false,
        isActive: true,
        collectionSettings: {
          checkInterval: 1800, // 30 minutes
          lastChecked: null,
          enabled: true,
        },
        metadata: {},
      },
    });

    // Add keywords
    await prisma.channelKeyword.createMany({
      data: [
        {
          channelId: secondaryChannel.id,
          keyword: 'bitcoin',
          isActive: true,
          isDefault: false,
        },
        {
          channelId: secondaryChannel.id,
          keyword: testForecaster.name,
          isActive: true,
          isDefault: true,
        },
      ],
    });

    // Mock the collection
    (service as any).collectTwitterChannel = async (channel: any) => {
      // Verify keywords are available
      expect(channel.keywords).toHaveLength(2);
      expect(channel.keywords.some((k: any) => k.keyword === 'bitcoin')).toBe(true);
      expect(channel.keywords.some((k: any) => k.isDefault)).toBe(true);

      return {
        success: true,
        itemsCollected: 1,
        itemsFiltered: 3,
      };
    };

    const result = await service.collectFromChannelImmediate(secondaryChannel.id);

    expect(result.success).toBe(true);
    expect(result.itemsCollected).toBe(1);
    expect(result.itemsFiltered).toBe(3);

    // Cleanup
    await prisma.channelCollectionJob.deleteMany({
      where: { channelId: secondaryChannel.id },
    });
    await prisma.channelKeyword.deleteMany({
      where: { channelId: secondaryChannel.id },
    });
    await prisma.forecasterChannel.delete({
      where: { id: secondaryChannel.id },
    });
  });

  test('should respect checkInterval for scheduled collection', async () => {
    // Set channel as recently checked
    const recentTime = new Date();
    await prisma.forecasterChannel.update({
      where: { id: testChannel.id },
      data: {
        collectionSettings: {
          checkInterval: 3600, // 1 hour
          lastChecked: recentTime.toISOString(),
          enabled: true,
        },
      },
    });

    // Should not collect since it was recently checked
    let processedCount = 0;
    (service as any).collectYouTubeChannel = async () => {
      processedCount++;
      return { success: true, itemsCollected: 0, itemsFiltered: 0 };
    };

    await service.processScheduledCollection();
    expect(processedCount).toBe(0);

    // Set channel as due for collection
    const oldTime = new Date();
    oldTime.setHours(oldTime.getHours() - 2); // 2 hours ago

    await prisma.forecasterChannel.update({
      where: { id: testChannel.id },
      data: {
        collectionSettings: {
          checkInterval: 3600, // 1 hour
          lastChecked: oldTime.toISOString(),
          enabled: true,
        },
      },
    });

    await service.processScheduledCollection();
    expect(processedCount).toBe(1);
  });

  test('should get accurate collection statistics', async () => {
    // Add some test content
    await prisma.content.create({
      data: {
        forecasterId: testForecaster.id,
        sourceType: 'YOUTUBE',
        sourceId: 'test-video-1',
        sourceUrl: 'https://youtube.com/watch?v=test-video-1',
        data: {
          title: 'Test Video',
          text: 'Test description',
        },
        status: 'COLLECTED',
      },
    });

    // Create collection job
    await prisma.channelCollectionJob.create({
      data: {
        channelId: testChannel.id,
        jobType: 'FULL_SCAN',
        status: 'COMPLETED',
        videosFound: 5,
        videosProcessed: 3,
        predictionsExtracted: 1,
      },
    });

    const stats = await service.getCollectionStats(testForecaster.id);

    expect(stats.channels.total).toBeGreaterThanOrEqual(1);
    expect(stats.channels.active).toBeGreaterThanOrEqual(1);
    expect(stats.content.total).toBeGreaterThanOrEqual(1);
  });

  test('should handle disabled channels correctly', async () => {
    // Disable the channel
    await prisma.forecasterChannel.update({
      where: { id: testChannel.id },
      data: {
        collectionSettings: {
          checkInterval: 3600,
          lastChecked: null,
          enabled: false, // Disabled
        },
      },
    });

    let processedCount = 0;
    (service as any).collectYouTubeChannel = async () => {
      processedCount++;
      return { success: true, itemsCollected: 0, itemsFiltered: 0 };
    };

    await service.processScheduledCollection();
    expect(processedCount).toBe(0); // Should not process disabled channels
  });

  test('should handle unverified forecasters correctly', async () => {
    // Set forecaster as unverified
    await prisma.forecaster.update({
      where: { id: testForecaster.id },
      data: { isVerified: false },
    });

    let processedCount = 0;
    (service as any).collectYouTubeChannel = async () => {
      processedCount++;
      return { success: true, itemsCollected: 0, itemsFiltered: 0 };
    };

    await service.processScheduledCollection();
    expect(processedCount).toBe(0); // Should not process unverified forecasters
  });
});

describe('Cron Integration', () => {
  test('should trigger collection through cron service', async () => {
    // Create a minimal mock for dependencies
    const mockServices = {
      asset: { updatePrice: async () => {} },
      validation: { validate: async () => {} },
      collection: { processScheduledCollection: async () => {} },
      channelCollection: {
        processScheduledCollection: async () => {},
        collectFromChannelImmediate: async () => ({ success: true, itemsCollected: 1, itemsFiltered: 0 }),
      },
      brierScore: { calculate: async () => {} },
      ranking: { updateAll: async () => {} },
    };

    const cronService = new CronService(
      mockServices.asset as any,
      mockServices.validation as any,
      mockServices.collection as any,
      mockServices.channelCollection as any,
      mockServices.brierScore as any,
      mockServices.ranking as any
    );

    // Test manual trigger
    const result = await cronService.triggerChannelCollection('test-channel-id');

    expect(result.success).toBe(true);
    expect(result.itemsCollected).toBe(1);

    // Verify job was logged
    const job = await prisma.job.findFirst({
      where: {
        type: 'CHANNEL_COLLECTION',
        payload: {
          path: ['channelId'],
          equals: 'test-channel-id',
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    expect(job).toBeTruthy();
    expect(job?.status).toBe('COMPLETED');
  });
});