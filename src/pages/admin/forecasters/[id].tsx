"use client";

import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  User,
  ShieldCheck,
  Target,
  BarChart3,
  Globe,
  Twitter,
  ExternalLink,
  Calendar,
  Award,
  TrendingUp,
  Clock,
  Edit,
  Ban,
  CheckCircle,
  Settings
} from "lucide-react";

const ForecasterDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  // Fetch forecaster details
  const { data: forecaster, isLoading, error } = api.admin.getForecaster.useQuery(
    { id: id as string },
    { enabled: !!id }
  );

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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading forecaster details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !forecaster) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Forecaster not found</h3>
          <p className="text-gray-600 mb-4">The forecaster you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/admin/forecasters">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forecasters
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{forecaster.name} - Forecaster Details - Admin - Prediction Prism Analytics</title>
        <meta
          name="description"
          content={`View detailed information about forecaster ${forecaster.name}`}
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
                  <Link href="/admin/forecasters">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                    Forecaster
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Details</span>
                  </h1>
                  <p className="text-xl text-gray-600">
                    View and manage forecaster profile and performance.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" asChild>
                  <Link href={`/admin/forecasters/${forecaster.id}/channels`}>
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Channels
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/admin/forecasters/${forecaster.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
                {forecaster.isVerified ? (
                  <Button variant="outline">
                    <Ban className="h-4 w-4 mr-2" />
                    Suspend
                  </Button>
                ) : (
                  <Button>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Info */}
            <motion.div className="lg:col-span-1" variants={itemVariants}>
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20 mb-6">
                <CardHeader className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                    {forecaster.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <CardTitle className="flex items-center justify-center gap-2">
                    {forecaster.name}
                    {forecaster.isVerified && (
                      <ShieldCheck className="h-5 w-5 text-green-600" />
                    )}
                  </CardTitle>
                  <CardDescription>@{forecaster.slug}</CardDescription>
                </CardHeader>
                <CardContent>
                  {forecaster.bio && (
                    <p className="text-sm text-gray-600 mb-4">{forecaster.bio}</p>
                  )}

                  {/* Expertise */}
                  {forecaster.expertise && forecaster.expertise.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Expertise</h4>
                      <div className="flex flex-wrap gap-1">
                        {forecaster.expertise.map((skill: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Links */}
                  {forecaster.links && Object.keys(forecaster.links).length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Links</h4>
                      <div className="space-y-2">
                        {forecaster.links.website && (
                          <a
                            href={forecaster.links.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Globe className="h-3 w-3" />
                            Website
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {forecaster.links.twitter && (
                          <a
                            href={forecaster.links.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Twitter className="h-3 w-3" />
                            X
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Member since */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-3 w-3" />
                    <span>Joined {new Date(forecaster.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Column - Performance & Activity */}
            <motion.div className="lg:col-span-2 space-y-6" variants={itemVariants}>
              {/* Performance Metrics */}
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>
                    Key performance indicators and statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Target className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{forecaster.accuracy}%</div>
                      <div className="text-sm text-gray-600">Accuracy</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{forecaster.totalPredictions}</div>
                      <div className="text-sm text-gray-600">Total Predictions</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Award className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{forecaster.correctPredictions}</div>
                      <div className="text-sm text-gray-600">Correct</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <Clock className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">
                        {forecaster.brierScore ? forecaster.brierScore.toFixed(3) : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">Brier Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Predictions */}
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle>Recent Predictions</CardTitle>
                  <CardDescription>
                    Latest predictions made by this forecaster
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {forecaster.recentPredictions && forecaster.recentPredictions.length > 0 ? (
                    <div className="space-y-4">
                      {forecaster.recentPredictions.map((prediction: any) => (
                        <div key={prediction.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-gray-900">
                                  {prediction.asset?.symbol || 'Unknown Asset'}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {prediction.asset?.type || 'Unknown'}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600 mb-2">
                                <strong>Prediction:</strong> {prediction.prediction}
                              </div>
                              <div className="text-sm text-gray-600 mb-2">
                                <strong>Confidence:</strong> {Math.round(Number(prediction.confidence || 0) * 100)}%
                              </div>
                              {prediction.targetPrice && (
                                <div className="text-sm text-gray-600 mb-2">
                                  <strong>Target Price:</strong> ${prediction.targetPrice}
                                </div>
                              )}
                              {prediction.targetDate && (
                                <div className="text-sm text-gray-600">
                                  <strong>Target Date:</strong> {new Date(prediction.targetDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <Badge
                                className={
                                  prediction.outcome === 'CORRECT' ? 'bg-green-100 text-green-700' :
                                  prediction.outcome === 'INCORRECT' ? 'bg-red-100 text-red-700' :
                                  prediction.outcome === 'PARTIALLY_CORRECT' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                                }
                              >
                                {prediction.outcome}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No predictions yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ForecasterDetail;