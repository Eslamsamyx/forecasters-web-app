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
  Radio,
  Settings,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Rss,
  Mail,
  MessageSquare,
  Bell
} from "lucide-react";

const SecondaryChannels: NextPage = () => {
  const [channels, setChannels] = useState([
    {
      id: 1,
      name: "Email Newsletter",
      type: "email",
      status: "active",
      subscribers: 1247,
      lastActivity: "2 hours ago",
      config: { frequency: "weekly", template: "default" }
    },
    {
      id: 2,
      name: "RSS Feed",
      type: "rss",
      status: "active",
      subscribers: 856,
      lastActivity: "5 minutes ago",
      config: { format: "full", categories: ["all"] }
    },
    {
      id: 3,
      name: "Discord Notifications",
      type: "discord",
      status: "error",
      subscribers: 234,
      lastActivity: "1 day ago",
      config: { webhook: "https://discord.com/api/webhooks/..." }
    },
    {
      id: 4,
      name: "Slack Integration",
      type: "slack",
      status: "paused",
      subscribers: 45,
      lastActivity: "3 days ago",
      config: { channel: "#predictions", format: "summary" }
    },
    {
      id: 5,
      name: "Telegram Bot",
      type: "telegram",
      status: "active",
      subscribers: 567,
      lastActivity: "1 hour ago",
      config: { botToken: "1234567890:ABC...", chatId: "@predictions_channel" }
    }
  ]);

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-5 w-5" />;
      case 'rss':
        return <Rss className="h-5 w-5" />;
      case 'discord':
      case 'slack':
      case 'telegram':
        return <MessageSquare className="h-5 w-5" />;
      default:
        return <Radio className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'paused':
        return 'bg-yellow-100 text-yellow-700';
      case 'error':
        return 'bg-red-100 text-red-700';
      case 'disabled':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'paused':
        return <AlertTriangle className="h-4 w-4" />;
      case 'error':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Radio className="h-4 w-4" />;
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
        <title>Secondary Channels - Admin - Prediction Prism Analytics</title>
        <meta name="description" content="Configure secondary communication channels and integrations." />
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
                      Secondary
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Channels</span>
                    </h1>
                    <p className="text-xl text-gray-600">
                      Manage communication channels and integrations.
                    </p>
                  </div>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Channel
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-blue-600 mb-2">
                      <Radio className="h-8 w-8 mx-auto" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">5</div>
                    <div className="text-sm text-gray-600">Total Channels</div>
                  </CardContent>
                </Card>
                <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-green-600 mb-2">
                      <CheckCircle className="h-8 w-8 mx-auto" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">3</div>
                    <div className="text-sm text-gray-600">Active</div>
                  </CardContent>
                </Card>
                <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-purple-600 mb-2">
                      <Bell className="h-8 w-8 mx-auto" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">2,949</div>
                    <div className="text-sm text-gray-600">Total Subscribers</div>
                  </CardContent>
                </Card>
                <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-orange-600 mb-2">
                      <ExternalLink className="h-8 w-8 mx-auto" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">1,247</div>
                    <div className="text-sm text-gray-600">Messages Sent</div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Channels List */}
            <motion.div variants={itemVariants}>
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Radio className="h-5 w-5" />
                    Communication Channels
                  </CardTitle>
                  <CardDescription>
                    Manage all secondary communication channels and integrations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {channels.map((channel) => (
                      <motion.div
                        key={channel.id}
                        className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                              {getChannelIcon(channel.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">{channel.name}</h3>
                                <Badge className={getStatusColor(channel.status)}>
                                  {getStatusIcon(channel.status)}
                                  <span className="ml-1">{channel.status}</span>
                                </Badge>
                                <Badge variant="outline" className="capitalize">
                                  {channel.type}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                                <div>
                                  <div className="text-gray-500">Subscribers</div>
                                  <div className="font-medium">{channel.subscribers.toLocaleString()}</div>
                                </div>
                                <div>
                                  <div className="text-gray-500">Last Activity</div>
                                  <div className="font-medium">{channel.lastActivity}</div>
                                </div>
                                <div>
                                  <div className="text-gray-500">Configuration</div>
                                  <div className="font-medium text-xs">
                                    {Object.entries(channel.config).map(([key, value]) => (
                                      <div key={key} className="text-gray-600">
                                        {key}: {typeof value === 'string' && value.length > 20
                                          ? `${value.substring(0, 20)}...`
                                          : String(value)
                                        }
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Status-specific information */}
                              {channel.status === 'error' && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                                  <div className="flex items-center gap-2 text-red-800 text-sm">
                                    <XCircle className="h-4 w-4" />
                                    <span>Connection failed - webhook URL may be invalid</span>
                                  </div>
                                </div>
                              )}

                              {channel.status === 'paused' && (
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                                  <div className="flex items-center gap-2 text-yellow-800 text-sm">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span>Channel is temporarily paused</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Available Channel Types</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-blue-800">
                        <Mail className="h-4 w-4" />
                        <span>Email Newsletter</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-800">
                        <Rss className="h-4 w-4" />
                        <span>RSS Feed</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-800">
                        <MessageSquare className="h-4 w-4" />
                        <span>Discord</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-800">
                        <MessageSquare className="h-4 w-4" />
                        <span>Slack</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-800">
                        <MessageSquare className="h-4 w-4" />
                        <span>Telegram</span>
                      </div>
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

export default SecondaryChannels;