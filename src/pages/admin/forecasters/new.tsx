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
import { useRouter } from "next/router";
import { AddChannelFormForNew } from "@/components/admin/AddChannelFormForNew";
import {
  ArrowLeft,
  Save,
  User,
  Star,
  Globe,
  Twitter,
  Tag,
  Shield,
  Loader2,
  X,
  Plus,
  Youtube,
  Crown,
  Link2,
  BarChart3,
  Trash2,
  Edit
} from "lucide-react";

interface ForecasterForm {
  name: string;
  bio: string;
  avatar: string;
  twitter: string;
  website: string;
  expertise: string[];
  isVerified: boolean;
}

interface ChannelData {
  channelType: "YOUTUBE" | "TWITTER";
  channelId: string;
  channelName: string;
  channelUrl: string;
  isPrimary: boolean;
  keywords: string[];
}

const NewForecaster: NextPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<ForecasterForm>({
    name: "",
    bio: "",
    avatar: "",
    twitter: "",
    website: "",
    expertise: [],
    isVerified: false
  });

  const [newExpertise, setNewExpertise] = useState("");
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [showAddChannel, setShowAddChannel] = useState(false);

  const createForecasterMutation = api.forecasters.create.useMutation({
    onSuccess: (data) => {
      toast.success("Forecaster created successfully!");
      router.push("/admin/forecasters");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create forecaster");
    },
  });

  const handleInputChange = (field: keyof ForecasterForm, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addExpertise = () => {
    if (newExpertise.trim() && !formData.expertise.includes(newExpertise.trim())) {
      setFormData(prev => ({
        ...prev,
        expertise: [...prev.expertise, newExpertise.trim()]
      }));
      setNewExpertise("");
    }
  };

  const removeExpertise = (expertiseToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.filter(exp => exp !== expertiseToRemove)
    }));
  };

  const removeChannel = (index: number) => {
    setChannels(prev => prev.filter((_, i) => i !== index));
  };

  const toggleChannelPrimary = (index: number) => {
    const channel = channels[index];
    if (!channel) return;

    // If setting to primary, unset other primaries of the same type
    if (!channel.isPrimary) {
      setChannels(prev => prev.map((ch, i) => {
        if (i === index) {
          return { ...ch, isPrimary: true, keywords: [] }; // Clear keywords for primary
        } else if (ch.channelType === channel.channelType) {
          return { ...ch, isPrimary: false };
        }
        return ch;
      }));
    } else {
      // Setting to secondary
      setChannels(prev => prev.map((ch, i) =>
        i === index ? { ...ch, isPrimary: false } : ch
      ));
    }
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error("Forecaster name is required");
      return;
    }

    createForecasterMutation.mutate({
      name: formData.name,
      bio: formData.bio || undefined,
      avatar: formData.avatar || undefined,
      twitter: formData.twitter || undefined,
      website: formData.website || undefined,
      expertise: formData.expertise,
      isVerified: formData.isVerified,
      channels: channels.map(ch => ({
        url: ch.channelUrl,
        isPrimary: ch.isPrimary,
        keywords: ch.keywords
      }))
    });
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

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "YOUTUBE":
        return <Youtube className="h-4 w-4 text-red-500" />;
      case "TWITTER":
        return <Twitter className="h-4 w-4 text-blue-500" />;
      default:
        return <Globe className="h-4 w-4 text-gray-500" />;
    }
  };

  // Handler for when a channel is added from the form
  const handleChannelAdded = (channelData: ChannelData) => {
    // Check for duplicates
    const isDuplicate = channels.some(ch =>
      ch.channelId === channelData.channelId &&
      ch.channelType === channelData.channelType
    );

    if (isDuplicate) {
      toast.error("This channel has already been added");
      return;
    }

    setChannels(prev => [...prev, channelData]);
    setShowAddChannel(false);
    toast.success(`Added ${channelData.channelType} channel: ${channelData.channelName || channelData.channelId}`);
  };

  return (
    <>
      <Head>
        <title>Add New Forecaster | Prediction Prism Analytics</title>
        <meta name="description" content="Add a new forecaster to the platform" />
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
                    Add New
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Forecaster</span>
                  </h1>
                  <p className="text-xl text-gray-600">
                    Create a new forecaster profile with their information and channels.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={createForecasterMutation.isPending || !formData.name.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createForecasterMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Create Forecaster
              </Button>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            variants={itemVariants}
          >
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="shadow-lg bg-white/90 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Enter the forecaster's basic profile information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter forecaster's full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter a brief biography..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      value={formData.avatar}
                      onChange={(e) => handleInputChange("avatar", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Channels */}
              <Card className="shadow-lg bg-white/90 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Link2 className="h-5 w-5" />
                        Content Channels
                      </CardTitle>
                      <CardDescription>
                        Add YouTube and X channels for content collection.
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => setShowAddChannel(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Channel
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Added Channels */}
                  {channels.length > 0 ? (
                    <div className="space-y-3">
                      {channels.map((channel, index) => (
                        <div key={index} className="p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getChannelIcon(channel.channelType)}
                              <div>
                                <span className="font-medium text-gray-900">
                                  {channel.channelName || channel.channelId}
                                </span>
                                <p className="text-xs text-gray-500">{channel.channelUrl}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {channel.isPrimary ? (
                                <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                                  <Crown className="h-3 w-3 mr-1" />
                                  Primary
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <Tag className="h-3 w-3 mr-1" />
                                  Secondary
                                </Badge>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleChannelPrimary(index)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeChannel(index)}
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          </div>
                          {!channel.isPrimary && channel.keywords.length > 0 && (
                            <div className="mt-2 pl-6">
                              <div className="flex flex-wrap gap-1">
                                {channel.keywords.map((keyword, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Youtube className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No channels added yet</p>
                      <p className="text-sm">Click "Add Channel" to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card className="shadow-lg bg-white/90 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Social Links
                  </CardTitle>
                  <CardDescription>
                    Add social media and website links for the forecaster profile.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      X Handle
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        @
                      </span>
                      <input
                        type="text"
                        value={formData.twitter}
                        onChange={(e) => handleInputChange("twitter", e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="username"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Expertise */}
              <Card className="shadow-lg bg-white/90 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Areas of Expertise
                  </CardTitle>
                  <CardDescription>
                    Add tags that describe the forecaster's areas of expertise.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newExpertise}
                      onChange={(e) => setNewExpertise(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addExpertise()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter expertise area (e.g., Bitcoin Analysis)"
                    />
                    <Button onClick={addExpertise} type="button" variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {formData.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.expertise.map((exp, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {exp}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-red-500"
                            onClick={() => removeExpertise(exp)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Settings */}
              <Card className="shadow-lg bg-white/90 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Settings
                  </CardTitle>
                  <CardDescription>
                    Configure forecaster settings and permissions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Verified Status</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.isVerified}
                      onChange={(e) => handleInputChange("isVerified", e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Mark this forecaster as verified to show a verification badge on their profile.
                  </p>
                </CardContent>
              </Card>

              {/* Channel Summary */}
              {channels.length > 0 && (
                <Card className="shadow-lg bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Channel Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Total Channels</span>
                        <span className="font-medium">{channels.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">YouTube Channels</span>
                        <span className="font-medium">
                          {channels.filter(ch => ch.channelType === "YOUTUBE").length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">X Channels</span>
                        <span className="font-medium">
                          {channels.filter(ch => ch.channelType === "TWITTER").length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Primary Channels</span>
                        <span className="font-medium">
                          {channels.filter(ch => ch.isPrimary).length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Preview */}
              <Card className="shadow-lg bg-white/90 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Preview
                  </CardTitle>
                  <CardDescription>
                    How the forecaster will appear on the platform.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                      {formData.name ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {formData.name || "Forecaster Name"}
                        </h3>
                        {formData.isVerified && (
                          <Shield className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {formData.bio || "Forecaster biography will appear here..."}
                      </p>
                      {formData.expertise.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {formData.expertise.slice(0, 2).map((exp, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {exp}
                            </Badge>
                          ))}
                          {formData.expertise.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{formData.expertise.length - 2} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Add Channel Modal - Collects channel data without saving to DB */}
          {showAddChannel && (
            <AddChannelFormForNew
              forecasterName={formData.name || "New Forecaster"}
              onSuccess={handleChannelAdded}
              onCancel={() => setShowAddChannel(false)}
              existingChannels={channels}
            />
          )}
        </div>
      </motion.div>
    </>
  );
};

export default NewForecaster;