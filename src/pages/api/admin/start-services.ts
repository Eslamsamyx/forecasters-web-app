import { type NextApiRequest, type NextApiResponse } from "next";
import { initializeServices } from "@/server/services";

/**
 * Production endpoint to start background services
 * Call this after deployment to start cron jobs
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize all background services including cron
    initializeServices();

    console.log("🚀 Production services started successfully");

    return res.status(200).json({
      success: true,
      message: "Background services started successfully",
      services: [
        "Health monitoring",
        "Cron jobs (X collection every 10 minutes)",
        "Asset price updates",
        "Prediction validation",
        "Brier score calculation",
        "Rankings update"
      ]
    });
  } catch (error) {
    console.error("❌ Failed to start services:", error);
    return res.status(500).json({
      error: "Failed to start services",
      details: (error as Error).message
    });
  }
}