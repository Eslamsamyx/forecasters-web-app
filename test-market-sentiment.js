// Test Market Sentiment API Integration
require('dotenv').config();

async function testMarketSentiment() {
  console.log('🧪 Testing Market Sentiment API Integration...\n');

  try {
    // Import the service
    const { marketSentimentService } = require('./src/server/services/marketSentiment.ts');

    console.log('📊 Fetching current market sentiment...');
    const sentimentData = await marketSentimentService.getCurrentMarketContext();

    console.log('✅ Market sentiment data retrieved:');
    console.log(`   Context: ${sentimentData.marketContext}`);
    console.log(`   Score: ${sentimentData.sentimentScore}/100`);
    console.log(`   Classification: ${sentimentData.classification}`);
    console.log(`   Emoji: ${marketSentimentService.getMarketContextEmoji(sentimentData.marketContext)}`);
    console.log(`   Description: ${marketSentimentService.getMarketContextDescription(sentimentData.marketContext)}`);
    console.log(`   Difficulty Multiplier: ${marketSentimentService.getDifficultyMultiplier(sentimentData.marketContext)}`);
    console.log(`   Timestamp: ${sentimentData.timestamp}`);
    console.log(`   Last Updated: ${sentimentData.lastUpdated}`);

    console.log('\n🔍 Cache info:');
    const cacheInfo = marketSentimentService.getCacheInfo();
    console.log(`   Is Cached: ${cacheInfo.isCached}`);
    console.log(`   Last Fetch: ${cacheInfo.lastFetch}`);
    console.log(`   Expires At: ${cacheInfo.expiresAt}`);

    console.log('\n🔄 Testing fresh fetch (bypassing cache)...');
    const freshData = await marketSentimentService.fetchFreshMarketContext();
    console.log(`✅ Fresh data: ${freshData.marketContext} (${freshData.sentimentScore}/100)`);

    console.log('\n🎉 Market Sentiment API Integration Test Completed Successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testMarketSentiment();