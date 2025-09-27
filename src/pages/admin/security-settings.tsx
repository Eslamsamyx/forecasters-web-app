"use client";

import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Shield,
  Lock,
  Key,
  AlertTriangle,
  CheckCircle,
  Settings,
  Save,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw
} from "lucide-react";

const SecuritySettings: NextPage = () => {
  const [settings, setSettings] = useState({
    twoFactorRequired: true,
    passwordMinLength: 8,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    enableAuditLog: true,
    requireHttps: true,
    ipWhitelist: "",
    enableCaptcha: true
  });

  // Fetch security settings and events from database
  const { data: securityData, isLoading: settingsLoading, refetch: refetchSettings } = api.admin.getSecuritySettings.useQuery();
  const { data: eventsData, isLoading: eventsLoading, refetch: refetchEvents } = api.admin.getSecurityEvents.useQuery({
    page: 1,
    limit: 10
  });

  // Update settings mutation
  const updateSettingsMutation = api.admin.updateSecuritySettings.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetchSettings();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update security settings");
    },
  });

  // Update settings when data is loaded
  useEffect(() => {
    if (securityData?.settings) {
      setSettings(securityData.settings);
    }
  }, [securityData]);

  const securityEvents = eventsData?.events || [];
  const securityStats = securityData?.stats;

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(settings);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatEventType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getRelativeTime = (timestamp: string | Date) => {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - eventTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''} ago`;
  };

  // Loading state
  if (settingsLoading || eventsLoading) {
    return (
      <>
        <Head>
          <title>Loading Security Settings - Admin</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">Loading security settings...</span>
          </div>
        </div>
      </>
    );
  }

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
        <title>Security Settings - Admin - Prediction Prism Analytics</title>
        <meta name="description" content="Configure security policies and monitor security events." />
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
                      Security
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Settings</span>
                    </h1>
                    <p className="text-xl text-gray-600">
                      Configure security policies and monitor threats.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      refetchSettings();
                      refetchEvents();
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button
                    onClick={handleSaveSettings}
                    disabled={updateSettingsMutation.isPending}
                  >
                    {updateSettingsMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>

              {/* Security Status */}
              {securityStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card className="shadow-lg bg-white/90 backdrop-blur-xl border border-white/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Login Success Rate</p>
                          <p className="text-2xl font-bold text-green-600">{securityStats.successRate}%</p>
                        </div>
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-lg bg-white/90 backdrop-blur-xl border border-white/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Failed Logins (24h)</p>
                          <p className="text-2xl font-bold text-red-600">{securityStats.failedLogins}</p>
                        </div>
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-lg bg-white/90 backdrop-blur-xl border border-white/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Logins (24h)</p>
                          <p className="text-2xl font-bold text-blue-600">{securityStats.totalLogins}</p>
                        </div>
                        <Shield className="h-6 w-6 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-lg bg-white/90 backdrop-blur-xl border border-white/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Suspicious Activity</p>
                          <p className="text-2xl font-bold text-orange-600">{securityStats.suspiciousActivity}</p>
                        </div>
                        <Eye className="h-6 w-6 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className={`flex items-center gap-4 p-4 border rounded-lg ${
                securityStats && securityStats.failedLogins < 5
                  ? 'bg-green-50 border-green-200'
                  : securityStats && securityStats.failedLogins < 20
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                {securityStats && securityStats.failedLogins < 5 ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : securityStats && securityStats.failedLogins < 20 ? (
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                )}
                <div>
                  <h2 className={`text-lg font-semibold ${
                    securityStats && securityStats.failedLogins < 5
                      ? 'text-green-900'
                      : securityStats && securityStats.failedLogins < 20
                      ? 'text-yellow-900'
                      : 'text-red-900'
                  }`}>
                    {securityStats && securityStats.failedLogins < 5
                      ? 'Security Status: Good'
                      : securityStats && securityStats.failedLogins < 20
                      ? 'Security Status: Elevated'
                      : 'Security Status: Alert'}
                  </h2>
                  <p className={
                    securityStats && securityStats.failedLogins < 5
                      ? 'text-green-700'
                      : securityStats && securityStats.failedLogins < 20
                      ? 'text-yellow-700'
                      : 'text-red-700'
                  }>
                    {securityStats && securityStats.failedLogins < 5
                      ? 'All security measures are properly configured'
                      : securityStats && securityStats.failedLogins < 20
                      ? 'Increased failed login attempts detected'
                      : 'High number of failed login attempts - review immediately'
                    }
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* Authentication Settings */}
              <motion.div variants={itemVariants}>
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Authentication Settings
                    </CardTitle>
                    <CardDescription>
                      Configure authentication and password policies
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Two-Factor Authentication</div>
                        <div className="text-sm text-gray-600">Require 2FA for all users</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.twoFactorRequired}
                          onChange={(e) => setSettings({...settings, twoFactorRequired: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Password Length
                      </label>
                      <input
                        type="number"
                        value={settings.passwordMinLength}
                        onChange={(e) => setSettings({...settings, passwordMinLength: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        min="6"
                        max="32"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Timeout (hours)
                      </label>
                      <input
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        min="1"
                        max="168"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Login Attempts
                      </label>
                      <input
                        type="number"
                        value={settings.maxLoginAttempts}
                        onChange={(e) => setSettings({...settings, maxLoginAttempts: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        min="1"
                        max="10"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* System Security */}
              <motion.div variants={itemVariants}>
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      System Security
                    </CardTitle>
                    <CardDescription>
                      General system security settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Audit Logging</div>
                        <div className="text-sm text-gray-600">Log all security events</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.enableAuditLog}
                          onChange={(e) => setSettings({...settings, enableAuditLog: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Force HTTPS</div>
                        <div className="text-sm text-gray-600">Require secure connections</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.requireHttps}
                          onChange={(e) => setSettings({...settings, requireHttps: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Enable CAPTCHA</div>
                        <div className="text-sm text-gray-600">Prevent automated attacks</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.enableCaptcha}
                          onChange={(e) => setSettings({...settings, enableCaptcha: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IP Whitelist (optional)
                      </label>
                      <textarea
                        value={settings.ipWhitelist}
                        onChange={(e) => setSettings({...settings, ipWhitelist: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="192.168.1.0/24&#10;10.0.0.0/8"
                        rows={3}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Enter IP ranges, one per line. Leave empty to allow all IPs.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Security Events */}
            <motion.div variants={itemVariants}>
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Recent Security Events
                  </CardTitle>
                  <CardDescription>
                    Monitor security-related activities and threats
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {securityEvents.map((event, index) => event && (
                      <div key={event.id || index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-4">
                          <Badge className={getSeverityColor(event.severity)}>
                            {event.severity}
                          </Badge>
                          <div>
                            <div className="font-medium text-gray-900">{formatEventType(event.type)}</div>
                            <div className="text-sm text-gray-600">
                              {event.userFullName || event.user} from {event.ipAddress}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">{getRelativeTime(event.timestamp)}</div>
                      </div>
                    ))}
                  </div>

                  {securityEvents.length === 0 && (
                    <div className="text-center py-8">
                      <Shield className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No recent security events</h3>
                      <p className="text-gray-600">All security events will appear here.</p>
                    </div>
                  )}
                  <Button variant="outline" className="w-full mt-4">
                    <Eye className="h-4 w-4 mr-2" />
                    View Full Audit Log
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
    </>
  );
};

export default SecuritySettings;