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
  CreditCard,
  ArrowLeft,
  Crown,
  Calendar,
  Download,
  Plus,
  Trash2,
  Edit,
  AlertCircle,
  CheckCircle,
  DollarSign,
  BarChart3,
  TrendingUp,
  Users,
  Target
} from "lucide-react";

const BillingSettings: NextPage = () => {
  const [currentPlan] = useState({
    name: "Premium",
    price: 29,
    billing: "monthly",
    nextBilling: "2024-02-15",
    status: "active",
    features: [
      "Unlimited forecaster tracking",
      "Advanced analytics",
      "API access",
      "Priority support",
      "Real-time alerts"
    ]
  });

  const [paymentMethods] = useState([
    {
      id: 1,
      type: "visa",
      last4: "4242",
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
      name: "John Doe"
    },
    {
      id: 2,
      type: "mastercard",
      last4: "8888",
      expiryMonth: 8,
      expiryYear: 2024,
      isDefault: false,
      name: "John Doe"
    }
  ]);

  const [billingHistory] = useState([
    {
      id: "inv_001",
      date: "2024-01-15",
      amount: 29.00,
      status: "paid",
      description: "Premium Plan - Monthly",
      downloadUrl: "/invoices/inv_001.pdf"
    },
    {
      id: "inv_002",
      date: "2023-12-15",
      amount: 29.00,
      status: "paid",
      description: "Premium Plan - Monthly",
      downloadUrl: "/invoices/inv_002.pdf"
    },
    {
      id: "inv_003",
      date: "2023-11-15",
      amount: 29.00,
      status: "paid",
      description: "Premium Plan - Monthly",
      downloadUrl: "/invoices/inv_003.pdf"
    }
  ]);

  const [usage] = useState({
    apiCalls: {
      current: 8567,
      limit: 50000,
      percentage: 17
    },
    forecasters: {
      current: 145,
      limit: "unlimited"
    },
    predictions: {
      current: 2341,
      limit: "unlimited"
    }
  });

  const getCardIcon = (type: string) => {
    switch (type) {
      case "visa":
        return "V";
      case "mastercard":
        return "MC";
      case "amex":
        return "AX";
      default:
        return "CC";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "past_due":
        return "bg-red-100 text-red-700";
      case "canceled":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
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
        <title>Billing Settings - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Manage your subscription, billing details, payment methods, and view usage statistics."
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
                Billing &
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Subscription</span>
              </h1>
              <p className="text-xl text-gray-600">
                Manage your subscription plan, billing details, and payment methods.
              </p>
            </motion.div>

            {/* Current Plan */}
            <motion.div
              className="mb-8"
              variants={itemVariants}
            >
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-yellow-500" />
                        Current Plan
                      </CardTitle>
                      <CardDescription>
                        Your active subscription details
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(currentPlan.status)}>
                      {currentPlan.status === "active" ? "Active" : currentPlan.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <div className="mb-4">
                        <h3 className="text-2xl font-bold text-gray-900">{currentPlan.name} Plan</h3>
                        <p className="text-3xl font-bold text-blue-600">
                          ${currentPlan.price}
                          <span className="text-lg text-gray-500">/{currentPlan.billing}</span>
                        </p>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Next billing: {new Date(currentPlan.nextBilling).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Auto-renewal enabled
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Included Features</h4>
                      <div className="space-y-2">
                        {currentPlan.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Button className="w-full" asChild>
                        <Link href="/pricing">
                          <Crown className="mr-2 h-4 w-4" />
                          Change Plan
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full">
                        Cancel Subscription
                      </Button>
                      <Button variant="ghost" className="w-full text-sm">
                        <Download className="mr-2 h-3 w-3" />
                        Download Invoice
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Usage Statistics */}
            <motion.div
              className="mb-8"
              variants={itemVariants}
            >
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Usage This Month
                  </CardTitle>
                  <CardDescription>
                    Track your current usage against plan limits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">API Calls</span>
                        <span className="text-sm text-gray-600">
                          {usage.apiCalls.current.toLocaleString()} / {usage.apiCalls.limit.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${usage.apiCalls.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">{usage.apiCalls.percentage}% of limit used</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Forecasters Tracked</span>
                        <span className="text-sm text-gray-600">
                          {usage.forecasters.current} / {usage.forecasters.limit}
                        </span>
                      </div>
                      <div className="flex items-center text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Unlimited
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Predictions Viewed</span>
                        <span className="text-sm text-gray-600">
                          {usage.predictions.current.toLocaleString()} / {usage.predictions.limit}
                        </span>
                      </div>
                      <div className="flex items-center text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Unlimited
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Payment Methods */}
              <motion.div
                variants={itemVariants}
              >
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Methods
                      </CardTitle>
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Card
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-6 bg-gray-800 rounded text-white text-xs flex items-center justify-center font-bold">
                                {getCardIcon(method.type)}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  **** **** **** {method.last4}
                                  {method.isDefault && (
                                    <Badge className="ml-2 bg-blue-100 text-blue-700 text-xs">Default</Badge>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Expires {method.expiryMonth}/{method.expiryYear} • {method.name}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              {!method.isDefault && (
                                <Button variant="ghost" size="sm" className="text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Billing History */}
              <motion.div
                variants={itemVariants}
              >
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Billing History
                    </CardTitle>
                    <CardDescription>
                      Your recent invoices and payments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {billingHistory.map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{invoice.description}</div>
                            <div className="text-sm text-gray-600">
                              {new Date(invoice.date).toLocaleDateString()} • Invoice #{invoice.id}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">${invoice.amount.toFixed(2)}</div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                {invoice.status}
                              </Badge>
                              <Button variant="ghost" size="sm">
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      View All Invoices
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Plan Comparison */}
            <motion.div
              className="mt-16"
              variants={itemVariants}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Upgrade Your Plan</h2>
                <p className="text-lg text-gray-600">
                  Get more features and higher limits with our advanced plans
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Free Plan */}
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle>Free</CardTitle>
                    <div className="text-3xl font-bold">$0<span className="text-lg text-gray-500">/month</span></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>Top 10 forecasters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-gray-400" />
                        <span>Basic predictions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-gray-400" />
                        <span>Limited analytics</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-6" disabled>
                      Current Plan
                    </Button>
                  </CardContent>
                </Card>

                {/* Premium Plan */}
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border-2 border-blue-600">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Premium</CardTitle>
                      <Badge className="bg-blue-100 text-blue-700">Current</Badge>
                    </div>
                    <div className="text-3xl font-bold">$29<span className="text-lg text-gray-500">/month</span></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Unlimited forecasters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Advanced analytics</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>API access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Priority support</span>
                      </div>
                    </div>
                    <Button className="w-full mt-6 bg-blue-600" disabled>
                      Current Plan
                    </Button>
                  </CardContent>
                </Card>

                {/* Enterprise Plan */}
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle>Enterprise</CardTitle>
                    <div className="text-3xl font-bold">$99<span className="text-lg text-gray-500">/month</span></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Everything in Premium</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Custom integrations</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Dedicated support</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>SLA guarantee</span>
                      </div>
                    </div>
                    <Button className="w-full mt-6">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Upgrade
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Help Section */}
            <motion.div
              className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white text-center"
              variants={itemVariants}
            >
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-80" />
              <h3 className="text-2xl font-bold mb-4">Need Help with Billing?</h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Have questions about your subscription, need to update payment information,
                or want to discuss custom pricing? Our billing support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
                  <Link href="/contact?type=billing">
                    Contact Billing Support
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                  <Link href="/docs/billing">
                    View Billing FAQ
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
    </>
  );
};

export default BillingSettings;