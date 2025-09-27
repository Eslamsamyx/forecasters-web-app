// Export all services
export { AssetService } from "./assets";
export { BrierScoreService } from "./brierScore";
export { ContentCollectionService } from "./collectors";
export { ChannelCollectionService } from "./channelCollectionService";
export { CronService } from "./cron";
export { EmailService } from "./email";
export { UnifiedExtractionService } from "./extraction";
export { HealthMonitoringService } from "./health";
export { MarketDataService, BinanceService, CoinGeckoService } from "./marketData";
export { RankingService } from "./ranking";
export { SearchService } from "./search";
export { StripeService } from "./stripe";
export { TranscriptionService } from "./transcription";
export { PredictionValidationService } from "./validation";

// Service initialization
import { AssetService } from "./assets";
import { BrierScoreService } from "./brierScore";
import { ContentCollectionService } from "./collectors";
import { ChannelCollectionService } from "./channelCollectionService";
import { CronService } from "./cron";
import { EmailService } from "./email";
import { HealthMonitoringService } from "./health";
import { MarketDataService } from "./marketData";
import { RankingService } from "./ranking";
import { SearchService } from "./search";
import { StripeService } from "./stripe";
import { TranscriptionService } from "./transcription";
import { PredictionValidationService } from "./validation";

// Initialize service instances
export const services = {
  asset: new AssetService(),
  brierScore: new BrierScoreService(),
  collection: new ContentCollectionService(),
  channelCollection: new ChannelCollectionService(),
  email: new EmailService(),
  health: new HealthMonitoringService(),
  marketData: new MarketDataService(),
  ranking: new RankingService(new BrierScoreService()),
  search: new SearchService(),
  stripe: new StripeService(),
  transcription: new TranscriptionService(),
  validation: new PredictionValidationService(),
};

// Initialize cron service with dependencies
export const cronService = new CronService(
  services.asset,
  services.validation,
  services.collection,
  services.channelCollection,
  services.brierScore,
  services.ranking
);

// Track initialization state
let servicesInitialized = false;

// Start services that need initialization
export function initializeServices() {
  if (servicesInitialized) {
    console.log("⚠️ Services already initialized, skipping...");
    return;
  }

  console.log("🚀 Initializing services...");

  // Start health monitoring
  services.health.start();
  console.log("✅ Health monitoring started");

  // Start cron jobs
  cronService.start();
  console.log("✅ Cron jobs started");

  // Mark as initialized
  servicesInitialized = true;
  console.log("✅ All services initialized successfully");
}

// Auto-initialize services in production environments
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  console.log("🌐 Production environment detected - auto-initializing services...");

  // Add small delay to ensure database connection is ready
  setTimeout(() => {
    initializeServices();
  }, 2000);
}

// Also auto-initialize in development if not running in Vercel
if (typeof window === 'undefined' &&
    process.env.NODE_ENV === 'development' &&
    !process.env.VERCEL) {
  console.log("🔧 Local development environment detected - auto-initializing services...");

  setTimeout(() => {
    initializeServices();
  }, 3000);
}

// Cleanup function for graceful shutdown
export function shutdownServices() {
  console.log("🛑 Shutting down services...");

  services.health.stop();
  cronService.stop();

  console.log("✅ All services shut down");
}