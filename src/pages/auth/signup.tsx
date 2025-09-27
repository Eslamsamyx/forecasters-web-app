import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Mail,
  Lock,
  User,
  UserPlus,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  X,
  Github,
  Chrome,
  Twitter,
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
  BarChart3,
  Sparkles
} from "lucide-react";

const SignUp: NextPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Password strength calculation
  const calculatePasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (pass.length >= 12) strength++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
    if (/\d/.test(pass)) strength++;
    if (/[^a-zA-Z0-9]/.test(pass)) strength++;
    return strength;
  };

  const passwordStrength = calculatePasswordStrength(password);
  const passwordStrengthText = ["Very Weak", "Weak", "Fair", "Good", "Strong"][passwordStrength] || "Very Weak";
  const passwordStrengthColor = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-emerald-500"][passwordStrength] || "bg-gray-200";

  const registerMutation = api.auth.register.useMutation({
    onSuccess: async () => {
      // Auto sign in after registration
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.ok) {
        router.push("/dashboard");
      }
    },
    onError: (err) => {
      setError(err.message || "Registration failed");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions");
      return;
    }

    if (passwordStrength < 2) {
      setError("Please choose a stronger password");
      return;
    }

    setIsLoading(true);

    registerMutation.mutate({
      email,
      password,
      fullName,
    });

    setIsLoading(false);
  };

  const handleSocialSignUp = async (provider: string) => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch (err) {
      setError("Failed to sign up with " + provider);
      setIsLoading(false);
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

  const passwordRequirements = [
    { met: password.length >= 8, text: "8+ characters" },
    { met: /[A-Z]/.test(password), text: "Uppercase" },
    { met: /[a-z]/.test(password), text: "Lowercase" },
    { met: /\d/.test(password), text: "Number" },
    { met: /[^a-zA-Z0-9]/.test(password), text: "Special char" },
  ];

  return (
    <>
      <Head>
        <title>Sign Up - Prediction Prism Analytics</title>
        <meta name="description" content="Create your Prediction Prism Analytics account and start tracking forecasters" />
      </Head>
      <motion.div
        className="min-h-screen relative flex"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Side - Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
          <motion.div
            className="w-full max-w-md"
            variants={itemVariants}
          >
            {/* Logo */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-block">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg mb-4">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Create your account
              </h1>
              <p className="text-gray-600 mt-1">
                Start your free 14-day trial
              </p>
            </div>

            {/* Form Card */}
            <Card className="w-full border-0 shadow-2xl bg-white/95 backdrop-blur">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error Alert */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3"
                    >
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <span className="text-sm text-red-800">{error}</span>
                    </motion.div>
                  )}

                  {/* Full Name Input */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                      Full Name
                    </Label>
                    <div className="relative group">
                      <input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full h-12 pl-4 pr-4 text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 placeholder:text-gray-400"
                        required
                        disabled={isLoading || registerMutation.isPending}
                        autoComplete="name"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email
                    </Label>
                    <div className="relative group">
                      <input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-12 pl-4 pr-4 text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 placeholder:text-gray-400"
                        required
                        disabled={isLoading || registerMutation.isPending}
                        autoComplete="email"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <div className="relative group">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-12 pl-4 pr-12 text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 placeholder:text-gray-400"
                        required
                        disabled={isLoading || registerMutation.isPending}
                        autoComplete="new-password"
                        minLength={8}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
                          tabIndex={-1}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Password Strength Indicator */}
                    {password && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-3"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Password strength:</span>
                          <span className={`font-medium ${
                            passwordStrength < 2 ? "text-red-500" :
                            passwordStrength < 4 ? "text-yellow-500" :
                            "text-green-500"
                          }`}>
                            {passwordStrengthText}
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${passwordStrengthColor} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {passwordRequirements.map((req, idx) => (
                            <div key={idx} className="flex items-center gap-1">
                              <div className={`h-1.5 w-1.5 rounded-full ${req.met ? 'bg-green-500' : 'bg-gray-300'}`} />
                              <span className={`text-xs ${req.met ? 'text-gray-600' : 'text-gray-400'}`}>
                                {req.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Terms and Conditions */}
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                      className="mt-1 border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm text-gray-600 cursor-pointer select-none"
                    >
                      I agree to the{" "}
                      <Link href="/terms" className="text-blue-600 hover:underline">
                        Terms
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base rounded-lg shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 transform hover:-translate-y-0.5 transition-all duration-200"
                    disabled={isLoading || registerMutation.isPending || !agreedToTerms}
                  >
                    {isLoading || registerMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="px-4 bg-white text-gray-500 tracking-wider">Or</span>
                    </div>
                  </div>

                  {/* Social Login */}
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 border-gray-200 hover:bg-gray-50 text-gray-700 font-medium group"
                      onClick={() => handleSocialSignUp("google")}
                      disabled={isLoading || registerMutation.isPending}
                    >
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 border-gray-200 hover:bg-gray-50 text-gray-700 font-medium group"
                      onClick={() => handleSocialSignUp("github")}
                      disabled={isLoading || registerMutation.isPending}
                    >
                      <Github className="w-5 h-5 mr-3" />
                      Continue with GitHub
                    </Button>
                  </div>

                  {/* Sign In Link */}
                  <p className="text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                      href="/auth/signin"
                      className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Side - Feature Showcase */}
        <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
          {/* Pattern overlay */}
          <div className="absolute inset-0 bg-grid-white/5 bg-grid-16"></div>

          {/* Animated shapes */}
          <motion.div
            className="absolute top-20 right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 left-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0]
            }}
            transition={{ duration: 25, repeat: Infinity }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center px-12 text-white">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-4xl font-bold mb-6 text-white">
                Join Thousands of Successful Traders
              </h2>
              <p className="text-xl text-white/90 mb-12">
                Get instant access to premium market predictions
              </p>

              {/* Feature Cards */}
              <div className="space-y-4">
                <motion.div
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Shield className="h-8 w-8 mb-3 text-blue-400" />
                  <h3 className="text-lg font-semibold mb-2 text-white">Bank-Level Security</h3>
                  <p className="text-slate-300">Your data is encrypted and protected with industry-leading security</p>
                </motion.div>

                <motion.div
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <BarChart3 className="h-8 w-8 mb-3 text-blue-400" />
                  <h3 className="text-lg font-semibold mb-2 text-white">Advanced Analytics</h3>
                  <p className="text-slate-300">AI-powered insights and real-time market analysis</p>
                </motion.div>

                <motion.div
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Sparkles className="h-8 w-8 mb-3 text-blue-400" />
                  <h3 className="text-lg font-semibold mb-2 text-white">Premium Features</h3>
                  <p className="text-slate-300">Unlock exclusive forecasts and advanced trading signals</p>
                </motion.div>
              </div>

              {/* Trust Indicators */}
              <motion.div
                className="flex gap-8 mt-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div>
                  <div className="text-3xl font-bold text-white">14 Days</div>
                  <div className="text-slate-400">Free Trial</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">24/7</div>
                  <div className="text-slate-400">Support</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">100%</div>
                  <div className="text-slate-400">Secure</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default SignUp;