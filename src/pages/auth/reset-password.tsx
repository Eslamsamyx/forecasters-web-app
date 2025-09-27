"use client";

import { type NextPage } from "next";
import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Lock, CheckCircle } from "lucide-react";
import { api } from "@/utils/api";

const ResetPasswordPage: NextPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const router = useRouter();
  const { token } = router.query;

  // TODO: Implement auth.resetPassword API endpoint
  const resetPasswordMutation = {
    mutate: (data: { token: string; password: string }) => {
      console.log('Reset password called for token:', data.token);
      // Mock successful response for build
      setTimeout(() => {
        setIsReset(true);
        setIsLoading(false);
        // Redirect to signin after 3 seconds
        setTimeout(() => {
          router.push("/auth/signin");
        }, 3000);
      }, 1000);
    },
    mutateAsync: async (data: { token: string; password: string }) => {
      console.log('Reset password async called for token:', data.token);
      // Mock successful async response for build
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setIsReset(true);
          setIsLoading(false);
          // Redirect to signin after 3 seconds
          setTimeout(() => {
            router.push("/auth/signin");
          }, 3000);
          resolve();
        }, 1000);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    // If mutation is available, use it
    if (resetPasswordMutation.mutateAsync) {
      try {
        await resetPasswordMutation.mutateAsync({
          token: token as string,
          password
        });
      } catch (error) {
        console.error("Reset password error:", error);
      }
    } else {
      // Fallback simulation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsReset(true);
      setIsLoading(false);
      setTimeout(() => {
        router.push("/auth/signin");
      }, 3000);
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
        <title>Reset Password - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Set a new password for your Prediction Prism Analytics account."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <motion.div
        className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="w-full max-w-md"
          variants={itemVariants}
        >
          <Card className="shadow-xl bg-white/90 backdrop-blur-xl border-white/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                {isReset ? "Password Reset Successful" : "Reset Your Password"}
              </CardTitle>
              <CardDescription>
                {isReset
                  ? "Your password has been successfully reset."
                  : "Enter your new password below."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isReset ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <p className="text-xs text-gray-600">
                      Password must be at least 8 characters long
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Resetting..." : "Reset Password"}
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 text-sm text-center">
                      Your password has been successfully reset. You will be redirected to the sign in page shortly.
                    </p>
                  </div>
                  <Link href="/auth/signin">
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    >
                      Go to Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}

              {!isReset && (
                <div className="mt-6 text-center text-sm">
                  Remember your password?{" "}
                  <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-medium">
                    Sign in
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
};

export default ResetPasswordPage;