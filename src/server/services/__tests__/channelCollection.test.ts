import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { ChannelCollectionService } from '../channelCollectionService';
import { prisma } from '../../db';

// Mock external dependencies
vi.mock('../../db', () => ({
  prisma: {
    forecasterChannel: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    channelCollectionJob: {
      create: vi.fn(),
      update: vi.fn(),
    },
    content: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('@/env.mjs', () => ({
  env: {
    GOOGLE_API_KEY: 'test-google-key',
    RAPIDAPI_KEY: 'test-rapidapi-key',
  },
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('ChannelCollectionService', () => {
  let service: ChannelCollectionService;

  beforeEach(() => {
    service = new ChannelCollectionService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('processScheduledCollection', () => {
    test('should process channels due for collection', async () => {
      // Mock channels due for collection
      const mockChannels = [
        {
          id: 'channel-1',
          forecasterId: 'forecaster-1',
          channelType: 'YOUTUBE',
          channelId: 'UCtest123',
          channelUrl: 'https://youtube.com/channel/UCtest123',
          isPrimary: true,
          isActive: true,
          collectionSettings: {
            checkInterval: 3600,
            lastChecked: null,
            enabled: true,
          },
          keywords: [],
        },
      ];

      (prisma.forecasterChannel.findMany as any).mockResolvedValue(mockChannels);

      // Mock YouTube API responses
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            items: [{
              contentDetails: {
                relatedPlaylists: { uploads: 'UUtest123' }
              }
            }]
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            items: [
              {
                snippet: {
                  resourceId: { videoId: 'video-1' },
                  title: 'Test Video',
                  description: 'Test Description',
                }
              }
            ]
          }),
        });

      (prisma.content.findFirst as any).mockResolvedValue(null); // No duplicates
      (prisma.channelCollectionJob.create as any).mockResolvedValue({ id: 'job-1' });
      (prisma.channelCollectionJob.update as any).mockResolvedValue({});
      (prisma.forecasterChannel.update as any).mockResolvedValue({});

      await service.processScheduledCollection();

      expect(prisma.forecasterChannel.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          forecaster: { isVerified: true },
        },
        include: expect.any(Object),
      });

      expect(prisma.channelCollectionJob.create).toHaveBeenCalled();
    });

    test('should handle empty channels list', async () => {
      (prisma.forecasterChannel.findMany as any).mockResolvedValue([]);

      await service.processScheduledCollection();

      expect(prisma.channelCollectionJob.create).not.toHaveBeenCalled();
    });

    test('should handle collection errors gracefully', async () => {
      const mockChannels = [
        {
          id: 'channel-1',
          forecasterId: 'forecaster-1',
          channelType: 'YOUTUBE',
          channelId: 'UCtest123',
          channelUrl: 'https://youtube.com/channel/UCtest123',
          isPrimary: true,
          isActive: true,
          collectionSettings: {
            checkInterval: 3600,
            lastChecked: null,
            enabled: true,
          },
          keywords: [],
        },
      ];

      (prisma.forecasterChannel.findMany as any).mockResolvedValue(mockChannels);
      (global.fetch as any).mockRejectedValue(new Error('API Error'));
      (prisma.channelCollectionJob.create as any).mockResolvedValue({ id: 'job-1' });
      (prisma.channelCollectionJob.update as any).mockResolvedValue({});

      await service.processScheduledCollection();

      // Should not throw, should handle gracefully
      expect(prisma.channelCollectionJob.update).toHaveBeenCalledWith({
        where: { id: 'job-1' },
        data: expect.objectContaining({
          status: 'FAILED',
          error: expect.any(String),
        }),
      });
    });
  });

  describe('collectFromChannelImmediate', () => {
    test('should collect from channel immediately', async () => {
      const channelId = 'channel-1';
      const mockChannel = {
        id: channelId,
        forecasterId: 'forecaster-1',
        channelType: 'YOUTUBE',
        channelId: 'UCtest123',
        channelUrl: 'https://youtube.com/channel/UCtest123',
        isPrimary: true,
        isActive: true,
        collectionSettings: {
          checkInterval: 3600,
          lastChecked: null,
          enabled: true,
        },
        keywords: [],
      };

      (prisma.forecasterChannel.findUnique as any).mockResolvedValue(mockChannel);
      (prisma.channelCollectionJob.create as any).mockResolvedValue({ id: 'job-1' });
      (prisma.channelCollectionJob.update as any).mockResolvedValue({});
      (prisma.forecasterChannel.update as any).mockResolvedValue({});

      // Mock YouTube API responses
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            items: [{
              contentDetails: {
                relatedPlaylists: { uploads: 'UUtest123' }
              }
            }]
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            items: [
              {
                snippet: {
                  resourceId: { videoId: 'video-1' },
                  title: 'Test Video',
                  description: 'Test Description',
                }
              }
            ]
          }),
        });

      (prisma.content.findFirst as any).mockResolvedValue(null); // No duplicates

      const result = await service.collectFromChannelImmediate(channelId);

      expect(result.success).toBe(true);
      expect(result.itemsCollected).toBeGreaterThanOrEqual(0);
      expect(prisma.forecasterChannel.findUnique).toHaveBeenCalledWith({
        where: { id: channelId },
        include: expect.any(Object),
      });
    });

    test('should return error for non-existent channel', async () => {
      const channelId = 'non-existent';
      (prisma.forecasterChannel.findUnique as any).mockResolvedValue(null);

      const result = await service.collectFromChannelImmediate(channelId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('YouTube Collection', () => {
    test('should collect YouTube videos with keyword filtering', async () => {
      const mockChannel = {
        id: 'channel-1',
        forecasterId: 'forecaster-1',
        channelType: 'YOUTUBE',
        channelId: 'UCtest123',
        channelUrl: 'https://youtube.com/channel/UCtest123',
        isPrimary: false, // Secondary channel with keywords
        isActive: true,
        collectionSettings: {
          checkInterval: 3600,
          lastChecked: null,
          enabled: true,
        },
        keywords: [
          { keyword: 'bitcoin', isActive: true },
          { keyword: 'ethereum', isActive: true },
        ],
      };

      // Mock YouTube API responses
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            items: [{
              contentDetails: {
                relatedPlaylists: { uploads: 'UUtest123' }
              }
            }]
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            items: [
              {
                snippet: {
                  resourceId: { videoId: 'video-1' },
                  title: 'Bitcoin Price Prediction',
                  description: 'Analysis of bitcoin trends',
                }
              },
              {
                snippet: {
                  resourceId: { videoId: 'video-2' },
                  title: 'Random Topic',
                  description: 'Nothing about crypto',
                }
              },
            ]
          }),
        });

      (prisma.content.findFirst as any).mockResolvedValue(null); // No duplicates
      (prisma.channelCollectionJob.create as any).mockResolvedValue({ id: 'job-1' });
      (prisma.channelCollectionJob.update as any).mockResolvedValue({});
      (prisma.forecasterChannel.update as any).mockResolvedValue({});

      const result = await service.collectFromChannelImmediate(mockChannel.id);

      expect(result.success).toBe(true);
      expect(result.itemsCollected).toBe(1); // Only one matches keywords
      expect(result.itemsFiltered).toBe(1); // One filtered out
    });

    test('should handle YouTube API errors', async () => {
      const mockChannel = {
        id: 'channel-1',
        forecasterId: 'forecaster-1',
        channelType: 'YOUTUBE',
        channelId: 'UCtest123',
        channelUrl: 'https://youtube.com/channel/UCtest123',
        isPrimary: true,
        isActive: true,
        collectionSettings: {
          checkInterval: 3600,
          lastChecked: null,
          enabled: true,
        },
        keywords: [],
      };

      (prisma.forecasterChannel.findUnique as any).mockResolvedValue(mockChannel);
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 403,
      });

      (prisma.channelCollectionJob.create as any).mockResolvedValue({ id: 'job-1' });
      (prisma.channelCollectionJob.update as any).mockResolvedValue({});

      const result = await service.collectFromChannelImmediate(mockChannel.id);

      expect(result.success).toBe(false);
      expect(result.error).toContain('YouTube API error');
    });
  });

  describe('Twitter Collection', () => {
    test('should collect Twitter tweets with keyword filtering', async () => {
      const mockChannel = {
        id: 'channel-1',
        forecasterId: 'forecaster-1',
        channelType: 'TWITTER',
        channelId: 'testuser',
        channelUrl: 'https://twitter.com/testuser',
        isPrimary: false,
        isActive: true,
        collectionSettings: {
          checkInterval: 3600,
          lastChecked: null,
          enabled: true,
        },
        keywords: [
          { keyword: 'crypto', isActive: true },
        ],
      };

      // Mock Twitter API responses
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            data: { id: 'user123' }
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            data: [
              {
                id: 'tweet-1',
                text: 'Crypto market analysis today',
                created_at: new Date().toISOString(),
              },
              {
                id: 'tweet-2',
                text: 'Random tweet about weather',
                created_at: new Date().toISOString(),
              },
            ]
          }),
        });

      (prisma.forecasterChannel.findUnique as any).mockResolvedValue(mockChannel);
      (prisma.content.findFirst as any).mockResolvedValue(null); // No duplicates
      (prisma.channelCollectionJob.create as any).mockResolvedValue({ id: 'job-1' });
      (prisma.channelCollectionJob.update as any).mockResolvedValue({});
      (prisma.forecasterChannel.update as any).mockResolvedValue({});

      const result = await service.collectFromChannelImmediate(mockChannel.id);

      expect(result.success).toBe(true);
      expect(result.itemsCollected).toBe(1); // Only one matches keywords
      expect(result.itemsFiltered).toBe(1); // One filtered out
    });

    test('should handle Twitter API errors', async () => {
      const mockChannel = {
        id: 'channel-1',
        forecasterId: 'forecaster-1',
        channelType: 'TWITTER',
        channelId: 'testuser',
        channelUrl: 'https://twitter.com/testuser',
        isPrimary: true,
        isActive: true,
        collectionSettings: {
          checkInterval: 3600,
          lastChecked: null,
          enabled: true,
        },
        keywords: [],
      };

      (prisma.forecasterChannel.findUnique as any).mockResolvedValue(mockChannel);
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
      });

      (prisma.channelCollectionJob.create as any).mockResolvedValue({ id: 'job-1' });
      (prisma.channelCollectionJob.update as any).mockResolvedValue({});

      const result = await service.collectFromChannelImmediate(mockChannel.id);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Twitter API error');
    });
  });

  describe('Edge Cases', () => {
    test('should handle rate limiting with delays', async () => {
      const startTime = Date.now();

      // Mock a delay function to test rate limiting
      const service = new ChannelCollectionService();
      const delayPromise = (service as any).delay(100);

      await delayPromise;
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(95); // Allow for some variance
    });

    test('should detect duplicate content correctly', async () => {
      const service = new ChannelCollectionService();

      // Mock existing content
      (prisma.content.findFirst as any).mockResolvedValue({
        id: 'existing-content',
        processedAt: new Date(),
      });

      const isDuplicate = await (service as any).isDuplicateContent(
        'YOUTUBE',
        'video-123',
        'forecaster-1'
      );

      expect(isDuplicate).toBe(true);
      expect(prisma.content.findFirst).toHaveBeenCalledWith({
        where: {
          sourceType: 'YOUTUBE',
          sourceId: 'video-123',
          forecasterId: 'forecaster-1',
          processedAt: {
            gte: expect.any(Date),
          },
        },
      });
    });

    test('should match keywords correctly', async () => {
      const service = new ChannelCollectionService();

      const keywords = ['bitcoin', 'ethereum', 'crypto'];

      // Test positive matches
      expect((service as any).matchesKeywords(
        'Bitcoin price prediction',
        'Analysis of bitcoin trends',
        keywords
      )).toBe(true);

      expect((service as any).matchesKeywords(
        'Ethereum update',
        '',
        keywords
      )).toBe(true);

      // Test negative matches
      expect((service as any).matchesKeywords(
        'Weather forecast',
        'Today will be sunny',
        keywords
      )).toBe(false);

      // Test empty keywords (should return true)
      expect((service as any).matchesKeywords(
        'Any content',
        'Any description',
        []
      )).toBe(true);
    });

    test('should handle channel due checking correctly', async () => {
      const service = new ChannelCollectionService();

      // Channel never checked before
      const neverChecked = {
        collectionSettings: {
          checkInterval: 3600,
          lastChecked: null,
          enabled: true,
        },
      };

      expect((service as any).isChannelDueForCollection(neverChecked)).toBe(true);

      // Channel checked recently
      const recentlyChecked = {
        collectionSettings: {
          checkInterval: 3600,
          lastChecked: new Date().toISOString(),
          enabled: true,
        },
      };

      expect((service as any).isChannelDueForCollection(recentlyChecked)).toBe(false);

      // Channel checked long ago
      const oldDate = new Date();
      oldDate.setHours(oldDate.getHours() - 2); // 2 hours ago

      const longAgoChecked = {
        collectionSettings: {
          checkInterval: 3600, // 1 hour
          lastChecked: oldDate.toISOString(),
          enabled: true,
        },
      };

      expect((service as any).isChannelDueForCollection(longAgoChecked)).toBe(true);
    });
  });

  describe('Error Recovery', () => {
    test('should continue processing other channels if one fails', async () => {
      const mockChannels = [
        {
          id: 'channel-1',
          forecasterId: 'forecaster-1',
          channelType: 'YOUTUBE',
          channelId: 'UCtest123',
          isPrimary: true,
          isActive: true,
          collectionSettings: { checkInterval: 3600, lastChecked: null, enabled: true },
          keywords: [],
        },
        {
          id: 'channel-2',
          forecasterId: 'forecaster-2',
          channelType: 'YOUTUBE',
          channelId: 'UCtest456',
          isPrimary: true,
          isActive: true,
          collectionSettings: { checkInterval: 3600, lastChecked: null, enabled: true },
          keywords: [],
        },
      ];

      (prisma.forecasterChannel.findMany as any).mockResolvedValue(mockChannels);

      // First channel fails, second succeeds
      (global.fetch as any)
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            items: [{ contentDetails: { relatedPlaylists: { uploads: 'UUtest456' }}}]
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ items: [] }),
        });

      (prisma.channelCollectionJob.create as any).mockResolvedValue({ id: 'job-1' });
      (prisma.channelCollectionJob.update as any).mockResolvedValue({});
      (prisma.forecasterChannel.update as any).mockResolvedValue({});

      await service.processScheduledCollection();

      // Should have attempted both channels
      expect(prisma.channelCollectionJob.create).toHaveBeenCalledTimes(2);
    });
  });
});