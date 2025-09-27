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
  Crown,
  CreditCard,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  Eye,
  RefreshCw
} from "lucide-react";

const SubscriptionsManagement: NextPage = () => {
  const subscriptions = [
    { id: 1, user: "John Doe", email: "john@example.com", plan: "Premium", status: "active", amount: 29.99, nextBilling: "2024-04-15", joined: "2024-01-15" },
    { id: 2, user: "Jane Smith", email: "jane@example.com", plan: "Pro", status: "active", amount: 19.99, nextBilling: "2024-04-20", joined: "2024-02-03" },
    { id: 3, user: "Mike Johnson", email: "mike@example.com", plan: "Premium", status: "cancelled", amount: 29.99, nextBilling: null, joined: "2024-03-10" },
    { id: 4, user: "Sarah Wilson", email: "sarah@example.com", plan: "Pro", status: "past_due", amount: 19.99, nextBilling: "2024-03-15", joined: "2024-01-28" }
  ];

  const stats = {
    totalSubscribers: 324,
    monthlyRevenue: 8567,
    annualRevenue: 89423,
    churnRate: 3.2
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-700';
      case 'paused':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Premium':
        return 'bg-purple-100 text-purple-700';
      case 'Pro':
        return 'bg-blue-100 text-blue-700';
      case 'Basic':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
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
        <title>Subscriptions Management - Admin - Prediction Prism Analytics</title>
        <meta name="description" content="Manage user subscriptions and billing." />
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
              <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" asChild>
                  <Link href="/admin">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                    Subscriptions
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Management</span>
                  </h1>
                  <p className="text-xl text-gray-600">
                    Monitor subscriptions and revenue metrics.
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-blue-600 mb-2">
                      <Users className="h-8 w-8 mx-auto" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalSubscribers}</div>
                    <div className="text-sm text-gray-600">Total Subscribers</div>
                  </CardContent>
                </Card>
                <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-green-600 mb-2">
                      <DollarSign className="h-8 w-8 mx-auto" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">${stats.monthlyRevenue.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Monthly Revenue</div>
                  </CardContent>
                </Card>
                <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-purple-600 mb-2">
                      <TrendingUp className="h-8 w-8 mx-auto" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">${stats.annualRevenue.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Annual Revenue</div>
                  </CardContent>
                </Card>
                <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-orange-600 mb-2">
                      <RefreshCw className="h-8 w-8 mx-auto" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stats.churnRate}%</div>
                    <div className="text-sm text-gray-600">Churn Rate</div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Subscriptions List */}
            <motion.div variants={itemVariants}>
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Active Subscriptions
                  </CardTitle>
                  <CardDescription>
                    Manage user subscriptions and billing information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subscriptions.map((subscription) => (
                      <motion.div
                        key={subscription.id}
                        className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                              {subscription.user.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">{subscription.user}</h3>
                                <Badge className={getPlanColor(subscription.plan)}>
                                  <Crown className="h-3 w-3 mr-1" />
                                  {subscription.plan}
                                </Badge>
                                <Badge className={getStatusColor(subscription.status)}>
                                  {subscription.status.replace('_', ' ')}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600 mb-3">{subscription.email}</div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <div className="text-gray-500">Amount</div>
                                  <div className="font-medium">${subscription.amount}/month</div>
                                </div>
                                <div>
                                  <div className="text-gray-500">Next Billing</div>
                                  <div className="font-medium">
                                    {subscription.nextBilling
                                      ? new Date(subscription.nextBilling).toLocaleDateString()
                                      : 'N/A'
                                    }
                                  </div>
                                </div>
                                <div>
                                  <div className="text-gray-500">Joined</div>
                                  <div className="font-medium">{new Date(subscription.joined).toLocaleDateString()}</div>
                                </div>
                                <div>
                                  <div className="text-gray-500">Customer Since</div>
                                  <div className="font-medium">
                                    {Math.floor((new Date().getTime() - new Date(subscription.joined).getTime()) / (1000 * 60 * 60 * 24))} days
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <CreditCard className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
    </>
  );
};

export default SubscriptionsManagement;