"use client";

import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  CreditCard,
  Lock,
  Shield,
  Check,
  AlertCircle,
  Crown,
  Star,
  Users,
  Target,
  BarChart3,
  Calendar,
  Gift,
  Percent,
  ArrowLeft,
  ArrowRight,
  Zap,
  Award
} from "lucide-react";

const Checkout: NextPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<"premium" | "enterprise">("premium");
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = {
    premium: {
      name: "Premium",
      monthlyPrice: 29,
      yearlyPrice: 290,
      yearlyDiscount: 17,
      features: [
        "Unlimited forecaster tracking",
        "Complete rankings & analytics",
        "Advanced prediction insights",
        "Full historical data access",
        "Real-time price alerts",
        "API access for developers",
        "Custom watchlists",
        "Export data to CSV/JSON",
        "Priority customer support",
        "Early access to new features"
      ]
    },
    enterprise: {
      name: "Enterprise",
      monthlyPrice: 99,
      yearlyPrice: 990,
      yearlyDiscount: 17,
      features: [
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
      ]
    }
  };

  const currentPlan = plans[selectedPlan];
  const currentPrice = billingPeriod === "monthly" ? currentPlan.monthlyPrice : currentPlan.yearlyPrice;
  const savings = billingPeriod === "yearly" ? (currentPlan.monthlyPrice * 12 - currentPlan.yearlyPrice) : 0;

  const mockCoupons = {
    "SAVE20": { discount: 20, type: "percentage" },
    "FIRST50": { discount: 50, type: "percentage" },
    "WELCOME10": { discount: 10, type: "fixed" }
  };

  const applyCoupon = () => {
    const coupon = mockCoupons[couponCode as keyof typeof mockCoupons];
    if (coupon) {
      setAppliedCoupon({ code: couponCode, ...coupon });
    }
  };

  const calculateTotal = () => {
    let total = currentPrice;
    if (appliedCoupon) {
      if (appliedCoupon.type === "percentage") {
        total = total * (1 - appliedCoupon.discount / 100);
      } else {
        total = Math.max(0, total - appliedCoupon.discount);
      }
    }
    return total;
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    // Redirect to success page
    window.location.href = "/success";
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
        <title>Checkout - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Complete your subscription to access premium forecasting analytics and insights."
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
              className="text-center max-w-3xl mx-auto mb-12"
              variants={itemVariants}
            >
              <Badge variant="secondary" className="mb-4">
                <Crown className="w-4 h-4 mr-2" />
                Secure Checkout
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Complete Your
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Subscription</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Join thousands of successful investors. Start your 7-day free trial today.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Order Summary */}
              <motion.div
                className="lg:col-span-1 order-2 lg:order-1"
                variants={itemVariants}
              >
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20 sticky top-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Plan Selection */}
                    <div className="space-y-3">
                      <div
                        onClick={() => setSelectedPlan("premium")}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedPlan === "premium"
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">Premium</span>
                            <Badge className="bg-green-100 text-green-700">Popular</Badge>
                          </div>
                          <span className="font-bold">
                            ${billingPeriod === "monthly" ? "29" : "290"}
                            <span className="text-sm text-gray-500">/{billingPeriod.slice(0, -2)}</span>
                          </span>
                        </div>
                      </div>
                      <div
                        onClick={() => setSelectedPlan("enterprise")}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedPlan === "enterprise"
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Crown className="h-5 w-5 text-purple-600" />
                            <span className="font-medium">Enterprise</span>
                          </div>
                          <span className="font-bold">
                            ${billingPeriod === "monthly" ? "99" : "990"}
                            <span className="text-sm text-gray-500">/{billingPeriod.slice(0, -2)}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Billing Period */}
                    <div className="bg-gray-50 rounded-lg p-1">
                      <div className="grid grid-cols-2 gap-1">
                        <button
                          onClick={() => setBillingPeriod("monthly")}
                          className={`py-2 px-3 rounded text-sm font-medium transition-all ${
                            billingPeriod === "monthly"
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          Monthly
                        </button>
                        <button
                          onClick={() => setBillingPeriod("yearly")}
                          className={`py-2 px-3 rounded text-sm font-medium transition-all ${
                            billingPeriod === "yearly"
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          Yearly
                          <Badge className="ml-1 bg-green-100 text-green-700 text-xs">Save 17%</Badge>
                        </button>
                      </div>
                    </div>

                    {/* Coupon Code */}
                    <div className="border-t pt-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={applyCoupon}
                          disabled={!couponCode}
                        >
                          <Gift className="h-4 w-4" />
                        </Button>
                      </div>
                      {appliedCoupon && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            Coupon "{appliedCoupon.code}" applied!
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Price Breakdown */}
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span>{currentPlan.name} Plan ({billingPeriod})</span>
                        <span>${currentPrice}</span>
                      </div>
                      {billingPeriod === "yearly" && (
                        <div className="flex items-center justify-between text-green-600">
                          <span className="flex items-center gap-1">
                            <Percent className="h-3 w-3" />
                            Yearly Discount
                          </span>
                          <span>-${savings}</span>
                        </div>
                      )}
                      {appliedCoupon && (
                        <div className="flex items-center justify-between text-green-600">
                          <span>Coupon ({appliedCoupon.code})</span>
                          <span>
                            -{appliedCoupon.type === "percentage" ? `${appliedCoupon.discount}%` : `$${appliedCoupon.discount}`}
                          </span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex items-center justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Trial Notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Zap className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <strong>7-day free trial included</strong>
                          <br />
                          You won't be charged until {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">What's included:</h4>
                      <div className="space-y-2">
                        {currentPlan.features.slice(0, 5).map((feature, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                        <div className="text-sm text-gray-500">
                          + {currentPlan.features.length - 5} more features
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Payment Form */}
              <motion.div
                className="lg:col-span-2 order-1 lg:order-2"
                variants={itemVariants}
              >
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Information
                    </CardTitle>
                    <CardDescription>
                      Your payment information is secure and encrypted
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Payment Method */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-3 block">
                        Payment Method
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <div
                          onClick={() => setPaymentMethod("card")}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            paymentMethod === "card"
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            <span className="font-medium">Credit Card</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Visa, Mastercard, Amex
                          </div>
                        </div>
                        <div
                          onClick={() => setPaymentMethod("paypal")}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            paymentMethod === "paypal"
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                              P
                            </div>
                            <span className="font-medium">PayPal</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Pay with your PayPal account
                          </div>
                        </div>
                      </div>
                    </div>

                    {paymentMethod === "card" && (
                      <>
                        {/* Card Information */}
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                              Card Number
                            </label>
                            <Input
                              placeholder="1234 5678 9012 3456"
                              className="font-mono"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-1 block">
                                Expiry Date
                              </label>
                              <Input placeholder="MM/YY" className="font-mono" />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-1 block">
                                CVV
                              </label>
                              <Input placeholder="123" className="font-mono" />
                            </div>
                          </div>
                        </div>

                        {/* Billing Information */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-gray-700">Billing Information</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <Input placeholder="First Name" />
                            <Input placeholder="Last Name" />
                          </div>
                          <Input placeholder="Email Address" type="email" />
                          <Input placeholder="Address Line 1" />
                          <Input placeholder="Address Line 2 (Optional)" />
                          <div className="grid grid-cols-3 gap-4">
                            <Input placeholder="City" />
                            <Input placeholder="State" />
                            <Input placeholder="ZIP Code" />
                          </div>
                          <select className="w-full px-3 py-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select Country</option>
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="UK">United Kingdom</option>
                            <option value="AU">Australia</option>
                          </select>
                        </div>
                      </>
                    )}

                    {/* Terms and Privacy */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="terms"
                          className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <label htmlFor="terms" className="text-sm text-gray-700">
                          I agree to the{" "}
                          <Link href="/terms" className="text-blue-600 hover:underline">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy" className="text-blue-600 hover:underline">
                            Privacy Policy
                          </Link>
                          . I understand that my subscription will automatically renew and I can cancel anytime.
                        </label>
                      </div>
                    </div>

                    {/* Security Notice */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-700">
                        <Shield className="h-5 w-5" />
                        <span className="font-medium">Your payment is secure</span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        We use 256-bit SSL encryption to protect your payment information.
                        Your data is safe and never stored on our servers.
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                      <Button
                        variant="outline"
                        size="lg"
                        className="flex-1"
                        asChild
                      >
                        <Link href="/pricing">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back to Pricing
                        </Link>
                      </Button>
                      <Button
                        size="lg"
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        onClick={handlePayment}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          "Processing..."
                        ) : (
                          <>
                            Start Free Trial
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Money Back Guarantee */}
                    <div className="text-center pt-4 border-t">
                      <div className="flex items-center justify-center gap-2 text-gray-600">
                        <Award className="h-4 w-4" />
                        <span className="text-sm">30-day money-back guarantee</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Trust Indicators */}
            <motion.div
              className="mt-16 text-center max-w-4xl mx-auto"
              variants={itemVariants}
            >
              <div className="grid md:grid-cols-4 gap-8">
                <div className="flex flex-col items-center gap-2">
                  <Shield className="h-8 w-8 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">SSL Encrypted</span>
                  <span className="text-xs text-gray-500">Bank-level security</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Users className="h-8 w-8 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">12,000+ Users</span>
                  <span className="text-xs text-gray-500">Trusted worldwide</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Award className="h-8 w-8 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Money-back</span>
                  <span className="text-xs text-gray-500">30-day guarantee</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Lock className="h-8 w-8 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Cancel Anytime</span>
                  <span className="text-xs text-gray-500">No long-term contracts</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
    </>
  );
};

export default Checkout;