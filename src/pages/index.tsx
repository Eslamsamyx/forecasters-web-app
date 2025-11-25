"use client";

import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Check,
  TrendingUp,
  Users,
  Target,
  Star,
  BarChart3,
  Brain,
  Shield,
  Clock,
  Award,
  DollarSign,
  Zap,
  Eye,
  PlayCircle,
  Bitcoin,
  Activity,
  Gauge,
  TrendingDown
} from "lucide-react";

const Home: NextPage = () => {
  // Fetch real data from database
  const { data: dashboardData, refetch: refetchDashboard } = api.statistics.getLiveDashboard.useQuery(
    undefined,
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const { data: topForecastersData, refetch: refetchForecasters } = api.statistics.getTopForecasters.useQuery(
    { limit: 4 },
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  // Fetch overall metrics for stats section
  const { data: metricsData } = api.statistics.getMetrics.useQuery(
    undefined,
    {
      refetchInterval: 60000, // Refetch every minute
    }
  );

  // Live Dashboard State - Real data from database
  const [liveData, setLiveData] = useState({
    predictions: 0,
    avgAccuracy: 0,
    forecasters: [] as any[]
  });

  // Update live data when database data changes
  useEffect(() => {
    if (dashboardData && topForecastersData) {
      setLiveData({
        predictions: dashboardData.predictions,
        avgAccuracy: dashboardData.avgAccuracy,
        forecasters: topForecastersData.map((f, index) => ({
          id: f.id,
          name: f.name,
          accuracy: f.accuracy,
          trend: f.trend,
          profit: f.profit,
          color: f.color
        }))
      });
    }
  }, [dashboardData, topForecastersData]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchDashboard();
      refetchForecasters();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [refetchDashboard, refetchForecasters]);

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

  const stats = [
    {
      label: "Tracked Forecasters",
      value: metricsData?.forecasterCount?.toLocaleString() || "0",
      icon: <Users className="h-6 w-6" />
    },
    {
      label: "Predictions Analyzed",
      value: metricsData?.predictionCount ?
        (metricsData.predictionCount > 1000 ?
          `${Math.floor(metricsData.predictionCount / 1000)}K+` :
          metricsData.predictionCount.toLocaleString()) : "0",
      icon: <Target className="h-6 w-6" />
    },
    {
      label: "Average Accuracy",
      value: metricsData?.averageAccuracy ?
        `${(metricsData.averageAccuracy * 100).toFixed(1)}%` : "0%",
      icon: <TrendingUp className="h-6 w-6" />
    },
    {
      label: "Active Users",
      value: metricsData?.userCount?.toLocaleString() || "0",
      icon: <Eye className="h-6 w-6" />
    }
  ];

  // This static data is no longer needed - using real data from database

  const features = [
    {
      icon: <Brain className="h-12 w-12 text-finance-600" />,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms analyze thousands of predictions daily with 99.7% accuracy in extraction.",
      metrics: "99.7% extraction accuracy"
    },
    {
      icon: <BarChart3 className="h-12 w-12 text-finance-600" />,
      title: "Real-Time Tracking",
      description: "Live monitoring of market movements and prediction outcomes with instant accuracy updates and notifications.",
      metrics: "< 5 min update time"
    },
    {
      icon: <Shield className="h-12 w-12 text-finance-600" />,
      title: "Verified Sources",
      description: "All forecasters are verified and their track records are independently validated using blockchain technology.",
      metrics: "100% verified sources"
    }
  ];

  return (
    <>
      <Head>
        <title>Prediction Prism Analytics - AI-Powered Forecasting Platform</title>
        <meta
          name="description"
          content="Advanced AI-powered prediction tracking and forecaster performance analysis platform."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <motion.div
          className="flex flex-col min-h-screen"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Hero Section */}
          <motion.section
            className="relative min-h-[70vh] lg:min-h-[85vh] xl:min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 py-12 lg:py-20"
            variants={itemVariants}
          >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <div className="w-full h-full" style={{ position: 'relative' }}>
                <Image
                  src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                  alt="Financial Trading Background"
                  fill
                  sizes="100vw"
                  className="object-cover opacity-20"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-blue-900/80 to-slate-800/90"></div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute inset-0 z-1">
              <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
              <div className="absolute top-1/2 left-1/4 w-32 sm:w-48 h-32 sm:h-48 bg-emerald-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>

            <div className="container px-4 md:px-6 relative z-10">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Content Side */}
                <motion.div className="space-y-6 lg:space-y-8 text-center lg:text-left" variants={itemVariants}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full text-white text-sm font-medium shadow-lg"
                  >
                    <TrendingUp className="w-4 h-4" />
                    {dashboardData?.avgAccuracy || 0}% Average Accuracy Rate
                  </motion.div>

                  <motion.h1
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    Find the
                    <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent block">
                      Best Forecasters
                    </span>
                  </motion.h1>

                  <motion.p
                    className="text-lg sm:text-xl lg:text-2xl text-slate-100 max-w-lg mx-auto lg:mx-0 leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  >
                    AI-powered platform tracking {metricsData?.forecasterCount?.toLocaleString() || 0}+ financial experts.
                    Discover verified predictions with proven accuracy.
                  </motion.p>

                  <motion.div
                    className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  >
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-xl transform hover:scale-105 transition-all duration-200 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg w-full sm:w-auto"
                      asChild
                    >
                      <Link href="/auth/signup">
                        <Zap className="mr-2 h-5 w-5" />
                        Start Free - 14 Days
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-2 border-white/30 text-slate-900 hover:bg-white hover:text-slate-900 backdrop-blur-sm px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-medium transition-all duration-200 bg-white/90 w-full sm:w-auto"
                      asChild
                    >
                      <Link href="/forecasters" className="text-slate-900">
                        <PlayCircle className="mr-2 h-5 w-5 text-slate-900" />
                        Watch Demo
                      </Link>
                    </Button>
                  </motion.div>

                  {/* Enhanced Trust Indicators */}
                  <motion.div
                    className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 lg:gap-8 pt-6 lg:pt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                  >
                    {[
                      { value: metricsData?.forecasterCount?.toLocaleString() || "0", suffix: "+", label: "Verified Forecasters", icon: <Users className="w-4 h-4" /> },
                      { value: metricsData?.predictionCount ? (metricsData.predictionCount > 1000 ? `${Math.floor(metricsData.predictionCount / 1000)}` : metricsData.predictionCount.toString()) : "0", suffix: metricsData?.predictionCount && metricsData.predictionCount > 1000 ? "K+" : "+", label: "Predictions Tracked", icon: <Target className="w-4 h-4" /> },
                      { value: metricsData?.userCount?.toLocaleString() || "0", suffix: "", label: "Active Users", icon: <TrendingUp className="w-4 h-4" /> }
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        className="text-center group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.9 + i * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <motion.div
                          className="flex items-center justify-center gap-1 mb-1"
                          animate={{ scale: [1, 1.02, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                        >
                          <div className="text-cyan-100 group-hover:text-cyan-50 transition-colors">
                            {stat.icon}
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-white">
                            {stat.value}
                            <span className="text-cyan-100">{stat.suffix}</span>
                          </div>
                        </motion.div>
                        <div className="text-sm text-slate-200 group-hover:text-slate-100 transition-colors">
                          {stat.label}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Social Proof Banner */}
                  <motion.div
                    className="mt-6 lg:mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-sm text-slate-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <motion.div
                            key={i}
                            className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3, delay: 1.3 + i * 0.1 }}
                          >
                            {String.fromCharCode(65 + i)}
                          </motion.div>
                        ))}
                      </div>
                      <span>12,000+ investors trust us</span>
                    </div>
                    <div className="h-4 w-px bg-slate-600 hidden sm:block"></div>
                    <motion.div
                      className="flex items-center gap-2"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>4.9/5 rating</span>
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* Visual Side - Enhanced Dashboard Preview */}
                <motion.div
                  className="relative order-first lg:order-last mt-8 lg:mt-0 w-full"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {/* Live Dashboard */}
                  <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-3 sm:p-4 lg:p-6 border border-white/20 shadow-2xl overflow-hidden">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-semibold" style={{ color: '#ffffff' }}>Live Rankings</h3>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-green-400 text-sm">Live</span>
                        </div>
                      </div>

                      {liveData.forecasters.map((forecaster, index) => (
                        <motion.div
                          key={forecaster.id}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-lg backdrop-blur-sm"
                          layout
                          transition={{ duration: 0.5 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 ${forecaster.color} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                              {forecaster.name.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <div>
                              <div className="text-white text-sm sm:text-base font-medium">{forecaster.name}</div>
                              <div className="text-slate-200 text-xs sm:text-sm">{forecaster.accuracy}% accuracy</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white text-sm sm:text-base">{forecaster.profit}</div>
                            <div className={`text-xs sm:text-sm ${forecaster.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                              {forecaster.trend}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.section>

          {/* Features Section */}
          <motion.section
            className="py-16 lg:py-24 bg-slate-50"
            variants={itemVariants}
          >
            <div className="container px-4 md:px-6">
              <motion.div
                className="text-center mb-12 lg:mb-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-4">
                  Why Choose Prediction Prism?
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Advanced AI technology meets financial expertise to deliver unparalleled forecasting insights.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                    className="text-center group"
                  >
                    <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white group-hover:bg-slate-50">
                      <CardHeader className="pb-4">
                        <motion.div
                          className="mx-auto mb-4"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {feature.icon}
                        </motion.div>
                        <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-finance-600 transition-colors">
                          {feature.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-slate-600 mb-4">
                          {feature.description}
                        </CardDescription>
                        <Badge variant="secondary" className="bg-finance-100 text-finance-700 hover:bg-finance-200">
                          {feature.metrics}
                        </Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Crypto Analytics Section */}
          <motion.section
            className="py-16 lg:py-24 bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 overflow-hidden"
            variants={itemVariants}
          >
            <div className="container px-4 md:px-6">
              <motion.div
                className="text-center mb-12 lg:mb-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full text-white text-sm font-medium shadow-lg mb-4">
                  <Bitcoin className="w-4 h-4" />
                  New: Enhanced Crypto Analytics
                </div>
                <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-4">
                  Advanced Crypto Prediction Analytics
                </h2>
                <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                  Go beyond traditional accuracy metrics with our crypto-focused analytics engine.
                  Risk-adjusted performance, market cycle analysis, and AI-powered personalization.
                </p>
              </motion.div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {[
                  {
                    icon: <Gauge className="h-8 w-8 text-orange-600" />,
                    title: "Risk-Adjusted Accuracy",
                    description: "Performance metrics weighted by prediction difficulty and market conditions",
                    value: "Up to 15% more accurate"
                  },
                  {
                    icon: <Activity className="h-8 w-8 text-blue-600" />,
                    title: "Market Cycle Analysis",
                    description: "Track performance across bull, bear, and sideways market conditions",
                    value: "4 market phases tracked"
                  },
                  {
                    icon: <Brain className="h-8 w-8 text-purple-600" />,
                    title: "AI Personalization",
                    description: "Smart forecaster recommendations based on your preferences and risk tolerance",
                    value: "12+ matching factors"
                  },
                  {
                    icon: <Bitcoin className="h-8 w-8 text-yellow-600" />,
                    title: "Real-time Indicators",
                    description: "Live technical analysis with Fear & Greed Index, RSI, MACD, and more",
                    value: "< 30 sec updates"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                    className="group"
                  >
                    <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-orange-50">
                      <CardContent className="p-6 text-center">
                        <motion.div
                          className="mx-auto mb-4"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {feature.icon}
                        </motion.div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-orange-700 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-slate-600 text-sm mb-3">
                          {feature.description}
                        </p>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200">
                          {feature.value}
                        </Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Crypto Analytics Preview */}
              <motion.div
                className="grid lg:grid-cols-2 gap-8 items-center"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4">
                    Crypto Market Intelligence at Your Fingertips
                  </h3>
                  <div className="space-y-4 mb-6">
                    {[
                      "Track forecaster performance across different market cycles",
                      "Get personalized recommendations based on your crypto portfolio",
                      "Real-time technical indicators and market sentiment analysis",
                      "Risk-adjusted metrics that account for volatility and difficulty"
                    ].map((feature, index) => (
                      <motion.div
                        key={index}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-slate-600">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
                      asChild
                    >
                      <Link href="/crypto/overview">
                        <Bitcoin className="mr-2 h-5 w-5" />
                        Explore Crypto Analytics
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-2 border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300"
                      asChild
                    >
                      <Link href="/crypto/leaderboard">
                        <Award className="mr-2 h-5 w-5" />
                        View Crypto Leaderboard
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Crypto Dashboard Preview */}
                <motion.div
                  className="relative w-full"
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 sm:p-5 lg:p-6 border border-orange-200 shadow-2xl">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-slate-900">Crypto Market Context</h4>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-green-600 text-sm">Live Data</span>
                        </div>
                      </div>

                      {/* Market Cycle Indicator */}
                      <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700">Market Cycle</span>
                          <Badge className="bg-blue-100 text-blue-700">Accumulation Phase</Badge>
                        </div>
                      </div>

                      {/* Fear & Greed */}
                      <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700">Fear & Greed Index</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-red-500 to-green-500"
                                initial={{ width: 0 }}
                                whileInView={{ width: '68%' }}
                                transition={{ duration: 1, delay: 0.5 }}
                              ></motion.div>
                            </div>
                            <span className="text-sm font-bold text-orange-600">68</span>
                          </div>
                        </div>
                      </div>

                      {/* Top Crypto Forecasters */}
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-slate-700">Top Crypto Performers</h5>
                        {[
                          { name: "Alex Chen", accuracy: "96.2%", trend: "+2.1%", color: "bg-green-500" },
                          { name: "Maria S.", accuracy: "93.8%", trend: "+1.4%", color: "bg-blue-500" },
                          { name: "David K.", accuracy: "91.5%", trend: "+0.8%", color: "bg-purple-500" }
                        ].map((forecaster, index) => (
                          <motion.div
                            key={index}
                            className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                            viewport={{ once: true }}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 sm:w-7 sm:h-7 ${forecaster.color} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                                {forecaster.name.split(' ').map((n: string) => n[0]).join('')}
                              </div>
                              <span className="text-xs sm:text-sm font-medium text-slate-700">{forecaster.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-xs sm:text-sm font-bold text-slate-900">{forecaster.accuracy}</div>
                              <div className="text-xs sm:text-sm text-green-600">{forecaster.trend}</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.section
            className="py-16 lg:py-24 bg-gradient-to-r from-finance-600 to-finance-800"
            variants={itemVariants}
          >
            <div className="container px-4 md:px-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                  Ready to Find Your Edge?
                </h2>
                <p className="text-base sm:text-lg lg:text-xl text-finance-100 mb-8 max-w-2xl mx-auto">
                  Join thousands of successful investors who trust our AI-powered forecasting platform.
                </p>
                <Button
                  size="lg"
                  className="bg-white text-finance-600 hover:bg-finance-50 shadow-xl transform hover:scale-105 transition-all duration-200 px-8 py-6 text-lg"
                  asChild
                >
                  <Link href="/auth/signup">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.section>
        </motion.div>
    </>
  );
};

export default Home;