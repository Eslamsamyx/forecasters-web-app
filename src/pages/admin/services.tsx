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
  Server,
  Database,
  Mail,
  Search,
  Shield,
  Zap,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Settings,
  RefreshCw,
  Play,
  Pause
} from "lucide-react";

const ServicesManagement: NextPage = () => {
  const services = [
    { name: "API Gateway", type: "Core", status: "running", cpu: 45, memory: 67, uptime: 99.9, port: 8080 },
    { name: "Database Service", type: "Data", status: "running", cpu: 23, memory: 78, uptime: 99.8, port: 5432 },
    { name: "Email Service", type: "Communication", status: "error", cpu: 0, memory: 0, uptime: 85.3, port: 587 },
    { name: "Cache Service", type: "Performance", status: "running", cpu: 12, memory: 34, uptime: 99.9, port: 6379 },
    { name: "Auth Service", type: "Security", status: "running", cpu: 34, memory: 45, uptime: 99.7, port: 8081 },
    { name: "Search Service", type: "Data", status: "stopped", cpu: 0, memory: 0, uptime: 92.1, port: 9200 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-700';
      case 'stopped':
        return 'bg-gray-100 text-gray-700';
      case 'error':
        return 'bg-red-100 text-red-700';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="h-4 w-4" />;
      case 'stopped':
        return <Pause className="h-4 w-4" />;
      case 'error':
        return <XCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Server className="h-4 w-4" />;
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'Core':
        return <Server className="h-5 w-5" />;
      case 'Data':
        return <Database className="h-5 w-5" />;
      case 'Communication':
        return <Mail className="h-5 w-5" />;
      case 'Performance':
        return <Zap className="h-5 w-5" />;
      case 'Security':
        return <Shield className="h-5 w-5" />;
      default:
        return <Server className="h-5 w-5" />;
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
        <title>Services Management - Admin - Prediction Prism Analytics</title>
        <meta name="description" content="Manage system services and microservices." />
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
            <motion.div className="mb-12" variants={itemVariants}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" asChild>
                    <Link href="/admin">
                      <ArrowLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                  <div>
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                      Services
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Management</span>
                    </h1>
                    <p className="text-xl text-gray-600">
                      Monitor and manage system services.
                    </p>
                  </div>
                </div>
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh All
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-blue-600 mb-2">
                      <Server className="h-8 w-8 mx-auto" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">6</div>
                    <div className="text-sm text-gray-600">Total Services</div>
                  </CardContent>
                </Card>
                <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-green-600 mb-2">
                      <CheckCircle className="h-8 w-8 mx-auto" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">4</div>
                    <div className="text-sm text-gray-600">Running</div>
                  </CardContent>
                </Card>
                <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-red-600 mb-2">
                      <XCircle className="h-8 w-8 mx-auto" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">1</div>
                    <div className="text-sm text-gray-600">Errors</div>
                  </CardContent>
                </Card>
                <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-purple-600 mb-2">
                      <Zap className="h-8 w-8 mx-auto" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">97.1%</div>
                    <div className="text-sm text-gray-600">Avg Uptime</div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Services List */}
            <motion.div variants={itemVariants}>
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    System Services
                  </CardTitle>
                  <CardDescription>
                    Monitor and control all system services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {services.map((service, index) => (
                      <motion.div
                        key={index}
                        className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                              {getServiceIcon(service.type)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{service.name}</h3>
                              <div className="text-sm text-gray-600">{service.type} Service</div>
                            </div>
                          </div>
                          <Badge className={getStatusColor(service.status)}>
                            {getStatusIcon(service.status)}
                            <span className="ml-1">{service.status}</span>
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-gray-500">Port</div>
                              <div className="font-medium">{service.port}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Uptime</div>
                              <div className="font-medium">{service.uptime}%</div>
                            </div>
                          </div>

                          {service.status === 'running' && (
                            <div className="space-y-2">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>CPU Usage</span>
                                  <span>{service.cpu}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full transition-all"
                                    style={{ width: `${service.cpu}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Memory</span>
                                  <span>{service.memory}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-purple-500 h-2 rounded-full transition-all"
                                    style={{ width: `${service.memory}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex justify-between items-center pt-2">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                {service.status === 'running' ? (
                                  <Pause className="h-3 w-3 mr-1" />
                                ) : (
                                  <Play className="h-3 w-3 mr-1" />
                                )}
                                {service.status === 'running' ? 'Stop' : 'Start'}
                              </Button>
                              <Button variant="outline" size="sm">
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Restart
                              </Button>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-3 w-3 mr-1" />
                              Config
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
    </>
  );
};

export default ServicesManagement;