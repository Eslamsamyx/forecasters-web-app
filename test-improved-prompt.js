// Test script to verify improved AI prompt with current price awareness
require('dotenv').config();

async function testImprovedPrompt() {
  console.log('🧪 Testing Improved AI Prompt with Current Price Awareness...\n');

  try {
    const { UnifiedExtractionService } = require('./src/server/services/extraction.js');
    const extractionService = new UnifiedExtractionService();

    // Test cases that should show improved AI direction awareness
    const testCases = [
      {
        content: "Bitcoin will hit $60,000 by end of year",
        description: "BTC $60k prediction - should be BEARISH if current price > $60k"
      },
      {
        content: "Ethereum will reach $8,000 by Q3 2025",
        description: "ETH $8k prediction - should be BULLISH if current price < $8k"
      },
      {
        content: "XRP will crash to $0.50 by December",
        description: "XRP $0.50 prediction - should be BEARISH regardless of current price"
      },
      {
        content: "I think Bitcoin could go to $150,000 within the next 2 years",
        description: "BTC $150k prediction - should be BULLISH if current price < $150k"
      },
      {
        content: "Apple stock might drop to $160 if earnings disappoint",
        description: "AAPL $160 prediction - direction depends on current AAPL price"
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n🔍 Testing: ${testCase.description}`);
      console.log(`📝 Content: "${testCase.content}"`);

      try {
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
          console.log(`   AI Direction: ${pred.aiDirection || 'Not captured'}`);
          console.log(`   Prediction: ${pred.prediction}`);
        } else {
          console.log('❌ No predictions extracted');
        }
      } catch (error) {
        console.log(`❌ Error processing "${testCase.content}": ${error.message}`);
      }
    }

    // Check recent database predictions to see direction correction patterns
    console.log('\n🗄️ Checking recent predictions for direction correction patterns...');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const recentPredictions = await prisma.prediction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        prediction: true,
        targetPrice: true,
        baselinePrice: true,
        direction: true,
        metadata: true,
        asset: { select: { symbol: true } }
      }
    });

    console.log(`📊 Recent predictions analysis:`);
    recentPredictions.forEach((pred, i) => {
      const directionCorrection = pred.metadata?.directionCorrection;
      console.log(`\n${i + 1}. ${pred.asset?.symbol}: ${pred.prediction.substring(0, 50)}...`);
      console.log(`   Final Direction: ${pred.direction}`);

      if (directionCorrection?.correctionMade) {
        console.log(`   🔧 CORRECTED: AI said "${directionCorrection.originalAiDirection}" → Math corrected to "${directionCorrection.mathematicalDirection}"`);
        console.log(`   📈 Price Change: ${directionCorrection.priceChangePercent}%`);
      } else if (directionCorrection) {
        console.log(`   ✅ AI direction was mathematically correct`);
      }
    });

    await prisma.$disconnect();

    console.log('\n📈 Expected improvements:');
    console.log('- AI should now be more price-aware when setting initial direction');
    console.log('- Fewer corrections needed if AI considers current market prices');
    console.log('- Better alignment between linguistic and mathematical analysis');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testImprovedPrompt();