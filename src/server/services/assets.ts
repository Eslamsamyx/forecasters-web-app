import { prisma } from "../db";
import { PriceTrackingService } from "./priceTracking";
import { Decimal } from "@prisma/client/runtime/library";

export class AssetService {
  private priceTracker: PriceTrackingService;

  constructor() {
    this.priceTracker = new PriceTrackingService();
  }

  async updateAssetPrices(): Promise<void> {
    try {
      // Update all crypto prices
      await this.priceTracker.updateAssetPrices("CRYPTO");

      // Update all stock prices
      await this.priceTracker.updateAssetPrices("STOCK");

      console.log("✅ All asset prices updated successfully");
    } catch (error) {
      console.error("Failed to update asset prices:", error);
      throw error;
    }
  }

  async getAssetPrice(assetId: string): Promise<number | null> {
    try {
      const asset = await prisma.asset.findUnique({
        where: { id: assetId },
        select: { priceData: true }
      });

      if (!asset || !asset.priceData) {
        return null;
      }

      const priceData = asset.priceData as any;
      return priceData.price || null;
    } catch (error) {
      console.error(`Failed to get price for asset ${assetId}:`, error);
      return null;
    }
  }

  async validateAssetExists(assetId: string): Promise<boolean> {
    try {
      const asset = await prisma.asset.findUnique({
        where: { id: assetId },
        select: { id: true }
      });

      return !!asset;
    } catch (error) {
      console.error(`Failed to validate asset ${assetId}:`, error);
      return false;
    }
  }

  async updatePrice(assetId: string): Promise<void> {
    try {
      // Get asset details
      const asset = await prisma.asset.findUnique({
        where: { id: assetId },
        select: { symbol: true, type: true }
      });

      if (!asset) {
        throw new Error(`Asset ${assetId} not found`);
      }

      // Fetch latest price based on asset type
      let priceData;
      if (asset.type === "CRYPTO") {
        const prices = await this.priceTracker.fetchCryptoPrices([asset.symbol]);
        priceData = prices[0];
      } else if (asset.type === "STOCK") {
        const prices = await this.priceTracker.fetchStockPrices([asset.symbol]);
        priceData = prices[0];
      } else {
        // For ETF and COMMODITY, use mock data for now
        priceData = {
          symbol: asset.symbol,
          price: Math.random() * 1000,
          change24h: (Math.random() - 0.5) * 10,
          volume24h: Math.random() * 1000000
        };
      }

      if (!priceData) {
        console.error(`No price data available for ${asset.symbol}`);
        return;
      }

      // Update asset with latest price
      await prisma.asset.update({
        where: { id: assetId },
        data: {
          priceData: {
            price: priceData.price,
            change24h: priceData.change24h || null,
            volume24h: priceData.volume24h || null,
            updatedAt: new Date().toISOString(),
            source: asset.type === "CRYPTO" ? "binance" : "mock"
          }
        }
      });

      // Create price history record
      await prisma.priceHistory.create({
        data: {
          assetId: assetId,
          price: new Decimal(priceData.price),
          volume: priceData.volume24h ? new Decimal(priceData.volume24h) : null,
          source: asset.type === "CRYPTO" ? "binance" : "mock"
        }
      });

      console.log(`✅ Price updated for ${asset.symbol}: $${priceData.price}`);
    } catch (error) {
      console.error(`Failed to update price for asset ${assetId}:`, error);
      throw error;
    }
  }

  // Additional utility methods

  async getAssetBySymbol(symbol: string, type: string): Promise<any> {
    try {
      const asset = await prisma.asset.findUnique({
        where: {
          symbol_type: {
            symbol: symbol.toUpperCase(),
            type: type
          }
        }
      });

      return asset;
    } catch (error) {
      console.error(`Failed to get asset ${symbol} (${type}):`, error);
      return null;
    }
  }

  async createAsset(symbol: string, type: string, metadata?: any): Promise<any> {
    try {
      const asset = await prisma.asset.create({
        data: {
          symbol: symbol.toUpperCase(),
          type,
          metadata: metadata || {
            name: null,
            exchange: null,
            sector: null,
            marketCap: null
          },
          priceData: {
            price: null,
            change24h: null,
            volume24h: null,
            updatedAt: null,
            source: null
          }
        }
      });

      // Fetch initial price
      await this.updatePrice(asset.id);

      return asset;
    } catch (error) {
      console.error(`Failed to create asset ${symbol}:`, error);
      throw error;
    }
  }

  async getTopMovers(type: string, limit: number = 10): Promise<any[]> {
    try {
      const assets = await prisma.asset.findMany({
        where: { type },
        orderBy: {
          updatedAt: "desc"
        },
        take: limit
      });

      // Sort by price change
      return assets.sort((a, b) => {
        const aChange = (a.priceData as any)?.change24h || 0;
        const bChange = (b.priceData as any)?.change24h || 0;
        return Math.abs(bChange) - Math.abs(aChange);
      });
    } catch (error) {
      console.error(`Failed to get top movers:`, error);
      return [];
    }
  }

  async getAssetStats(assetId: string): Promise<any> {
    try {
      const [asset, predictions, history] = await Promise.all([
        prisma.asset.findUnique({
          where: { id: assetId }
        }),
        prisma.prediction.count({
          where: { assetId }
        }),
        prisma.priceHistory.findMany({
          where: {
            assetId,
            recordedAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            }
          },
          orderBy: { recordedAt: "asc" }
        })
      ]);

      if (!asset) return null;

      // Calculate stats
      const prices = history.map(h => h.price.toNumber());
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

      const currentPrice = (asset.priceData as any)?.price || 0;
      const firstPrice = prices[0] || 0;
      const weekChange = prices.length > 0 && firstPrice > 0
        ? ((currentPrice - firstPrice) / firstPrice) * 100
        : 0;

      return {
        asset,
        stats: {
          totalPredictions: predictions,
          weekMin: minPrice,
          weekMax: maxPrice,
          weekAvg: avgPrice,
          weekChange,
          dataPoints: history.length
        }
      };
    } catch (error) {
      console.error(`Failed to get asset stats:`, error);
      return null;
    }
  }
}