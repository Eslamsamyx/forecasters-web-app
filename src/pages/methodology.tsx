"use client";

import { type NextPage } from "next";
import { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  Target,
  BarChart3,
  TrendingUp,
  Book,
  Shield,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Brain,
  Zap,
  Sparkles
} from "lucide-react";
import { api } from "@/utils/api";

const MethodologyPage: NextPage = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch real metrics from database
  const { data: metricsData, isLoading, refetch } = api.statistics.getMetrics.useQuery();
  const { data: forecasterStats } = api.statistics.getForecasterStats.useQuery();
  const { data: predictionStats } = api.statistics.getPredictionStats.useQuery();

  // Use real data or fallback to defaults while loading
  const metrics = metricsData || {
    forecasterCount: 0,
    predictionCount: 0,
    validatedPredictions: 0,
    averageAccuracy: 0,
    totalDataPoints: 0,
    methodologyVersion: "2.1.0"
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setShowSuccess(false);
    await refetch();
    setLastRefreshed(new Date());
    setTimeout(() => {
      setIsRefreshing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }, 1500);
  };

  // Format time since last refresh
  const getTimeSinceRefresh = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastRefreshed.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <>
      <Head>
        <title>Methodology - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Learn about our advanced statistical framework for cryptocurrency prediction validation."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <motion.div
          className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="container mx-auto px-4 py-12 max-w-5xl">
            {/* Header */}
            <motion.div className="mb-12" variants={itemVariants}>
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border-white/20">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
                    <div className="flex-1">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 sm:mb-3">
                        Accuracy Methodology
                      </h1>
                      <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                        Advanced statistical framework for cryptocurrency prediction validation
                      </p>
                    </div>
                    <div className="flex items-center justify-between lg:justify-end gap-3 lg:text-right">
                      <div className="space-y-2 sm:space-y-3 flex-shrink-0">
                        <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-700 border-indigo-200 text-xs sm:text-sm">
                          v{metrics.methodologyVersion}
                        </Badge>
                      </div>
                        <div className="relative group flex-shrink-0">
                          {/* Gradient glow effect */}
                          <div className={`absolute -inset-0.5 bg-gradient-to-r ${
                            showSuccess
                              ? 'from-green-600 to-emerald-600'
                              : 'from-blue-600 to-indigo-600'
                          } rounded-lg blur opacity-50 group-hover:opacity-75 transition-all duration-300`}></div>

                          <Button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className={`relative px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3 bg-gradient-to-r ${
                              showSuccess
                                ? 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                                : 'from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                            } text-white font-semibold rounded-lg transform transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed`}
                          >
                            <div className="flex items-center gap-2 sm:gap-3">
                              {showSuccess ? (
                                <>
                                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                </>
                              ) : (
                                <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                  isRefreshing
                                    ? 'animate-spin'
                                    : 'group-hover:rotate-180 transition-transform duration-500'
                                }`} />
                              )}
                              <div className="flex flex-col items-start">
                                <span className="text-xs sm:text-sm font-bold flex items-center gap-1">
                                  {showSuccess
                                    ? 'Updated!'
                                    : isRefreshing
                                      ? 'Refreshing...'
                                      : 'Refresh Data'
                                  }
                                </span>
                                <span className="text-[10px] sm:text-xs opacity-90">
                                  {getTimeSinceRefresh()}
                                </span>
                              </div>
                            </div>

                            {/* Pulse indicator */}
                            {!isRefreshing && !showSuccess && (
                              <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                              </span>
                            )}

                            {/* Success sparkle effect */}
                            {showSuccess && (
                              <>
                                <Sparkles className="absolute -top-2 -left-2 w-3 h-3 sm:w-4 sm:h-4 text-yellow-300 animate-pulse" />
                                <Sparkles className="absolute -bottom-2 -right-2 w-3 h-3 sm:w-4 sm:h-4 text-yellow-300 animate-pulse delay-75" />
                                <Sparkles className="absolute -top-2 -right-2 w-2 h-2 sm:w-3 sm:h-3 text-yellow-300 animate-pulse delay-150" />
                              </>
                            )}
                          </Button>
                        </div>
                    </div>
                  </div>

                  {/* System Metrics */}
                  {isLoading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
                      <p className="text-gray-600">Loading real-time metrics...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-gray-900">{metrics.forecasterCount.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Active Forecasters</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-gray-900">{metrics.predictionCount.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Total Predictions</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-gray-900">{metrics.validatedPredictions.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Validated</div>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-emerald-700">{(metrics.averageAccuracy * 100).toFixed(1)}%</div>
                        <div className="text-sm text-gray-600">Avg Accuracy</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Our Approach */}
            <motion.div className="mb-12" variants={itemVariants}>
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Book className="h-6 w-6 text-blue-600" />
                    Our Approach
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-gray-700 leading-relaxed">
                    Our prediction tracking system uses advanced statistical methods to provide accurate,
                    unbiased assessments of forecaster performance. We employ multiple validation techniques
                    to ensure reliability and account for the inherent uncertainty in prediction accuracy measurement.
                  </p>

                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="bg-blue-50/50">
                      <CardContent className="pt-6">
                        <Shield className="h-8 w-8 text-blue-600 mb-3" />
                        <h4 className="font-semibold mb-2">Transparent</h4>
                        <p className="text-sm text-gray-600">All methods and calculations are fully disclosed</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-50/50">
                      <CardContent className="pt-6">
                        <CheckCircle2 className="h-8 w-8 text-green-600 mb-3" />
                        <h4 className="font-semibold mb-2">Validated</h4>
                        <p className="text-sm text-gray-600">Regular audits ensure accuracy and consistency</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-purple-50/50">
                      <CardContent className="pt-6">
                        <Activity className="h-8 w-8 text-purple-600 mb-3" />
                        <h4 className="font-semibold mb-2">Dynamic</h4>
                        <p className="text-sm text-gray-600">Continuously updated as new data becomes available</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Advanced Accuracy Calculation */}
            <motion.div className="mb-12" variants={itemVariants}>
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-6 w-6 text-blue-600" />
                    Sophisticated Accuracy Calculation Framework
                  </CardTitle>
                  <CardDescription>
                    Multi-layered statistical methodology for precise forecaster performance assessment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div>
                    <h4 className="font-semibold mb-4">Advanced Statistical Formula</h4>
                    <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm overflow-x-auto">
                      <div className="mb-3 text-lg text-blue-300">
                        Aᵩ = Σᵢ₌₁ⁿ [ωᵢ × δ(pᵢ, oᵢ) × λ(tᵢ, τ)] / Σᵢ₌₁ⁿ ωᵢ
                      </div>
                      <div className="text-xs text-gray-400 mt-3">
                        Where: ωᵢ = confidence weighting, δ(pᵢ,oᵢ) = prediction-outcome correlation,
                        <br />λ(tᵢ,τ) = temporal decay function, n = total validated predictions
                      </div>
                    </div>
                    <p className="text-gray-600 mt-4">
                      Our proprietary algorithm incorporates confidence-weighted scoring, temporal decay adjustments,
                      and multi-dimensional outcome correlation analysis to provide statistically robust accuracy metrics.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-4">Multi-Stage Validation Pipeline</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-50">
                        <div className="w-10 h-10 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center font-bold">α</div>
                        <div>
                          <p className="font-medium mb-1">Semantic Analysis Engine</p>
                          <p className="text-xs text-gray-600">NLP-based prediction extraction with confidence scoring</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 rounded-lg bg-green-50">
                        <div className="w-10 h-10 rounded-full bg-green-200 text-green-700 flex items-center justify-center font-bold">β</div>
                        <div>
                          <p className="font-medium mb-1">Cross-Reference Validation</p>
                          <p className="text-xs text-gray-600">Multi-source data aggregation with consensus algorithms</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 rounded-lg bg-purple-50">
                        <div className="w-10 h-10 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center font-bold">γ</div>
                        <div>
                          <p className="font-medium mb-1">Temporal Correlation Analysis</p>
                          <p className="text-xs text-gray-600">Time-weighted accuracy adjustments and trend detection</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 rounded-lg bg-amber-50">
                        <div className="w-10 h-10 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center font-bold">δ</div>
                        <div>
                          <p className="font-medium mb-1">Bayesian Inference Engine</p>
                          <p className="text-xs text-gray-600">Probabilistic modeling for uncertainty quantification</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Performance Tiers */}
            <motion.div className="mb-12" variants={itemVariants}>
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                    Performance Tier Classification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="border-l-4 border-purple-500 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-purple-100 text-purple-700">Elite</Badge>
                          <span className="text-sm text-gray-600">95%+ accuracy</span>
                          {forecasterStats?.tierDistribution.elite && (
                            <span className="text-xs text-purple-600">({forecasterStats.tierDistribution.elite} forecasters)</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">Top 1% of forecasters with exceptional performance</p>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-blue-100 text-blue-700">Expert</Badge>
                          <span className="text-sm text-gray-600">85-94% accuracy</span>
                          {forecasterStats?.tierDistribution.expert && (
                            <span className="text-xs text-blue-600">({forecasterStats.tierDistribution.expert} forecasters)</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">Highly skilled forecasters with consistent results</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="border-l-4 border-green-500 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-green-100 text-green-700">Pro</Badge>
                          <span className="text-sm text-gray-600">75-84% accuracy</span>
                          {forecasterStats?.tierDistribution.pro && (
                            <span className="text-xs text-green-600">({forecasterStats.tierDistribution.pro} forecasters)</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">Professional level with solid track record</p>
                      </div>
                      <div className="border-l-4 border-amber-500 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-amber-100 text-amber-700">Rising</Badge>
                          <span className="text-sm text-gray-600">65-74% accuracy</span>
                          {forecasterStats?.tierDistribution.rising && (
                            <span className="text-xs text-amber-600">({forecasterStats.tierDistribution.rising} forecasters)</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">Emerging talent showing promising results</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Key Features */}
            <motion.div variants={itemVariants}>
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-6 w-6 text-blue-600" />
                    Key Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium mb-1">Real-Time Processing</h4>
                          <p className="text-sm text-gray-600">Predictions are validated within 24 hours of resolution</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium mb-1">Machine Learning Integration</h4>
                          <p className="text-sm text-gray-600">AI-powered pattern recognition and anomaly detection</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium mb-1">Trend Analysis</h4>
                          <p className="text-sm text-gray-600">Historical performance tracking with predictive modeling</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calculator className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium mb-1">Statistical Rigor</h4>
                          <p className="text-sm text-gray-600">Peer-reviewed methodology with academic validation</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
    </>
  );
};

export default MethodologyPage;