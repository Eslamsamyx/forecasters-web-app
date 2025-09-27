"use client";

import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Crown,
  Star,
  Zap,
  ArrowRight,
  Users,
  BarChart3,
  Target,
  TrendingUp,
  Shield,
  Award,
  X
} from "lucide-react";

const PricingPage: NextPage = () => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const FREE_FEATURES = [
    "Access to top 10 forecaster rankings",
    "Basic prediction analytics",
    "Limited historical data (7 days)",
    "Community support",
    "Email notifications",
  ];

  const PREMIUM_FEATURES = [
    "Unlimited forecaster tracking",
    "Complete forecaster rankings & analytics",
    "Advanced prediction insights & charts",
    "Full historical data access",
    "Real-time price alerts & notifications",
    "API access for developers",
    "Custom watchlists & portfolios",
    "Export data to CSV/JSON",
    "Priority customer support",
    "Early access to new features"
  ];

  const ENTERPRISE_FEATURES = [
    "Everything in Premium",
    "Custom integrations",
    "Dedicated account manager",
    "Advanced API limits",
    "White-label options",
    "Custom reporting",
    "SLA guarantee",
    "Team collaboration tools",
    "Bulk data export",
    "Phone support"
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

  const getPrice = (basePrice: number) => {
    if (billingPeriod === "yearly") {
      return Math.floor(basePrice * 10); // 2 months free on yearly
    }
    return basePrice;
  };

  const getPriceLabel = (monthlyPrice: number) => {
    if (billingPeriod === "yearly") {
      return `$${getPrice(monthlyPrice)}/year`;
    }
    return `$${monthlyPrice}/month`;
  };

  return (
    <>
      <Head>
        <title>Pricing - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Choose the perfect plan for your prediction tracking needs."
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
              className="text-center max-w-3xl mx-auto mb-16"
              variants={itemVariants}
            >
              <Badge variant="secondary" className="mb-4">
                <Crown className="w-4 h-4 mr-2" />
                Forecaster Analytics Platform
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Choose Your
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Plan</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Get unlimited access to forecaster rankings, prediction analytics, and market insights.
                Start with a <strong>7-day free trial</strong> — no commitment required.
              </p>
            </motion.div>

            {/* Billing Toggle */}
            <motion.div
              className="flex items-center justify-center mb-12"
              variants={itemVariants}
            >
              <div className="bg-white/90 backdrop-blur-xl rounded-full p-1 shadow-lg border border-white/20">
                <button
                  onClick={() => setBillingPeriod("monthly")}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    billingPeriod === "monthly"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  onClick={() => setBillingPeriod("yearly")}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    billingPeriod === "yearly"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Yearly Billing
                  <Badge className="ml-2 bg-green-100 text-green-700">Save 17%</Badge>
                </button>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 max-w-4xl mx-auto"
              variants={itemVariants}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">2,847+</div>
                <div className="text-sm text-gray-600">Forecasters Tracked</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">156K+</div>
                <div className="text-sm text-gray-600">Predictions Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">94.8%</div>
                <div className="text-sm text-gray-600">Top Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">12,934</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
            </motion.div>

            {/* Pricing Cards */}
            <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
              {/* Free Plan */}
              <motion.div variants={itemVariants}>
                <Card className="relative h-full border-gray-200 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-2xl font-bold text-gray-900">Free</CardTitle>
                    <CardDescription className="text-gray-600">
                      Get started with basic features
                    </CardDescription>
                    <div className="mt-6">
                      <span className="text-4xl font-bold text-gray-900">$0</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {FREE_FEATURES.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                    {PREMIUM_FEATURES.slice(5, 8).map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 opacity-50">
                        <X className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-500 line-through">{feature}</span>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant="outline"
                      asChild
                    >
                      <Link href="/auth/signup">
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>

              {/* Premium Plan */}
              <motion.div variants={itemVariants}>
                <Card className="relative h-full border-2 border-blue-600 bg-white shadow-2xl transform scale-105">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-1">
                      <Star className="h-4 w-4 mr-1" />
                      MOST POPULAR
                    </Badge>
                  </div>
                  <CardHeader className="text-center pb-8 pt-12">
                    <CardTitle className="text-2xl font-bold text-gray-900">Premium</CardTitle>
                    <CardDescription className="text-gray-600">
                      Perfect for serious investors
                    </CardDescription>
                    <div className="mt-6">
                      <span className="text-4xl font-bold text-gray-900">
                        {billingPeriod === "monthly" ? "$29" : "$290"}
                      </span>
                      <span className="text-gray-600">/{billingPeriod === "monthly" ? "month" : "year"}</span>
                      {billingPeriod === "yearly" && (
                        <div className="text-sm text-green-600 mt-1">Save $58/year</div>
                      )}
                    </div>
                    <Badge className="mt-4 bg-green-100 text-green-700">
                      <Zap className="h-3 w-3 mr-1" />
                      7-Day Free Trial
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {PREMIUM_FEATURES.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                      asChild
                    >
                      <Link href="/auth/signup?plan=premium">
                        Start Free Trial
                        <Crown className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>

              {/* Enterprise Plan */}
              <motion.div variants={itemVariants}>
                <Card className="relative h-full border-gray-200 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-2xl font-bold text-gray-900">Enterprise</CardTitle>
                    <CardDescription className="text-gray-600">
                      For teams and organizations
                    </CardDescription>
                    <div className="mt-6">
                      <span className="text-4xl font-bold text-gray-900">Custom</span>
                      <div className="text-sm text-gray-600 mt-2">Contact for pricing</div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {ENTERPRISE_FEATURES.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant="outline"
                      asChild
                    >
                      <Link href="/contact?type=enterprise">
                        Contact Sales
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </div>

            {/* FAQ Section */}
            <motion.div
              className="max-w-4xl mx-auto"
              variants={itemVariants}
            >
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                Frequently Asked Questions
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Can I change my plan anytime?
                  </h3>
                  <p className="text-gray-600">
                    Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any differences.
                  </p>
                </div>
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    What payment methods do you accept?
                  </h3>
                  <p className="text-gray-600">
                    We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. Enterprise customers can also pay by invoice.
                  </p>
                </div>
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Is there a free trial?
                  </h3>
                  <p className="text-gray-600">
                    Yes! Premium plans include a 7-day free trial. No credit card required to start, and you can cancel anytime.
                  </p>
                </div>
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Do you offer refunds?
                  </h3>
                  <p className="text-gray-600">
                    We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact us for a full refund.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              className="mt-16 text-center"
              variants={itemVariants}
            >
              <div className="flex items-center justify-center gap-8 mb-8">
                <div className="flex items-center gap-2 text-gray-600">
                  <Shield className="h-5 w-5" />
                  <span>Bank-level security</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Award className="h-5 w-5" />
                  <span>99.9% uptime SLA</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-5 w-5" />
                  <span>12,000+ happy users</span>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Trusted by investors, traders, and financial analysts worldwide
              </p>
            </motion.div>
          </div>
        </motion.div>
    </>
  );
};

export default PricingPage;