"use client";

import { type NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { api } from "@/utils/api";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Target,
  User,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Bitcoin,
  BarChart3,
  ChevronRight,
  Share2,
  Bookmark,
  ExternalLink,
  Info,
  Gauge
} from "lucide-react";

const PredictionDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  // Fetch prediction details
  const { data: prediction, isLoading, error } = api.predictions.getById.useQuery(
    id as string,
    { enabled: !!id }
  );

  const getOutcomeColor = (outcome?: string) => {
    switch (outcome) {
      case "CORRECT":
        return "bg-green-100 text-green-700 border-green-200";
      case "INCORRECT":
        return "bg-red-100 text-red-700 border-red-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "PARTIAL":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getOutcomeIcon = (outcome?: string) => {
    switch (outcome) {
      case "CORRECT":
        return <CheckCircle className="h-5 w-5" />;
      case "INCORRECT":
        return <AlertCircle className="h-5 w-5" />;
      case "PENDING":
        return <Clock className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Prediction Not Found</h2>
            <p className="text-gray-600 mb-4">The prediction you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.push("/predictions")}>
              Back to Predictions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-4xl px-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return null;
  }

  const daysUntilTarget = prediction.targetDate
    ? Math.ceil((new Date(prediction.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const isOverdue = daysUntilTarget !== null && daysUntilTarget < 0 && prediction.outcome === "PENDING";

  return (
    <>
      <Head>
        <title>{prediction.prediction} - Prediction Details</title>
        <meta name="description" content={`View detailed prediction analysis and tracking`} />
      </Head>
      <motion.div
        className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 py-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Back Navigation */}
          <motion.div variants={itemVariants} className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/predictions")}
              className="hover:bg-white/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Predictions
            </Button>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Main Info */}
            <motion.div className="lg:col-span-2 space-y-6" variants={itemVariants}>
              {/* Prediction Header Card */}
              <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-xl">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={getOutcomeColor(prediction.outcome)}>
                          <span className="mr-1">{getOutcomeIcon(prediction.outcome)}</span>
                          {prediction.outcome}
                        </Badge>
                        {isOverdue && (
                          <Badge className="bg-red-100 text-red-700 border-red-200">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Overdue
                          </Badge>
                        )}
                        {prediction.asset && (
                          <Badge variant="outline" className="bg-finance-50 text-finance-700 border-finance-200">
                            {prediction.asset.type === "CRYPTO" ? (
                              <Bitcoin className="h-3 w-3 mr-1" />
                            ) : (
                              <DollarSign className="h-3 w-3 mr-1" />
                            )}
                            {prediction.asset.symbol}
                          </Badge>
                        )}
                      </div>
                      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                        {prediction.prediction}
                      </h1>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 pt-4 border-t">
                    <Link
                      href={`/forecasters/${prediction.forecaster.id}`}
                      className="flex items-center gap-1 hover:text-finance-700 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      {prediction.forecaster.name}
                    </Link>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Made on {formatDate(prediction.createdAt)}
                    </div>
                    {prediction.targetDate && (
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        Target: {formatDate(prediction.targetDate)}
                      </div>
                    )}
                  </div>
                </CardHeader>
              </Card>

              {/* Prediction Details Card */}
              <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-finance-600" />
                    Prediction Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Confidence Level */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Confidence Level</span>
                      <span className="text-2xl font-bold text-finance-600">
                        {Math.round(Number(prediction.confidence || 0) * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={Number(prediction.confidence || 0) * 100}
                      className="h-3 bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {Number(prediction.confidence) >= 80 ? "High confidence" :
                       Number(prediction.confidence) >= 50 ? "Moderate confidence" :
                       "Low confidence"}
                    </p>
                  </div>

                  {/* Target Price */}
                  {prediction.targetPrice && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Target Price</h4>
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-finance-50 to-blue-50 rounded-xl">
                        <div className="flex-1">
                          <div className="text-3xl font-bold text-finance-700">
                            ${Number(prediction.targetPrice).toFixed(2)}
                          </div>
                        </div>
                        <Gauge className="h-12 w-12 text-finance-600" />
                      </div>
                    </div>
                  )}

                  {/* Time Analysis */}
                  {daysUntilTarget !== null && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Time Analysis</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">Days Until Target</div>
                          <div className={`text-xl font-bold ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                            {Math.abs(daysUntilTarget)}
                            <span className="text-sm ml-1">{isOverdue ? 'overdue' : 'days'}</span>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">Status</div>
                          <div className="text-xl font-bold text-gray-900">
                            {prediction.outcome === "PENDING" ? "Active" : prediction.outcome}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            </motion.div>

            {/* Right Column - Sidebar */}
            <motion.div className="space-y-6" variants={itemVariants}>
              {/* Action Buttons */}
              <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-xl">
                <CardContent className="p-4 space-y-2">
                  <Button className="w-full justify-start" variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Prediction
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Bookmark className="h-4 w-4 mr-2" />
                    Save to Bookmarks
                  </Button>
                </CardContent>
              </Card>

              {/* Forecaster Info */}
              <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">About the Forecaster</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/forecasters/${prediction.forecaster.id}`}
                    className="group"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-finance-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {prediction.forecaster.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-finance-700 transition-colors">
                          {prediction.forecaster.name}
                        </h3>
                        {prediction.forecaster.profile && typeof prediction.forecaster.profile === 'object' && 'title' in prediction.forecaster.profile && (
                          <p className="text-sm text-gray-600">
                            {String((prediction.forecaster.profile as any).title)}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-finance-700 transition-colors" />
                    </div>
                  </Link>

                  {prediction.forecaster.metrics && typeof prediction.forecaster.metrics === 'object' && (
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">
                          {(prediction.forecaster.metrics as any).accuracy || 0}%
                        </div>
                        <div className="text-xs text-gray-500">Accuracy</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">
                          {(prediction.forecaster.metrics as any).totalPredictions || 0}
                        </div>
                        <div className="text-xs text-gray-500">Predictions</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Related Predictions */}
              <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Related Predictions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    View more predictions for {prediction.asset?.symbol || 'this asset'}
                  </div>
                  <Button
                    className="w-full mt-3"
                    variant="outline"
                    onClick={() => router.push(`/predictions?asset=${prediction.asset?.symbol}`)}
                  >
                    View Related
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default PredictionDetailPage;