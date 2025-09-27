"use client";

import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  TrendingUp,
  Target,
  Award,
  BarChart3,
  Users,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";

const BrierScores: NextPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  const topForecasters = [
    { name: "Dr. Sarah Chen", brierScore: 0.098, predictions: 89, accuracy: 87.3, rank: 1 },
    { name: "Prof. David Kim", brierScore: 0.112, predictions: 65, accuracy: 91.2, rank: 2 },
    { name: "Dr. Ahmed Hassan", brierScore: 0.125, predictions: 52, accuracy: 88.6, rank: 3 },
    { name: "Emily Johnson", brierScore: 0.138, predictions: 78, accuracy: 84.1, rank: 4 },
    { name: "Michael Rodriguez", brierScore: 0.145, predictions: 94, accuracy: 82.7, rank: 5 }
  ];

  const categoryScores = [
    { category: "Technology", avgScore: 0.134, predictions: 245, topScore: 0.089 },
    { category: "Economics", avgScore: 0.156, predictions: 189, topScore: 0.098 },
    { category: "Sports", avgScore: 0.167, predictions: 312, topScore: 0.112 },
    { category: "Politics", avgScore: 0.178, predictions: 156, topScore: 0.125 },
    { category: "Environment", avgScore: 0.189, predictions: 98, topScore: 0.134 }
  ];

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
        <title>Brier Scores - Admin - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Analyze forecasting accuracy using Brier scores and performance metrics."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <motion.div
          className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="container mx-auto px-4 py-16">
            {/* Header */}
            <motion.div
              className="mb-12"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" asChild>
                    <Link href="/admin">
                      <ArrowLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                  <div>
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                      Brier
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Scores</span>
                    </h1>
                    <p className="text-xl text-gray-600">
                      Analyze forecasting accuracy and calibration metrics.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="1y">Last year</option>
                  </select>
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-blue-600 mb-2">
                      <Target className="h-8 w-8 mx-auto" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">0.142</div>
                    <div className="text-sm text-gray-600">Platform Average</div>
                  </CardContent>
                </Card>
                <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-green-600 mb-2">
                      <Award className="h-8 w-8 mx-auto" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">0.098</div>
                    <div className="text-sm text-gray-600">Best Score</div>
                  </CardContent>
                </Card>
                <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-purple-600 mb-2">
                      <Users className="h-8 w-8 mx-auto" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">86</div>
                    <div className="text-sm text-gray-600">Active Forecasters</div>
                  </CardContent>
                </Card>
                <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-orange-600 mb-2">
                      <BarChart3 className="h-8 w-8 mx-auto" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">1,247</div>
                    <div className="text-sm text-gray-600">Total Predictions</div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* Top Forecasters */}
              <motion.div
                variants={itemVariants}
              >
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Top Forecasters by Brier Score
                    </CardTitle>
                    <CardDescription>
                      Lower scores indicate better calibration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topForecasters.map((forecaster, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                              forecaster.rank === 1 ? 'bg-yellow-500' :
                              forecaster.rank === 2 ? 'bg-gray-400' :
                              forecaster.rank === 3 ? 'bg-orange-600' :
                              'bg-blue-500'
                            }`}>
                              {forecaster.rank}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{forecaster.name}</div>
                              <div className="text-sm text-gray-500">
                                {forecaster.predictions} predictions • {forecaster.accuracy}% accuracy
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              {forecaster.brierScore.toFixed(3)}
                            </div>
                            <div className="text-sm text-gray-500">Brier Score</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Category Performance */}
              <motion.div
                variants={itemVariants}
              >
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Performance by Category
                    </CardTitle>
                    <CardDescription>
                      Average Brier scores across prediction categories
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {categoryScores.map((category, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-medium text-gray-900">{category.category}</div>
                            <div className="text-sm text-gray-500">{category.predictions} predictions</div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Average Score</span>
                              <span className="font-medium">{category.avgScore.toFixed(3)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${Math.max(10, 100 - (category.avgScore * 500))}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Best Score: {category.topScore.toFixed(3)}</span>
                              <Badge className="bg-blue-100 text-blue-700">
                                {category.category === 'Technology' ? 'Excellent' :
                                 category.category === 'Economics' ? 'Good' :
                                 category.category === 'Sports' ? 'Average' :
                                 'Needs Improvement'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Score Distribution */}
            <motion.div
              variants={itemVariants}
            >
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Brier Score Distribution
                  </CardTitle>
                  <CardDescription>
                    Distribution of scores across all forecasters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">12</div>
                      <div className="text-sm text-gray-600">Excellent</div>
                      <div className="text-xs text-gray-500">&lt; 0.10</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">23</div>
                      <div className="text-sm text-gray-600">Good</div>
                      <div className="text-xs text-gray-500">0.10 - 0.15</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">34</div>
                      <div className="text-sm text-gray-600">Average</div>
                      <div className="text-xs text-gray-500">0.15 - 0.20</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">15</div>
                      <div className="text-sm text-gray-600">Poor</div>
                      <div className="text-xs text-gray-500">0.20 - 0.25</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">2</div>
                      <div className="text-sm text-gray-600">Very Poor</div>
                      <div className="text-xs text-gray-500">&gt; 0.25</div>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">About Brier Scores</h4>
                    <p className="text-sm text-blue-800">
                      The Brier score measures the accuracy of probabilistic predictions. Lower scores are better, 
                      with 0 being perfect and 1 being the worst possible score. A score of 0.25 represents 
                      random guessing for binary predictions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
    </>
  );
};

export default BrierScores;