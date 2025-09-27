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
  FileText,
  Users,
  MessageSquare,
  Flag,
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Clock
} from "lucide-react";

const ContentManagement: NextPage = () => {
  const [activeTab, setActiveTab] = useState("articles");

  const tabs = [
    { id: "articles", label: "Articles", icon: <FileText className="h-4 w-4" />, count: 198 },
    { id: "comments", label: "Comments", icon: <MessageSquare className="h-4 w-4" />, count: 1247 },
    { id: "reports", label: "Reports", icon: <Flag className="h-4 w-4" />, count: 23 },
    { id: "users", label: "User Content", icon: <Users className="h-4 w-4" />, count: 86 }
  ];

  const articles = [
    { id: 1, title: "Market Predictions for Q4 2024", author: "Dr. Sarah Chen", status: "published", reports: 0, views: 2847 },
    { id: 2, title: "AI Impact on Forecasting", author: "Michael Rodriguez", status: "draft", reports: 0, views: 0 },
    { id: 3, title: "Economic Indicators Deep Dive", author: "Prof. David Kim", status: "published", reports: 2, views: 1923 }
  ];

  const reports = [
    { id: 1, content: "Inappropriate content in article comments", type: "harassment", status: "pending", reported: "2 hours ago" },
    { id: 2, content: "Spam in prediction comments", type: "spam", status: "resolved", reported: "1 day ago" },
    { id: 3, content: "Misleading information in article", type: "misinformation", status: "investigating", reported: "3 days ago" }
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
        <title>Content Management - Admin - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Moderate and manage all platform content including articles, comments, and reports."
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
                      Content
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Management</span>
                    </h1>
                    <p className="text-xl text-gray-600">
                      Moderate and manage all platform content.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                      <Badge variant="secondary">{tab.count}</Badge>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div variants={itemVariants}>
              {activeTab === "articles" && (
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle>Articles Overview</CardTitle>
                    <CardDescription>Manage published and draft articles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {articles.map((article) => (
                        <div key={article.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <h3 className="font-medium text-gray-900">{article.title}</h3>
                            <div className="text-sm text-gray-500">by {article.author}</div>
                            <div className="flex items-center gap-4 mt-2">
                              <Badge className={article.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                                {article.status}
                              </Badge>
                              {article.reports > 0 && (
                                <Badge className="bg-red-100 text-red-700">
                                  {article.reports} reports
                                </Badge>
                              )}
                              <span className="text-xs text-gray-500">{article.views} views</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === "reports" && (
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle>Content Reports</CardTitle>
                    <CardDescription>Review and moderate reported content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reports.map((report) => (
                        <div key={report.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="font-medium text-gray-900">{report.content}</div>
                              <div className="text-sm text-gray-500">Reported {report.reported}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={
                                report.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                'bg-blue-100 text-blue-700'
                              }>
                                {report.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                                {report.status === 'resolved' && <CheckCircle className="h-3 w-3 mr-1" />}
                                {report.status === 'investigating' && <AlertTriangle className="h-3 w-3 mr-1" />}
                                {report.status}
                              </Badge>
                              <Badge variant="outline">{report.type}</Badge>
                            </div>
                          </div>
                          {report.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">Review</Button>
                              <Button size="sm">Take Action</Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === "comments" && (
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle>Comments Moderation</CardTitle>
                    <CardDescription>Review and moderate user comments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Comment moderation interface</h3>
                      <p className="text-gray-600">Advanced comment management tools would be implemented here.</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === "users" && (
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle>User-Generated Content</CardTitle>
                    <CardDescription>Manage content created by users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">User content overview</h3>
                      <p className="text-gray-600">Tools for managing user predictions, profiles, and contributions.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </motion.div>
    </>
  );
};

export default ContentManagement;