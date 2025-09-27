import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { env } from "@/env.mjs";
import { prisma } from "../db";
import crypto from 'crypto';
import { MarketDataService } from './marketData';

interface DirectionCorrection {
  originalAiDirection: string;
  mathematicalDirection: string | null;
  correctionMade: boolean;
  priceChange: number | null;
  priceChangePercent: number | null;
  reasoning: string | null;
}

const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY);
const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

// Enhanced interfaces matching original app's sophisticated structure
export interface UnifiedVideoContext {
  videoId: string;
  videoUrl: string;
  title: string;
  description: string;
  channelName: string;
  publishedAt: Date;
  transcript: string;
  transcriptWithTimestamps?: Array<{ time: number; text: string }>;
}

export interface UnifiedPrediction {
  asset: {
    symbol: string;
    fullName: string;
    type: 'CRYPTO' | 'STOCK' | 'ETF' | 'INDEX' | 'COMMODITY' | 'CURRENCY' | 'BOND' | 'OPTION' | 'FUTURE';
    dataSource: 'binance' | 'yfinance' | 'coingecko' | 'alphavantage' | 'unknown';
    alternativeSymbols?: string[];
    confidence: number;
    currentPrice?: number;
    priceLastUpdated?: Date;
    priceDataSource?: string;
  };
  prediction: {
    text: string;
    direction: 'bullish' | 'bearish' | 'neutral';
    timeframe: string;
    targetDate?: string;
    targetPrice?: number;
    confidence: number;
  };
  context: {
    exactQuote: string;
    reasoning: string;
    marketFactors: string[];
    technicalIndicators: string[];
    fundamentalPoints: string[];
    positionInTranscript?: {
      start: number;
      end: number;
    };
  };
  metadata: {
    // extractedAt is represented by createdAt in the schema
    modelUsed: string;
    qualityGrade?: 'A' | 'B' | 'C' | 'D' | 'F';
    qualityScore?: number;
    deduplicationHash?: string;
    processingTimeMs?: number;
  };
}

export interface UnifiedExtractionResult {
  predictions: UnifiedPrediction[];
  summary: {
    totalPredictions: number;
    uniqueAssets: number;
    assetList: string[];
    assetTypes: string[];
    sentimentBreakdown: Record<string, number>;
    averageConfidence: number;
    topPredictions: any[];
  };
  metadata: {
    videoId: string;
    // extractedAt is represented by createdAt in the schema
    modelUsed: string;
    totalProcessingTimeMs: number;
    chunksProcessed?: number;
    deduplicationRate?: number;
    tokensUsed?: number;
    estimatedCost?: number;
  };
}

export class UnifiedExtractionService {
  private geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" });
  private marketDataService = new MarketDataService();

  // Configuration matching original app
  private readonly MAX_SINGLE_CALL_TOKENS = 50000;
  private readonly CHUNK_SIZE_TOKENS = 30000;
  private readonly OVERLAP_TOKENS = 2000;
  private readonly MIN_QUALITY_SCORE = 60;

  /**
   * Main extraction method - automatically chooses optimal strategy
   */
  async extractFromVideo(context: UnifiedVideoContext): Promise<UnifiedExtractionResult> {
    const startTime = Date.now();
    console.log(`🚀 [Unified] Starting extraction for: ${context.title}`);

    // Step 1: Estimate processing requirements
    const estimatedTokens = this.estimateTokens(context);
    console.log(`📊 Estimated tokens: ${estimatedTokens.toLocaleString()}`);

    let rawPredictions: UnifiedPrediction[];
    let chunksProcessed = 1;

    // Step 2: Choose processing strategy
    if (estimatedTokens < this.MAX_SINGLE_CALL_TOKENS) {
      console.log(`✅ Using single-call extraction`);
      rawPredictions = await this.processSingleCall(context);
    } else {
      console.log(`🔄 Using intelligent chunking for long video`);
      const result = await this.processWithChunking(context);
      rawPredictions = result.predictions;
      chunksProcessed = result.chunksProcessed;
    }

    // Step 3: Deduplication
    const beforeDedup = rawPredictions.length;
    const dedupedPredictions = await this.deduplicatePredictions(rawPredictions);
    const afterDedup = dedupedPredictions.length;
    const deduplicationRate = beforeDedup > 0 ? ((beforeDedup - afterDedup) / beforeDedup) * 100 : 0;

    console.log(`🧹 Deduplication: ${beforeDedup} → ${afterDedup} (${deduplicationRate.toFixed(1)}% removed)`);

    // Step 4: Quality scoring
    const scoredPredictions = this.scorePredictions(dedupedPredictions);

    // Step 5: Generate summary
    const summary = this.generateSummary(scoredPredictions);

    // Step 6: Create result
    const result: UnifiedExtractionResult = {
      predictions: scoredPredictions,
      summary,
      metadata: {
        videoId: context.videoId,
        // extractedAt is handled by createdAt automatically
        modelUsed: 'gemini-pro',
        totalProcessingTimeMs: Date.now() - startTime,
        chunksProcessed,
        deduplicationRate,
        tokensUsed: estimatedTokens,
        estimatedCost: this.calculateCost(estimatedTokens)
      }
    };

    console.log(`✅ [Unified] Complete: ${scoredPredictions.length} predictions in ${result.metadata.totalProcessingTimeMs}ms`);

    return result;
  }

  /**
   * Process entire content in a single AI call
   */
  private async processSingleCall(context: UnifiedVideoContext): Promise<UnifiedPrediction[]> {
    const prompt = this.buildComprehensivePrompt(context);
    const response = await this.callAI(prompt, 'single');
    return await this.parseAIResponse(response);
  }

  /**
   * Process long content with intelligent chunking
   */
  private async processWithChunking(context: UnifiedVideoContext): Promise<{
    predictions: UnifiedPrediction[];
    chunksProcessed: number;
  }> {
    const chunks = this.createIntelligentChunks(context.transcript);
    const allPredictions: UnifiedPrediction[] = [];

    console.log(`📦 Created ${chunks.length} intelligent chunks`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      if (!chunk) continue;

      console.log(`\n🔄 Processing chunk ${i + 1}/${chunks.length}`);

      // Build chunk-specific prompt with context
      const prompt = this.buildChunkPrompt(chunk, context, i, chunks.length);

      // Extract from chunk
      const response = await this.callAI(prompt, `chunk_${i + 1}`);
      const chunkPredictions = await this.parseAIResponse(response);

      allPredictions.push(...chunkPredictions);
      console.log(`✅ Chunk ${i + 1}: Found ${chunkPredictions.length} predictions`);
    }

    return {
      predictions: allPredictions,
      chunksProcessed: chunks.length
    };
  }

  /**
   * Build comprehensive prompt for single-call extraction
   */
  private buildComprehensivePrompt(context: UnifiedVideoContext): string {
    return `You are an expert financial analyst extracting ALL predictions from video content.

VIDEO INFORMATION:
==================
Title: ${context.title}
Channel: ${context.channelName || 'Unknown'}
Published: ${context.publishedAt?.toISOString() || 'Unknown'}
Description: ${context.description || 'No description'}

FULL TRANSCRIPT:
===============
${context.transcript}

EXTRACTION TASK:
===============
Extract EVERY financial prediction made in this video. For each prediction:

1. ASSET IDENTIFICATION (use full video context):
   - symbol: The EXACT ticker/symbol mentioned (e.g., XRP, BTC, ETH, AAPL, TSLA)
   - fullName: Complete official name (e.g., "Ripple" for XRP, "Bitcoin" for BTC)
   - type: CRYPTO, STOCK, ETF, INDEX, COMMODITY, CURRENCY, BOND, OPTION, FUTURE
   - dataSource: binance (major crypto), yfinance (stocks/ETFs), coingecko (altcoins)
   - alternativeSymbols: Other symbols used
   - confidence: 0-100

2. PREDICTION DETAILS:
   - text: Complete prediction statement
   - direction: bullish/bearish/neutral (IMPORTANT: Consider current asset price when determining direction)
   - timeframe: Exact timeframe mentioned
   - targetDate: ALWAYS provide as YYYY-MM-DD ISO date. Convert relative dates:
     * "Q1 2025" → "2025-03-31"
     * "Q2 2025" → "2025-06-30"
     * "Q3 2025" → "2025-09-30"
     * "Q4 2025" → "2025-12-31"
     * "end of year" → current year's 12-31
     * "next few months" → 3 months from today
     * "next month" → 1 month from today
     * "within 6 months" → 6 months from today
     * TODAY'S DATE: ${new Date().toISOString().split('T')[0]}
   - targetPrice: Specific target if mentioned (number only)
   - confidence: 0-100

DIRECTION ANALYSIS REQUIREMENT:
When determining direction (bullish/bearish/neutral), you MUST consider the current market price context:
- If target price > current price = BULLISH (price going up)
- If target price < current price = BEARISH (price going down)
- If target price ≈ current price (within 2%) = NEUTRAL
- TODAY'S DATE: ${new Date().toISOString().split('T')[0]}
- Please check current asset prices when making direction decisions, don't rely solely on language sentiment

3. CONTEXT:
   - exactQuote: Exact words from transcript
   - reasoning: Why prediction was made
   - marketFactors: Market conditions
   - technicalIndicators: TA mentioned
   - fundamentalPoints: FA points
   - positionInTranscript: {start: char_position, end: char_position}

CRITICAL RULES:
- Look for SPECIFIC ASSET SYMBOLS in the transcript and video title
- Do NOT return "UNKNOWN" as a symbol - extract the actual ticker mentioned
- Common crypto: XRP (Ripple), XLM (Stellar), HBAR (Hedera), BTC (Bitcoin), ETH (Ethereum)
- If the title mentions specific assets (e.g., "XRP, XLM & HBAR"), these are key focus assets
- Use appropriate data source based on asset type:
  - binance: major cryptocurrencies (BTC, ETH, XRP, etc.)
  - coingecko: alternative cryptocurrencies (smaller market cap)
  - yfinance: stocks, ETFs, indices

EDGE CASE HANDLING:
1. ASSET IDENTIFICATION:
   - Fix common typos: "Bitcon"→"BTC", "Etherium"→"ETH", "doge coin"→"DOGE"
   - Handle wrapped tokens: "WBTC"→"BTC", "stETH"→"ETH", "BTCB"→"BTC"
   - Extract from pairs: "BTC/USD"→"BTC", "ETH/BTC"→both "ETH" and "BTC"
   - Multiple assets: "XRP and XLM" → create separate predictions for each

2. DATE CONVERSION:
   - ALWAYS convert to ISO date YYYY-MM-DD
   - "end of year" in Sept video → current year, Oct+ video → next year
   - "between Q1 and Q3" → use Q3 (later date): "2025-09-30"
   - "next few months" → exactly 3 months from today
   - Seasons: spring→06-20, summer→09-22, fall→12-20, winter→03-19

3. PRICE HANDLING:
   - Percentages: "up 500%" → calculate from current price if known
   - Relative: "double", "10x" → multiply current price
   - Ranges: "between $5 and $10" → use $10 (upper bound)
   - Bearish: "crash to zero" → targetPrice: 0
   - Scientific: "1e6" → 1000000
   - Non-USD: Convert €→1.1x, £→1.25x, ¥→0.007x to USD

4. QUALITY FILTERING:
   - SKIP predictions that are questions: "Will BTC hit 100k?"
   - SKIP sarcasm/jokes: excessive "!!!", "to the moon 🚀😂"
   - REDUCE confidence for: "maybe", "could", "possibly"
   - REDUCE confidence for: "analyst says", "according to"
   - SKIP hypotheticals: "in a perfect world", "imagine if"

Return ONLY a valid JSON array with this exact structure:

Example output structure:
[
  {
    "asset": {
      "symbol": "XRP",
      "fullName": "Ripple",
      "type": "CRYPTO",
      "dataSource": "binance",
      "alternativeSymbols": [],
      "confidence": 95
    },
    "prediction": {
      "text": "XRP will hit $5 by end of year",
      "direction": "bullish",
      "timeframe": "end of year",
      "targetDate": "${new Date().getFullYear()}-12-31",
      "targetPrice": 5,
      "confidence": 85
    },
    "context": {
      "exactQuote": "I believe XRP will hit $5 by end of year",
      "reasoning": "SEC lawsuit ending and institutional adoption",
      "marketFactors": ["SEC lawsuit resolution", "institutional adoption"],
      "technicalIndicators": [],
      "fundamentalPoints": ["adoption growing"],
      "positionInTranscript": {"start": 100, "end": 200}
    }
  }
]`;
  }

  /**
   * Build prompt for individual chunk
   */
  private buildChunkPrompt(chunk: string, context: UnifiedVideoContext, index: number, total: number): string {
    return `You are extracting predictions from chunk ${index + 1}/${total} of a video.

VIDEO CONTEXT:
Title: ${context.title}
Channel: ${context.channelName}

CHUNK CONTENT:
${chunk}

Extract all financial predictions from this chunk following the same rules as the comprehensive prompt.
Focus on finding specific asset symbols, target prices, and timeframes.

Return JSON array of predictions.`;
  }

  /**
   * Three-layer deduplication system
   */
  private async deduplicatePredictions(predictions: UnifiedPrediction[]): Promise<UnifiedPrediction[]> {
    const uniquePredictions = new Map<string, UnifiedPrediction>();

    for (const pred of predictions) {
      // Layer 1: Hash-based deduplication
      const hash = this.generatePredictionHash(pred);

      // Layer 2: Position-based deduplication (if positions overlap)
      const isOverlapping = this.checkPositionOverlap(pred, uniquePredictions);

      // Layer 3: Semantic similarity
      const similarExisting = this.findSimilarPrediction(pred, uniquePredictions);

      if (!uniquePredictions.has(hash) && !isOverlapping && !similarExisting) {
        uniquePredictions.set(hash, pred);
      } else if (similarExisting) {
        // Merge and keep the better version
        const existing = uniquePredictions.get(similarExisting);
        if (existing && pred.prediction.confidence > existing.prediction.confidence) {
          uniquePredictions.set(hash, pred);
          uniquePredictions.delete(similarExisting);
        }
      }
    }

    return Array.from(uniquePredictions.values());
  }

  /**
   * Generate hash for prediction
   */
  private generatePredictionHash(pred: UnifiedPrediction): string {
    const key = `${pred.asset.symbol}-${pred.prediction.direction}-${pred.prediction.targetPrice || 'notarget'}-${pred.prediction.timeframe}`;
    return crypto.createHash('md5').update(key).digest('hex');
  }

  /**
   * Check if prediction positions overlap
   */
  private checkPositionOverlap(pred: UnifiedPrediction, existing: Map<string, UnifiedPrediction>): boolean {
    if (!pred.context.positionInTranscript) return false;

    for (const [_, existingPred] of existing) {
      if (existingPred.context.positionInTranscript) {
        const overlap =
          (pred.context.positionInTranscript.start >= existingPred.context.positionInTranscript.start &&
           pred.context.positionInTranscript.start <= existingPred.context.positionInTranscript.end) ||
          (pred.context.positionInTranscript.end >= existingPred.context.positionInTranscript.start &&
           pred.context.positionInTranscript.end <= existingPred.context.positionInTranscript.end);

        if (overlap) return true;
      }
    }
    return false;
  }

  /**
   * Find semantically similar prediction
   */
  private findSimilarPrediction(pred: UnifiedPrediction, existing: Map<string, UnifiedPrediction>): string | null {
    for (const [hash, existingPred] of existing) {
      if (existingPred.asset.symbol === pred.asset.symbol &&
          existingPred.prediction.direction === pred.prediction.direction &&
          Math.abs((existingPred.prediction.targetPrice || 0) - (pred.prediction.targetPrice || 0)) < 0.01) {
        return hash;
      }
    }
    return null;
  }

  /**
   * Score predictions for quality
   */
  private scorePredictions(predictions: UnifiedPrediction[]): UnifiedPrediction[] {
    return predictions.map(pred => {
      let score = 50; // Base score

      // Confidence factors
      score += pred.asset.confidence * 0.2;
      score += pred.prediction.confidence * 0.2;

      // Completeness factors
      if (pred.prediction.targetPrice) score += 10;
      if (pred.prediction.targetDate) score += 10;
      if (pred.context.exactQuote) score += 10;
      if (pred.context.reasoning) score += 5;
      if (pred.context.marketFactors.length > 0) score += 5;

      // Grade assignment
      let grade: 'A' | 'B' | 'C' | 'D' | 'F';
      if (score >= 90) grade = 'A';
      else if (score >= 80) grade = 'B';
      else if (score >= 70) grade = 'C';
      else if (score >= 60) grade = 'D';
      else grade = 'F';

      return {
        ...pred,
        metadata: {
          ...pred.metadata,
          qualityScore: Math.round(score),
          qualityGrade: grade
        }
      };
    });
  }

  /**
   * Create intelligent chunks preserving context
   */
  private createIntelligentChunks(transcript: string): string[] {
    const chunks: string[] = [];
    const chunkSize = this.CHUNK_SIZE_TOKENS * 4; // Approximate chars
    const overlap = this.OVERLAP_TOKENS * 4;

    // Split by sentences to avoid breaking thoughts
    const sentences = transcript.match(/[^.!?]+[.!?]+/g) || [transcript];

    let currentChunk = '';
    let previousOverlap = '';

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
        // Add chunk with overlap from previous
        chunks.push(previousOverlap + currentChunk);

        // Save overlap for next chunk
        previousOverlap = currentChunk.slice(-overlap);
        currentChunk = sentence;
      } else {
        currentChunk += ' ' + sentence;
      }
    }

    // Add final chunk
    if (currentChunk.trim()) {
      chunks.push(previousOverlap + currentChunk);
    }

    return chunks;
  }

  /**
   * Call AI service with fallback
   */
  private async callAI(prompt: string, context: string): Promise<string> {
    try {
      console.log(`📤 [Unified] Calling Gemini (${context})`);

      const result = await this.geminiModel.generateContent(prompt);
      const response = result.response;
      return response.text() || '[]';
    } catch (error) {
      console.error(`[Unified] Gemini call failed:`, error);

      // Fallback to OpenAI
      try {
        console.log(`📤 [Unified] Falling back to OpenAI (${context})`);
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a financial analyst. Extract predictions and return ONLY valid JSON array.'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1,
          max_tokens: 4000
        });

        return response.choices[0]?.message?.content || '[]';
      } catch (fallbackError) {
        console.error(`[Unified] Fallback also failed:`, fallbackError);
        return '[]';
      }
    }
  }

  /**
   * Parse AI response into structured predictions
   */
  private async parseAIResponse(response: string): Promise<UnifiedPrediction[]> {
    try {
      // Log the raw response for debugging
      console.log('[Unified] Raw AI response:', response.substring(0, 500));

      // Extract JSON array from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.warn('[Unified] No JSON array found in response');
        return [];
      }

      const rawPredictions = JSON.parse(jsonMatch[0]);
      console.log('[Unified] Parsed predictions count:', rawPredictions.length);

      // Transform to UnifiedPrediction format
      const predictions = rawPredictions.map((pred: any) => ({
        asset: {
          symbol: pred.asset?.symbol || 'UNKNOWN',
          fullName: pred.asset?.fullName || '',
          type: this.normalizeAssetType(pred.asset?.type),
          dataSource: pred.asset?.dataSource || 'unknown',
          alternativeSymbols: pred.asset?.alternativeSymbols || [],
          confidence: pred.asset?.confidence || 50
        },
        prediction: {
          text: pred.prediction?.text || '',
          direction: pred.prediction?.direction || 'neutral',
          timeframe: pred.prediction?.timeframe || '',
          targetDate: pred.prediction?.targetDate || undefined,
          targetPrice: pred.prediction?.targetPrice || undefined,
          confidence: pred.prediction?.confidence || 50
        },
        context: {
          exactQuote: pred.context?.exactQuote || '',
          reasoning: pred.context?.reasoning || '',
          marketFactors: pred.context?.marketFactors || [],
          technicalIndicators: pred.context?.technicalIndicators || [],
          fundamentalPoints: pred.context?.fundamentalPoints || [],
          positionInTranscript: pred.context?.positionInTranscript || undefined
        },
        metadata: {
          // extractedAt is handled by createdAt automatically
          modelUsed: 'gemini-pro',
          deduplicationHash: ''
        }
      })) as UnifiedPrediction[];

      return predictions;
    } catch (error) {
      console.error('[Unified] Parse error:', error);
      return [];
    }
  }

  /**
   * Normalize asset type to enum
   */
  private normalizeAssetType(type: string): 'CRYPTO' | 'STOCK' | 'ETF' | 'INDEX' | 'COMMODITY' | 'CURRENCY' | 'BOND' | 'OPTION' | 'FUTURE' {
    const normalized = (type || 'STOCK').toUpperCase();
    const validTypes = ['CRYPTO', 'STOCK', 'ETF', 'INDEX', 'COMMODITY', 'CURRENCY', 'BOND', 'OPTION', 'FUTURE'];
    return validTypes.includes(normalized) ? normalized as any : 'STOCK';
  }

  /**
   * Estimate token count
   */
  private estimateTokens(context: UnifiedVideoContext): number {
    const totalChars =
      (context.title || '').length +
      (context.description || '').length +
      (context.transcript || '').length +
      1000; // Prompt overhead

    return Math.ceil(totalChars / 4); // 1 token ≈ 4 chars
  }

  /**
   * Calculate estimated cost
   */
  private calculateCost(tokens: number): number {
    // Gemini pricing: ~$0.001 per 1K tokens
    const inputCost = (tokens / 1000) * 0.001;
    return Math.round(inputCost * 100) / 100;
  }

  /**
   * Generate extraction summary
   */
  private generateSummary(predictions: UnifiedPrediction[]): any {
    const uniqueAssets = [...new Set(predictions.map(p => p.asset.symbol))];
    const assetTypes = [...new Set(predictions.map(p => p.asset.type))];

    const sentimentBreakdown = predictions.reduce((acc, pred) => {
      acc[pred.prediction.direction] = (acc[pred.prediction.direction] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgConfidence = predictions.length > 0
      ? predictions.reduce((sum, p) => sum + p.prediction.confidence, 0) / predictions.length
      : 0;

    return {
      totalPredictions: predictions.length,
      uniqueAssets: uniqueAssets.length,
      assetList: uniqueAssets,
      assetTypes,
      sentimentBreakdown,
      averageConfidence: Math.round(avgConfidence),
      topPredictions: predictions
        .sort((a, b) => b.prediction.confidence - a.prediction.confidence)
        .slice(0, 5)
        .map(p => ({
          asset: p.asset.symbol,
          direction: p.prediction.direction,
          target: p.prediction.targetPrice,
          confidence: p.prediction.confidence
        }))
    };
  }

  // ========================================
  // LEGACY COMPATIBILITY METHODS
  // ========================================

  /**
   * Legacy method for backward compatibility with existing routes
   */
  async extractFromContent(
    content: string,
    sourceType: "YOUTUBE" | "TWITTER",
    forecasterId?: string
  ): Promise<any[]> {
    // Build unified video context from legacy parameters
    const context: UnifiedVideoContext = {
      videoId: `legacy_${Date.now()}`,
      videoUrl: '',
      title: `${sourceType} Content`,
      description: '',
      channelName: 'Legacy Extraction',
      publishedAt: new Date(),
      transcript: content,
      transcriptWithTimestamps: []
    };

    // Extract using our unified method
    const unifiedResult = await this.extractFromVideo(context);

    // Transform to legacy format
    const legacyPredictions = unifiedResult.predictions.map(pred => ({
      prediction: pred.prediction.text,
      confidence: pred.prediction.confidence / 100,
      targetDate: pred.prediction.targetDate ? new Date(pred.prediction.targetDate) : null,
      targetPrice: pred.prediction.targetPrice,
      assetSymbol: pred.asset.symbol,
      assetType: pred.asset.type,
      reasoning: pred.context.reasoning,
      tags: pred.context.technicalIndicators || [],
      aiDirection: pred.prediction.direction?.toUpperCase() || "NEUTRAL"
    }));

    // Store predictions in database if forecaster provided
    if (forecasterId) {
      await this.storePredictions(legacyPredictions, forecasterId);
    }

    return legacyPredictions;
  }

  public async storePredictions(
    predictions: any[],
    forecasterId?: string
  ): Promise<void> {
    if (!forecasterId) return;

    for (const pred of predictions) {
      try {
        // Find or create asset if symbol is provided
        let assetId = null;
        let baselinePrice = null;

        if (pred.assetSymbol && pred.assetType) {
          const asset = await prisma.asset.upsert({
            where: {
              symbol_type: {
                symbol: pred.assetSymbol,
                type: pred.assetType,
              },
            },
            update: {},
            create: {
              symbol: pred.assetSymbol,
              type: pred.assetType,
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
          assetId = asset.id;

          // Fetch current price as baseline for this prediction
          try {
            const currentPrice = await this.marketDataService.getPrice(pred.assetSymbol);
            if (currentPrice?.price) {
              baselinePrice = currentPrice.price;
              console.log(`📊 Baseline price for ${pred.assetSymbol}: $${baselinePrice}`);
            }
          } catch (error) {
            console.warn(`⚠️ Could not fetch baseline price for ${pred.assetSymbol}:`, error);
          }
        }

        // Calculate mathematical direction and correct AI direction if needed
        const { correctedDirection, directionCorrection } = this.calculateMathematicalDirection(
          pred.targetPrice,
          baselinePrice,
          pred.aiDirection || "NEUTRAL"
        );

        // Create prediction
        await prisma.prediction.create({
          data: {
            forecasterId,
            assetId,
            prediction: pred.prediction,
            confidence: pred.confidence,
            targetDate: pred.targetDate,
            targetPrice: pred.targetPrice,
            baselinePrice: baselinePrice,
            direction: correctedDirection,
            metadata: {
              source: {
                type: pred.sourceType ? pred.sourceType.toLowerCase() : null,
                url: pred.sourceUrl || null
              },
              reasoning: pred.reasoning,
              tags: pred.tags || [],
              extraction: {
                model: "gemini-pro",
                confidence: pred.confidence,
              },
              directionCorrection: {
                originalAiDirection: directionCorrection.originalAiDirection,
                mathematicalDirection: directionCorrection.mathematicalDirection,
                correctionMade: directionCorrection.correctionMade,
                priceChange: directionCorrection.priceChange,
                priceChangePercent: directionCorrection.priceChangePercent,
                reasoning: directionCorrection.reasoning,
              },
            },
            outcome: "PENDING",
          },
        });
      } catch (error) {
        console.error("Failed to store prediction:", error);
      }
    }
  }

  /**
   * Calculate mathematical direction based on target vs baseline price
   * and correct AI linguistic direction when they conflict
   */
  private calculateMathematicalDirection(
    targetPrice: number | null | undefined,
    baselinePrice: number | null | undefined,
    aiDirection: string
  ): { correctedDirection: string; directionCorrection: DirectionCorrection } {
    const directionCorrection = {
      originalAiDirection: aiDirection,
      mathematicalDirection: null as string | null,
      correctionMade: false,
      priceChange: null as number | null,
      priceChangePercent: null as number | null,
      reasoning: null as string | null,
    };

    // If we don't have both prices, keep AI direction
    if (!targetPrice || !baselinePrice) {
      directionCorrection.reasoning = "Insufficient price data for mathematical validation";
      return {
        correctedDirection: aiDirection,
        directionCorrection
      };
    }

    // Calculate price change and percentage
    const priceChange = targetPrice - baselinePrice;
    const priceChangePercent = (priceChange / baselinePrice) * 100;

    directionCorrection.priceChange = priceChange;
    directionCorrection.priceChangePercent = priceChangePercent;

    // Determine mathematical direction
    let mathematicalDirection: string;

    if (Math.abs(priceChangePercent) < 2) {
      // Within 2% is considered neutral
      mathematicalDirection = "NEUTRAL";
    } else if (priceChange > 0) {
      // Target price higher than baseline = bullish
      mathematicalDirection = "BULLISH";
    } else {
      // Target price lower than baseline = bearish
      mathematicalDirection = "BEARISH";
    }

    directionCorrection.mathematicalDirection = mathematicalDirection;

    // Check if correction is needed
    const aiDirectionNormalized = aiDirection.toUpperCase();
    if (aiDirectionNormalized !== mathematicalDirection) {
      directionCorrection.correctionMade = true;
      directionCorrection.reasoning = `AI classified as ${aiDirectionNormalized} but mathematically ${mathematicalDirection} (${priceChangePercent.toFixed(1)}% change)`;

      console.log(`🔧 Direction correction: ${aiDirectionNormalized} → ${mathematicalDirection} (Target: $${targetPrice}, Baseline: $${baselinePrice}, Change: ${priceChangePercent.toFixed(1)}%)`);

      return {
        correctedDirection: mathematicalDirection,
        directionCorrection
      };
    }

    directionCorrection.reasoning = `AI and mathematical direction aligned (${priceChangePercent.toFixed(1)}% change)`;

    return {
      correctedDirection: mathematicalDirection,
      directionCorrection
    };
  }
}