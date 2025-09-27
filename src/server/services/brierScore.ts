import { prisma } from "../db";

export class BrierScoreService {
  /**
   * Calculate Brier Score for a forecaster
   * Brier Score = (1/N) * Σ(forecast_probability - actual_outcome)²
   * Lower scores indicate better accuracy (0 = perfect, 1 = worst)
   */
  async calculate(forecasterId: string) {
    const predictions = await prisma.prediction.findMany({
      where: {
        forecasterId,
        outcome: { not: "PENDING" },
        confidence: { not: null },
      },
    });

    if (predictions.length === 0) {
      return null;
    }

    let totalScore = 0;
    let validPredictions = 0;

    for (const prediction of predictions) {
      const confidence = Number(prediction.confidence) || 0.5;
      const actualOutcome = prediction.outcome === "CORRECT" ? 1 : 0;

      // Calculate Brier score component
      const score = Math.pow(confidence - actualOutcome, 2);
      totalScore += score;
      validPredictions++;
    }

    const brierScore = totalScore / validPredictions;

    // Update forecaster metrics
    await prisma.forecaster.update({
      where: { id: forecasterId },
      data: {
        metrics: {
          ...(await this.getMetrics(forecasterId)),
          brierScore,
          lastCalculated: new Date().toISOString(),
        },
      },
    });

    return brierScore;
  }

  private async getMetrics(forecasterId: string) {
    const forecaster = await prisma.forecaster.findUnique({
      where: { id: forecasterId },
    });

    return (forecaster?.metrics as any) || {};
  }

  async calculateAll() {
    const forecasters = await prisma.forecaster.findMany();

    const results = [];

    for (const forecaster of forecasters) {
      try {
        const score = await this.calculate(forecaster.id);
        results.push({
          forecasterId: forecaster.id,
          name: forecaster.name,
          brierScore: score,
        });
      } catch (error) {
        console.error(`Failed to calculate Brier score for ${forecaster.name}:`, error);
      }
    }

    return results;
  }

  /**
   * Calculate calibration score
   * Measures how well confidence levels match actual accuracy
   */
  async calculateCalibration(forecasterId: string) {
    const predictions = await prisma.prediction.findMany({
      where: {
        forecasterId,
        outcome: { not: "PENDING" },
        confidence: { not: null },
      },
    });

    // Group predictions by confidence buckets
    const buckets: Record<number, { predictions: number; correct: number }> = {};

    for (const prediction of predictions) {
      const confidence = Math.round((Number(prediction.confidence) || 0.5) * 10) / 10;
      if (!buckets[confidence]) {
        buckets[confidence] = { predictions: 0, correct: 0 };
      }

      buckets[confidence].predictions++;
      if (prediction.outcome === "CORRECT") {
        buckets[confidence].correct++;
      }
    }

    // Calculate calibration error
    let totalError = 0;
    let totalWeight = 0;

    for (const [confidence, data] of Object.entries(buckets)) {
      const expectedAccuracy = parseFloat(confidence);
      const actualAccuracy = data.correct / data.predictions;
      const weight = data.predictions;

      totalError += Math.abs(expectedAccuracy - actualAccuracy) * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? totalError / totalWeight : null;
  }

  /**
   * Calculate resolution score
   * Measures how much predictions vary from the base rate
   */
  async calculateResolution(forecasterId: string) {
    const predictions = await prisma.prediction.findMany({
      where: {
        forecasterId,
        outcome: { not: "PENDING" },
      },
    });

    if (predictions.length === 0) return null;

    const baseRate = predictions.filter(p => p.outcome === "CORRECT").length / predictions.length;

    let resolution = 0;
    const confidenceBuckets: Record<number, number> = {};

    for (const prediction of predictions) {
      const confidence = Math.round((Number(prediction.confidence) || 0.5) * 10) / 10;
      confidenceBuckets[confidence] = (confidenceBuckets[confidence] || 0) + 1;
    }

    for (const [confidence, count] of Object.entries(confidenceBuckets)) {
      const p = parseFloat(confidence);
      const weight = count / predictions.length;
      resolution += weight * Math.pow(p - baseRate, 2);
    }

    return resolution;
  }

  /**
   * Get comprehensive scoring metrics for a forecaster
   */
  async getComprehensiveMetrics(forecasterId: string) {
    const [brierScore, calibration, resolution] = await Promise.all([
      this.calculate(forecasterId),
      this.calculateCalibration(forecasterId),
      this.calculateResolution(forecasterId),
    ]);

    const predictions = await prisma.prediction.findMany({
      where: { forecasterId },
      select: { outcome: true },
    });

    const total = predictions.length;
    const correct = predictions.filter(p => p.outcome === "CORRECT").length;
    const incorrect = predictions.filter(p => p.outcome === "INCORRECT").length;
    const partial = predictions.filter(p => p.outcome === "PARTIAL").length;
    const pending = predictions.filter(p => p.outcome === "PENDING").length;

    return {
      brierScore,
      calibration,
      resolution,
      accuracy: total > 0 ? correct / total : 0,
      total,
      correct,
      incorrect,
      partial,
      pending,
    };
  }
}