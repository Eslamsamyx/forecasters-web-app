"use client";

import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/utils/api";
import {
  Search,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  User,
  Filter,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Bitcoin,
  DollarSign,
  Activity,
  X,
  Youtube,
  Twitter,
  Sparkles,
  LineChart,
  Eye,
  Globe,
  Gauge,
  ExternalLink,
  Zap
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useMarketSentiment } from "@/hooks/useMarketSentiment";

const PredictionsPage: NextPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState("all");
  const [assetFilter, setAssetFilter] = useState("all");
  const [confidenceFilter, setConfidenceFilter] = useState("all");
  const [forecasterFilter, setForecasterFilter] = useState("all");
  const [timeframeFilter, setTimeframeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Fetch predictions using tRPC with fallback
  const { data, isLoading, error, refetch } = api.predictions.getAll.useQuery({
    limit: 100
  }, {
    retry: 1
  });

  // Fetch market sentiment data
  const { data: marketSentiment, isLoading: marketLoading } = useMarketSentiment();

  // Mock data fallback if API fails
  const mockPredictions = [
    {
      id: "mock-1",
      prediction: "Bitcoin will reach $75,000 by end of Q1 2025",
      outcome: "PENDING" as const,
      confidence: 85,
      targetPrice: "75000",
      targetDate: "2025-03-31",
      createdAt: new Date("2024-12-15"),
      forecaster: {
        id: "forecaster-1",
        name: "Crypto Analyst Pro",
        slug: "crypto-analyst-pro"
      },
      asset: {
        id: "btc",
        symbol: "BTC",
        type: "CRYPTO" as const,
        metadata: {},
        priceData: {}
      }
    },
    {
      id: "mock-2",
      prediction: "S&P 500 will correct 15% from current levels before year end",
      outcome: "PENDING" as const,
      confidence: 72,
      targetPrice: "4800",
      targetDate: "2024-12-31",
      createdAt: new Date("2024-11-20"),
      forecaster: {
        id: "forecaster-2",
        name: "Market Strategist",
        slug: "market-strategist"
      },
      asset: {
        id: "spx",
        symbol: "SPX",
        type: "INDEX" as const,
        metadata: {},
        priceData: {}
      }
    },
    {
      id: "mock-3",
      prediction: "Ethereum will outperform Bitcoin in 2025 with 150% gains",
      outcome: "PENDING" as const,
      confidence: 68,
      targetPrice: "8500",
      targetDate: "2025-12-31",
      createdAt: new Date("2024-12-01"),
      forecaster: {
        id: "forecaster-3",
        name: "DeFi Expert",
        slug: "defi-expert"
      },
      asset: {
        id: "eth",
        symbol: "ETH",
        type: "CRYPTO" as const,
        metadata: {},
        priceData: {}
      }
    }
  ];

  // Use real data if available, show empty state on error (no mock data fallback)
  const predictions = data?.predictions || [];

  // Filter and sort predictions
  const { filteredPredictions, uniqueAssets, uniqueForecasters } = useMemo(() => {
    let filtered = [...predictions];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.prediction.toLowerCase().includes(query) ||
        p.asset?.symbol?.toLowerCase().includes(query) ||
        p.forecaster.name.toLowerCase().includes(query)
      );
    }

    // Outcome filter
    if (outcomeFilter !== "all") {
      filtered = filtered.filter(p => p.outcome === outcomeFilter);
    }

    // Asset filter
    if (assetFilter !== "all") {
      filtered = filtered.filter(p =>
        p.asset?.symbol?.toLowerCase() === assetFilter.toLowerCase()
      );
    }

    // Confidence filter
    if (confidenceFilter !== "all") {
      filtered = filtered.filter(p => {
        const conf = p.confidence ? Number(p.confidence) : 0;
        switch (confidenceFilter) {
          case "high": return conf >= 80;
          case "medium": return conf >= 50 && conf < 80;
          case "low": return conf < 50;
          default: return true;
        }
      });
    }

    // Forecaster filter
    if (forecasterFilter !== "all") {
      filtered = filtered.filter(p =>
        p.forecaster.id === forecasterFilter
      );
    }

    // Timeframe filter
    if (timeframeFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter(p => {
        if (!p.targetDate) return false;
        const target = new Date(p.targetDate);
        const daysUntil = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        switch (timeframeFilter) {
          case "overdue":
            return daysUntil < 0 && p.outcome === "PENDING";
          case "week":
            return daysUntil >= 0 && daysUntil <= 7;
          case "month":
            return daysUntil >= 0 && daysUntil <= 30;
          case "quarter":
            return daysUntil >= 0 && daysUntil <= 90;
          default:
            return true;
        }
      });
    }

    // Sort predictions
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "target_date":
          aValue = a.targetDate ? new Date(a.targetDate).getTime() : 0;
          bValue = b.targetDate ? new Date(b.targetDate).getTime() : 0;
          break;
        case "confidence":
          aValue = Number(a.confidence || 0);
          bValue = Number(b.confidence || 0);
          break;
        case "created_at":
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
      }

      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

    // Extract unique assets and forecasters
    const assets = Array.from(new Set(predictions.map(p => p.asset?.symbol).filter(Boolean)))
      .sort((a, b) => {
        // Prioritize major assets
        const majorAssets = [
          'BTC', 'ETH', 'XRP', 'ADA', 'SOL', 'DOGE',
          'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA',
          'SPX', 'NDX', 'DJI', 'VIX',
          'GOLD', 'SILVER', 'OIL', 'NATGAS',
          'EURUSD', 'GBPUSD', 'USDJPY'
        ];
        const aIsMajor = majorAssets.includes((a || '').toUpperCase());
        const bIsMajor = majorAssets.includes((b || '').toUpperCase());

        if (aIsMajor && !bIsMajor) return -1;
        if (!aIsMajor && bIsMajor) return 1;
        return (a || '').localeCompare(b || '');
      }) as string[];

    const forecasters = Array.from(
      new Map(predictions.map(p => [p.forecaster.id, p.forecaster])).values()
    ).sort((a, b) => a.name.localeCompare(b.name));

    return {
      filteredPredictions: filtered,
      uniqueAssets: assets,
      uniqueForecasters: forecasters
    };
  }, [predictions, searchQuery, outcomeFilter, assetFilter, confidenceFilter,
      forecasterFilter, timeframeFilter, sortBy, sortOrder]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredPredictions.length;
    const pending = filteredPredictions.filter(p => p.outcome === "PENDING").length;
    const correct = filteredPredictions.filter(p => p.outcome === "CORRECT").length;
    const incorrect = filteredPredictions.filter(p => p.outcome === "INCORRECT").length;
    const accuracy = (correct + incorrect) > 0 ? Math.round((correct / (correct + incorrect)) * 100) : 0;

    return { total, pending, correct, incorrect, accuracy };
  }, [filteredPredictions]);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setOutcomeFilter("all");
    setAssetFilter("all");
    setConfidenceFilter("all");
    setForecasterFilter("all");
    setTimeframeFilter("all");
    setSortBy("created_at");
    setSortOrder("desc");
  };

  const hasActiveFilters = searchQuery || outcomeFilter !== "all" || assetFilter !== "all" ||
    confidenceFilter !== "all" || forecasterFilter !== "all" || timeframeFilter !== "all";

  const getOutcomeColor = (outcome: string) => {
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

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case "CORRECT":
        return <CheckCircle className="h-4 w-4" />;
      case "INCORRECT":
        return <AlertCircle className="h-4 w-4" />;
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getAssetIcon = (type?: string, symbol?: string) => {
    const cryptoSymbols = ["BTC", "ETH", "XRP", "ADA", "SOL", "DOGE", "AVAX", "DOT", "MATIC"];
    if (type === "CRYPTO" || cryptoSymbols.includes(symbol?.toUpperCase() || "")) {
      return <Bitcoin className="h-4 w-4" />;
    }
    return <DollarSign className="h-4 w-4" />;
  };

  const getSentimentBadge = () => {
    if (marketLoading) {
      return (
        <Badge className="bg-gray-100 text-gray-700 border-gray-200">
          <Activity className="h-3 w-3 mr-1 animate-pulse" />
          Loading...
        </Badge>
      );
    }

    if (!marketSentiment) {
      return (
        <Badge className="bg-gray-100 text-gray-700 border-gray-200">
          <Activity className="h-3 w-3 mr-1" />
          Unavailable
        </Badge>
      );
    }

    const getContextColor = () => {
      switch (marketSentiment.marketContext) {
        case 'EXTREME_FEAR':
          return 'bg-red-100 text-red-700 border-red-200';
        case 'FEAR':
          return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'NEUTRAL':
          return 'bg-gray-100 text-gray-700 border-gray-200';
        case 'GREED':
          return 'bg-green-100 text-green-700 border-green-200';
        case 'EXTREME_GREED':
          return 'bg-green-100 text-green-700 border-green-200';
        default:
          return 'bg-gray-100 text-gray-700 border-gray-200';
      }
    };

    const getContextIcon = () => {
      switch (marketSentiment.marketContext) {
        case 'EXTREME_FEAR':
        case 'FEAR':
          return <TrendingDown className="h-3 w-3 mr-1" />;
        case 'GREED':
        case 'EXTREME_GREED':
          return <TrendingUp className="h-3 w-3 mr-1" />;
        default:
          return <Activity className="h-3 w-3 mr-1" />;
      }
    };

    return (
      <Badge className={getContextColor()}>
        {getContextIcon()}
        {marketSentiment.emoji} {marketSentiment.classification} ({marketSentiment.sentimentScore})
      </Badge>
    );
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

  return (
    <>
      <Head>
        <title>Multi-Asset Predictions - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Track and analyze price predictions across cryptocurrencies, stocks, indices, commodities and more from top forecasters."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <motion.div
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="container mx-auto px-4 space-y-8">
          {/* Header */}
          <motion.div className="text-center space-y-4" variants={itemVariants}>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              <span className="flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                Multi-Asset Predictions
              </span>
            </h1>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto mb-2">
              Track and analyze price predictions across cryptocurrencies, stocks, indices, commodities and more from top forecasters
            </p>

            {/* Market Context Section */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <p className="text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                <Zap className="h-4 w-4 inline mr-1" />Real-time Multi-Asset Prediction Tracking
              </p>

              {/* Market Sentiment Badge */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 font-medium">Market Sentiment:</span>
                {getSentimentBadge()}
              </div>
            </div>
          </motion.div>

          {/* Stats Overview */}
          <motion.div className="grid grid-cols-2 md:grid-cols-5 gap-4" variants={itemVariants}>
            <div className="bg-white/95 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-white/20 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-xs text-gray-600">Total</p>
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-white/20 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                  <p className="text-xs text-gray-600">Pending</p>
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-white/20 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.correct}</p>
                  <p className="text-xs text-gray-600">Correct</p>
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-white/20 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.incorrect}</p>
                  <p className="text-xs text-gray-600">Incorrect</p>
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-white/20 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.accuracy}%</p>
                  <p className="text-xs text-gray-600">Accuracy</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Advanced Filters */}
          <motion.div className="bg-white/95 backdrop-blur-xl rounded-xl p-6 shadow-lg border border-white/20" variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-600" />
                Filters & Search
              </h3>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search predictions..."
                  className="pl-10 bg-white border-gray-200 rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Outcome Filter */}
              <select
                value={outcomeFilter}
                onChange={(e) => setOutcomeFilter(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Outcomes</option>
                <option value="PENDING">Pending</option>
                <option value="CORRECT">Correct</option>
                <option value="INCORRECT">Incorrect</option>
              </select>

              {/* Asset Filter */}
              <select
                value={assetFilter}
                onChange={(e) => setAssetFilter(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Assets</option>
                {uniqueAssets.map(asset => (
                  <option key={asset} value={asset}>{asset}</option>
                ))}
              </select>

              {/* Confidence Filter */}
              <select
                value={confidenceFilter}
                onChange={(e) => setConfidenceFilter(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Confidence</option>
                <option value="high">High (80%+)</option>
                <option value="medium">Medium (50-79%)</option>
                <option value="low">Low (&lt;50%)</option>
              </select>

              {/* Forecaster Filter */}
              <select
                value={forecasterFilter}
                onChange={(e) => setForecasterFilter(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Forecasters</option>
                {uniqueForecasters.map(forecaster => (
                  <option key={forecaster.id} value={forecaster.id}>{forecaster.name}</option>
                ))}
              </select>

              {/* Timeframe Filter */}
              <select
                value={timeframeFilter}
                onChange={(e) => setTimeframeFilter(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Timeframes</option>
                <option value="overdue">Overdue</option>
                <option value="week">Next 7 Days</option>
                <option value="month">Next 30 Days</option>
                <option value="quarter">Next Quarter</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="created_at">Created Date</option>
                <option value="target_date">Target Date</option>
                <option value="confidence">Confidence</option>
              </select>

              {/* Sort Order */}
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>

            {/* Filter Summary */}
            {hasActiveFilters && (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <span>Active filters:</span>
                <div className="flex flex-wrap gap-2">
                  {searchQuery && (
                    <Badge variant="outline" className="bg-blue-50">
                      Search: {searchQuery}
                    </Badge>
                  )}
                  {outcomeFilter !== "all" && (
                    <Badge variant="outline" className="bg-yellow-50">
                      Outcome: {outcomeFilter}
                    </Badge>
                  )}
                  {assetFilter !== "all" && (
                    <Badge variant="outline" className="bg-purple-50">
                      Asset: {assetFilter}
                    </Badge>
                  )}
                  {confidenceFilter !== "all" && (
                    <Badge variant="outline" className="bg-green-50">
                      Confidence: {confidenceFilter}
                    </Badge>
                  )}
                  {forecasterFilter !== "all" && (
                    <Badge variant="outline" className="bg-orange-50">
                      Forecaster: {uniqueForecasters.find(f => f.id === forecasterFilter)?.name}
                    </Badge>
                  )}
                  {timeframeFilter !== "all" && (
                    <Badge variant="outline" className="bg-red-50">
                      Timeframe: {timeframeFilter}
                    </Badge>
                  )}
                </div>
                <span className="text-gray-600">• {filteredPredictions.length} results</span>
              </div>
            )}
          </motion.div>

          {/* Quick Asset Filters */}
          {uniqueAssets.length > 0 && (
            <motion.div className="bg-white/95 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-white/20" variants={itemVariants}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">Quick filters:</span>
                {uniqueAssets.slice(0, 15).map((asset) => (
                  <Badge
                    key={asset}
                    variant={assetFilter === asset ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${
                      assetFilter === asset
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-blue-50 hover:border-blue-300'
                    }`}
                    onClick={() => setAssetFilter(assetFilter === asset ? "all" : asset)}
                  >
                    {getAssetIcon(undefined, asset)}
                    <span className="ml-1">{asset}</span>
                  </Badge>
                ))}
                {uniqueAssets.length > 15 && (
                  <span className="text-xs text-gray-600">+{uniqueAssets.length - 15} more</span>
                )}
              </div>
            </motion.div>
          )}

          {/* Refresh Button */}
          <motion.div className="flex justify-end" variants={itemVariants}>
            <Button
              onClick={() => refetch()}
              disabled={isLoading}
              variant="ghost"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Predictions
            </Button>
          </motion.div>

          {/* Error State - Show error message if API fails */}
          {error && !isLoading && (
            <motion.div className="mb-4" variants={itemVariants}>
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-800">
                        Unable to load predictions
                      </p>
                      {error.message && (
                        <p className="text-xs text-yellow-700 mt-1">
                          {error.message.includes('less than or equal to 100')
                            ? 'Please refresh the page to load the latest version.'
                            : error.message}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => refetch()}
                      variant="outline"
                      size="sm"
                      className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}


          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <motion.div key={i} variants={itemVariants}>
                  <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-lg">
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="flex items-start justify-between mb-4">
                          <div className="space-y-2 flex-1">
                            <div className="h-6 bg-gray-200 rounded w-24" />
                            <div className="h-8 bg-gray-200 rounded w-3/4" />
                            <div className="h-4 bg-gray-200 rounded w-1/2" />
                          </div>
                          <div className="h-12 w-20 bg-gray-200 rounded" />
                        </div>
                        <div className="flex gap-2">
                          <div className="h-6 bg-gray-200 rounded w-20" />
                          <div className="h-6 bg-gray-200 rounded w-24" />
                          <div className="h-6 bg-gray-200 rounded w-28" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Predictions Grid */}
          {!isLoading && !error && filteredPredictions.length > 0 && (
            <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" variants={containerVariants}>
              {filteredPredictions.map((prediction) => {
                const daysUntilTarget = prediction.targetDate
                  ? Math.ceil((new Date(prediction.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  : null;
                const isOverdue = daysUntilTarget !== null && daysUntilTarget < 0 && prediction.outcome === "PENDING";

                return (
                  <motion.div key={prediction.id} variants={itemVariants}>
                    <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden relative">
                      {/* Card Header with Asset Badge */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500" />

                      <CardContent className="p-6">
                        {/* Top Section */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            {/* Badges Row */}
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              {prediction.asset && (
                                <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200">
                                  {getAssetIcon(prediction.asset.type, prediction.asset.symbol)}
                                  <span className="ml-1 font-medium">{prediction.asset.symbol}</span>
                                </Badge>
                              )}
                              <Badge className={getOutcomeColor(prediction.outcome)}>
                                {getOutcomeIcon(prediction.outcome)}
                                <span className="ml-1">{prediction.outcome}</span>
                              </Badge>
                              {isOverdue && (
                                <Badge className="bg-red-100 text-red-700 border-red-200 animate-pulse">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Overdue
                                </Badge>
                              )}
                            </div>

                            {/* Prediction Text */}
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">
                              {prediction.prediction}
                            </h3>

                            {/* Direction Badge */}
                            {prediction.direction && (
                              <div className="mb-2">
                                <Badge variant="outline" className={`text-xs ${
                                  prediction.direction === "BULLISH" ? "bg-green-50 text-green-700" :
                                  prediction.direction === "BEARISH" ? "bg-red-50 text-red-700" :
                                  "bg-gray-50 text-gray-700"
                                }`}>
                                  <span className="flex items-center gap-1">
                                    {prediction.direction === "BULLISH" ? (
                                      <><TrendingUp className="h-3 w-3 text-green-600" />Bullish</>
                                    ) : prediction.direction === "BEARISH" ? (
                                      <><TrendingDown className="h-3 w-3 text-red-600" />Bearish</>
                                    ) : (
                                      <><Activity className="h-3 w-3 text-gray-600" />Neutral</>
                                    )}
                                  </span>
                                </Badge>
                              </div>
                            )}

                            {/* Price Information */}
                            <div className="space-y-2">
                              {/* Baseline Price */}
                              {prediction.baselinePrice && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <DollarSign className="h-4 w-4 text-gray-500" />
                                  <span>Baseline:</span>
                                  <span className="font-medium text-gray-800">${Number(prediction.baselinePrice).toLocaleString()}</span>
                                  <span className="text-xs text-gray-500">(at creation)</span>
                                </div>
                              )}

                              {/* Target Price */}
                              {prediction.targetPrice && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Gauge className="h-4 w-4 text-blue-500" />
                                  <span>Target:</span>
                                  <span className="font-bold text-gray-900">${Number(prediction.targetPrice).toLocaleString()}</span>
                                  {prediction.baselinePrice && prediction.targetPrice && (
                                    <span className={`text-xs font-medium ${
                                      Number(prediction.targetPrice) > Number(prediction.baselinePrice)
                                        ? 'text-green-600'
                                        : Number(prediction.targetPrice) < Number(prediction.baselinePrice)
                                        ? 'text-red-600'
                                        : 'text-gray-500'
                                    }`}>
                                      ({((Number(prediction.targetPrice) - Number(prediction.baselinePrice)) / Number(prediction.baselinePrice) * 100).toFixed(1)}%)
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Confidence Score */}
                          {prediction.confidence && (
                            <div className="text-center ml-4">
                              <div className="relative">
                                <div className="text-3xl font-bold text-blue-600">
                                  {Math.round(Number(prediction.confidence) * 100)}%
                                </div>
                                <div className="text-xs text-gray-600 font-medium">Confidence</div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Progress Bar for Target Date */}
                        {prediction.targetDate && daysUntilTarget !== null && !isOverdue && (
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>Progress to target</span>
                              <span>{daysUntilTarget} days left</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all"
                                style={{
                                  width: `${Math.max(0, Math.min(100, ((30 - daysUntilTarget) / 30) * 100))}%`
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Footer Section */}
                        <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-4">
                            {/* Forecaster */}
                            <Link
                              href={`/forecasters/${prediction.forecaster.id}`}
                              className="flex items-center gap-1 hover:text-blue-700 transition-colors group/link"
                            >
                              <User className="h-4 w-4 group-hover/link:text-blue-700" />
                              <span className="font-medium">{prediction.forecaster.name}</span>
                            </Link>

                            {/* Source Information */}
                            {(prediction.metadata as any)?.source && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <Globe className="h-4 w-4" />
                                <Badge variant="outline" className="text-xs flex items-center gap-1">
                                  {(prediction.metadata as any)?.source?.type === "youtube" ? (
                                    <Youtube className="h-3 w-3" />
                                  ) : (prediction.metadata as any)?.source?.type === "twitter" ? (
                                    <Twitter className="h-3 w-3" />
                                  ) : null}
                                  {(prediction.metadata as any)?.source?.type === "youtube" ? "YouTube" :
                                   (prediction.metadata as any)?.source?.type === "twitter" ? "Twitter" :
                                   "Unknown"}
                                </Badge>
                                {(prediction.metadata as any)?.source?.url && (
                                  <a
                                    href={(prediction.metadata as any)?.source?.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-xs ml-1"
                                  >
                                    <span className="flex items-center gap-1">
                                      <ExternalLink className="h-3 w-3" />
                                      Source
                                    </span>
                                  </a>
                                )}
                              </div>
                            )}

                            {/* Created Date */}
                            <div className="flex items-center gap-1 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              {formatDate(prediction.createdAt)}
                            </div>
                          </div>

                          {/* View Details Button */}
                          <Link href={`/predictions/${prediction.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-blue-50 hover:text-blue-700 transition-all group/btn"
                            >
                              <Eye className="h-4 w-4 mr-1 group-hover/btn:scale-110 transition-transform" />
                              View Details
                              <ChevronRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        </div>

                        {/* Target Date Info */}
                        {prediction.targetDate && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1 text-gray-600">
                                <Target className="h-3 w-3" />
                                Target Date:
                              </div>
                              <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                                {formatDate(prediction.targetDate)}
                                {daysUntilTarget !== null && (
                                  <span className="ml-1">
                                    ({Math.abs(daysUntilTarget)} days {isOverdue ? 'ago' : 'left'})
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredPredictions.length === 0 && (
            <motion.div className="text-center py-16" variants={itemVariants}>
              <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-lg max-w-md mx-auto">
                <CardContent className="p-12">
                  <Search className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">No Predictions Found</h3>
                  <p className="text-slate-600 mb-6">
                    {hasActiveFilters
                      ? 'Try adjusting your filters or search terms to find more predictions.'
                      : 'No predictions are available at this time. Check back later!'}
                  </p>
                  {hasActiveFilters && (
                    <Button
                      onClick={clearAllFilters}
                      variant="ghost"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg"
                    >
                      Clear All Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default PredictionsPage;