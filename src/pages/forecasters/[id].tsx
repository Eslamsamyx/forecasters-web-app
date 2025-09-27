"use client";

import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Youtube,
  Twitter,
  Globe,
  Eye,
  Trophy,
  Zap,
  Calendar,
  Activity,
  AlertCircle
} from "lucide-react";
import { api } from "@/utils/api";
import { Loader2 } from "lucide-react";

const ForecasterDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "correct" | "incorrect">("all");

  // Fetch forecaster data from database
  const { data: forecaster, isLoading, error } = api.forecasters.getById.useQuery(
    id as string,
    { enabled: !!id }
  );

  // Predictions are included in the forecaster data
  const predictionsData: any = null; // Removed separate predictions query as it doesn't exist

  // Mock data fallback for when database is empty
  const mockForecaster = {
    id: id,
    name: "Michael Chen",
    username: "@mchen",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    bio: "Financial analyst and cryptocurrency expert with 10+ years of experience in market predictions.",
    tier: "Elite",
    accuracy: 96.5,
    totalPredictions: 234,
    correctPredictions: 226,
    pendingPredictions: 8,
    followers: 12543,
    joinedDate: "2023-01-15",
    winStreak: 15,
    avgConfidence: 82,
    categories: ["Crypto", "Stocks", "Forex"],
    socialLinks: {
      twitter: "https://twitter.com/mchen",
      youtube: "https://youtube.com/@mchen",
      website: "https://mchen.com"
    }
  };

  // Use real data if available, otherwise use mock
  const displayData = forecaster || mockForecaster;

  // Format predictions data - use paginated data if available
  const predictions = (predictionsData as any)?.predictions?.map((pred: any) => ({
    id: pred.id,
    title: `${pred.asset?.symbol || 'Asset'} - ${pred.prediction || pred.title || pred.description}`,
    confidence: pred.confidence,
    status: pred.outcome?.toLowerCase() || 'pending',
    date: new Date(pred.createdAt).toLocaleDateString(),
    category: pred.asset?.type || 'General',
    targetPrice: pred.targetPrice,
    targetDate: pred.targetDate ? new Date(pred.targetDate).toLocaleDateString() : null,
  })) || ('predictions' in displayData && displayData.predictions?.map((pred: any) => ({
    id: pred.id,
    title: `${pred.asset?.symbol || 'Asset'} - ${pred.prediction || pred.title || pred.description}`,
    confidence: pred.confidence,
    status: pred.outcome?.toLowerCase() || 'pending',
    date: new Date(pred.createdAt).toLocaleDateString(),
    category: pred.asset?.type || 'General',
  }))) || [];

  // Use performance data from API if available
  const performanceData: Array<{ month: string; accuracy: number; total: number; correct: number }> =
    ('performanceData' in displayData && Array.isArray(displayData.performanceData) ? displayData.performanceData : null) || [
    { month: "Jan", accuracy: 94, total: 25, correct: 23 },
    { month: "Feb", accuracy: 96, total: 28, correct: 27 },
    { month: "Mar", accuracy: 95, total: 30, correct: 28 },
    { month: "Apr", accuracy: 97, total: 32, correct: 31 },
    { month: "May", accuracy: 96, total: 26, correct: 25 },
    { month: "Jun", accuracy: 98, total: 29, correct: 28 }
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

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Elite": return "bg-purple-100 text-purple-700";
      case "Expert": return "bg-blue-100 text-blue-700";
      case "Pro": return "bg-green-100 text-green-700";
      default: return "bg-amber-100 text-amber-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "correct": return "text-green-600";
      case "incorrect": return "text-red-600";
      default: return "text-yellow-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "correct": return <CheckCircle className="h-4 w-4" />;
      case "incorrect": return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading forecaster data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-900 text-xl mb-2">Forecaster not found</p>
          <p className="text-gray-600 mb-4">The forecaster you're looking for doesn't exist.</p>
          <Link href="/forecasters">
            <Button>Back to Forecasters</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{displayData.name} - Forecaster Profile | Prediction Prism Analytics</title>
        <meta
          name="description"
          content={`View ${displayData.name}'s prediction accuracy and performance on Prediction Prism Analytics.`}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <motion.div
          className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Back Button */}
            <motion.div variants={itemVariants} className="mb-6">
              <Link href="/forecasters">
                <Button variant="ghost" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Forecasters
                </Button>
              </Link>
            </motion.div>

            {/* Profile Header */}
            <motion.div variants={itemVariants}>
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border-white/20 mb-8">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Avatar and Basic Info */}
                    <div className="flex flex-col items-center md:items-start gap-4">
                      <Avatar className="h-32 w-32">
                        <AvatarImage src={('avatar' in displayData && displayData.avatar) || undefined} alt={displayData.name} />
                        <AvatarFallback>{displayData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold text-gray-900">{displayData.name}</h1>
                        <p className="text-gray-600">@{('slug' in displayData && displayData.slug) || ('username' in displayData && displayData.username) || 'user'}</p>
                        {('isVerified' in displayData && displayData.isVerified) && (
                          <Badge className={`mt-2 ${getTierColor('Verified')}`}>
                            <Trophy className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="flex-1">
                      <p className="text-gray-600 mb-6">{('bio' in displayData && displayData.bio) || 'Expert forecaster tracking market trends'}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="text-2xl font-bold text-blue-700">{('accuracy' in displayData && displayData.accuracy) || 0}%</div>
                          <div className="text-sm text-gray-600">Accuracy</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="text-2xl font-bold text-green-700">{('_count' in displayData && displayData._count?.predictions) || ('totalPredictions' in displayData && displayData.totalPredictions) || 0}</div>
                          <div className="text-sm text-gray-600">Predictions</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <div className="text-2xl font-bold text-purple-700">{('winStreak' in displayData && displayData.winStreak) || 0}</div>
                          <div className="text-sm text-gray-600">Win Streak</div>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-4">
                          <div className="text-2xl font-bold text-amber-700">{('_count' in displayData && displayData._count?.content) || ('followers' in displayData && displayData.followers) || 0}</div>
                          <div className="text-sm text-gray-600">Followers</div>
                        </div>
                      </div>

                      {/* Social Links */}
                      <div className="flex gap-4 mt-6">
                        {('socialLinks' in displayData && displayData.socialLinks?.twitter) && (
                          <a href={('socialLinks' in displayData && displayData.socialLinks.twitter) || '#'} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">
                              <Twitter className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                        {('socialLinks' in displayData && displayData.socialLinks?.youtube) && (
                          <a href={('socialLinks' in displayData && displayData.socialLinks.youtube) || '#'} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">
                              <Youtube className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                        {('socialLinks' in displayData && displayData.socialLinks?.website) && (
                          <a href={('socialLinks' in displayData && displayData.socialLinks.website) || '#'} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">
                              <Globe className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                          <Eye className="h-4 w-4 mr-2" />
                          Follow
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tabs Section */}
            <motion.div variants={itemVariants}>
              <Tabs defaultValue="predictions" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                  <TabsTrigger value="predictions">Predictions</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                </TabsList>

                {/* Predictions Tab */}
                <TabsContent value="predictions">
                  <Card className="shadow-xl bg-white/90 backdrop-blur-xl border-white/20">
                    <CardHeader>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <CardTitle>All Predictions</CardTitle>
                          <CardDescription>
                            {predictionsData?.pagination ?
                              `Showing ${((predictionsData.pagination.page - 1) * predictionsData.pagination.pageSize) + 1}-${Math.min(predictionsData.pagination.page * predictionsData.pagination.pageSize, predictionsData.pagination.totalCount)} of ${predictionsData.pagination.totalCount} predictions` :
                              'Track record of market predictions'
                            }
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={statusFilter === "all" ? "default" : "outline"}
                            onClick={() => { setStatusFilter("all"); setCurrentPage(1); }}
                          >
                            All
                          </Button>
                          <Button
                            size="sm"
                            variant={statusFilter === "pending" ? "default" : "outline"}
                            onClick={() => { setStatusFilter("pending"); setCurrentPage(1); }}
                          >
                            Pending
                          </Button>
                          <Button
                            size="sm"
                            variant={statusFilter === "correct" ? "default" : "outline"}
                            onClick={() => { setStatusFilter("correct"); setCurrentPage(1); }}
                          >
                            Correct
                          </Button>
                          <Button
                            size="sm"
                            variant={statusFilter === "incorrect" ? "default" : "outline"}
                            onClick={() => { setStatusFilter("incorrect"); setCurrentPage(1); }}
                          >
                            Incorrect
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {predictions.map((prediction: any) => (
                          <div key={prediction.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{prediction.title}</h4>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {prediction.date}
                                  </span>
                                  <Badge variant="outline">{prediction.category}</Badge>
                                  <span className="flex items-center gap-1">
                                    <Target className="h-3 w-3" />
                                    {Math.round((prediction.confidence || 0) * 100)}% confidence
                                  </span>
                                </div>
                              </div>
                              <div className={`flex items-center gap-1 ${getStatusColor(prediction.status)}`}>
                                {getStatusIcon(prediction.status)}
                                <span className="capitalize">{prediction.status}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination Controls */}
                      {predictionsData?.pagination && predictionsData.pagination.totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            Page {predictionsData.pagination.page} of {predictionsData.pagination.totalPages}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={currentPage === 1}
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            >
                              Previous
                            </Button>
                            {/* Page numbers */}
                            <div className="flex gap-1">
                              {Array.from({ length: Math.min(5, predictionsData.pagination.totalPages) }, (_, i) => {
                                let pageNum;
                                if (predictionsData.pagination.totalPages <= 5) {
                                  pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                  pageNum = i + 1;
                                } else if (currentPage >= predictionsData.pagination.totalPages - 2) {
                                  pageNum = predictionsData.pagination.totalPages - 4 + i;
                                } else {
                                  pageNum = currentPage - 2 + i;
                                }
                                return (
                                  <Button
                                    key={i}
                                    size="sm"
                                    variant={currentPage === pageNum ? "default" : "outline"}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className="w-10"
                                  >
                                    {pageNum}
                                  </Button>
                                );
                              })}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!predictionsData.pagination.hasMore}
                              onClick={() => setCurrentPage(p => Math.min(predictionsData.pagination.totalPages, p + 1))}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance">
                  <Card className="shadow-xl bg-white/90 backdrop-blur-xl border-white/20">
                    <CardHeader>
                      <CardTitle>Performance Analytics</CardTitle>
                      <CardDescription>Historical accuracy and statistics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Performance Chart */}
                        <div className="bg-gray-50 rounded-lg p-6">
                          <h4 className="font-semibold mb-4 text-gray-900">Accuracy Trend</h4>
                          <div className="relative h-64">
                            {/* Y-axis labels */}
                            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
                              <span>100%</span>
                              <span>95%</span>
                              <span>90%</span>
                              <span>85%</span>
                              <span>80%</span>
                            </div>
                            {/* Chart area */}
                            <div className="ml-8 h-full flex items-end gap-4">
                              {performanceData.map((data: any, index: any) => {
                                const height = ((data.accuracy - 80) / 20) * 100; // Scale from 80-100% to 0-100% height
                                return (
                                  <div key={data.month} className="flex-1 flex flex-col items-center">
                                    <div className="w-full bg-gray-200 rounded-t relative" style={{ height: '100%' }}>
                                      <div
                                        className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-500 hover:from-blue-600 hover:to-blue-500"
                                        style={{ height: `${height}%` }}
                                      >
                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-700">
                                          {data.accuracy}%
                                        </span>
                                      </div>
                                    </div>
                                    <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Monthly Performance */}
                        <div>
                          <h4 className="font-semibold mb-4">Monthly Accuracy</h4>
                          <div className="grid grid-cols-6 gap-4">
                            {performanceData.map((month: any) => (
                              <div key={month.month} className="text-center">
                                <div className="text-2xl font-bold text-gray-900">{month.accuracy}%</div>
                                <div className="text-sm text-gray-600">{month.month}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Insights Tab */}
                <TabsContent value="insights">
                  <Card className="shadow-xl bg-white/90 backdrop-blur-xl border-white/20">
                    <CardHeader>
                      <CardTitle>Key Insights</CardTitle>
                      <CardDescription>Analysis patterns and strengths</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">Strongest Categories</h4>
                              <div className="space-y-2">
                                {(('categories' in displayData && displayData.categories) || ['General']).map((category) => (
                                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span>{category}</span>
                                    <Badge className="bg-green-100 text-green-700">High Accuracy</Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">Recent Achievements</h4>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                                  <Award className="h-5 w-5 text-purple-600" />
                                  <span className="text-sm">15 prediction win streak</span>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                                  <TrendingUp className="h-5 w-5 text-blue-600" />
                                  <span className="text-sm">Top 1% accuracy this month</span>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                                  <Zap className="h-5 w-5 text-green-600" />
                                  <span className="text-sm">Quick market response time</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </motion.div>
    </>
  );
};

export default ForecasterDetailPage;