"use client";

import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/utils/api";
import {
  Search,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  BarChart3,
  Star,
  Users,
  Calendar,
  ExternalLink,
  Trophy,
  Eye,
  CheckCircle,
  Plus,
  Filter
} from "lucide-react";

const ForecastersPage: NextPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"accuracy" | "totalPredictions" | "name" | "createdAt">("accuracy");
  const [filterVerified, setFilterVerified] = useState<boolean | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);

  // Fetch forecasters using tRPC
  const { data, isLoading, error, refetch } = api.forecasters.getAll.useQuery({
    limit: 50,
    searchTerm: searchQuery || undefined,
    sort: sortBy === "accuracy" ? "accuracy" :
          sortBy === "totalPredictions" ? "totalPredictions" :
          sortBy === "name" ? "name" : "created",
    order: "desc",
  });

  const forecasters = data?.forecasters || [];
  const total = forecasters.length;

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get accuracy percentage
  const getAccuracy = (forecaster: any) => {
    const metrics = forecaster.metrics as any;
    if (metrics?.accuracy) {
      return Math.round(metrics.accuracy * 100);
    }
    return 0;
  };

  // Get total predictions
  const getTotalPredictions = (forecaster: any) => {
    const metrics = forecaster.metrics as any;
    return metrics?.totalPredictions || 0;
  };

  // Get correct predictions
  const getCorrectPredictions = (forecaster: any) => {
    const metrics = forecaster.metrics as any;
    return metrics?.correctPredictions || 0;
  };

  // Get accuracy color
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (accuracy >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  // Get performance tier
  const getPerformanceTier = (accuracy: number, totalPredictions: number) => {
    if (accuracy >= 80 && totalPredictions >= 20) return { tier: "Elite", color: "bg-gradient-to-r from-purple-500 to-purple-600", icon: Trophy };
    if (accuracy >= 70 && totalPredictions >= 10) return { tier: "Expert", color: "bg-gradient-to-r from-blue-500 to-blue-600", icon: Award };
    if (accuracy >= 60 && totalPredictions >= 5) return { tier: "Pro", color: "bg-gradient-to-r from-green-500 to-green-600", icon: Target };
    return { tier: "Rising", color: "bg-gradient-to-r from-gray-500 to-gray-600", icon: TrendingUp };
  };

  // Calculate average accuracy
  const avgAccuracy = forecasters.length > 0
    ? Math.round(forecasters.reduce((acc, f) => acc + getAccuracy(f), 0) / forecasters.length)
    : 0;

  // Get top accuracy
  const topAccuracy = forecasters.length > 0
    ? Math.max(...forecasters.map(f => getAccuracy(f)))
    : 0;

  // Calculate total predictions across all forecasters
  const totalPredictions = forecasters.reduce((acc, f) => acc + getTotalPredictions(f), 0);

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
        <title>Forecasters - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Discover and analyze top multi-asset forecasters ranked by prediction accuracy."
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
              <h1 className="text-4xl font-bold text-gray-900">
                🏆 Top Forecasters
              </h1>
              <p className="text-lg text-gray-800 max-w-3xl mx-auto">
                Discover and analyze the world's top multi-asset forecasters ranked by their prediction accuracy across cryptocurrencies, stocks, indices, commodities, and more.
              </p>

              {/* Quick Stats */}
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <span className="text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                  <Users className="h-4 w-4 inline mr-2" />
                  {total} Forecasters
                </span>
                <span className="text-sm text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                  <RefreshCw className="h-4 w-4 inline mr-2" />
                  Live Updates
                </span>
              </div>
            </motion.div>

            {/* Stats Overview */}
            <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-4" variants={itemVariants}>
              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Total Forecasters</p>
                      <p className="text-3xl font-bold text-gray-900">{total}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Avg Accuracy</p>
                      <p className="text-3xl font-bold text-gray-900">{avgAccuracy}%</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Top Performer</p>
                      <p className="text-3xl font-bold text-gray-900">{topAccuracy}%</p>
                    </div>
                    <Trophy className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Total Predictions</p>
                      <p className="text-3xl font-bold text-gray-900">{totalPredictions.toLocaleString()}</p>
                    </div>
                    <Target className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Filters */}
            <motion.div className="flex flex-col md:flex-row gap-4" variants={itemVariants}>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search forecasters by name..."
                  className="pl-10 bg-white border-gray-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="accuracy">Sort by Accuracy</option>
                <option value="totalPredictions">Sort by Predictions</option>
                <option value="name">Sort by Name</option>
                <option value="createdAt">Sort by Date Added</option>
              </select>

              <select
                value={filterVerified === undefined ? "all" : filterVerified ? "verified" : "unverified"}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilterVerified(val === "all" ? undefined : val === "verified");
                }}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Forecasters</option>
                <option value="verified">Verified Only</option>
                <option value="unverified">Unverified</option>
              </select>

              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isLoading}
                className="bg-white border-gray-200 hover:bg-gray-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </motion.div>

            {/* Error State */}
            {error && (
              <motion.div className="text-center py-12" variants={itemVariants}>
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
                  <p className="text-red-600 mb-4">Failed to load forecasters</p>
                  <Button onClick={() => refetch()} variant="outline">
                    Try Again
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <motion.div key={i} variants={itemVariants}>
                    <Card className="bg-white shadow-sm">
                      <CardContent className="p-6">
                        <div className="animate-pulse">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="h-16 w-16 bg-gray-200 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <div className="h-5 bg-gray-200 rounded w-32" />
                              <div className="h-4 bg-gray-200 rounded w-24" />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-full" />
                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Forecasters Grid */}
            {!isLoading && !error && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
              >
                {forecasters.map((forecaster) => {
                  const accuracy = getAccuracy(forecaster);
                  const totalPreds = getTotalPredictions(forecaster);
                  const correctPreds = getCorrectPredictions(forecaster);
                  const performanceTier = getPerformanceTier(accuracy, totalPreds);
                  const TierIcon = performanceTier.icon;
                  const profile = forecaster.profile as any;

                  return (
                    <motion.div key={forecaster.id} variants={itemVariants}>
                      <div className="group relative bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/20">
                        {/* Performance Tier Badge */}
                        <div className="absolute top-4 right-4 z-10">
                          <div className={`${performanceTier.color} text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1`}>
                            <TierIcon className="h-3 w-3" />
                            {performanceTier.tier}
                          </div>
                        </div>

                        {/* Header Section */}
                        <div className="p-6 pb-4">
                          <div className="flex items-start gap-4">
                            <div className="h-16 w-16 bg-gradient-to-br from-finance-500 to-finance-600 rounded-full flex items-center justify-center text-white text-lg font-semibold ring-4 ring-white/50 shadow-lg">
                              {forecaster.name.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg text-gray-900 group-hover:text-finance-700 transition-colors duration-300 truncate">
                                {forecaster.name}
                              </h3>
                              {forecaster.isVerified && (
                                <Badge className="bg-blue-100 text-blue-700 text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                                <Calendar className="h-3 w-3" />
                                <span>Since {new Date(forecaster.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Stats Section */}
                        <div className="px-6 pb-4">
                          <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-3 bg-gray-50/50 rounded-xl">
                              <p className={`text-lg font-bold ${getAccuracyColor(accuracy).split(' ')[0]}`}>
                                {accuracy}%
                              </p>
                              <p className="text-xs text-gray-600">Accuracy</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50/50 rounded-xl">
                              <p className="text-lg font-bold text-gray-900">
                                {totalPreds}
                              </p>
                              <p className="text-xs text-gray-600">Total</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50/50 rounded-xl">
                              <p className="text-lg font-bold text-green-600">
                                {correctPreds}
                              </p>
                              <p className="text-xs text-gray-600">Correct</p>
                            </div>
                          </div>
                        </div>

                        {/* Bio Section */}
                        {profile?.bio && (
                          <div className="px-6 pb-4">
                            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                              {profile.bio}
                            </p>
                          </div>
                        )}

                        {/* Action Section */}
                        <div className="p-6 pt-0">
                          <Button
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                            asChild
                          >
                            <Link href={`/forecasters/${forecaster.id}`} className="flex items-center justify-center gap-2">
                              <Eye className="h-4 w-4" />
                              View Profile
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>

                        {/* Hover Effect Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Empty State */}
            {!isLoading && !error && forecasters.length === 0 && (
              <motion.div className="text-center py-16" variants={itemVariants}>
                <div className="bg-white shadow-sm rounded-xl p-12 max-w-md mx-auto">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">No Forecasters Found</h3>
                  <p className="text-slate-600 mb-6">
                    {searchQuery ? 'No forecasters match your search criteria.' : 'No forecasters are available at this time.'}
                  </p>
                  {searchQuery && (
                    <Button variant="outline" onClick={() => setSearchQuery('')}>
                      Clear Search
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
    </>
  );
};

export default ForecastersPage;