// Test script to verify extraction pipeline components
require('dotenv').config();

// Test sample crypto content (simulating what we'd get from a Coin Bureau video)
const sampleCryptoContent = `
In this video, I'm going to share my predictions for the crypto market in 2025.

First, let's talk about Bitcoin. I believe Bitcoin will reach $150,000 by the end of 2025.
The institutional adoption is accelerating, and with the halving effects still rippling through
the market, I'm very confident about this target.

For Ethereum, I think we'll see it hit $8,000 by Q3 2025. The upcoming upgrades and
the shift to proof-of-stake have set the foundation for massive growth.

Regarding XRP, this is where it gets interesting. With the SEC lawsuit behind us,
I predict XRP will surge to $5 by December 2025. The banking partnerships are
finally starting to materialize.

Solana is another one to watch. I'm calling $400 for SOL by the end of Q2 2025.
The ecosystem is growing rapidly and developer activity is through the roof.

Now, here's a bold prediction - I think we're going to see a new all-time high
for the total crypto market cap of $4 trillion by late 2025.

Remember, these are just my opinions and not financial advice. Always do your own research.
`;

async function testExtractionPipeline() {
  console.log('🧪 Testing Extraction Pipeline Components...\n');

  try {
    // Test 1: Import and test UnifiedExtractionService
    console.log('📊 Testing UnifiedExtractionService...');

    const { UnifiedExtractionService } = require('./src/server/services/extraction.js');
    const extractionService = new UnifiedExtractionService();

    // Simulate extraction from content
    console.log('🔍 Extracting predictions from sample crypto content...');
    const predictions = await extractionService.extractFromContent(
      sampleCryptoContent,
      "YOUTUBE",
      "cmg1clh2q0000s17lgkgnvn3u" // Coin Bureau forecaster ID
    );

    console.log(`✅ Extraction complete! Found ${predictions.length} predictions\n`);

    if (predictions.length > 0) {
      console.log('📈 Extracted Predictions:');
      predictions.forEach((pred, i) => {
        console.log(`${i + 1}. Asset: ${pred.assetSymbol || 'Unknown'}`);
        console.log(`   Prediction: ${pred.prediction}`);
        console.log(`   Confidence: ${Math.round(pred.confidence * 100)}%`);
        console.log(`   Target Price: $${pred.targetPrice || 'N/A'}`);
        console.log(`   Target Date: ${pred.targetDate || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('❌ No predictions extracted. This might indicate an issue with the LLM processing.');
    }

    // Test 2: Verify database storage
    console.log('🗄️ Testing database storage...');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    // Check if predictions were stored
    const storedPredictions = await prisma.prediction.findMany({
      where: { forecasterId: "cmg1clh2q0000s17lgkgnvn3u" },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    console.log(`📊 Found ${storedPredictions.length} stored predictions for Coin Bureau`);

    if (storedPredictions.length > 0) {
      console.log('\n💾 Recent stored predictions:');
      storedPredictions.forEach((pred, i) => {
        console.log(`${i + 1}. ${pred.prediction} (${Math.round(pred.confidence * 100)}%)`);
      });
    }

    await prisma.$disconnect();

    // Test 3: Check forecaster configuration
    console.log('\n🔧 Verifying forecaster configuration...');
    const { PrismaClient: PrismaClient2 } = require('@prisma/client');
    const prisma2 = new PrismaClient2();
    const forecaster = await prisma2.forecaster.findUnique({
      where: { id: "cmg1clh2q0000s17lgkgnvn3u" }
    });

    if (forecaster) {
      console.log('✅ Coin Bureau forecaster found:');
      console.log(`   Name: ${forecaster.name}`);
      console.log(`   Verified: ${forecaster.isVerified}`);
      console.log(`   YouTube Channel: ${forecaster.profile?.youtubeChannel || 'Not configured'}`);
    } else {
      console.log('❌ Coin Bureau forecaster not found in database');
    }

    await prisma2.$disconnect();

    console.log('\n🎉 Test completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Test the YouTube video collection with a real Coin Bureau video');
    console.log('2. Test the complete bulk extraction pipeline via the admin interface');
    console.log('3. Verify predictions appear in the admin dashboard');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testExtractionPipeline();