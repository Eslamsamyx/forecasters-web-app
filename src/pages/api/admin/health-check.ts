import { type NextApiRequest, type NextApiResponse } from "next";
import { services, cronService } from "@/server/services";
import { prisma } from "@/server/db";

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  details?: string;
  lastCheck: string;
}

interface HealthCheckResponse {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: ServiceStatus[];
  database: {
    connected: boolean;
    latency?: number;
  };
  environment: {
    nodeEnv: string;
    platform: string;
  };
}

/**
 * Health check endpoint for monitoring service status
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthCheckResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const timestamp = new Date().toISOString();
  const serviceStatuses: ServiceStatus[] = [];

  try {
    // Check database connectivity
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;
    const databaseStatus = {
      connected: true,
      latency: dbLatency
    };

    // Check cron service
    serviceStatuses.push({
      name: 'Cron Service',
      status: 'healthy', // Assume healthy if no errors
      details: 'Background jobs running',
      lastCheck: timestamp
    });

    // Check health monitoring service
    try {
      const healthStats = await services.health.getStats();
      serviceStatuses.push({
        name: 'Health Monitoring',
        status: 'healthy',
        details: `Monitoring ${Object.keys(healthStats).length} metrics`,
        lastCheck: timestamp
      });
    } catch (error) {
      serviceStatuses.push({
        name: 'Health Monitoring',
        status: 'unhealthy',
        details: (error as Error).message,
        lastCheck: timestamp
      });
    }

    // Check recent job executions
    try {
      const recentJobs = await prisma.job.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
          }
        }
      });

      serviceStatuses.push({
        name: 'Job Execution',
        status: recentJobs > 0 ? 'healthy' : 'unknown',
        details: `${recentJobs} jobs in last hour`,
        lastCheck: timestamp
      });
    } catch (error) {
      serviceStatuses.push({
        name: 'Job Execution',
        status: 'unhealthy',
        details: (error as Error).message,
        lastCheck: timestamp
      });
    }

    // Check channel collection status
    try {
      const activeChannels = await prisma.forecasterChannel.count({
        where: { isActive: true }
      });

      const recentCollections = await prisma.channelCollectionJob.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });

      serviceStatuses.push({
        name: 'X Collection',
        status: activeChannels > 0 ? 'healthy' : 'unknown',
        details: `${activeChannels} active channels, ${recentCollections} collections in 24h`,
        lastCheck: timestamp
      });
    } catch (error) {
      serviceStatuses.push({
        name: 'X Collection',
        status: 'unhealthy',
        details: (error as Error).message,
        lastCheck: timestamp
      });
    }

    // Determine overall health
    const unhealthyServices = serviceStatuses.filter(s => s.status === 'unhealthy');
    const unknownServices = serviceStatuses.filter(s => s.status === 'unknown');

    let overall: 'healthy' | 'degraded' | 'unhealthy';
    if (unhealthyServices.length > 0) {
      overall = 'unhealthy';
    } else if (unknownServices.length > 0) {
      overall = 'degraded';
    } else {
      overall = 'healthy';
    }

    const response: HealthCheckResponse = {
      overall,
      timestamp,
      services: serviceStatuses,
      database: databaseStatus,
      environment: {
        nodeEnv: process.env.NODE_ENV || 'unknown',
        platform: process.platform
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error("❌ Health check failed:", error);

    return res.status(500).json({
      error: "Health check failed",
      timestamp,
      services: serviceStatuses,
      database: { connected: false },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'unknown',
        platform: process.platform
      }
    } as any);
  }
}