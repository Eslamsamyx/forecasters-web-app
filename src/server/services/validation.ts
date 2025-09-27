import { prisma } from "../db";
import { Prediction, Asset } from "@prisma/client";

export class PredictionValidationService {
  async validate(predictionId: string) {
    const prediction = await prisma.prediction.findUnique({
      where: { id: predictionId },
      include: { asset: true },
    });

    if (!prediction) {
      throw new Error("Prediction not found");
    }

    if (prediction.outcome !== "PENDING") {
      return prediction; // Already validated
    }

    if (!prediction.asset) {
      throw new Error("Cannot validate prediction without asset information");
    }

    const outcome = await this.determineOutcome(prediction, prediction.asset);

    await prisma.prediction.update({
      where: { id: predictionId },
      data: {
        outcome,
        validatedAt: new Date(),
      },
    });

    // Update forecaster metrics
    await this.updateForecasterMetrics(prediction.forecasterId, outcome);

    // Log validation event
    await prisma.event.create({
      data: {
        type: "PREDICTION_VALIDATED",
        entityType: "PREDICTION",
        entityId: predictionId,
        data: { outcome, targetPrice: prediction.targetPrice },
      },
    });

    return outcome;
  }

  private async determineOutcome(
    prediction: Prediction,
    asset: Asset
  ): Promise<"CORRECT" | "INCORRECT" | "PENDING" | "PARTIAL"> {
    const currentPrice = (asset.priceData as any)?.price;

    if (!currentPrice) {
      return "PENDING";
    }

    const targetPrice = prediction.targetPrice;
    const confidence = prediction.confidence || 0.5;

    // Parse prediction text for direction
    const predictionText = prediction.prediction.toLowerCase();
    const isBullish =
      predictionText.includes("rise") ||
      predictionText.includes("increase") ||
      predictionText.includes("bull") ||
      predictionText.includes("up") ||
      predictionText.includes("reach") ||
      predictionText.includes("hit");

    const isBearish =
      predictionText.includes("fall") ||
      predictionText.includes("decrease") ||
      predictionText.includes("bear") ||
      predictionText.includes("down") ||
      predictionText.includes("drop");

    if (targetPrice) {
      // Price target prediction
      const targetPriceNum = Number(targetPrice);
      const tolerance = targetPriceNum * 0.05; // 5% tolerance

      if (Math.abs(currentPrice - targetPriceNum) <= tolerance) {
        return "CORRECT";
      }

      // Check if direction is correct at least
      if (isBullish && currentPrice > (asset.priceData as any).price24hAgo) {
        return "PARTIAL";
      }
      if (isBearish && currentPrice < (asset.priceData as any).price24hAgo) {
        return "PARTIAL";
      }

      return "INCORRECT";
    }

    // Directional prediction
    const price24hAgo = (asset.priceData as any).price24hAgo || currentPrice;
    const priceChange = ((currentPrice - price24hAgo) / price24hAgo) * 100;

    if (isBullish && priceChange > 1) {
      return "CORRECT";
    }
    if (isBearish && priceChange < -1) {
      return "CORRECT";
    }

    if (Math.abs(priceChange) < 1) {
      return "PARTIAL"; // Neutral movement
    }

    return "INCORRECT";
  }

  private async updateForecasterMetrics(forecasterId: string, outcome: string) {
    const forecaster = await prisma.forecaster.findUnique({
      where: { id: forecasterId },
    });

    if (!forecaster) return;

    const metrics = (forecaster.metrics as any) || {
      accuracy: 0,
      totalPredictions: 0,
      correctPredictions: 0,
      brierScore: 0,
    };

    metrics.totalPredictions++;

    if (outcome === "CORRECT") {
      metrics.correctPredictions++;
    } else if (outcome === "PARTIAL") {
      metrics.correctPredictions += 0.5;
    }

    metrics.accuracy = metrics.correctPredictions / metrics.totalPredictions;

    await prisma.forecaster.update({
      where: { id: forecasterId },
      data: { metrics },
    });
  }

  async validateBatch(predictionIds: string[]) {
    const results = [];

    for (const id of predictionIds) {
      try {
        const result = await this.validate(id);
        results.push({ id, success: true, outcome: result });
      } catch (error) {
        results.push({ id, success: false, error: (error as Error).message });
      }
    }

    return results;
  }

  async validateAllPending() {
    const pendingPredictions = await prisma.prediction.findMany({
      where: {
        outcome: "PENDING",
        targetDate: { lte: new Date() },
      },
      select: { id: true },
    });

    console.log(`Found ${pendingPredictions.length} predictions to validate`);

    return this.validateBatch(pendingPredictions.map(p => p.id));
  }
}