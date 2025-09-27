// Test script to verify direction correction logic
require('dotenv').config();

async function testDirectionCorrection() {
  console.log('🧪 Testing Direction Correction Logic...\\n');

  try {
    // Test 1: Import and test UnifiedExtractionService
    console.log('📊 Testing UnifiedExtractionService direction correction...');

    const { UnifiedExtractionService } = require('./src/server/services/extraction.js');
    const extractionService = new UnifiedExtractionService();

    // Test sample content with mixed directions that should be corrected
    const testCases = [
      {
        content: "Bitcoin will hit $60,000 by end of year", // Should be BEARISH if BTC > $60k
        description: "BTC prediction (linguistically bullish but mathematically depends on current price)"
      },
      {
        content: "Ethereum will reach $8,000 by Q3 2025", // Should be BULLISH if ETH < $8k
        description: "ETH prediction (linguistically bullish, likely mathematically bullish too)"
      },
      {
        content: "XRP will crash to $0.50 by December", // Should be BEARISH regardless
        description: "XRP prediction (linguistically bearish, mathematically bearish)"
      }
    ];

    for (const testCase of testCases) {
      console.log(`\\n🔍 Testing: ${testCase.description}`);
      console.log(`📝 Content: "${testCase.content}"`);

      const predictions = await extractionService.extractFromContent(
        testCase.content,
        "YOUTUBE",
        "cmg1clh2q0000s17lgkgnvn3u" // Test forecaster ID
      );

      if (predictions.length > 0) {
        const pred = predictions[0];
        console.log(`✅ Extracted prediction:`);
        console.log(`   Asset: ${pred.assetSymbol}`);
        console.log(`   Target: $${pred.targetPrice}`);
        console.log(`   Prediction: ${pred.prediction}`);
      } else {
        console.log('❌ No predictions extracted');
      }
    }

    // Test 2: Check recent predictions in database with direction correction
    console.log('\\n🗄️ Checking recent predictions with direction data...');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const recentPredictions = await prisma.prediction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        prediction: true,
        targetPrice: true,
        baselinePrice: true,
        direction: true,
        metadata: true,
        asset: {
          select: { symbol: true }
        }
      }
    });

    console.log(`📊 Found ${recentPredictions.length} recent predictions:`);
    recentPredictions.forEach((pred, i) => {
      const directionCorrection = pred.metadata?.directionCorrection;
      const priceChange = pred.targetPrice && pred.baselinePrice
        ? ((pred.targetPrice - pred.baselinePrice) / pred.baselinePrice * 100).toFixed(1)
        : 'N/A';

      console.log(`\\n${i + 1}. ${pred.asset?.symbol || 'Unknown'}: ${pred.prediction.substring(0, 60)}...`);
      console.log(`   Target: $${pred.targetPrice}, Baseline: $${pred.baselinePrice}`);
      console.log(`   Direction: ${pred.direction}, Change: ${priceChange}%`);

      if (directionCorrection?.correctionMade) {
        console.log(`   🔧 CORRECTED: ${directionCorrection.originalAiDirection} → ${directionCorrection.mathematicalDirection}`);
        console.log(`   📝 Reason: ${directionCorrection.reasoning}`);
      } else if (directionCorrection) {
        console.log(`   ✅ AI direction confirmed: ${directionCorrection.reasoning}`);
      }
    });

    await prisma.$disconnect();

    console.log('\\n🎉 Direction correction test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testDirectionCorrection();