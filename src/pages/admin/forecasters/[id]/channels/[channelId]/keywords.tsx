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
  Tag,
  Shield,
  Eye,
  EyeOff,
  Crown,
  Settings,
  Trash2,
  Edit,
  Save,
  X,
  Loader2,
  Youtube,
  Twitter,
  Globe,
  AlertTriangle,
  Info
} from "lucide-react";

const ChannelKeywords: NextPage = () => {
  const router = useRouter();
  const { id: forecasterId, channelId } = router.query;

  const [showAddKeyword, setShowAddKeyword] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [editingKeyword, setEditingKeyword] = useState<{ id: string; keyword: string } | null>(null);

  // Fetch channel details
  const { data: channels } = api.forecasters.getChannels.useQuery(
    forecasterId as string,
    { enabled: !!forecasterId }
  );

  const channel = channels?.find(c => c.id === channelId);

  // Fetch forecaster details
  const { data: forecaster } = api.admin.getForecaster.useQuery(
    { id: forecasterId as string },
    { enabled: !!forecasterId }
  );

  // Fetch keywords
  const { data: keywords, isLoading: keywordsLoading, refetch: refetchKeywords } = api.forecasters.getChannelKeywords.useQuery(
    channelId as string,
    { enabled: !!channelId }
  );

  // Mutations
  const addKeywordMutation = api.forecasters.addChannelKeyword.useMutation({
    onSuccess: () => {
      toast.success("Keyword added successfully!");
      setNewKeyword("");
      setShowAddKeyword(false);
      refetchKeywords();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add keyword");
    },
  });

  const updateKeywordMutation = api.forecasters.updateChannelKeyword.useMutation({
    onSuccess: () => {
      toast.success("Keyword updated successfully!");
      setEditingKeyword(null);
      refetchKeywords();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update keyword");
    },
  });

  const deleteKeywordMutation = api.forecasters.deleteChannelKeyword.useMutation({
    onSuccess: () => {
      toast.success("Keyword deleted successfully!");
      refetchKeywords();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete keyword");
    },
  });

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
  if (keywordsLoading || !channel || !forecaster) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading keyword data...</p>
        </div>
      </div>
    );
  }

  // Error state - Primary channel shouldn't have keywords
  if (channel.isPrimary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Primary Channel</h3>
          <p className="text-gray-600 mb-4">Primary channels collect all content and don't use keyword filtering.</p>
          <Button asChild>
            <Link href={`/admin/forecasters/${forecasterId}/channels`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Channels
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

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) {
      toast.error("Keyword cannot be empty");
      return;
    }

    addKeywordMutation.mutate({
      channelId: channelId as string,
      keyword: newKeyword.trim(),
      isActive: true,
    });
  };

  const handleUpdateKeyword = () => {
    if (!editingKeyword || !editingKeyword.keyword.trim()) {
      toast.error("Keyword cannot be empty");
      return;
    }

    updateKeywordMutation.mutate({
      keywordId: editingKeyword.id,
      keyword: editingKeyword.keyword.trim(),
    });
  };

  const handleDeleteKeyword = (keywordId: string) => {
    if (confirm("Are you sure you want to delete this keyword?")) {
      deleteKeywordMutation.mutate(keywordId);
    }
  };

  const toggleKeywordStatus = (keywordId: string, currentStatus: boolean) => {
    updateKeywordMutation.mutate({
      keywordId,
      isActive: !currentStatus,
    });
  };

  return (
    <>
      <Head>
        <title>{channel.channelName || channel.channelId} - Keywords - Admin - Prediction Prism Analytics</title>
        <meta
          name="description"
          content={`Manage keywords for ${channel.channelName || channel.channelId}`}
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
                  <Link href={`/admin/forecasters/${forecasterId}/channels`}>
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                    Keyword
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Management</span>
                  </h1>
                  <div className="flex items-center gap-2 text-xl text-gray-600">
                    {getChannelIcon(channel.channelType)}
                    <span>{channel.channelName || channel.channelId}</span>
                    <Badge variant="secondary" className="ml-2">
                      <Tag className="h-3 w-3 mr-1" />
                      Secondary Channel
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setShowAddKeyword(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Keyword
              </Button>
            </div>
          </motion.div>

          {/* Channel Info */}
          <motion.div className="mb-8" variants={itemVariants}>
            <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  How Keywords Work
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>
                    <strong>Secondary channels</strong> only collect content that contains at least one of the configured keywords in the title or description.
                  </p>
                  <p>
                    <strong>Default behavior:</strong> The forecaster's name ("{forecaster.name}") is automatically included as a default keyword.
                  </p>
                  <p>
                    <strong>Matching:</strong> Keywords are case-insensitive and match partial words.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Keywords Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
            variants={itemVariants}
          >
            {keywords && keywords.length > 0 ? (
              keywords.map((keyword: any) => (
                <Card key={keyword.id} className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardContent className="p-4">
                    {editingKeyword?.id === keyword.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editingKeyword?.keyword || ""}
                          onChange={(e) => setEditingKeyword(prev => prev ? { ...prev, keyword: e.target.value } : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter keyword..."
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={handleUpdateKeyword}
                            disabled={updateKeywordMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {updateKeywordMutation.isPending ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <Save className="h-3 w-3 mr-1" />
                            )}
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingKeyword(null)}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{keyword.keyword}</span>
                          {keyword.isDefault && (
                            <Badge variant="default" className="bg-blue-100 text-blue-800">
                              <Crown className="h-3 w-3 mr-1" />
                              Default
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {keyword.isActive ? (
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

                          <div className="flex items-center gap-1">
                            {!keyword.isDefault && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingKeyword({ id: keyword.id, keyword: keyword.keyword })}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteKeyword(keyword.id)}
                                  disabled={deleteKeywordMutation.isPending}
                                >
                                  <Trash2 className="h-3 w-3 text-red-500" />
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleKeywordStatus(keyword.id, keyword.isActive)}
                              disabled={updateKeywordMutation.isPending}
                            >
                              {keyword.isActive ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="text-xs text-gray-500">
                          Added {new Date(keyword.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Tag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No keywords configured</h3>
                <p className="text-gray-600 mb-4">
                  Add keywords to filter content from this secondary channel.
                </p>
                <Button onClick={() => setShowAddKeyword(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Keyword
                </Button>
              </div>
            )}
          </motion.div>

          {/* Add Keyword Modal */}
          {showAddKeyword && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowAddKeyword(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-lg p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Add New Keyword</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddKeyword(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Keyword
                    </label>
                    <input
                      type="text"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddKeyword()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter keyword..."
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Content matching this keyword will be collected from the channel.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddKeyword(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddKeyword}
                      disabled={addKeywordMutation.isPending || !newKeyword.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {addKeywordMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Add Keyword
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default ChannelKeywords;

// Force server-side rendering to avoid SSG issues with useRouter in Next.js 16
export async function getServerSideProps() {
  return { props: {} };
}