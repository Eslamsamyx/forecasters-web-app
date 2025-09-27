"use client";

import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Crown,
  Star,
  Users,
  Target,
  BarChart3,
  Calendar,
  Gift,
  Download,
  ArrowRight,
  Zap,
  Award,
  BookOpen,
  Settings,
  Heart,
  Sparkles,
  Trophy,
  Mail,
  Phone,
  Headphones
} from "lucide-react";

const Success: NextPage = () => {
  const [confettiVisible, setConfettiVisible] = useState(true);
  const [orderDetails] = useState({
    orderId: "PP-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    plan: "Premium",
    amount: "$29.00",
    billingPeriod: "monthly",
    trialEnds: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    nextBilling: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    email: "user@example.com"
  });

  const quickActions = [
    {
      title: "Explore Forecasters",
      description: "Discover top-performing prediction experts",
      icon: <Users className="h-6 w-6" />,
      href: "/forecasters",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "View Rankings",
      description: "See real-time forecaster leaderboards",
      icon: <Trophy className="h-6 w-6" />,
      href: "/rankings",
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Search Predictions",
      description: "Find specific market predictions",
      icon: <Target className="h-6 w-6" />,
      href: "/search",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Dashboard",
      description: "Access your personalized analytics",
      icon: <BarChart3 className="h-6 w-6" />,
      href: "/dashboard",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const features = [
    {
      title: "Unlimited Access",
      description: "Track all forecasters and predictions without limits",
      icon: <Star className="h-5 w-5" />
    },
    {
      title: "Real-time Alerts",
      description: "Get notified when your favorite forecasters make predictions",
      icon: <Zap className="h-5 w-5" />
    },
    {
      title: "Advanced Analytics",
      description: "Deep insights into prediction accuracy and market trends",
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      title: "API Access",
      description: "Integrate our data into your own applications",
      icon: <Settings className="h-5 w-5" />
    },
    {
      title: "Priority Support",
      description: "Get help when you need it with priority customer support",
      icon: <Headphones className="h-5 w-5" />
    },
    {
      title: "Early Access",
      description: "Be the first to try new features and improvements",
      icon: <Gift className="h-5 w-5" />
    }
  ];

  useEffect(() => {
    // Hide confetti after 3 seconds
    const timer = setTimeout(() => {
      setConfettiVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

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

  const confettiVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <>
      <Head>
        <title>Welcome to Premium! - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Thank you for subscribing! Your premium account is now active. Start exploring advanced forecasting features."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <motion.div
          className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Confetti Animation */}
          {confettiVisible && (
            <motion.div
              className="fixed inset-0 pointer-events-none z-50"
              variants={confettiVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"][i % 5],
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -100, 100],
                    rotate: [0, 360],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3,
                    delay: Math.random() * 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          )}

          <div className="container mx-auto px-4 py-16">
            {/* Success Header */}
            <motion.div
              className="text-center max-w-4xl mx-auto mb-16"
              variants={itemVariants}
            >
              <motion.div
                className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, type: "spring" }}
              >
                <CheckCircle className="h-12 w-12 text-white" />
              </motion.div>

              <Badge variant="secondary" className="mb-4">
                <Crown className="w-4 h-4 mr-2" />
                Payment Successful
              </Badge>

              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Welcome to
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Premium!</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Your subscription is now active and your 7-day free trial has begun.
                Get ready to discover the world's most accurate forecasters!
              </p>

              {/* Order Details */}
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20 max-w-md mx-auto">
                <CardHeader>
                  <CardTitle className="text-lg">Order Confirmation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-mono font-medium">{orderDetails.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan:</span>
                      <span className="font-medium">{orderDetails.plan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">{orderDetails.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trial Ends:</span>
                      <span className="font-medium">{orderDetails.trialEnds.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Next Billing:</span>
                      <span className="font-medium">{orderDetails.nextBilling.toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
              variants={itemVariants}
            >
              {quickActions.map((action, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20 h-full hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <motion.div
                        className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-full flex items-center justify-center text-white mx-auto mb-4`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        {action.icon}
                      </motion.div>
                      <h3 className="font-bold text-gray-900 mb-2">{action.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                      <Button size="sm" className="w-full" asChild>
                        <Link href={action.href}>
                          Get Started
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Features Grid */}
            <motion.div
              className="mb-16"
              variants={itemVariants}
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Your Premium Features
                </h2>
                <p className="text-lg text-gray-600">
                  Unlock the full power of prediction analytics
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20 h-full">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                            {feature.icon}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                            <p className="text-sm text-gray-600">{feature.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Next Steps */}
            <motion.div
              className="grid lg:grid-cols-2 gap-8 mb-16"
              variants={itemVariants}
            >
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Getting Started Guide
                  </CardTitle>
                  <CardDescription>
                    Learn how to make the most of your premium subscription
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Explore Top Forecasters</h4>
                        <p className="text-sm text-gray-600">Browse our rankings to find the most accurate predictors in your areas of interest.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Set Up Alerts</h4>
                        <p className="text-sm text-gray-600">Configure notifications for your favorite forecasters and prediction categories.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Create Watchlists</h4>
                        <p className="text-sm text-gray-600">Build custom lists to track specific assets, forecasters, or prediction topics.</p>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full mt-6" variant="outline">
                    <BookOpen className="mr-2 h-4 w-4" />
                    View Full Guide
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Headphones className="h-5 w-5" />
                    Need Help?
                  </CardTitle>
                  <CardDescription>
                    Our premium support team is here to help
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-900">Email Support</div>
                        <div className="text-sm text-gray-600">Get help within 24 hours</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Phone className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium text-gray-900">Priority Support</div>
                        <div className="text-sm text-gray-600">Premium members get faster responses</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-medium text-gray-900">Knowledge Base</div>
                        <div className="text-sm text-gray-600">Comprehensive guides and tutorials</div>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full mt-6" variant="outline" asChild>
                    <Link href="/contact">
                      <Headphones className="mr-2 h-4 w-4" />
                      Contact Support
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Call to Action */}
            <motion.div
              className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white"
              variants={itemVariants}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                <Sparkles className="h-16 w-16 mx-auto mb-6 opacity-80" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Your 7-day free trial is now active. Explore all premium features and discover
                the world's most accurate financial forecasters.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
                  <Link href="/dashboard">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Go to Dashboard
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                  <Link href="/forecasters">
                    <Users className="mr-2 h-5 w-5" />
                    Browse Forecasters
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
    </>
  );
};

export default Success;