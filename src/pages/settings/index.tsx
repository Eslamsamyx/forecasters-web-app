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
  Settings as SettingsIcon,
  User,
  CreditCard,
  Bell,
  Shield,
  Download,
  Upload,
  Trash2,
  HelpCircle,
  ExternalLink,
  ArrowRight,
  Activity,
  BarChart3,
  Users,
  Target,
  Crown,
  Zap
} from "lucide-react";

const Settings: NextPage = () => {
  const [user] = useState({
    name: "John Doe",
    email: "john@example.com",
    plan: "Premium",
    joinDate: "2024-01-15",
    avatar: "JD"
  });

  const settingsCategories = [
    {
      id: "profile",
      title: "Profile Settings",
      description: "Manage your personal information, preferences, and public profile",
      icon: <User className="h-6 w-6" />,
      href: "/settings/profile",
      color: "from-blue-500 to-blue-600",
      badge: null,
      items: [
        "Personal information",
        "Profile picture",
        "Bio and preferences",
        "Display settings"
      ]
    },
    {
      id: "billing",
      title: "Billing & Subscription",
      description: "View and manage your subscription, billing details, and payment methods",
      icon: <CreditCard className="h-6 w-6" />,
      href: "/settings/billing",
      color: "from-green-500 to-green-600",
      badge: user.plan,
      items: [
        "Subscription plan",
        "Payment methods",
        "Billing history",
        "Usage limits"
      ]
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Configure email, push, and in-app notification preferences",
      icon: <Bell className="h-6 w-6" />,
      href: "/settings/notifications",
      color: "from-purple-500 to-purple-600",
      badge: null,
      items: [
        "Email notifications",
        "Push notifications",
        "Alert preferences",
        "Frequency settings"
      ]
    },
    {
      id: "security",
      title: "Security & Privacy",
      description: "Manage your password, two-factor authentication, and privacy settings",
      icon: <Shield className="h-6 w-6" />,
      href: "/settings/security",
      color: "from-red-500 to-red-600",
      badge: null,
      items: [
        "Password management",
        "Two-factor authentication",
        "Login history",
        "Privacy controls"
      ]
    }
  ];

  const quickActions = [
    {
      title: "Download Data",
      description: "Export your account data",
      icon: <Download className="h-5 w-5" />,
      action: "Export",
      color: "text-blue-600"
    },
    {
      title: "Import Watchlist",
      description: "Import existing watchlists",
      icon: <Upload className="h-5 w-5" />,
      action: "Import",
      color: "text-green-600"
    },
    {
      title: "Delete Account",
      description: "Permanently delete your account",
      icon: <Trash2 className="h-5 w-5" />,
      action: "Delete",
      color: "text-red-600"
    },
    {
      title: "Get Help",
      description: "Contact support team",
      icon: <HelpCircle className="h-5 w-5" />,
      action: "Contact",
      color: "text-purple-600"
    }
  ];

  const recentActivity = [
    {
      action: "Updated payment method",
      timestamp: "2 hours ago",
      icon: <CreditCard className="h-4 w-4" />
    },
    {
      action: "Changed notification settings",
      timestamp: "1 day ago",
      icon: <Bell className="h-4 w-4" />
    },
    {
      action: "Updated security settings",
      timestamp: "3 days ago",
      icon: <Shield className="h-4 w-4" />
    },
    {
      action: "Updated profile information",
      timestamp: "1 week ago",
      icon: <User className="h-4 w-4" />
    }
  ];

  const accountStats = [
    {
      label: "Account Created",
      value: new Date(user.joinDate).toLocaleDateString(),
      icon: <Activity className="h-5 w-5" />
    },
    {
      label: "Current Plan",
      value: user.plan,
      icon: <Crown className="h-5 w-5" />
    },
    {
      label: "Total Predictions",
      value: "156",
      icon: <Target className="h-5 w-5" />
    },
    {
      label: "Accuracy Rate",
      value: "87%",
      icon: <BarChart3 className="h-5 w-5" />
    }
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
        <title>Settings - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Manage your account settings, preferences, billing, and security options."
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
                <div>
                  <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                    Account
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Settings</span>
                  </h1>
                  <p className="text-xl text-gray-600">
                    Manage your account preferences, security, and billing settings.
                  </p>
                </div>
                <div className="text-right">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2">
                    {user.avatar}
                  </div>
                  <div className="text-sm text-gray-600">{user.name}</div>
                  <Badge className="bg-green-100 text-green-700 mt-1">
                    <Crown className="h-3 w-3 mr-1" />
                    {user.plan}
                  </Badge>
                </div>
              </div>

              {/* Account Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {accountStats.map((stat, index) => (
                  <Card key={index} className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center text-blue-600 mb-2">
                        {stat.icon}
                      </div>
                      <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs text-gray-600">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* Settings Categories */}
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
              variants={itemVariants}
            >
              {settingsCategories.map((category) => (
                <motion.div
                  key={category.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20 h-full hover:shadow-2xl transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-3">
                        <motion.div
                          className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center text-white`}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          {category.icon}
                        </motion.div>
                        {category.badge && (
                          <Badge className="bg-blue-100 text-blue-700">
                            {category.badge}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        {category.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                      <Button className="w-full" asChild>
                        <Link href={category.href}>
                          Configure
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Quick Actions */}
              <motion.div
                className="lg:col-span-2"
                variants={itemVariants}
              >
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>
                      Common account management tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {quickActions.map((action, index) => (
                        <motion.div
                          key={index}
                          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`${action.color}`}>
                                {action.icon}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{action.title}</div>
                                <div className="text-sm text-gray-600">{action.description}</div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              {action.action}
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* System Status */}
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20 mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      System Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-gray-700">API Status</span>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Operational</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-gray-700">Data Sync</span>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-gray-700">Notifications</span>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-700">Maintenance</Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      <ExternalLink className="mr-2 h-3 w-3" />
                      View Status Page
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                variants={itemVariants}
              >
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>
                      Your recent account changes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                            {activity.icon}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{activity.action}</div>
                            <div className="text-xs text-gray-500">{activity.timestamp}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      View All Activity
                    </Button>
                  </CardContent>
                </Card>

                {/* Account Health */}
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20 mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Account Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-700">Security Score</span>
                          <span className="text-sm font-medium">85/100</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-700">Profile Complete</span>
                          <span className="text-sm font-medium">90%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Shield className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                          <strong>Recommendation:</strong> Enable 2FA to improve your security score.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Help Section */}
            <motion.div
              className="mt-16 text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white"
              variants={itemVariants}
            >
              <HelpCircle className="h-16 w-16 mx-auto mb-6 opacity-80" />
              <h2 className="text-3xl font-bold mb-4">Need Help?</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Can't find what you're looking for? Our support team is here to help
                you with any questions about your account settings.
              </p>
              <div className="flex justify-center">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
                  <Link href="/contact">
                    <HelpCircle className="mr-2 h-5 w-5" />
                    Contact Support
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
    </>
  );
};

export default Settings;