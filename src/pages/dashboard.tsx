"use client";

import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Users,
  BarChart3,
  Calendar,
  Target,
  Award,
  Bell,
  Settings,
  ChevronRight,
  Eye,
  Loader2
} from "lucide-react";
import { api } from "@/utils/api";

const DashboardPage: NextPage = () => {
  // Fetch real data from database
  const { data: dashboardData, isLoading } = api.statistics.getDashboardData.useQuery(
    undefined,
    {
      refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    }
  );

  // Extract data from API response
  const stats = dashboardData?.stats || {
    totalForecasters: 0,
    accuracyRate: 0,
    activePredictions: 0,
    profitability: 0,
    growthPercentage: 0
  };

  const recentPredictions = dashboardData?.recentPredictions || [];
  const topForecasters = dashboardData?.topForecasters || [];

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

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper function to get prediction direction color
  const getPredictionColor = (prediction: string) => {
    switch (prediction.toUpperCase()) {
      case "BULLISH":
        return "text-green-600";
      case "BEARISH":
        return "text-red-600";
      case "NEUTRAL":
        return "text-gray-600";
      default:
        return "text-blue-600";
    }
  };

  // Helper function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "correct":
        return "bg-green-100 text-green-700";
      case "incorrect":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Helper function to get tier badge color
  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Elite":
        return "bg-purple-100 text-purple-700";
      case "Expert":
        return "bg-blue-100 text-blue-700";
      case "Pro":
        return "bg-indigo-100 text-indigo-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Your personalized dashboard for tracking forecaster performance and predictions."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <motion.div
          className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="container mx-auto px-4 space-y-8">
            {/* Header */}
            <motion.div
              className="text-center space-y-4"
              variants={itemVariants}
            >
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <BarChart3 className="h-8 w-8" />
                Dashboard
              </h1>
              <p className="text-lg text-gray-800">Your personalized overview of forecaster performance and predictions</p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">Total Forecasters</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalForecasters.toLocaleString()}</p>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {stats.growthPercentage > 0 ? '+' : ''}{stats.growthPercentage}% from last month
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">Accuracy Rate</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.accuracyRate}%</p>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                          <Target className="h-3 w-3 mr-1" />
                          Overall performance
                        </p>
                      </div>
                      <Target className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Active Predictions</p>
                        <p className="text-3xl font-bold text-slate-900">{stats.activePredictions.toLocaleString()}</p>
                        <p className="text-xs text-blue-600 flex items-center mt-1">
                          <Activity className="h-3 w-3 mr-1" />
                          Live tracking
                        </p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Profitability</p>
                        <p className="text-3xl font-bold text-slate-900">
                          {stats.profitability > 0 ? '+' : ''}{stats.profitability}%
                        </p>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                          <DollarSign className="h-3 w-3 mr-1" />
                          Performance-based
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-emerald-600" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Recent Predictions */}
              <motion.div className="lg:col-span-2" variants={itemVariants}>
                <Card className="bg-white shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Recent Predictions</CardTitle>
                      <Link href="/predictions">
                        <Button variant="ghost" size="sm">
                          View all <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentPredictions.length > 0 ? (
                        recentPredictions.slice(0, 3).map((prediction) => (
                          <div
                            key={prediction.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Link href={`/forecasters/${prediction.forecasterSlug}`}>
                                  <span className="font-medium hover:text-blue-600 cursor-pointer">
                                    {prediction.forecaster}
                                  </span>
                                </Link>
                                <Badge variant="outline" className="text-xs">
                                  {prediction.asset}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {prediction.assetType}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                <span className={getPredictionColor(prediction.prediction)}>
                                  {prediction.prediction}
                                </span>
                                <span>Confidence: {Math.round(Number(prediction.confidence || 0) * 100)}%</span>
                                <span>{formatDate(prediction.date)}</span>
                                {prediction.targetPrice && (
                                  <span>Target: ${prediction.targetPrice}</span>
                                )}
                              </div>
                            </div>
                            <Badge className={getStatusColor(prediction.status)}>
                              {prediction.status}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">No predictions available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Top Forecasters */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Top Forecasters</CardTitle>
                      <Link href="/forecasters">
                        <Button variant="ghost" size="sm">
                          View all <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topForecasters.length > 0 ? (
                        topForecasters.map((forecaster, index) => (
                          <div key={forecaster.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <Link href={`/forecasters/${forecaster.slug}`}>
                                  <p className="font-medium hover:text-blue-600 cursor-pointer">
                                    {forecaster.name}
                                  </p>
                                </Link>
                                <p className="text-xs text-gray-600">
                                  {forecaster.predictions} predictions
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm">{forecaster.accuracy}%</p>
                              <Badge className={getTierColor(forecaster.tier)}>
                                {forecaster.tier}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">No forecasters available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border-white/20 mt-6">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link href="/forecasters">
                      <Button className="w-full justify-start" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Browse Forecasters
                      </Button>
                    </Link>
                    <Link href="/predictions">
                      <Button className="w-full justify-start" variant="outline">
                        <Activity className="h-4 w-4 mr-2" />
                        Track Predictions
                      </Button>
                    </Link>
                    <Link href="/pricing">
                      <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                        <Award className="h-4 w-4 mr-2" />
                        Upgrade to Premium
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Last Updated */}
            {dashboardData?.lastUpdated && (
              <motion.div variants={itemVariants} className="text-center text-sm text-gray-500">
                Last updated: {formatDate(dashboardData.lastUpdated)} at{' '}
                {new Date(dashboardData.lastUpdated).toLocaleTimeString()}
              </motion.div>
            )}
          </div>
        </motion.div>
    </>
  );
};

export default DashboardPage;