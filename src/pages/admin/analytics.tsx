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
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  FileText,
  Activity,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  ArrowLeft,
  Eye,
  MousePointer,
  Clock,
  DollarSign,
  Percent,
  Map
} from "lucide-react";

const AdminAnalytics: NextPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("7d");

  const periods = [
    { label: "24h", value: "24h" },
    { label: "7d", value: "7d" },
    { label: "30d", value: "30d" },
    { label: "3m", value: "3m" }
  ];

  const keyMetrics = [
    {
      title: "Total Users",
      value: "1,247",
      change: "+12.3%",
      trend: "up",
      icon: <Users className="h-5 w-5" />
    },
    {
      title: "Active Users",
      value: "856",
      change: "+8.7%",
      trend: "up",
      icon: <Activity className="h-5 w-5" />
    },
    {
      title: "Predictions Made",
      value: "3,421",
      change: "+15.2%",
      trend: "up",
      icon: <Target className="h-5 w-5" />
    },
    {
      title: "Articles Published",
      value: "198",
      change: "-2.1%",
      trend: "down",
      icon: <FileText className="h-5 w-5" />
    },
    {
      title: "Page Views",
      value: "47,582",
      change: "+23.4%",
      trend: "up",
      icon: <Eye className="h-5 w-5" />
    },
    {
      title: "Avg. Session Duration",
      value: "4m 32s",
      change: "+1.8%",
      trend: "up",
      icon: <Clock className="h-5 w-5" />
    },
    {
      title: "Conversion Rate",
      value: "3.2%",
      change: "+0.4%",
      trend: "up",
      icon: <Percent className="h-5 w-5" />
    },
    {
      title: "Revenue",
      value: "$12,847",
      change: "+18.9%",
      trend: "up",
      icon: <DollarSign className="h-5 w-5" />
    }
  ];

  const topPages = [
    { page: "/predictions", views: 8542, change: "+12%" },
    { page: "/forecasters", views: 6231, change: "+8%" },
    { page: "/dashboard", views: 4967, change: "+15%" },
    { page: "/articles", views: 3824, change: "-3%" },
    { page: "/settings", views: 2156, change: "+5%" }
  ];

  const topForecasters = [
    { name: "Dr. Sarah Chen", predictions: 89, accuracy: "87.3%" },
    { name: "Michael Rodriguez", predictions: 76, accuracy: "84.1%" },
    { name: "Prof. David Kim", predictions: 65, accuracy: "91.2%" },
    { name: "Emily Johnson", predictions: 58, accuracy: "79.8%" },
    { name: "Dr. Ahmed Hassan", predictions: 52, accuracy: "88.6%" }
  ];

  const userActivity = [
    { hour: "00", users: 45 },
    { hour: "04", users: 23 },
    { hour: "08", users: 156 },
    { hour: "12", users: 234 },
    { hour: "16", users: 189 },
    { hour: "20", users: 123 }
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
        <title>Analytics Dashboard - Admin - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Administrative analytics dashboard with user metrics, performance data, and insights."
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
                      Analytics
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Dashboard</span>
                    </h1>
                    <p className="text-xl text-gray-600">
                      Comprehensive analytics and performance metrics.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                    {periods.map((period) => (
                      <button
                        key={period.value}
                        onClick={() => setSelectedPeriod(period.value)}
                        className={`px-3 py-1 text-sm rounded transition-all ${
                          selectedPeriod === period.value
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {period.label}
                      </button>
                    ))}
                  </div>
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
            </motion.div>

            {/* Key Metrics */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
              variants={itemVariants}
            >
              {keyMetrics.map((metric, index) => (
                <Card key={index} className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-blue-600">
                        {metric.icon}
                      </div>
                      <Badge className={`${
                        metric.trend === 'up'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {metric.trend === 'up' ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {metric.change}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {metric.value}
                    </div>
                    <div className="text-sm text-gray-600">
                      {metric.title}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8 mb-12">
              {/* User Activity Chart */}
              <motion.div
                className="lg:col-span-2"
                variants={itemVariants}
              >
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      User Activity (24h)
                    </CardTitle>
                    <CardDescription>
                      Hourly active users over the past 24 hours
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-end justify-between gap-2">
                      {userActivity.map((data, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-sm transition-all hover:from-blue-600 hover:to-blue-700"
                            style={{ height: `${(data.users / 250) * 100}%`, minHeight: '4px' }}
                          ></div>
                          <div className="text-xs text-gray-500 mt-2">{data.hour}:00</div>
                          <div className="text-xs font-medium text-gray-700">{data.users}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Top Pages */}
              <motion.div
                variants={itemVariants}
              >
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Top Pages
                    </CardTitle>
                    <CardDescription>
                      Most visited pages this week
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topPages.map((page, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{page.page}</div>
                            <div className="text-xs text-gray-500">{page.views.toLocaleString()} views</div>
                          </div>
                          <Badge className={`${
                            page.change.startsWith('+')
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {page.change}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Top Forecasters */}
              <motion.div
                variants={itemVariants}
              >
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Top Forecasters
                    </CardTitle>
                    <CardDescription>
                      Most active forecasters this period
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topForecasters.map((forecaster, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {forecaster.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{forecaster.name}</div>
                              <div className="text-xs text-gray-500">{forecaster.predictions} predictions</div>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">
                            {forecaster.accuracy}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                      <Link href="/admin/forecasters">
                        View All Forecasters
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Performance Summary */}
              <motion.div
                variants={itemVariants}
              >
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Performance Summary
                    </CardTitle>
                    <CardDescription>
                      Key performance indicators
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-700">User Engagement</span>
                          <span className="text-sm font-medium">87%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-700">Prediction Accuracy</span>
                          <span className="text-sm font-medium">84%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '84%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-700">Content Quality</span>
                          <span className="text-sm font-medium">92%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-700">System Performance</span>
                          <span className="text-sm font-medium">98%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <strong>Insight:</strong> User engagement is up 15% compared to last period, driven by improved prediction accuracy.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>
    </>
  );
};

export default AdminAnalytics;