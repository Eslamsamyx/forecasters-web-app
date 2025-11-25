"use client";

import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  Search,
  Filter,
  Users,
  Star,
  TrendingUp,
  BarChart3,
  Eye,
  Shield,
  ShieldCheck,
  User,
  Calendar,
  Loader2,
  Globe,
  Twitter,
  ExternalLink,
  CheckCircle,
  XCircle,
  Plus
} from "lucide-react";

const ForecastersManagement: NextPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch forecasters from database using tRPC
  const { data: forecastersData, isLoading, error, refetch } = api.admin.getForecasters.useQuery({
    page: currentPage,
    limit: 20,
    search: searchTerm || undefined,
    verified: selectedFilter === "verified" ? true : selectedFilter === "unverified" ? false : undefined,
  });

  // Mutation for updating verification status
  const updateVerificationMutation = api.admin.updateForecasterVerification.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update verification status");
    },
  });

  const forecasters = forecastersData?.forecasters || [];
  const pagination = forecastersData?.pagination;

  const handleVerificationToggle = (forecasterId: string, currentStatus: boolean) => {
    updateVerificationMutation.mutate({
      id: forecasterId,
      isVerified: !currentStatus,
    });
  };

  const getAccuracyColor = (accuracy: number) => {
    const percent = accuracy * 100;
    if (percent >= 80) return 'text-green-600';
    if (percent >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyBadgeColor = (accuracy: number) => {
    const percent = accuracy * 100;
    if (percent >= 80) return 'bg-green-100 text-green-700';
    if (percent >= 60) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
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

  // Loading state
  if (isLoading) {
    return (
      <>
        <Head>
          <title>Loading Forecasters - Admin</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">Loading forecasters...</span>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Head>
          <title>Error - Forecasters - Admin</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Forecasters</h1>
            <p className="text-gray-600 mb-6">{error.message}</p>
            <Button onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Forecasters Management - Admin - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Manage forecasters, verify accounts, and monitor performance metrics."
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
                      Forecasters
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Management</span>
                    </h1>
                    <p className="text-xl text-gray-600">
                      Manage forecaster accounts, verification status, and performance metrics.
                    </p>
                  </div>
                </div>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/admin/forecasters/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Forecaster
                  </Link>
                </Button>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="shadow-lg bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Forecasters</p>
                        <p className="text-2xl font-bold text-gray-900">{pagination?.total || 0}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Verified</p>
                        <p className="text-2xl font-bold text-green-600">
                          {forecasters.filter(f => f.isVerified).length}
                        </p>
                      </div>
                      <ShieldCheck className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg Accuracy</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {forecasters.length > 0
                            ? Math.round(forecasters.reduce((acc, f) => acc + f.accuracy * 100, 0) / forecasters.length)
                            : 0}%
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Predictions</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {forecasters.reduce((acc, f) => acc + f.totalPredictions, 0).toLocaleString()}
                        </p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search forecasters..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Forecasters</option>
                  <option value="verified">Verified Only</option>
                  <option value="unverified">Unverified Only</option>
                </select>
              </div>
            </motion.div>

            {/* Forecasters List */}
            <motion.div
              variants={itemVariants}
            >
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Forecasters ({forecasters.length})
                  </CardTitle>
                  <CardDescription>
                    Manage forecaster accounts and verification status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {forecasters.map((forecaster) => (
                      <motion.div
                        key={forecaster.id}
                        className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-start gap-4 mb-4">
                              {/* Avatar */}
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                {forecaster.avatar ? (
                                  <img
                                    src={forecaster.avatar}
                                    alt={forecaster.name}
                                    className="w-16 h-16 rounded-full object-cover"
                                  />
                                ) : (
                                  forecaster.name.charAt(0).toUpperCase()
                                )}
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {forecaster.name}
                                  </h3>
                                  {forecaster.isVerified && (
                                    <ShieldCheck className="h-5 w-5 text-green-600" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">@{forecaster.slug}</p>
                                {forecaster.bio && (
                                  <p className="text-sm text-gray-600 mb-3">{forecaster.bio}</p>
                                )}

                                {/* Expertise Tags */}
                                {forecaster.expertise && forecaster.expertise.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {forecaster.expertise.map((skill: string, index: number) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                {/* Links */}
                                {forecaster.links && (
                                  <div className="flex items-center gap-3 mb-3">
                                    {forecaster.links.website && (
                                      <a
                                        href={forecaster.links.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                                      >
                                        <Globe className="h-3 w-3" />
                                        Website
                                      </a>
                                    )}
                                    {forecaster.links.twitter && (
                                      <a
                                        href={forecaster.links.twitter}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                                      >
                                        <Twitter className="h-3 w-3" />
                                        X
                                      </a>
                                    )}
                                  </div>
                                )}

                                {/* Stats */}
                                <div className="flex items-center gap-6 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <BarChart3 className="h-3 w-3" />
                                    <span>{forecaster.totalPredictions} predictions</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    <span>{forecaster.correctPredictions} correct</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>Joined {new Date(forecaster.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-3">
                            {/* Accuracy Badge */}
                            <Badge className={getAccuracyBadgeColor(forecaster.accuracy)}>
                              {(forecaster.accuracy * 100).toFixed(1)}% accuracy
                            </Badge>

                            {/* Verification Toggle */}
                            <Button
                              variant={forecaster.isVerified ? "outline" : "default"}
                              size="sm"
                              onClick={() => handleVerificationToggle(forecaster.id, forecaster.isVerified)}
                              disabled={updateVerificationMutation.isPending}
                              className={forecaster.isVerified ? "border-green-600 text-green-600 hover:bg-green-50" : "bg-blue-600 hover:bg-blue-700"}
                            >
                              {updateVerificationMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : forecaster.isVerified ? (
                                <>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Unverify
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="h-4 w-4 mr-2" />
                                  Verify
                                </>
                              )}
                            </Button>

                            {/* View Details */}
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/forecasters/${forecaster.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {forecasters.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No forecasters found</h3>
                      <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
                    </div>
                  )}

                  {/* Pagination */}
                  {pagination && pagination.pages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} forecasters
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={pagination.page === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-gray-600">
                          Page {pagination.page} of {pagination.pages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                          disabled={pagination.page === pagination.pages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
    </>
  );
};

export default ForecastersManagement;

// Force server-side rendering to avoid SSG issues with useRouter in Next.js 16
export async function getServerSideProps() {
  return { props: {} };
}