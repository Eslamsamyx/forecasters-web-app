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
  XCircle,
  AlertTriangle,
  CreditCard,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Phone,
  Mail,
  MessageCircle,
  HelpCircle,
  Shield,
  Clock,
  CheckCircle,
  Info
} from "lucide-react";

const PaymentFailed: NextPage = () => {
  const [errorDetails] = useState({
    errorCode: "CARD_DECLINED",
    orderId: "PP-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    timestamp: new Date().toISOString(),
    amount: "$29.00",
    plan: "Premium"
  });

  const commonIssues = [
    {
      title: "Card Declined",
      description: "Your card was declined by your bank",
      solutions: [
        "Check with your bank for any blocks on international transactions",
        "Ensure you have sufficient funds available",
        "Try a different payment method",
        "Contact your bank to authorize the transaction"
      ],
      icon: <CreditCard className="h-5 w-5" />
    },
    {
      title: "Expired Card",
      description: "The card you're using has expired",
      solutions: [
        "Check the expiration date on your card",
        "Use a different, valid credit card",
        "Contact your bank for a replacement card"
      ],
      icon: <Clock className="h-5 w-5" />
    },
    {
      title: "Security Check Failed",
      description: "Additional verification is required",
      solutions: [
        "Verify your billing address matches your card",
        "Check that your CVV code is correct",
        "Use a card registered to your current address"
      ],
      icon: <Shield className="h-5 w-5" />
    },
    {
      title: "Technical Issue",
      description: "A temporary system error occurred",
      solutions: [
        "Wait a few minutes and try again",
        "Clear your browser cache and cookies",
        "Try using a different browser or device",
        "Contact our support team for assistance"
      ],
      icon: <AlertTriangle className="h-5 w-5" />
    }
  ];

  const alternativePaymentMethods = [
    {
      name: "PayPal",
      description: "Pay securely with your PayPal account",
      icon: "P",
      color: "bg-blue-600",
      available: true
    },
    {
      name: "Apple Pay",
      description: "Quick payment with Touch ID or Face ID",
      icon: "",
      color: "bg-gray-900",
      available: true
    },
    {
      name: "Google Pay",
      description: "Fast and secure Google payments",
      icon: "G",
      color: "bg-red-500",
      available: true
    },
    {
      name: "Bank Transfer",
      description: "Direct transfer from your bank account",
      icon: "B",
      color: "bg-green-600",
      available: false
    }
  ];

  const supportOptions = [
    {
      title: "Live Chat",
      description: "Get instant help from our support team",
      icon: <MessageCircle className="h-6 w-6" />,
      action: "Start Chat",
      availability: "Available 24/7",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Email Support",
      description: "Send us details about your payment issue",
      icon: <Mail className="h-6 w-6" />,
      action: "Send Email",
      availability: "Response within 2 hours",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Phone Support",
      description: "Speak directly with a payment specialist",
      icon: <Phone className="h-6 w-6" />,
      action: "Call Now",
      availability: "Mon-Fri, 9AM-6PM EST",
      color: "from-purple-500 to-purple-600"
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
        <title>Payment Failed - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Payment could not be processed. Get help resolving payment issues and try again."
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
            {/* Error Header */}
            <motion.div
              className="text-center max-w-4xl mx-auto mb-16"
              variants={itemVariants}
            >
              <motion.div
                className="w-24 h-24 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, type: "spring" }}
              >
                <XCircle className="h-12 w-12 text-white" />
              </motion.div>

              <Badge variant="secondary" className="mb-4 bg-red-100 text-red-700">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Payment Failed
              </Badge>

              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Payment
                <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent"> Unsuccessful</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                We couldn't process your payment. Don't worry - this happens sometimes.
                Let's get this resolved quickly so you can start your premium experience.
              </p>

              {/* Error Details */}
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-red-200 max-w-md mx-auto">
                <CardHeader>
                  <CardTitle className="text-lg text-red-700">Transaction Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-mono font-medium">{errorDetails.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan:</span>
                      <span className="font-medium">{errorDetails.plan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">{errorDetails.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Error Code:</span>
                      <span className="font-mono text-red-600">{errorDetails.errorCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{new Date(errorDetails.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              className="grid md:grid-cols-3 gap-6 mb-16"
              variants={itemVariants}
            >
              <motion.div whileHover={{ scale: 1.05 }}>
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20 h-full hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white mx-auto mb-4"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <RefreshCw className="h-6 w-6" />
                    </motion.div>
                    <h3 className="font-bold text-gray-900 mb-2">Try Again</h3>
                    <p className="text-sm text-gray-600 mb-4">Return to checkout and retry your payment</p>
                    <Button size="sm" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white" asChild>
                      <Link href="/checkout">
                        Retry Payment
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }}>
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20 h-full hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white mx-auto mb-4"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <CreditCard className="h-6 w-6" />
                    </motion.div>
                    <h3 className="font-bold text-gray-900 mb-2">Different Method</h3>
                    <p className="text-sm text-gray-600 mb-4">Try a different payment method</p>
                    <Button size="sm" variant="outline" className="w-full">
                      Change Payment Method
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }}>
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20 h-full hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white mx-auto mb-4"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <HelpCircle className="h-6 w-6" />
                    </motion.div>
                    <h3 className="font-bold text-gray-900 mb-2">Get Help</h3>
                    <p className="text-sm text-gray-600 mb-4">Contact our support team</p>
                    <Button size="sm" variant="outline" className="w-full" asChild>
                      <Link href="/contact">
                        Contact Support
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Common Issues */}
            <motion.div
              className="mb-16"
              variants={itemVariants}
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Common Payment Issues
                </h2>
                <p className="text-lg text-gray-600">
                  Here are some common reasons payments fail and how to resolve them
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {commonIssues.map((issue, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20 h-full">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white">
                            {issue.icon}
                          </div>
                          {issue.title}
                        </CardTitle>
                        <CardDescription>{issue.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900 mb-2">How to resolve:</h4>
                          <ul className="space-y-1">
                            {issue.solutions.map((solution, sIndex) => (
                              <li key={sIndex} className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-600">{solution}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Alternative Payment Methods */}
            <motion.div
              className="mb-16"
              variants={itemVariants}
            >
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle>Alternative Payment Methods</CardTitle>
                  <CardDescription>
                    Try a different payment method to complete your subscription
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {alternativePaymentMethods.map((method, index) => (
                      <motion.div
                        key={index}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          method.available
                            ? "border-gray-200 hover:border-blue-500 hover:bg-blue-50"
                            : "border-gray-100 opacity-50 cursor-not-allowed"
                        }`}
                        whileHover={method.available ? { scale: 1.02 } : {}}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-8 h-8 ${method.color} rounded flex items-center justify-center text-white font-bold text-sm`}>
                            {method.icon || method.name[0]}
                          </div>
                          <span className="font-medium text-gray-900">{method.name}</span>
                          {!method.available && (
                            <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">{method.description}</p>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-6 text-center">
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white" asChild>
                      <Link href="/checkout">
                        Choose Payment Method
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Support Options */}
            <motion.div
              className="grid md:grid-cols-3 gap-6 mb-16"
              variants={itemVariants}
            >
              {supportOptions.map((option, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20 h-full hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <motion.div
                        className={`w-12 h-12 bg-gradient-to-r ${option.color} rounded-full flex items-center justify-center text-white mx-auto mb-4`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        {option.icon}
                      </motion.div>
                      <h3 className="font-bold text-gray-900 mb-2">{option.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                      <p className="text-xs text-gray-500 mb-4">{option.availability}</p>
                      <Button size="sm" className="w-full">
                        {option.action}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Free Trial Option */}
            <motion.div
              className="text-center bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-12 text-white mb-16"
              variants={itemVariants}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                <Info className="h-16 w-16 mx-auto mb-6 opacity-80" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-4">Still Want to Try Premium?</h2>
              <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                Even though your payment didn't go through, you can still explore our platform
                with a free account and try again later when you're ready.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100" asChild>
                  <Link href="/auth/signup">
                    Create Free Account
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                  <Link href="/forecasters">
                    Browse Free Content
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Navigation */}
            <motion.div
              className="flex justify-center gap-4"
              variants={itemVariants}
            >
              <Button variant="outline" size="lg" asChild>
                <Link href="/pricing">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Pricing
                </Link>
              </Button>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white" asChild>
                <Link href="/">
                  Return Home
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
    </>
  );
};

export default PaymentFailed;