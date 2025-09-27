import { prisma } from "../db";
import { Decimal } from "@prisma/client/runtime/library";

interface PriceData {
  symbol: string;
  price: number;
  change24h?: number;
  volume24h?: number;
  marketCap?: number;
}

export class PriceTrackingService {
  // Fetch crypto prices from Binance API
  async fetchCryptoPrices(symbols: string[]): Promise<PriceData[]> {
    try {
      const baseUrl = "https://api.binance.com/api/v3";
      const prices: PriceData[] = [];

      for (const symbol of symbols) {
        const tickerSymbol = `${symbol}USDT`;

        // Get 24hr ticker stats
        const tickerResponse = await fetch(
          `${baseUrl}/ticker/24hr?symbol=${tickerSymbol}`
        );

        if (tickerResponse.ok) {
          const data = await tickerResponse.json();

          prices.push({
            symbol: symbol,
            price: parseFloat(data.lastPrice),
            change24h: parseFloat(data.priceChangePercent),
            volume24h: parseFloat(data.volume),
          });
        }
      }

      return prices;
    } catch (error) {
      console.error("Failed to fetch crypto prices:", error);
      return [];
    }
  }

  // Fetch stock prices (simplified - in production use proper API)
  async fetchStockPrices(symbols: string[]): Promise<PriceData[]> {
    // In production, use Alpha Vantage, Yahoo Finance, or similar API
    // For now, return mock data
    return symbols.map(symbol => ({
      symbol,
      price: Math.random() * 1000,
      change24h: (Math.random() - 0.5) * 10,
      volume24h: Math.random() * 1000000,
    }));
  }

  // Update asset prices in database
  async updateAssetPrices(type: "CRYPTO" | "STOCK"): Promise<void> {
    try {
      // Get all assets of the specified type
      const assets = await prisma.asset.findMany({
        where: { type },
        select: { id: true, symbol: true },
      });

      if (assets.length === 0) return;

      const symbols = assets.map(a => a.symbol);

      // Fetch prices based on type
      const prices = type === "CRYPTO"
        ? await this.fetchCryptoPrices(symbols)
        : await this.fetchStockPrices(symbols);

      // Update assets and create price history
      for (const priceData of prices) {
        const asset = assets.find(a => a.symbol === priceData.symbol);
        if (!asset) continue;

        // Update asset with latest price data
        await prisma.asset.update({
          where: { id: asset.id },
          data: {
            priceData: {
              price: priceData.price,
              change24h: priceData.change24h || null,
              volume24h: priceData.volume24h || null,
              updatedAt: new Date().toISOString(),
              source: type === "CRYPTO" ? "binance" : "mock",
            },
          },
        });

        // Create price history record
        await prisma.priceHistory.create({
          data: {
            assetId: asset.id,
            price: new Decimal(priceData.price),
            volume: priceData.volume24h ? new Decimal(priceData.volume24h) : null,
            source: type === "CRYPTO" ? "binance" : "mock",
          },
        });
      }
    } catch (error) {
      console.error(`Failed to update ${type} prices:`, error);
    }
  }

  // Get price history for an asset
  async getPriceHistory(
    assetId: string,
    hours: number = 24
  ): Promise<any[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const history = await prisma.priceHistory.findMany({
      where: {
        assetId,
        recordedAt: { gte: since },
      },
      orderBy: { recordedAt: "asc" },
      select: {
        price: true,
        volume: true,
        recordedAt: true,
      },
    });

    return history.map(h => ({
      price: h.price.toNumber(),
      volume: h.volume?.toNumber() || null,
      recordedAt: h.recordedAt,
    }));
  }

  // Identify assets from text using patterns
  async identifyAssetsInText(text: string): Promise<string[]> {
    const cryptoPatterns = [
      /\b(BTC|Bitcoin)\b/gi,
      /\b(ETH|Ethereum)\b/gi,
      /\b(BNB|Binance Coin)\b/gi,
      /\b(SOL|Solana)\b/gi,
      /\b(ADA|Cardano)\b/gi,
      /\b(DOGE|Dogecoin)\b/gi,
      /\b(XRP|Ripple)\b/gi,
    ];

    const stockPatterns = [
      /\b(AAPL|Apple)\b/gi,
      /\b(GOOGL|Google|Alphabet)\b/gi,
      /\b(MSFT|Microsoft)\b/gi,
      /\b(AMZN|Amazon)\b/gi,
      /\b(TSLA|Tesla)\b/gi,
      /\b(META|Facebook|Meta)\b/gi,
      /\b(NVDA|Nvidia)\b/gi,
    ];

    const foundAssets = new Set<string>();

    // Check crypto patterns
    for (const pattern of cryptoPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        const symbol = pattern.source.match(/\\b\((\w+)\|/)?.[1];
        if (symbol) foundAssets.add(symbol);
      }
    }

    // Check stock patterns
    for (const pattern of stockPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        const symbol = pattern.source.match(/\\b\((\w+)\|/)?.[1];
        if (symbol) foundAssets.add(symbol);
      }
    }

    return Array.from(foundAssets);
  }

  // Auto-register new assets found in predictions
  async autoRegisterAssets(symbols: string[]): Promise<void> {
    for (const symbol of symbols) {
      // Determine asset type based on common patterns
      const type = this.determineAssetType(symbol);

      // Check if asset already exists
      const existing = await prisma.asset.findFirst({
        where: { symbol, type },
      });

      if (!existing) {
        await prisma.asset.create({
          data: {
            symbol,
            type,
            metadata: {
              name: null,
              exchange: null,
              sector: null,
              marketCap: null,
            },
            priceData: {
              price: null,
              change24h: null,
              volume24h: null,
              updatedAt: null,
              source: null,
            },
          },
        });
      }
    }
  }

  private determineAssetType(symbol: string): string {
    const cryptoSymbols = ["BTC", "ETH", "BNB", "SOL", "ADA", "DOGE", "XRP"];
    const stockSymbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "META", "NVDA"];

    if (cryptoSymbols.includes(symbol.toUpperCase())) {
      return "CRYPTO";
    } else if (stockSymbols.includes(symbol.toUpperCase())) {
      return "STOCK";
    } else {
      // Default to crypto for unknown symbols
      return "CRYPTO";
    }
  }
}