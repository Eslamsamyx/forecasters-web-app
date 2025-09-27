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
  Mail,
  Send,
  Users,
  Calendar,
  BarChart3,
  Plus,
  Edit,
  Eye,
  Copy,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

const EmailManagement: NextPage = () => {
  const [activeTab, setActiveTab] = useState("campaigns");

  const campaigns = [
    { id: 1, name: "Weekly Prediction Digest", status: "sent", recipients: 1247, openRate: 24.3, clickRate: 3.2, sentAt: "2024-03-15" },
    { id: 2, name: "New Forecaster Spotlight", status: "scheduled", recipients: 856, openRate: null, clickRate: null, sentAt: "2024-03-16" },
    { id: 3, name: "Q4 Market Analysis", status: "draft", recipients: 0, openRate: null, clickRate: null, sentAt: null }
  ];

  const templates = [
    { id: 1, name: "Welcome Email", type: "transactional", usage: 245 },
    { id: 2, name: "Password Reset", type: "transactional", usage: 89 },
    { id: 3, name: "Weekly Digest", type: "marketing", usage: 52 },
    { id: 4, name: "Prediction Alert", type: "notification", usage: 134 }
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
        <title>Email Management - Admin - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Manage email campaigns, templates, and communication settings."
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
                      Email
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Management</span>
                    </h1>
                    <p className="text-xl text-gray-600">
                      Manage email campaigns and communication.
                    </p>
                  </div>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Campaign
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-blue-600 mb-2">
                      <Mail className="h-8 w-8 mx-auto" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">1,247</div>
                    <div className="text-sm text-gray-600">Total Subscribers</div>
                  </CardContent>
                </Card>
                <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-green-600 mb-2">
                      <Send className="h-8 w-8 mx-auto" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">52</div>
                    <div className="text-sm text-gray-600">Campaigns Sent</div>
                  </CardContent>
                </Card>
                <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-purple-600 mb-2">
                      <BarChart3 className="h-8 w-8 mx-auto" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">24.3%</div>
                    <div className="text-sm text-gray-600">Avg Open Rate</div>
                  </CardContent>
                </Card>
                <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-orange-600 mb-2">
                      <Users className="h-8 w-8 mx-auto" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">3.2%</div>
                    <div className="text-sm text-gray-600">Avg Click Rate</div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Email Campaigns */}
            <motion.div
              className="mb-12"
              variants={itemVariants}
            >
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Email Campaigns
                  </CardTitle>
                  <CardDescription>
                    Manage your email marketing campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div>
                          <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span>{campaign.recipients.toLocaleString()} recipients</span>
                            {campaign.openRate && <span>{campaign.openRate}% open rate</span>}
                            {campaign.clickRate && <span>{campaign.clickRate}% click rate</span>}
                          </div>
                          {campaign.sentAt && (
                            <div className="text-xs text-gray-500 mt-1">
                              Sent on {new Date(campaign.sentAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={
                            campaign.status === 'sent' ? 'bg-green-100 text-green-700' :
                            campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }>
                            {campaign.status === 'sent' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {campaign.status === 'scheduled' && <Clock className="h-3 w-3 mr-1" />}
                            {campaign.status === 'draft' && <Edit className="h-3 w-3 mr-1" />}
                            {campaign.status}
                          </Badge>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Email Templates */}
              <motion.div
                variants={itemVariants}
              >
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Email Templates
                    </CardTitle>
                    <CardDescription>
                      Reusable email templates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {templates.map((template) => (
                        <div key={template.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{template.name}</div>
                            <div className="text-sm text-gray-600">
                              <Badge variant="outline" className="mr-2">{template.type}</Badge>
                              Used {template.usage} times
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Template
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Email Settings */}
              <motion.div
                variants={itemVariants}
              >
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle>Email Settings</CardTitle>
                    <CardDescription>
                      Configure email delivery settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3">SMTP Configuration</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Server Status</span>
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Daily Limit</span>
                          <span>10,000 emails</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Today's Usage</span>
                          <span>2,847 sent</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Delivery Health</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Delivery Rate</span>
                            <span>98.5%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '98.5%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Bounce Rate</span>
                            <span>1.2%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '1.2%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Complaint Rate</span>
                            <span>0.3%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: '0.3%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button variant="outline" className="w-full">
                        Configure Settings
                      </Button>
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

export default EmailManagement;