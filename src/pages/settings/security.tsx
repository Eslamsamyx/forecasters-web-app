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
  Shield,
  ArrowLeft,
  Key,
  Smartphone,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Monitor,
  Trash2,
  Download,
  Lock,
  Unlock,
  QrCode,
  Copy,
  RefreshCw
} from "lucide-react";

const SecuritySettings: NextPage = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const [backupCodes] = useState([
    "1a2b-3c4d-5e6f",
    "2b3c-4d5e-6f7g",
    "3c4d-5e6f-7g8h",
    "4d5e-6f7g-8h9i",
    "5e6f-7g8h-9i0j",
    "6f7g-8h9i-0j1k",
    "7g8h-9i0j-1k2l",
    "8h9i-0j1k-2l3m"
  ]);

  const [loginHistory] = useState([
    {
      id: 1,
      device: "MacBook Pro",
      browser: "Chrome",
      location: "New York, NY",
      ip: "192.168.1.1",
      timestamp: "2024-01-20T10:30:00Z",
      status: "success",
      current: true
    },
    {
      id: 2,
      device: "iPhone 15",
      browser: "Safari",
      location: "New York, NY",
      ip: "192.168.1.2",
      timestamp: "2024-01-19T15:45:00Z",
      status: "success",
      current: false
    },
    {
      id: 3,
      device: "Windows PC",
      browser: "Edge",
      location: "Los Angeles, CA",
      ip: "10.0.0.1",
      timestamp: "2024-01-18T09:15:00Z",
      status: "failed",
      current: false
    },
    {
      id: 4,
      device: "iPad",
      browser: "Safari",
      location: "New York, NY",
      ip: "192.168.1.3",
      timestamp: "2024-01-17T20:20:00Z",
      status: "success",
      current: false
    }
  ]);

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    showActivity: true,
    showPredictions: true,
    allowFollowers: true,
    dataSharing: false,
    analytics: true
  });

  const handlePasswordChange = (field: string, value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
  };

  const handlePrivacyChange = (setting: string, value: string | boolean) => {
    setPrivacySettings(prev => ({ ...prev, [setting]: value }));
  };

  const getDeviceIcon = (device: string) => {
    if (device.includes('iPhone') || device.includes('iPad')) return <Smartphone className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-600";
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
        <title>Security Settings - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Manage your password, two-factor authentication, login history, and privacy settings."
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
              <Button variant="ghost" className="mb-4" asChild>
                <Link href="/settings">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Settings
                </Link>
              </Button>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                Security &
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Privacy</span>
              </h1>
              <p className="text-xl text-gray-600">
                Protect your account with strong security measures and control your privacy settings.
              </p>
            </motion.div>

            {/* Security Score */}
            <motion.div
              className="mb-8"
              variants={itemVariants}
            >
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Score
                  </CardTitle>
                  <CardDescription>
                    Your account security strength based on enabled features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-gray-200"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-green-500"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeDasharray="85, 100"
                          strokeLinecap="round"
                          fill="none"
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900">85</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Good Security</h3>
                      <p className="text-gray-600 mb-4">
                        Your account has good security but can be improved by enabling two-factor authentication.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-gray-700">Strong password</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <span className="text-gray-700">Two-factor authentication disabled</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-gray-700">Recent login activity normal</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Password Settings */}
              <motion.div
                className="space-y-6"
                variants={itemVariants}
              >
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      Change Password
                    </CardTitle>
                    <CardDescription>
                      Update your account password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwords.current}
                          onChange={(e) => handlePasswordChange('current', e.target.value)}
                          placeholder="Enter current password"
                          className="w-full h-10 pl-3 pr-10 text-gray-900 bg-white border border-gray-200 rounded-md focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder:text-gray-400"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
                            tabIndex={-1}
                            aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                          >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={passwords.new}
                          onChange={(e) => handlePasswordChange('new', e.target.value)}
                          placeholder="Enter new password"
                          className="w-full h-10 pl-3 pr-10 text-gray-900 bg-white border border-gray-200 rounded-md focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder:text-gray-400"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
                            tabIndex={-1}
                            aria-label={showNewPassword ? "Hide password" : "Show password"}
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwords.confirm}
                          onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                          placeholder="Confirm new password"
                          className="w-full h-10 pl-3 pr-10 text-gray-900 bg-white border border-gray-200 rounded-md focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder:text-gray-400"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
                            tabIndex={-1}
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h4 className="font-medium text-blue-900 mb-2">Password Requirements</h4>
                      <div className="space-y-1 text-sm text-blue-800">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span>At least 8 characters long</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span>Contains uppercase and lowercase letters</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span>Contains at least one number</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span>Contains at least one special character</span>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                      Update Password
                    </Button>
                  </CardContent>
                </Card>

                {/* Two-Factor Authentication */}
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5" />
                      Two-Factor Authentication
                    </CardTitle>
                    <CardDescription>
                      Add an extra layer of security to your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                        <div className="text-sm text-gray-600">
                          {twoFactorEnabled ? "Enabled" : "Disabled"}
                        </div>
                      </div>
                      <button
                        onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          twoFactorEnabled ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    {twoFactorEnabled ? (
                      <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle className="h-4 w-4" />
                            <span className="font-medium">Two-factor authentication is enabled</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full justify-start">
                            <QrCode className="mr-2 h-4 w-4" />
                            View QR Code
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Download className="mr-2 h-4 w-4" />
                            Download Backup Codes
                          </Button>
                          <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Disable 2FA
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-yellow-700">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="font-medium">Two-factor authentication is not enabled</span>
                          </div>
                          <p className="text-sm text-yellow-600 mt-1">
                            Enable 2FA to significantly improve your account security.
                          </p>
                        </div>
                        <Button
                          onClick={() => setShowQRCode(!showQRCode)}
                          className="w-full bg-gradient-to-r from-green-600 to-green-700"
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Enable Two-Factor Authentication
                        </Button>
                      </div>
                    )}

                    {showQRCode && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
                        <div className="w-32 h-32 bg-white border-2 border-gray-300 mx-auto mb-4 flex items-center justify-center">
                          <QrCode className="h-16 w-16 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          Scan this QR code with your authenticator app
                        </p>
                        <div className="text-xs font-mono bg-gray-200 p-2 rounded break-all">
                          JBSWY3DPEHPK3PXP
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Login History & Privacy */}
              <motion.div
                className="space-y-6"
                variants={itemVariants}
              >
                {/* Login History */}
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Login History
                    </CardTitle>
                    <CardDescription>
                      Recent login attempts and active sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {loginHistory.map((login) => (
                        <div key={login.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              {getDeviceIcon(login.device)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {login.device}
                                {login.current && (
                                  <Badge className="ml-2 bg-green-100 text-green-700 text-xs">Current</Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                {login.browser} • {login.location}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(login.timestamp).toLocaleString()} • {login.ip}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`text-sm ${getStatusColor(login.status)}`}>
                              {login.status}
                            </div>
                            {!login.current && (
                              <Button variant="ghost" size="sm" className="text-red-600">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      View All Login History
                    </Button>
                  </CardContent>
                </Card>

                {/* Privacy Settings */}
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Privacy Settings
                    </CardTitle>
                    <CardDescription>
                      Control your data visibility and sharing preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Profile Visibility
                      </label>
                      <select
                        value={privacySettings.profileVisibility}
                        onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="public">Public</option>
                        <option value="followers">Followers Only</option>
                        <option value="private">Private</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      {[
                        { key: "showActivity", label: "Show Activity", description: "Display your recent activity to others" },
                        { key: "showPredictions", label: "Show Predictions", description: "Make your predictions visible on your profile" },
                        { key: "allowFollowers", label: "Allow Followers", description: "Let other users follow your predictions" },
                        { key: "dataSharing", label: "Data Sharing", description: "Share anonymized data for platform improvements" },
                        { key: "analytics", label: "Analytics Tracking", description: "Help us improve the platform with usage analytics" }
                      ].map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{setting.label}</div>
                            <div className="text-sm text-gray-600">{setting.description}</div>
                          </div>
                          <button
                            onClick={() => handlePrivacyChange(setting.key, !privacySettings[setting.key as keyof typeof privacySettings])}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              privacySettings[setting.key as keyof typeof privacySettings] ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              privacySettings[setting.key as keyof typeof privacySettings] ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Account Actions */}
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-red-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700">
                      <AlertTriangle className="h-5 w-5" />
                      Danger Zone
                    </CardTitle>
                    <CardDescription>
                      Irreversible account actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="mr-2 h-4 w-4" />
                      Export Account Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>
    </>
  );
};

export default SecuritySettings;