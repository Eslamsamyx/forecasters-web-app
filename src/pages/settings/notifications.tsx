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
  Bell,
  ArrowLeft,
  Mail,
  Smartphone,
  Globe,
  Clock,
  TrendingUp,
  User,
  Target,
  AlertTriangle,
  CheckCircle,
  Volume2,
  VolumeX,
  Calendar,
  DollarSign
} from "lucide-react";

const NotificationSettings: NextPage = () => {
  const [settings, setSettings] = useState({
    email: {
      predictions: true,
      forecasterUpdates: true,
      weeklyDigest: true,
      accountUpdates: true,
      marketing: false,
      security: true
    },
    push: {
      predictions: true,
      forecasterUpdates: false,
      weeklyDigest: false,
      accountUpdates: true,
      marketing: false,
      security: true
    },
    inApp: {
      predictions: true,
      forecasterUpdates: true,
      weeklyDigest: true,
      accountUpdates: true,
      marketing: true,
      security: true
    },
    frequency: {
      immediate: false,
      hourly: false,
      daily: true,
      weekly: false
    },
    quietHours: {
      enabled: true,
      start: "22:00",
      end: "08:00"
    },
    categories: {
      crypto: true,
      stocks: true,
      forex: false,
      commodities: false,
      economics: true
    }
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleToggle = (category: string, setting: string) => {
    setSettings(prev => {
      const currentCategory = (prev as any)[category];
      const currentValue = currentCategory[setting];
      return {
        ...prev,
        [category]: {
          ...currentCategory,
          [setting]: !currentValue
        }
      };
    });
    setHasChanges(true);
  };

  const handleFrequencyChange = (frequency: string) => {
    setSettings(prev => ({
      ...prev,
      frequency: Object.keys(prev.frequency).reduce((acc, key) => ({
        ...acc,
        [key]: key === frequency
      }), {} as any)
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setHasChanges(false);
  };

  const notificationTypes = [
    {
      id: "predictions",
      title: "New Predictions",
      description: "When forecasters you follow make new predictions",
      icon: <Target className="h-5 w-5" />,
      category: "Predictions"
    },
    {
      id: "forecasterUpdates",
      title: "Forecaster Updates",
      description: "Updates from your favorite forecasters",
      icon: <User className="h-5 w-5" />,
      category: "Social"
    },
    {
      id: "weeklyDigest",
      title: "Weekly Digest",
      description: "Summary of market predictions and performance",
      icon: <TrendingUp className="h-5 w-5" />,
      category: "Reports"
    },
    {
      id: "accountUpdates",
      title: "Account Updates",
      description: "Important updates about your account",
      icon: <AlertTriangle className="h-5 w-5" />,
      category: "Account"
    },
    {
      id: "marketing",
      title: "Marketing & Promotions",
      description: "New features, tips, and special offers",
      icon: <DollarSign className="h-5 w-5" />,
      category: "Marketing"
    },
    {
      id: "security",
      title: "Security Alerts",
      description: "Login attempts and security-related notifications",
      icon: <AlertTriangle className="h-5 w-5" />,
      category: "Security"
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
        <title>Notification Settings - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Configure your email, push, and in-app notification preferences and frequency."
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
              className="flex items-center justify-between mb-12"
              variants={itemVariants}
            >
              <div>
                <Button variant="ghost" className="mb-4" asChild>
                  <Link href="/settings">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Settings
                  </Link>
                </Button>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                  Notification
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Settings</span>
                </h1>
                <p className="text-xl text-gray-600">
                  Control how and when you receive notifications about predictions and updates.
                </p>
              </div>
              {hasChanges && (
                <Button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  Save Changes
                </Button>
              )}
            </motion.div>

            {/* Notification Methods */}
            <motion.div
              className="mb-8"
              variants={itemVariants}
            >
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Choose how you want to receive different types of notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-4 font-medium text-gray-900">Notification Type</th>
                          <th className="text-center py-4 font-medium text-gray-900 min-w-[100px]">
                            <div className="flex items-center justify-center gap-2">
                              <Mail className="h-4 w-4" />
                              Email
                            </div>
                          </th>
                          <th className="text-center py-4 font-medium text-gray-900 min-w-[100px]">
                            <div className="flex items-center justify-center gap-2">
                              <Smartphone className="h-4 w-4" />
                              Push
                            </div>
                          </th>
                          <th className="text-center py-4 font-medium text-gray-900 min-w-[100px]">
                            <div className="flex items-center justify-center gap-2">
                              <Globe className="h-4 w-4" />
                              In-App
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {notificationTypes.map((type) => (
                          <tr key={type.id} className="border-b border-gray-100">
                            <td className="py-4">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                                  {type.icon}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{type.title}</div>
                                  <div className="text-sm text-gray-600">{type.description}</div>
                                  <Badge variant="secondary" className="text-xs mt-1">
                                    {type.category}
                                  </Badge>
                                </div>
                              </div>
                            </td>
                            <td className="text-center py-4">
                              <button
                                onClick={() => handleToggle('email', type.id)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  settings.email[type.id as keyof typeof settings.email] ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  settings.email[type.id as keyof typeof settings.email] ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                              </button>
                            </td>
                            <td className="text-center py-4">
                              <button
                                onClick={() => handleToggle('push', type.id)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  settings.push[type.id as keyof typeof settings.push] ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  settings.push[type.id as keyof typeof settings.push] ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                              </button>
                            </td>
                            <td className="text-center py-4">
                              <button
                                onClick={() => handleToggle('inApp', type.id)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  settings.inApp[type.id as keyof typeof settings.inApp] ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  settings.inApp[type.id as keyof typeof settings.inApp] ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Frequency Settings */}
              <motion.div
                variants={itemVariants}
              >
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Notification Frequency
                    </CardTitle>
                    <CardDescription>
                      Control how often you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { key: "immediate", label: "Immediate", description: "Get notified right away" },
                        { key: "hourly", label: "Hourly", description: "Digest every hour" },
                        { key: "daily", label: "Daily", description: "One summary per day" },
                        { key: "weekly", label: "Weekly", description: "Weekly summary only" }
                      ].map((frequency) => (
                        <div key={frequency.key} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{frequency.label}</div>
                            <div className="text-sm text-gray-600">{frequency.description}</div>
                          </div>
                          <button
                            onClick={() => handleFrequencyChange(frequency.key)}
                            className={`w-4 h-4 rounded-full border-2 ${
                              settings.frequency[frequency.key as keyof typeof settings.frequency]
                                ? 'border-blue-600 bg-blue-600'
                                : 'border-gray-300'
                            }`}
                          >
                            {settings.frequency[frequency.key as keyof typeof settings.frequency] && (
                              <div className="w-full h-full rounded-full bg-blue-600"></div>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quiet Hours */}
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20 mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {settings.quietHours.enabled ? (
                        <VolumeX className="h-5 w-5" />
                      ) : (
                        <Volume2 className="h-5 w-5" />
                      )}
                      Quiet Hours
                    </CardTitle>
                    <CardDescription>
                      Set times when you don't want to receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Enable Quiet Hours</div>
                          <div className="text-sm text-gray-600">Pause notifications during these hours</div>
                        </div>
                        <button
                          onClick={() => handleToggle('quietHours', 'enabled')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.quietHours.enabled ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.quietHours.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      {settings.quietHours.enabled && (
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                              Start Time
                            </label>
                            <input
                              type="time"
                              value={settings.quietHours.start}
                              onChange={(e) => setSettings(prev => ({
                                ...prev,
                                quietHours: { ...prev.quietHours, start: e.target.value }
                              }))}
                              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                              End Time
                            </label>
                            <input
                              type="time"
                              value={settings.quietHours.end}
                              onChange={(e) => setSettings(prev => ({
                                ...prev,
                                quietHours: { ...prev.quietHours, end: e.target.value }
                              }))}
                              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Category Filters */}
              <motion.div
                variants={itemVariants}
              >
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Category Preferences
                    </CardTitle>
                    <CardDescription>
                      Choose which market categories to receive notifications for
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { key: "crypto", label: "Cryptocurrency", description: "Bitcoin, Ethereum, and other crypto predictions" },
                        { key: "stocks", label: "Stock Market", description: "Individual stocks and market indices" },
                        { key: "forex", label: "Foreign Exchange", description: "Currency pair predictions" },
                        { key: "commodities", label: "Commodities", description: "Gold, oil, and commodity predictions" },
                        { key: "economics", label: "Economic Indicators", description: "Interest rates, inflation, GDP" }
                      ].map((category) => (
                        <div key={category.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{category.label}</div>
                            <div className="text-sm text-gray-600">{category.description}</div>
                          </div>
                          <button
                            onClick={() => handleToggle('categories', category.key)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.categories[category.key as keyof typeof settings.categories] ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.categories[category.key as keyof typeof settings.categories] ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Test Notifications */}
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20 mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Test Notifications
                    </CardTitle>
                    <CardDescription>
                      Send test notifications to verify your settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Mail className="mr-2 h-4 w-4" />
                        Send Test Email
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Smartphone className="mr-2 h-4 w-4" />
                        Send Test Push Notification
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Bell className="mr-2 h-4 w-4" />
                        Test In-App Notification
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Notification Status */}
            <motion.div
              className="mt-8"
              variants={itemVariants}
            >
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Notification Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Mail className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="font-medium text-gray-900">Email</div>
                      <Badge className="bg-green-100 text-green-700 mt-1">Active</Badge>
                      <div className="text-xs text-gray-500 mt-1">john@example.com</div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Smartphone className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="font-medium text-gray-900">Push Notifications</div>
                      <Badge className="bg-yellow-100 text-yellow-700 mt-1">Permission Required</Badge>
                      <Button variant="link" size="sm" className="text-xs mt-1">
                        Enable Push
                      </Button>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Globe className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="font-medium text-gray-900">In-App</div>
                      <Badge className="bg-blue-100 text-blue-700 mt-1">Active</Badge>
                      <div className="text-xs text-gray-500 mt-1">Real-time updates</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Save Button */}
            <motion.div
              className="flex justify-end mt-8"
              variants={itemVariants}
            >
              <Button
                onClick={handleSave}
                disabled={!hasChanges}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Save Notification Settings
              </Button>
            </motion.div>
          </div>
        </motion.div>
    </>
  );
};

export default NotificationSettings;