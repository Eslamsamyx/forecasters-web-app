"use client";

import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/utils/api";
import {
  Shield,
  Users,
  FileText,
  BarChart3,
  Settings,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Target,
  Mail,
  Server,
  Globe,
  UserCheck,
  FileSearch,
  Zap,
  Heart,
  Eye,
  Filter,
  ArrowRight,
  Crown,
  Loader2,
  RefreshCw,
  Brain
} from "lucide-react";

const AdminDashboard: NextPage = () => {
  // Fetch real data from the API
  const { data: dashboardStats, isLoading: statsLoading, refetch: refetchStats } = api.admin.getDashboardStats.useQuery();
  const { data: systemStatus, isLoading: statusLoading, refetch: refetchStatus } = api.admin.getSystemStatus.useQuery();
  const { data: activityFeed, isLoading: activityLoading, refetch: refetchActivity } = api.admin.getActivityFeed.useQuery({
    limit: 5,
    offset: 0,
  });

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchStats();
      refetchStatus();
      refetchActivity();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetchStats, refetchStatus, refetchActivity]);

  // Handle loading states
  const isLoading = statsLoading || statusLoading || activityLoading;

  // Extract stats with fallback values
  const stats = dashboardStats?.stats || {
    totalUsers: 0,
    totalForecasters: 0,
    totalPredictions: 0,
    totalArticles: 0,
    systemHealth: 0,
    apiCalls: 0,
    activeSubscriptions: 0,
  };

  const todayStats = dashboardStats?.todayStats || {
    newUsers: 0,
    newPredictions: 0,
    apiRequests: 0,
    activeSessions: 0,
  };

  const growth = dashboardStats?.growth || {
    userGrowth: 0,
    predictionGrowth: 0,
    forecastersAccuracy: 0,
  };

  const recentActivity = activityFeed?.activities || [];
  const systemServices = systemStatus?.services || [];

  const quickActions = [
    {
      title: "Predictions Management",
      description: "Manage predictions and extractions",
      icon: <Brain className="h-6 w-6" />,
      href: "/admin/predictions",
      color: "from-emerald-500 to-emerald-600"
    },
    {
      title: "User Management",
      description: "Manage users and permissions",
      icon: <Users className="h-6 w-6" />,
      href: "/admin/users",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Content Management",
      description: "Manage articles and content",
      icon: <FileText className="h-6 w-6" />,
      href: "/admin/articles",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Analytics",
      description: "View system analytics",
      icon: <BarChart3 className="h-6 w-6" />,
      href: "/admin/analytics",
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "System Health",
      description: "Monitor system status",
      icon: <Activity className="h-6 w-6" />,
      href: "/admin/health",
      color: "from-red-500 to-red-600"
    },
    {
      title: "Forecasters",
      description: "Manage forecaster profiles",
      icon: <Target className="h-6 w-6" />,
      href: "/admin/forecasters",
      color: "from-orange-500 to-orange-600"
    },
    {
      title: "Security Settings",
      description: "Configure security policies",
      icon: <Shield className="h-6 w-6" />,
      href: "/admin/security-settings",
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case 'UserCheck':
        return <UserCheck className="h-4 w-4" />;
      case 'FileText':
        return <FileText className="h-4 w-4" />;
      case 'TrendingUp':
        return <TrendingUp className="h-4 w-4" />;
      case 'Target':
        return <Target className="h-4 w-4" />;
      case 'Database':
        return <Database className="h-4 w-4" />;
      case 'AlertTriangle':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
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
        <title>Admin Dashboard - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Administrative dashboard for managing users, content, and system settings."
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
                <div>
                  <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                    Admin
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Dashboard</span>
                  </h1>
                  <p className="text-xl text-gray-600">
                    Monitor and manage your Prism Analytics platform.
                  </p>
                </div>
                <div className="text-right">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2">
                    <Crown className="h-8 w-8" />
                  </div>
                  <Badge className="bg-red-100 text-red-700 mt-1">
                    Admin Access
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      refetchStats();
                      refetchStatus();
                      refetchActivity();
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Key Metrics */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-3 text-gray-600">Loading statistics...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center text-blue-600 mb-2">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Total Users</div>
                      {growth.userGrowth !== 0 && (
                        <div className={`text-xs mt-1 ${growth.userGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {growth.userGrowth > 0 ? '+' : ''}{growth.userGrowth}% this week
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center text-green-600 mb-2">
                        <Target className="h-5 w-5" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">{stats.totalForecasters}</div>
                      <div className="text-xs text-gray-600">Forecasters</div>
                      {'verifiedForecasters' in stats && stats.verifiedForecasters > 0 && (
                        <div className="text-xs text-green-600 mt-1">
                          {stats.verifiedForecasters} verified
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center text-purple-600 mb-2">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">{stats.totalPredictions.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Predictions</div>
                      {growth.predictionGrowth !== 0 && (
                        <div className={`text-xs mt-1 ${growth.predictionGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {growth.predictionGrowth > 0 ? '+' : ''}{growth.predictionGrowth}% today
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center text-orange-600 mb-2">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">{stats.totalArticles}</div>
                      <div className="text-xs text-gray-600">Articles</div>
                      {'publishedArticles' in stats && stats.publishedArticles > 0 && (
                        <div className="text-xs text-green-600 mt-1">
                          {stats.publishedArticles} published
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center text-red-600 mb-2">
                        <Activity className="h-5 w-5" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">{stats.systemHealth}%</div>
                      <div className="text-xs text-gray-600">Health</div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div
                            className={`h-1 rounded-full ${
                              stats.systemHealth >= 90 ? 'bg-green-500' :
                              stats.systemHealth >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${stats.systemHealth}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center text-indigo-600 mb-2">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">{stats.apiCalls.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">API Calls</div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center text-pink-600 mb-2">
                        <Crown className="h-5 w-5" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">{stats.activeSubscriptions}</div>
                      <div className="text-xs text-gray-600">Subscriptions</div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
              variants={itemVariants}
            >
              {quickActions.map((action, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20 h-full hover:shadow-2xl transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-3">
                        <motion.div
                          className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center text-white`}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          {action.icon}
                        </motion.div>
                      </div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <CardDescription>{action.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full" asChild>
                        <Link href={action.href}>
                          Access
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Recent Activity */}
              <motion.div
                className="lg:col-span-2"
                variants={itemVariants}
              >
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>
                      Latest system events and user actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No recent activity
                        </div>
                      ) : (
                        recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              activity.type === 'success' ? 'bg-green-100 text-green-600' :
                              activity.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {getActivityIcon(activity.icon)}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">{activity.action}</div>
                              <div className="text-xs text-gray-500">by {activity.user}</div>
                              <div className="text-xs text-gray-400">{formatTimestamp(activity.timestamp)}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      View All Activity
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* System Status */}
              <motion.div
                variants={itemVariants}
              >
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      System Status
                    </CardTitle>
                    <CardDescription>
                      Current service health
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {systemServices.map((service, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{service.name}</div>
                            <div className="text-xs text-gray-500">{service.uptime} uptime</div>
                          </div>
                          <Badge className={`${
                            service.status === 'operational'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {service.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                      <Link href="/admin/health">
                        View Details
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20 mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Today's Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">New Users</span>
                        <span className="text-sm font-medium">+{todayStats.newUsers}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">New Predictions</span>
                        <span className="text-sm font-medium">+{todayStats.newPredictions}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">API Requests</span>
                        <span className="text-sm font-medium">{todayStats.apiRequests.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Active Sessions</span>
                        <span className="text-sm font-medium">{todayStats.activeSessions}</span>
                      </div>
                      {growth.forecastersAccuracy > 0 && (
                        <div className="pt-3 border-t">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Avg. Accuracy</span>
                            <span className="text-sm font-medium text-green-600">{growth.forecastersAccuracy}%</span>
                          </div>
                        </div>
                      )}
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

export default AdminDashboard;