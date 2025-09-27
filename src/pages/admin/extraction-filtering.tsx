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
  Filter,
  Database,
  Search,
  Settings,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap
} from "lucide-react";

const ExtractionFiltering: NextPage = () => {
  const [filters, setFilters] = useState([
    { id: 1, name: "Market Data Filter", type: "financial", status: "active", processed: 2847, accuracy: 94.2 },
    { id: 2, name: "News Sentiment Filter", type: "nlp", status: "active", processed: 5621, accuracy: 87.8 },
    { id: 3, name: "Weather Data Filter", type: "environmental", status: "paused", processed: 1234, accuracy: 96.1 },
    { id: 4, name: "Social Media Filter", type: "social", status: "error", processed: 0, accuracy: 0 }
  ]);

  const dataSources = [
    { name: "Reuters API", status: "connected", lastSync: "2 min ago", records: 1247 },
    { name: "Bloomberg Terminal", status: "connected", lastSync: "5 min ago", records: 856 },
    { name: "Weather API", status: "error", lastSync: "2 hours ago", records: 0 },
    { name: "X API", status: "connected", lastSync: "1 min ago", records: 3421 }
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
        <title>Data Extraction & Filtering - Admin - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Configure data extraction filters and processing rules."
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
                      Data
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Extraction</span>
                    </h1>
                    <p className="text-xl text-gray-600">
                      Configure data extraction filters and processing rules.
                    </p>
                  </div>
                </div>
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-blue-600 mb-2">
                      <Database className="h-8 w-8 mx-auto" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">9.7K</div>
                    <div className="text-sm text-gray-600">Records Processed</div>
                  </CardContent>
                </Card>
                <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-green-600 mb-2">
                      <Filter className="h-8 w-8 mx-auto" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">91.2%</div>
                    <div className="text-sm text-gray-600">Filter Accuracy</div>
                  </CardContent>
                </Card>
                <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-purple-600 mb-2">
                      <Zap className="h-8 w-8 mx-auto" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">3</div>
                    <div className="text-sm text-gray-600">Active Filters</div>
                  </CardContent>
                </Card>
                <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-orange-600 mb-2">
                      <Clock className="h-8 w-8 mx-auto" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">2.3s</div>
                    <div className="text-sm text-gray-600">Avg Processing</div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* Data Filters */}
              <motion.div
                variants={itemVariants}
              >
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Data Filters
                    </CardTitle>
                    <CardDescription>
                      Active data processing filters
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filters.map((filter) => (
                        <div key={filter.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{filter.name}</div>
                            <div className="text-sm text-gray-600">
                              {filter.processed.toLocaleString()} processed • {filter.accuracy}% accuracy
                            </div>
                            <Badge variant="outline" className="mt-1">
                              {filter.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={
                              filter.status === 'active' ? 'bg-green-100 text-green-700' :
                              filter.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }>
                              {filter.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {filter.status === 'paused' && <Pause className="h-3 w-3 mr-1" />}
                              {filter.status === 'error' && <AlertTriangle className="h-3 w-3 mr-1" />}
                              {filter.status}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              {filter.status === 'paused' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Data Sources */}
              <motion.div
                variants={itemVariants}
              >
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Data Sources
                    </CardTitle>
                    <CardDescription>
                      Connected data sources and APIs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dataSources.map((source, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{source.name}</div>
                            <div className="text-sm text-gray-600">
                              Last sync: {source.lastSync}
                            </div>
                            <div className="text-sm text-gray-500">
                              {source.records.toLocaleString()} records
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={
                              source.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }>
                              {source.status === 'connected' ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <AlertTriangle className="h-3 w-3 mr-1" />
                              )}
                              {source.status}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Processing Rules */}
            <motion.div
              variants={itemVariants}
            >
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Processing Rules
                  </CardTitle>
                  <CardDescription>
                    Configure data processing and extraction rules
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Text Processing</h4>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="rounded border-gray-300" checked />
                          <span className="text-sm">Remove HTML tags</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="rounded border-gray-300" checked />
                          <span className="text-sm">Normalize whitespace</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="rounded border-gray-300" />
                          <span className="text-sm">Extract entities</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="rounded border-gray-300" checked />
                          <span className="text-sm">Sentiment analysis</span>
                        </label>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-medium">Quality Filters</h4>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="rounded border-gray-300" checked />
                          <span className="text-sm">Minimum length requirement</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="rounded border-gray-300" checked />
                          <span className="text-sm">Duplicate detection</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="rounded border-gray-300" />
                          <span className="text-sm">Language detection</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="rounded border-gray-300" checked />
                          <span className="text-sm">Spam filtering</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <Button>
                      Save Configuration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
    </>
  );
};

export default ExtractionFiltering;