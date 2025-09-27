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
  Server,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  ArrowLeft,
  Globe,
  Database,
  Zap,
  Shield,
  Mail,
  Search,
  BarChart3,
  TrendingUp,
  ExternalLink
} from "lucide-react";

const APIStatus: NextPage = () => {
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const apiEndpoints = [
    {
      name: "Authentication API",
      endpoint: "/api/auth",
      status: "operational",
      responseTime: 145,
      uptime: 99.9,
      lastCheck: "2 min ago"
    },
    {
      name: "Predictions API",
      endpoint: "/api/predictions",
      status: "operational",
      responseTime: 230,
      uptime: 99.7,
      lastCheck: "1 min ago"
    },
    {
      name: "Forecasters API",
      endpoint: "/api/forecasters",
      status: "degraded",
      responseTime: 890,
      uptime: 98.2,
      lastCheck: "30 sec ago"
    },
    {
      name: "Articles API",
      endpoint: "/api/articles",
      status: "operational",
      responseTime: 180,
      uptime: 99.8,
      lastCheck: "1 min ago"
    },
    {
      name: "Analytics API",
      endpoint: "/api/analytics",
      status: "operational",
      responseTime: 320,
      uptime: 99.5,
      lastCheck: "2 min ago"
    },
    {
      name: "Search API",
      endpoint: "/api/search",
      status: "maintenance",
      responseTime: 0,
      uptime: 95.3,
      lastCheck: "5 min ago"
    }
  ];

  const systemServices = [
    {
      name: "Main Database",
      type: "PostgreSQL",
      status: "operational",
      connections: 45,
      maxConnections: 100,
      responseTime: 12
    },
    {
      name: "Redis Cache",
      type: "Redis",
      status: "operational",
      memoryUsage: "2.3 GB",
      maxMemory: "8 GB",
      responseTime: 2
    },
    {
      name: "Email Service",
      type: "SMTP",
      status: "degraded",
      queueSize: 234,
      processed: 1847,
      responseTime: 450
    },
    {
      name: "File Storage",
      type: "S3",
      status: "operational",
      usage: "145 GB",
      available: "855 GB",
      responseTime: 89
    }
  ];

  const recentIncidents = [
    {
      title: "High response times on Forecasters API",
      status: "investigating",
      startTime: "2 hours ago",
      severity: "medium"
    },
    {
      title: "Search API scheduled maintenance",
      status: "scheduled",
      startTime: "1 hour ago",
      severity: "low"
    },
    {
      title: "Email delivery delays",
      status: "monitoring",
      startTime: "4 hours ago",
      severity: "medium"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-700';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-700';
      case 'maintenance':
        return 'bg-blue-100 text-blue-700';
      case 'outage':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-4 w-4" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4" />;
      case 'maintenance':
        return <Clock className="h-4 w-4" />;
      case 'outage':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
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

  return (
    <>
      <Head>
        <title>API Status - Admin - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Real-time API status monitoring and system health dashboard."
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
                      API
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Status</span>
                    </h1>
                    <p className="text-xl text-gray-600">
                      Real-time monitoring of API endpoints and system services.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-500">
                    Last updated: {lastUpdate.toLocaleTimeString()}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setLastUpdate(new Date())}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Overall Status */}
              <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <h2 className="text-lg font-semibold text-green-900">All Systems Operational</h2>
                  <p className="text-green-700">Minor issues detected on some services</p>
                </div>
              </div>
            </motion.div>

            {/* API Endpoints */}
            <motion.div
              className="mb-12"
              variants={itemVariants}
            >
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    API Endpoints
                  </CardTitle>
                  <CardDescription>
                    Status and performance of all API endpoints
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {apiEndpoints.map((api, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${getStatusColor(api.status)}`}>
                            {getStatusIcon(api.status)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{api.name}</div>
                            <div className="text-sm text-gray-500">{api.endpoint}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{api.responseTime}ms</div>
                            <div className="text-xs text-gray-500">Response Time</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{api.uptime}%</div>
                            <div className="text-xs text-gray-500">Uptime</div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(api.status)}>
                              {api.status}
                            </Badge>
                            <div className="text-xs text-gray-400 mt-1">{api.lastCheck}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* System Services */}
              <motion.div
                variants={itemVariants}
              >
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      System Services
                    </CardTitle>
                    <CardDescription>
                      Backend services and infrastructure
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {systemServices.map((service, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${getStatusColor(service.status)}`}>
                                {getStatusIcon(service.status)}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{service.name}</div>
                                <div className="text-sm text-gray-500">{service.type}</div>
                              </div>
                            </div>
                            <Badge className={getStatusColor(service.status)}>
                              {service.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-gray-500">Response Time</div>
                              <div className="font-medium">{service.responseTime}ms</div>
                            </div>
                            <div>
                              <div className="text-gray-500">
                                {service.connections ? 'Connections' : 
                                 service.memoryUsage ? 'Memory Usage' :
                                 service.queueSize ? 'Queue Size' : 'Usage'}
                              </div>
                              <div className="font-medium">
                                {service.connections || service.memoryUsage || service.queueSize || service.usage}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Incidents */}
              <motion.div
                variants={itemVariants}
              >
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Recent Incidents
                    </CardTitle>
                    <CardDescription>
                      Active and resolved incidents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentIncidents.map((incident, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 mb-1">{incident.title}</div>
                              <div className="text-sm text-gray-500">{incident.startTime}</div>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                              <Badge className={`${
                                incident.severity === 'high' ? 'bg-red-100 text-red-700' :
                                incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {incident.severity}
                              </Badge>
                              <Badge variant="outline">
                                {incident.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Status Page
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Performance Metrics */}
            <motion.div
              variants={itemVariants}
            >
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>
                    System performance over the past 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">245ms</div>
                      <div className="text-sm text-gray-600">Avg Response Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">99.2%</div>
                      <div className="text-sm text-gray-600">Uptime</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">45.7K</div>
                      <div className="text-sm text-gray-600">Requests/hour</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 mb-1">2.1%</div>
                      <div className="text-sm text-gray-600">Error Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
    </>
  );
};

export default APIStatus;