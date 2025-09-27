import { prisma } from "../db";

interface MarketPrice {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap?: number;
  high24h?: number;
  low24h?: number;
  source: string;
}

type AssetType = 'CRYPTO' | 'STOCK' | 'ETF' | 'INDEX' | 'COMMODITY' | 'CURRENCY' | 'BOND' | 'OPTION' | 'FUTURE';

interface AssetDetection {
  type: AssetType;
  confidence: number;
  normalizedSymbol: string;
}

// Asset Type Detection Utility
export class AssetTypeDetector {
  private static cryptoSymbols = new Set([
    'BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'XRP', 'DOT', 'DOGE', 'AVAX', 'MATIC',
    'LINK', 'UNI', 'LTC', 'BCH', 'ATOM', 'FIL', 'TRX', 'ETC', 'XLM', 'VET',
    'ICP', 'FTT', 'ALGO', 'MANA', 'SAND', 'AXS', 'SHIB', 'CRO', 'NEAR', 'APE'
  ]);

  private static stockSymbols = new Set([
    'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'TSLA', 'META', 'NVDA', 'BRK.A', 'BRK.B',
    'UNH', 'JNJ', 'JPM', 'V', 'PG', 'HD', 'MA', 'PYPL', 'DIS', 'ADBE', 'NFLX', 'CRM',
    'NVDA', 'INTC', 'VZ', 'KO', 'PFE', 'T', 'CISCO', 'XOM', 'ABT', 'TMO', 'ACN', 'CVX',
    'WMT', 'MRK', 'COST', 'DHR', 'LLY', 'AVGO', 'ORCL', 'LIN', 'NKE', 'NEE', 'UPS'
  ]);

  private static stockPatterns = [
    /^[A-Z]{1,5}$/, // Generic stock pattern
    /^[A-Z]+\.[A-Z]{2}$/, // International stocks like NESN.SW
  ];

  private static etfSymbols = new Set([
    'SPY', 'QQQ', 'IWM', 'EFA', 'VTI', 'VEA', 'VWO', 'TLT', 'HYG', 'LQD',
    'XLF', 'XLE', 'XLK', 'XLI', 'XLU', 'XLV', 'XLY', 'XLP', 'XLB', 'XLRE',
    'VOO', 'VTI', 'VXUS', 'BND', 'VTEB', 'SCHX', 'SCHF', 'SCHE'
  ]);

  private static etfPatterns = [
    /^[A-Z]{3,4}$/, // Most ETFs are 3-4 chars
  ];

  private static indexPatterns = [
    /^\^/, // ^GSPC, ^DJI, ^IXIC
    /^(SPX|DJI|NDX|RUT)$/,
  ];

  private static commodityPatterns = [
    /^(GC=F|SI=F|CL=F|NG=F|ZC=F|ZS=F|ZW=F)$/, // Futures
    /^(GLD|SLV|USO|UNG|DBA|DJP)$/, // Commodity ETFs
  ];

  private static currencyPatterns = [
    /^[A-Z]{3}[A-Z]{3}=X$/, // EURUSD=X
    /^[A-Z]{6}$/, // EURUSD
  ];

  static detectAssetType(symbol: string): AssetDetection {
    const upperSymbol = symbol.toUpperCase();

    // Check crypto first (highest confidence for known symbols)
    if (this.cryptoSymbols.has(upperSymbol)) {
      return {
        type: 'CRYPTO',
        confidence: 0.95,
        normalizedSymbol: upperSymbol
      };
    }

    // Check known stock symbols (high confidence)
    if (this.stockSymbols.has(upperSymbol)) {
      return {
        type: 'STOCK',
        confidence: 0.9,
        normalizedSymbol: upperSymbol
      };
    }

    // Check known ETF symbols (high confidence)
    if (this.etfSymbols.has(upperSymbol)) {
      return {
        type: 'ETF',
        confidence: 0.9,
        normalizedSymbol: upperSymbol
      };
    }

    // Check index patterns
    if (this.indexPatterns.some(pattern => pattern.test(upperSymbol))) {
      return {
        type: 'INDEX',
        confidence: 0.9,
        normalizedSymbol: upperSymbol
      };
    }

    // Check currency patterns
    if (this.currencyPatterns.some(pattern => pattern.test(upperSymbol))) {
      return {
        type: 'CURRENCY',
        confidence: 0.9,
        normalizedSymbol: upperSymbol
      };
    }

    // Check commodity patterns
    if (this.commodityPatterns.some(pattern => pattern.test(upperSymbol))) {
      return {
        type: 'COMMODITY',
        confidence: 0.85,
        normalizedSymbol: upperSymbol
      };
    }

    // Check stock patterns first (stocks are more common than ETFs)
    if (this.stockPatterns.some(pattern => pattern.test(upperSymbol))) {
      return {
        type: 'STOCK',
        confidence: 0.7,
        normalizedSymbol: upperSymbol
      };
    }

    // Check ETF patterns (lower priority than stocks)
    if (this.etfPatterns.some(pattern => pattern.test(upperSymbol))) {
      return {
        type: 'ETF',
        confidence: 0.6,
        normalizedSymbol: upperSymbol
      };
    }

    // Default to stock for unknown symbols
    return {
      type: 'STOCK',
      confidence: 0.5,
      normalizedSymbol: upperSymbol
    };
  }
}

// Yahoo Finance API Service with multiple endpoints
export class YFinanceService {
  private quotesUrl = "https://query1.finance.yahoo.com/v7/finance/quote";
  private chartUrl = "https://query1.finance.yahoo.com/v8/finance/chart";
  private summaryUrl = "https://query2.finance.yahoo.com/v10/finance/quoteSummary";

  async getPrice(symbol: string): Promise<MarketPrice | null> {
    // Try multiple endpoints in sequence
    const endpoints = [
      () => this.getPriceFromQuotes(symbol),
      () => this.getPriceFromChart(symbol),
      () => this.getPriceFromSummary(symbol)
    ];

    for (const getPrice of endpoints) {
      try {
        const price = await getPrice();
        if (price) return price;
      } catch (error) {
        console.log(`Yahoo Finance endpoint failed for ${symbol}, trying next...`);
        continue;
      }
    }

    console.error(`All Yahoo Finance endpoints failed for ${symbol}`);
    return null;
  }

  private async getPriceFromQuotes(symbol: string): Promise<MarketPrice | null> {
    const response = await fetch(`${this.quotesUrl}?symbols=${symbol}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const quote = data.quoteResponse?.result?.[0];

    if (!quote) return null;

    return {
      symbol,
      price: quote.regularMarketPrice || quote.price || 0,
      change24h: quote.regularMarketChangePercent || 0,
      volume24h: quote.regularMarketVolume || 0,
      marketCap: quote.marketCap,
      high24h: quote.regularMarketDayHigh,
      low24h: quote.regularMarketDayLow,
      source: 'yahoo'
    };
  }

  private async getPriceFromChart(symbol: string): Promise<MarketPrice | null> {
    const response = await fetch(`${this.chartUrl}/${symbol}?interval=1d&range=1d`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];

    if (!result || !result.meta) return null;

    const meta = result.meta;

    return {
      symbol,
      price: meta.regularMarketPrice || meta.previousClose || 0,
      change24h: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100) || 0,
      volume24h: meta.regularMarketVolume || 0,
      marketCap: meta.marketCap,
      high24h: meta.regularMarketDayHigh,
      low24h: meta.regularMarketDayLow,
      source: 'yahoo'
    };
  }

  private async getPriceFromSummary(symbol: string): Promise<MarketPrice | null> {
    const response = await fetch(`${this.summaryUrl}/${symbol}?modules=price`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const price = data.quoteSummary?.result?.[0]?.price;

    if (!price) return null;

    return {
      symbol,
      price: price.regularMarketPrice?.raw || price.preMarketPrice?.raw || 0,
      change24h: price.regularMarketChangePercent?.raw || 0,
      volume24h: price.regularMarketVolume?.raw || 0,
      marketCap: price.marketCap?.raw,
      high24h: price.regularMarketDayHigh?.raw,
      low24h: price.regularMarketDayLow?.raw,
      source: 'yahoo'
    };
  }

  async getBatchPrices(symbols: string[]): Promise<Map<string, MarketPrice>> {
    const prices = new Map<string, MarketPrice>();

    // Process symbols individually to avoid API rate limits
    const batchSize = 5;
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      const batchPromises = batch.map(symbol => this.getPrice(symbol));

      try {
        const batchResults = await Promise.allSettled(batchPromises);

        batch.forEach((symbol, index) => {
          const result = batchResults[index];
          if (result && result.status === 'fulfilled' && result.value) {
            prices.set(symbol, result.value);
          }
        });

        // Rate limiting
        if (i + batchSize < symbols.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error('Yahoo Finance batch processing error:', error);
      }
    }

    return prices;
  }
}


// Binance API Service
export class BinanceService {
  private baseUrl = "https://api.binance.com/api/v3";

  async getPrice(symbol: string): Promise<MarketPrice | null> {
    try {
      const ticker = await this.get24hrTicker(`${symbol}USDT`);

      if (!ticker) return null;

      return {
        symbol,
        price: parseFloat(ticker.lastPrice),
        change24h: parseFloat(ticker.priceChangePercent),
        volume24h: parseFloat(ticker.volume) * parseFloat(ticker.lastPrice),
        high24h: parseFloat(ticker.highPrice),
        low24h: parseFloat(ticker.lowPrice),
        source: 'binance'
      };
    } catch (error) {
      console.error(`Binance API error for ${symbol}:`, error);
      return null;
    }
  }

  private async get24hrTicker(symbol: string) {
    try {
      const response = await fetch(`${this.baseUrl}/ticker/24hr?symbol=${symbol}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Binance ticker error:", error);
      return null;
    }
  }

  async getBatchPrices(symbols: string[]): Promise<Map<string, MarketPrice>> {
    const prices = new Map<string, MarketPrice>();

    try {
      const response = await fetch(`${this.baseUrl}/ticker/24hr`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const tickers = await response.json();

      for (const ticker of tickers) {
        const symbol = ticker.symbol.replace("USDT", "");

        if (symbols.includes(symbol)) {
          prices.set(symbol, {
            symbol,
            price: parseFloat(ticker.lastPrice),
            change24h: parseFloat(ticker.priceChangePercent),
            volume24h: parseFloat(ticker.volume) * parseFloat(ticker.lastPrice),
            high24h: parseFloat(ticker.highPrice),
            low24h: parseFloat(ticker.lowPrice),
            source: 'binance'
          });
        }
      }
    } catch (error) {
      console.error("Binance batch prices error:", error);
    }

    return prices;
  }
}

// CoinGecko API Service
export class CoinGeckoService {
  private baseUrl = "https://api.coingecko.com/api/v3";
  private coinIds: Map<string, string> = new Map([
    ["BTC", "bitcoin"],
    ["ETH", "ethereum"],
    ["BNB", "binancecoin"],
    ["SOL", "solana"],
    ["XRP", "ripple"],
    ["ADA", "cardano"],
    ["DOGE", "dogecoin"],
    ["AVAX", "avalanche-2"],
    ["DOT", "polkadot"],
    ["MATIC", "matic-network"],
  ]);

  async getPrice(symbol: string): Promise<MarketPrice | null> {
    try {
      const coinId = this.coinIds.get(symbol) || symbol.toLowerCase();

      const response = await fetch(
        `${this.baseUrl}/simple/price?ids=${coinId}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data[coinId]) return null;

      return {
        symbol,
        price: data[coinId].usd,
        change24h: data[coinId].usd_24h_change || 0,
        volume24h: data[coinId].usd_24h_vol || 0,
        marketCap: data[coinId].usd_market_cap || 0,
        source: 'coingecko'
      };
    } catch (error) {
      console.error(`CoinGecko API error for ${symbol}:`, error);
      return null;
    }
  }

  async getBatchPrices(symbols: string[]): Promise<Map<string, MarketPrice>> {
    const prices = new Map<string, MarketPrice>();

    try {
      const coinIds = symbols.map(s => this.coinIds.get(s) || s.toLowerCase()).join(",");

      const response = await fetch(
        `${this.baseUrl}/simple/price?ids=${coinIds}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      for (const [symbol, coinId] of this.coinIds.entries()) {
        if (symbols.includes(symbol) && data[coinId]) {
          prices.set(symbol, {
            symbol,
            price: data[coinId].usd,
            change24h: data[coinId].usd_24h_change || 0,
            volume24h: data[coinId].usd_24h_vol || 0,
            marketCap: data[coinId].usd_market_cap || 0,
            source: 'coingecko'
          });
        }
      }
    } catch (error) {
      console.error("CoinGecko batch prices error:", error);
    }

    return prices;
  }

  async getMarketData(symbol: string) {
    try {
      const coinId = this.coinIds.get(symbol) || symbol.toLowerCase();

      const response = await fetch(`${this.baseUrl}/coins/${coinId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        symbol,
        name: data.name,
        image: data.image?.large,
        currentPrice: data.market_data?.current_price?.usd,
        marketCap: data.market_data?.market_cap?.usd,
        totalVolume: data.market_data?.total_volume?.usd,
        high24h: data.market_data?.high_24h?.usd,
        low24h: data.market_data?.low_24h?.usd,
        priceChange24h: data.market_data?.price_change_percentage_24h,
        priceChange7d: data.market_data?.price_change_percentage_7d,
        priceChange30d: data.market_data?.price_change_percentage_30d,
        circulatingSupply: data.market_data?.circulating_supply,
        totalSupply: data.market_data?.total_supply,
      };
    } catch (error) {
      console.error(`CoinGecko market data error for ${symbol}:`, error);
      return null;
    }
  }
}

// Unified Market Data Service
export class MarketDataService {
  private binance: BinanceService;
  private coingecko: CoinGeckoService;
  private yfinance: YFinanceService;
  private assetDetector: typeof AssetTypeDetector;

  constructor() {
    this.binance = new BinanceService();
    this.coingecko = new CoinGeckoService();
    this.yfinance = new YFinanceService();
    this.assetDetector = AssetTypeDetector;
  }

  async getPrice(symbol: string, source: "binance" | "coingecko" | "yahoo" | "auto" = "auto"): Promise<MarketPrice | null> {
    if (source === "binance") {
      return this.binance.getPrice(symbol);
    }

    if (source === "coingecko") {
      return this.coingecko.getPrice(symbol);
    }

    if (source === "yahoo") {
      return this.yfinance.getPrice(symbol);
    }

    // Auto mode: detect asset type and route accordingly
    const detection = this.assetDetector.detectAssetType(symbol);

    console.log(`🔍 Asset detection for ${symbol}: ${detection.type} (confidence: ${detection.confidence})`);

    return this.getPriceByAssetType(detection.normalizedSymbol, detection.type);
  }

  private async getPriceByAssetType(symbol: string, assetType: AssetType): Promise<MarketPrice | null> {
    let price: MarketPrice | null = null;

    switch (assetType) {
      case 'CRYPTO':
        // Try Binance first, then CoinGecko for crypto
        price = await this.binance.getPrice(symbol);
        if (!price) {
          price = await this.coingecko.getPrice(symbol);
        }
        break;

      case 'STOCK':
      case 'ETF':
      case 'INDEX':
      case 'COMMODITY':
      case 'CURRENCY':
      case 'BOND':
      case 'OPTION':
      case 'FUTURE':
        // Try Yahoo Finance for all traditional assets
        price = await this.yfinance.getPrice(symbol);
        break;

      default:
        // Fallback: try all sources
        price = await this.yfinance.getPrice(symbol);
        if (!price) {
          price = await this.binance.getPrice(symbol);
        }
        if (!price) {
          price = await this.coingecko.getPrice(symbol);
        }
    }

    if (price) {
      console.log(`✅ Price found for ${symbol} (${assetType}): $${price.price} via ${price.source}`);
    } else {
      console.log(`❌ No price found for ${symbol} (${assetType})`);
    }

    return price;
  }

  async updateAssetPrice(assetId: string) {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new Error("Asset not found");
    }

    const price = await this.getPrice(asset.symbol);

    if (!price) {
      throw new Error(`Failed to fetch price for ${asset.symbol}`);
    }

    // Store previous price for 24h comparison
    const previousPrice = (asset.priceData as any)?.price || price.price;

    // Update asset with new price data
    await prisma.asset.update({
      where: { id: assetId },
      data: {
        priceData: {
          price: price.price,
          change24h: price.change24h,
          volume24h: price.volume24h,
          marketCap: price.marketCap,
          high24h: price.high24h,
          low24h: price.low24h,
          updatedAt: new Date().toISOString(),
          source: price.source || "binance",
          price24hAgo: previousPrice,
        },
      },
    });

    // Create price history record
    await prisma.priceHistory.create({
      data: {
        assetId,
        price: price.price,
        volume: price.volume24h,
        source: price.source || "binance",
      },
    });

    return price;
  }

  async updateAllAssetPrices() {
    const assets = await prisma.asset.findMany();

    const symbols = assets.map(a => a.symbol);
    const prices = await this.binance.getBatchPrices(symbols);

    // Fallback to CoinGecko for missing prices
    const missingSymbols = symbols.filter(s => !prices.has(s));

    if (missingSymbols.length > 0) {
      const coingeckoPrices = await this.coingecko.getBatchPrices(missingSymbols);

      for (const [symbol, price] of coingeckoPrices) {
        prices.set(symbol, price);
      }
    }

    // Update all assets with new prices
    const updatePromises = [];

    for (const asset of assets) {
      const price = prices.get(asset.symbol);

      if (price) {
        updatePromises.push(
          prisma.asset.update({
            where: { id: asset.id },
            data: {
              priceData: {
                price: price.price,
                change24h: price.change24h,
                volume24h: price.volume24h,
                marketCap: price.marketCap,
                high24h: price.high24h,
                low24h: price.low24h,
                updatedAt: new Date().toISOString(),
                source: "mixed",
              },
            },
          })
        );

        updatePromises.push(
          prisma.priceHistory.create({
            data: {
              assetId: asset.id,
              price: price.price,
              volume: price.volume24h,
              source: "mixed",
            },
          })
        );
      }
    }

    await Promise.all(updatePromises);

    return prices;
  }
}