"use client";

import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Youtube,
  Twitter,
  Settings,
  Eye,
  EyeOff,
  Crown,
  Shield,
  Clock,
  Play,
  Pause,
  Trash2,
  Edit,
  Tag,
  BarChart3,
  Globe
} from "lucide-react";
import { AddChannelForm } from "@/components/admin/AddChannelForm";

const ForecasterChannels: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const forecasterId = id as string;

  const [showAddChannel, setShowAddChannel] = useState(false);

  // Fetch forecaster details
  const { data: forecaster, isLoading: forecastersLoading } = api.admin.getForecaster.useQuery(
    { id: forecasterId },
    { enabled: !!forecasterId }
  );

  // Fetch channels
  const { data: channels, isLoading: channelsLoading, refetch: refetchChannels } = api.forecasters.getChannels.useQuery(
    forecasterId,
    { enabled: !!forecasterId }
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
  if (forecastersLoading || channelsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading channel data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!forecaster) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
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

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "YOUTUBE":
        return <Youtube className="h-5 w-5 text-red-500" />;
      case "TWITTER":
        return <Twitter className="h-5 w-5 text-blue-500" />;
      default:
        return <Globe className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatCheckInterval = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <>
      <Head>
        <title>{forecaster.name} - Channel Management - Admin - Prediction Prism Analytics</title>
        <meta
          name="description"
          content={`Manage ${forecaster.name}'s channels and collection settings`}
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
                  <Link href={`/admin/forecasters/${forecasterId}`}>
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                    Channel
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Management</span>
                  </h1>
                  <p className="text-xl text-gray-600">
                    Manage {forecaster.name}'s content collection channels.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowAddChannel(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Channel
              </Button>
            </div>
          </motion.div>

          {/* Channels Grid */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            variants={itemVariants}
          >
            {channels && channels.length > 0 ? (
              channels.map((channel: any) => (
                <Card key={channel.id} className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getChannelIcon(channel.channelType)}
                        <CardTitle className="text-lg">{channel.channelName || channel.channelId}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1">
                        {channel.isPrimary && (
                          <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                            <Crown className="h-3 w-3 mr-1" />
                            Primary
                          </Badge>
                        )}
                        {channel.isActive ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <Eye className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription>
                      {channel.channelType} • {channel.isPrimary ? 'All content' : 'Keyword filtered'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Channel URL */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Globe className="h-4 w-4" />
                        <a
                          href={channel.channelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 truncate"
                        >
                          {channel.channelUrl}
                        </a>
                      </div>

                      {/* Collection Settings */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>
                          Check every {formatCheckInterval((channel.collectionSettings as any)?.checkInterval || 3600)}
                        </span>
                      </div>

                      {/* Keywords Count (for secondary channels) */}
                      {!channel.isPrimary && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Tag className="h-4 w-4" />
                          <span>{channel._count?.keywords || 0} keywords</span>
                        </div>
                      )}

                      {/* Collection Jobs Count */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BarChart3 className="h-4 w-4" />
                        <span>{channel._count?.collectionJobs || 0} collection jobs</span>
                      </div>

                      {/* Last Checked */}
                      {(channel.collectionSettings as any)?.lastChecked ? (
                        <div className="text-xs text-gray-500">
                          Last checked: {new Date((channel.collectionSettings as any).lastChecked).toLocaleDateString()}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500">
                          Never checked
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-4">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/admin/forecasters/${forecasterId}/channels/${channel.id}`}>
                          <Settings className="h-3 w-3 mr-1" />
                          Manage
                        </Link>
                      </Button>

                      {!channel.isPrimary && (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/admin/forecasters/${forecasterId}/channels/${channel.id}/keywords`}>
                            <Tag className="h-3 w-3 mr-1" />
                            Keywords
                          </Link>
                        </Button>
                      )}

                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/admin/forecasters/${forecasterId}/channels/${channel.id}/jobs`}>
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Jobs
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Youtube className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No channels configured</h3>
                <p className="text-gray-600 mb-4">
                  Start by adding YouTube or X channels for {forecaster.name}.
                </p>
                <Button onClick={() => setShowAddChannel(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Channel
                </Button>
              </div>
            )}
          </motion.div>

          {/* Add Channel Modal */}
          {showAddChannel && (
            <AddChannelForm
              forecasterId={forecasterId}
              forecasterName={forecaster.name}
              onSuccess={() => {
                setShowAddChannel(false);
                refetchChannels();
              }}
              onCancel={() => setShowAddChannel(false)}
            />
          )}
        </div>
      </motion.div>
    </>
  );
};

export default ForecasterChannels;