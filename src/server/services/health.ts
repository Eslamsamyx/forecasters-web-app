import { prisma } from "../db";

interface ServiceHealth {
  name: string;
  status: "healthy" | "degraded" | "down";
  responseTime: number;
  lastChecked: Date;
  error?: string;
}

interface SystemMetrics {
  cpu: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  uptime: number;
  timestamp: Date;
}

export class HealthMonitoringService {
  private services: Map<string, ServiceHealth> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;

  /**
   * Start health monitoring
   */
  start(intervalMs = 60000) {
    // Check every minute by default
    this.checkInterval = setInterval(() => {
      this.checkAllServices();
    }, intervalMs);

    // Initial check
    this.checkAllServices();
  }

  /**
   * Stop health monitoring
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Check all services
   */
  async checkAllServices() {
    await Promise.all([
      this.checkDatabase(),
      this.checkMarketDataAPIs(),
      this.checkExtractionServices(),
      this.checkEmailService(),
      this.checkStripeService(),
      this.checkCacheService(),
    ]);

    // Log health status
    await this.logHealthStatus();
  }

  /**
   * Check database health
   */
  async checkDatabase(): Promise<ServiceHealth> {
    const startTime = Date.now();
    let status: ServiceHealth = {
      name: "Database",
      status: "healthy",
      responseTime: 0,
      lastChecked: new Date(),
    };

    try {
      // Simple query to check database connection
      await prisma.$queryRaw`SELECT 1`;

      // Check table counts
      const [userCount, predictionCount] = await Promise.all([
        prisma.user.count(),
        prisma.prediction.count(),
      ]);

      status.responseTime = Date.now() - startTime;

      // Check if database is responding slowly
      if (status.responseTime > 1000) {
        status.status = "degraded";
      }
    } catch (error) {
      status.status = "down";
      status.error = (error as Error).message;
      status.responseTime = Date.now() - startTime;
    }

    this.services.set("database", status);
    return status;
  }

  /**
   * Check market data APIs
   */
  async checkMarketDataAPIs(): Promise<ServiceHealth> {
    const startTime = Date.now();
    let status: ServiceHealth = {
      name: "MarketData",
      status: "healthy",
      responseTime: 0,
      lastChecked: new Date(),
    };

    try {
      // Test Binance API
      const binanceResponse = await fetch("https://api.binance.com/api/v3/ping");

      if (!binanceResponse.ok) {
        status.status = "degraded";
      }

      // Test CoinGecko API
      const coingeckoResponse = await fetch("https://api.coingecko.com/api/v3/ping");

      if (!coingeckoResponse.ok) {
        status.status = "degraded";
      }

      status.responseTime = Date.now() - startTime;

      if (status.responseTime > 3000) {
        status.status = "degraded";
      }
    } catch (error) {
      status.status = "down";
      status.error = (error as Error).message;
      status.responseTime = Date.now() - startTime;
    }

    this.services.set("marketData", status);
    return status;
  }

  /**
   * Check extraction services (Gemini, OpenAI)
   */
  async checkExtractionServices(): Promise<ServiceHealth> {
    const startTime = Date.now();
    let status: ServiceHealth = {
      name: "ExtractionServices",
      status: "healthy",
      responseTime: 0,
      lastChecked: new Date(),
    };

    try {
      // Check if API keys are configured
      const hasGeminiKey = !!process.env.GEMINI_API_KEY;
      const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

      if (!hasGeminiKey && !hasOpenAIKey) {
        status.status = "down";
        status.error = "No extraction API keys configured";
      } else if (!hasGeminiKey || !hasOpenAIKey) {
        status.status = "degraded";
        status.error = "Some extraction API keys missing";
      }

      status.responseTime = Date.now() - startTime;
    } catch (error) {
      status.status = "down";
      status.error = (error as Error).message;
      status.responseTime = Date.now() - startTime;
    }

    this.services.set("extraction", status);
    return status;
  }

  /**
   * Check email service
   */
  async checkEmailService(): Promise<ServiceHealth> {
    const startTime = Date.now();
    let status: ServiceHealth = {
      name: "EmailService",
      status: "healthy",
      responseTime: 0,
      lastChecked: new Date(),
    };

    try {
      // Check if SMTP credentials are configured
      const hasSmtpConfig =
        !!process.env.SMTP_HOST &&
        !!process.env.SMTP_USER &&
        !!process.env.SMTP_PASSWORD;

      if (!hasSmtpConfig) {
        status.status = "down";
        status.error = "SMTP not configured";
      }

      status.responseTime = Date.now() - startTime;
    } catch (error) {
      status.status = "down";
      status.error = (error as Error).message;
      status.responseTime = Date.now() - startTime;
    }

    this.services.set("email", status);
    return status;
  }

  /**
   * Check Stripe service
   */
  async checkStripeService(): Promise<ServiceHealth> {
    const startTime = Date.now();
    let status: ServiceHealth = {
      name: "StripeService",
      status: "healthy",
      responseTime: 0,
      lastChecked: new Date(),
    };

    try {
      // Check if Stripe key is configured
      const hasStripeKey = !!process.env.STRIPE_SECRET_KEY;

      if (!hasStripeKey) {
        status.status = "down";
        status.error = "Stripe not configured";
      } else {
        // Test Stripe API
        const response = await fetch("https://api.stripe.com/v1/charges", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          },
        });

        if (response.status === 401) {
          status.status = "down";
          status.error = "Invalid Stripe API key";
        } else if (!response.ok && response.status !== 200) {
          status.status = "degraded";
        }
      }

      status.responseTime = Date.now() - startTime;
    } catch (error) {
      status.status = "down";
      status.error = (error as Error).message;
      status.responseTime = Date.now() - startTime;
    }

    this.services.set("stripe", status);
    return status;
  }

  /**
   * Check cache service (Redis/Memory)
   */
  async checkCacheService(): Promise<ServiceHealth> {
    const startTime = Date.now();
    let status: ServiceHealth = {
      name: "CacheService",
      status: "healthy",
      responseTime: 0,
      lastChecked: new Date(),
    };

    try {
      // For now, we're using in-memory cache
      // In production, check Redis connection
      status.responseTime = Date.now() - startTime;
    } catch (error) {
      status.status = "down";
      status.error = (error as Error).message;
      status.responseTime = Date.now() - startTime;
    }

    this.services.set("cache", status);
    return status;
  }

  /**
   * Get system metrics
   */
  getSystemMetrics(): SystemMetrics {
    const usage = process.memoryUsage();
    const uptime = process.uptime();

    return {
      cpu: process.cpuUsage().user / 1000000, // Convert to seconds
      memory: {
        used: usage.heapUsed,
        total: usage.heapTotal,
        percentage: (usage.heapUsed / usage.heapTotal) * 100,
      },
      uptime,
      timestamp: new Date(),
    };
  }

  /**
   * Get overall health status
   */
  getOverallHealth(): { status: string; services: ServiceHealth[]; metrics: SystemMetrics } {
    const services = Array.from(this.services.values());
    const unhealthyCount = services.filter(s => s.status === "down").length;
    const degradedCount = services.filter(s => s.status === "degraded").length;

    let overallStatus = "healthy";
    if (unhealthyCount > 0) {
      overallStatus = "unhealthy";
    } else if (degradedCount > 0) {
      overallStatus = "degraded";
    }

    return {
      status: overallStatus,
      services,
      metrics: this.getSystemMetrics(),
    };
  }

  /**
   * Log health status to database
   */
  async logHealthStatus() {
    const health = this.getOverallHealth();

    await prisma.event.create({
      data: {
        type: "HEALTH_CHECK",
        entityType: "SYSTEM",
        entityId: "health",
        data: JSON.parse(JSON.stringify(health)),
      },
    });

    // Alert if unhealthy
    if (health.status === "unhealthy") {
      console.error("⚠️  System health check failed:", health.services.filter(s => s.status === "down"));
    }
  }

  /**
   * Get health history
   */
  async getHealthHistory(hours = 24) {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    const events = await prisma.event.findMany({
      where: {
        type: "HEALTH_CHECK",
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "desc" },
    });

    return events.map(e => ({
      timestamp: e.createdAt,
      ...(e.data as any),
    }));
  }

  /**
   * Get service uptime percentage
   */
  async getUptime(serviceName: string, days = 30): Promise<number> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const events = await prisma.event.findMany({
      where: {
        type: "HEALTH_CHECK",
        createdAt: { gte: since },
      },
      select: { data: true },
    });

    let totalChecks = 0;
    let healthyChecks = 0;

    for (const event of events) {
      const data = event.data as any;
      const service = data.services?.find((s: any) => s.name === serviceName);

      if (service) {
        totalChecks++;
        if (service.status === "healthy") {
          healthyChecks++;
        }
      }
    }

    return totalChecks > 0 ? (healthyChecks / totalChecks) * 100 : 0;
  }

  /**
   * Get service statistics for health check endpoint
   */
  getStats() {
    const health = this.getOverallHealth();
    return {
      overallStatus: health.status,
      servicesCount: health.services.length,
      healthyCount: health.services.filter(s => s.status === "healthy").length,
      degradedCount: health.services.filter(s => s.status === "degraded").length,
      downCount: health.services.filter(s => s.status === "down").length,
      uptime: Math.floor(health.metrics.uptime / 60),
      memoryUsage: health.metrics.memory.percentage.toFixed(2),
    };
  }

  /**
   * API endpoint health check
   */
  async healthCheck() {
    const health = this.getOverallHealth();

    return {
      status: health.status,
      timestamp: new Date().toISOString(),
      services: Object.fromEntries(
        health.services.map(s => [
          s.name.toLowerCase(),
          {
            status: s.status,
            responseTime: s.responseTime,
            error: s.error,
          },
        ])
      ),
      metrics: {
        cpu: `${health.metrics.cpu.toFixed(2)}s`,
        memory: `${(health.metrics.memory.percentage).toFixed(2)}%`,
        uptime: `${Math.floor(health.metrics.uptime / 60)}m`,
      },
    };
  }
}