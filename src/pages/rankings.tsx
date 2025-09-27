"use client";

import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Award,
  Star,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Calendar,
  DollarSign,
  BarChart3,
  Crown,
  Medal,
  Trophy,
  Activity,
  Zap
} from "lucide-react";

const Rankings: NextPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"accuracy" | "predictions" | "performance">("accuracy");
  const [timeFrame, setTimeFrame] = useState<"7d" | "30d" | "90d" | "1y">("30d");

  // Fetch real data from database
  const { data: rankingsStats } = api.statistics.getRankingsStats.useQuery(
    undefined,
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const { data: forecasters, isLoading } = api.statistics.getForecastersRanked.useQuery(
    {
      limit: 10,
      offset: 0,
      sortBy,
      searchTerm: searchTerm || undefined
    },
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const mockForecasters = [
    {
      id: 1,
      name: "Michael Rodriguez",
      username: "@cryptomike",
      avatar: "MR",
      accuracy: 94.8,
      totalPredictions: 247,
      correctPredictions: 234,
      winStreak: 12,
      performance: "+24.5%",
      specialty: "Crypto Markets",
      verified: true,
      tier: "diamond",
      followers: 12500,
      joinDate: "2022-03-15"
    },
    {
      id: 2,
      name: "Sarah Chen",
      username: "@stocksarah",
      avatar: "SC",
      accuracy: 91.2,
      totalPredictions: 312,
      correctPredictions: 285,
      winStreak: 8,
      performance: "+18.7%",
      specialty: "Tech Stocks",
      verified: true,
      tier: "platinum",
      followers: 9800,
      joinDate: "2021-11-20"
    },
    {
      id: 3,
      name: "David Thompson",
      username: "@macrodave",
      avatar: "DT",
      accuracy: 89.7,
      totalPredictions: 189,
      correctPredictions: 169,
      winStreak: 15,
      performance: "+22.1%",
      specialty: "Macro Economics",
      verified: true,
      tier: "gold",
      followers: 7650,
      joinDate: "2022-01-08"
    },
    {
      id: 4,
      name: "Emma Williams",
      username: "@forexemma",
      avatar: "EW",
      accuracy: 87.3,
      totalPredictions: 156,
      correctPredictions: 136,
      winStreak: 6,
      performance: "+16.4%",
      specialty: "Forex Trading",
      verified: false,
      tier: "silver",
      followers: 4200,
      joinDate: "2022-06-12"
    },
    {
      id: 5,
      name: "Alex Kim",
      username: "@alextrades",
      avatar: "AK",
      accuracy: 85.9,
      totalPredictions: 203,
      correctPredictions: 174,
      winStreak: 4,
      performance: "+14.2%",
      specialty: "Options Trading",
      verified: true,
      tier: "silver",
      followers: 6100,
      joinDate: "2021-09-30"
    }
  ];

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "diamond":
        return <Crown className="h-5 w-5 text-blue-400" />;
      case "platinum":
        return <Medal className="h-5 w-5 text-gray-400" />;
      case "gold":
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case "silver":
        return <Award className="h-5 w-5 text-gray-500" />;
      default:
        return <Star className="h-5 w-5 text-gray-400" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "diamond":
        return "from-blue-500 to-cyan-500";
      case "platinum":
        return "from-gray-400 to-gray-600";
      case "gold":
        return "from-yellow-500 to-yellow-600";
      case "silver":
        return "from-gray-500 to-gray-600";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  // Use real data if available, otherwise use mock data
  const displayForecasters = forecasters || mockForecasters;

  const filteredForecasters = searchTerm && !forecasters
    ? mockForecasters.filter(forecaster =>
        forecaster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        forecaster.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        forecaster.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : displayForecasters;

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
        <title>Rankings - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Discover top-performing forecasters ranked by accuracy, performance, and expertise across different markets."
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
            <motion.div
              className="text-center space-y-4"
              variants={itemVariants}
            >
              <h1 className="text-4xl font-bold text-slate-900">
                🏆 Rankings
              </h1>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                Discover and follow the most accurate forecasters across crypto, stocks, forex, and macro markets. Rankings updated in real-time based on verified predictions.
              </p>
            </motion.div>

            {/* Stats Overview */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              variants={itemVariants}
            >
              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {rankingsStats?.totalForecasters?.toLocaleString() || "0"}
                  </div>
                  <div className="text-sm text-gray-600">Total Forecasters</div>
                </CardContent>
              </Card>
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardContent className="p-6 text-center">
                  <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {rankingsStats?.topAccuracy ? `${rankingsStats.topAccuracy}%` : "0%"}
                  </div>
                  <div className="text-sm text-gray-600">Top Accuracy</div>
                </CardContent>
              </Card>
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardContent className="p-6 text-center">
                  <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {rankingsStats?.totalPredictions ?
                      (rankingsStats.totalPredictions > 1000 ?
                        `${Math.floor(rankingsStats.totalPredictions / 1000)}K+` :
                        rankingsStats.totalPredictions.toLocaleString()) : "0"}
                  </div>
                  <div className="text-sm text-gray-600">Predictions Tracked</div>
                </CardContent>
              </Card>
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardContent className="p-6 text-center">
                  <Activity className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">Live</div>
                  <div className="text-sm text-gray-600">Real-time Updates</div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Filters and Search */}
            <motion.div
              className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 mb-8"
              variants={itemVariants}
            >
              <div className="grid md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search forecasters..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="accuracy">Sort by Accuracy</option>
                  <option value="predictions">Sort by Predictions</option>
                  <option value="performance">Sort by Performance</option>
                </select>
                <select
                  value={timeFrame}
                  onChange={(e) => setTimeFrame(e.target.value as any)}
                  className="px-3 py-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="1y">Last Year</option>
                </select>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  More Filters
                </Button>
              </div>
            </motion.div>

            {/* Rankings List */}
            <motion.div
              className="space-y-4 mb-12"
              variants={itemVariants}
            >
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="text-gray-600">Loading rankings...</div>
                </div>
              ) : filteredForecasters.map((forecaster, index) => (
                <motion.div
                  key={forecaster.id}
                  className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  layout
                >
                  <div className="grid md:grid-cols-6 gap-6 items-center">
                    {/* Rank and Avatar */}
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold text-gray-400">#{index + 1}</div>
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getTierColor(forecaster.tier)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                          {forecaster.avatar}
                        </div>
                        <div className="absolute -top-1 -right-1">
                          {getTierIcon(forecaster.tier)}
                        </div>
                        {forecaster.verified && (
                          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                            <Zap className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Name and Info */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{forecaster.name}</h3>
                        {forecaster.verified && (
                          <Badge className="bg-green-100 text-green-700 text-xs">Verified</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-1">{forecaster.username}</p>
                      <p className="text-gray-500 text-sm">{forecaster.specialty}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {forecaster.followers.toLocaleString()} followers
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Joined {forecaster.joinDate ? new Date(forecaster.joinDate).toLocaleDateString() : 'Unknown'}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{forecaster.accuracy}%</div>
                      <div className="text-xs text-gray-500">Accuracy</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {forecaster.correctPredictions}/{forecaster.totalPredictions}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{forecaster.performance}</div>
                      <div className="text-xs text-gray-500">Performance</div>
                      <div className="text-sm text-gray-600 mt-1 flex items-center justify-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        {forecaster.winStreak} streak
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                        Follow
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/forecasters/${forecaster.id}`}>
                          View Profile
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Load More */}
            <motion.div
              className="text-center"
              variants={itemVariants}
            >
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 text-lg"
              >
                Load More Forecasters
                <ArrowUpDown className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
    </>
  );
};

export default Rankings;