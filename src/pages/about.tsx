"use client";

import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Target,
  Users,
  TrendingUp,
  Shield,
  Brain,
  BarChart3,
  Award,
  Heart,
  Lightbulb,
  Globe
} from "lucide-react";

const About: NextPage = () => {
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

  const stats = [
    { label: "Forecasters Tracked", value: "2,847", change: "+247 this month" },
    { label: "Predictions Analyzed", value: "156K+", change: "+12K this week" },
    { label: "Average Accuracy", value: "73.2%", change: "Industry leading" },
    { label: "Global Users", value: "12,934", change: "Across 45 countries" }
  ];

  const values = [
    {
      icon: <Shield className="h-8 w-8 text-finance-600" />,
      title: "Transparency",
      description: "Every prediction is tracked publicly with full accountability."
    },
    {
      icon: <Target className="h-8 w-8 text-finance-600" />,
      title: "Accuracy",
      description: "Data-driven insights based on verified track records."
    },
    {
      icon: <Heart className="h-8 w-8 text-finance-600" />,
      title: "Integrity",
      description: "Unbiased analysis without conflicts of interest."
    },
    {
      icon: <Globe className="h-8 w-8 text-finance-600" />,
      title: "Accessibility",
      description: "Making financial insights available to everyone."
    }
  ];

  const team = [
    {
      name: "Alex Chen",
      role: "Co-Founder & CEO",
      bio: "Former Goldman Sachs quantitative analyst with 12 years in algorithmic trading.",
      expertise: "Machine Learning, Financial Markets"
    },
    {
      name: "Sarah Rodriguez",
      role: "Co-Founder & CTO",
      bio: "Ex-Google engineer specializing in large-scale data processing and AI systems.",
      expertise: "AI/ML, Data Engineering"
    },
    {
      name: "David Kim",
      role: "Head of Research",
      bio: "PhD in Economics from MIT, former Federal Reserve research economist.",
      expertise: "Economic Analysis, Forecasting"
    }
  ];

  const capabilities = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI-Powered Analysis",
      description: "Advanced algorithms process thousands of predictions daily"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Real-Time Tracking",
      description: "Live monitoring of predictions and accuracy updates"
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Performance Rankings",
      description: "Objective scoring based on verified track records"
    }
  ];

  return (
    <>
      <Head>
        <title>About Us - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Learn about Prediction Prism Analytics and our mission to bring clarity to financial predictions."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <div className="min-h-screen">
          {/* Hero Section */}
          <section className="relative py-20 lg:py-32 bg-gradient-to-br from-slate-900 via-finance-900 to-slate-800 text-white overflow-hidden">
            <div className="absolute inset-0 z-0">
              <Image
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                alt="Team collaboration"
                fill
                className="object-cover opacity-20"
                priority
              />
            </div>

            <motion.div
              className="relative z-10 container px-4 md:px-6 mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="max-w-4xl mx-auto text-center">
                <motion.div variants={itemVariants}>
                  <Badge className="mb-6 bg-finance-600/20 text-finance-200 border-finance-600/30">
                    About Prediction Prism Analytics
                  </Badge>
                </motion.div>

                <motion.h1
                  className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-finance-200 to-finance-300 bg-clip-text text-transparent"
                  variants={itemVariants}
                >
                  Bringing Clarity to Financial Predictions
                </motion.h1>

                <motion.p
                  className="text-xl md:text-2xl text-finance-100 mb-8 max-w-3xl mx-auto leading-relaxed"
                  variants={itemVariants}
                >
                  We track, analyze, and rank financial forecasters to help investors identify who truly delivers results.
                </motion.p>

                <motion.div variants={itemVariants}>
                  <Button
                    className="bg-finance-600 hover:bg-finance-700 text-white px-8 py-3 text-lg"
                    size="lg"
                    asChild
                  >
                    <Link href="/forecasters">
                      Explore Forecasters <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </section>

          {/* Stats Section */}
          <section className="py-16 bg-white">
            <motion.div
              className="container px-4 md:px-6 mx-auto"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    className="text-center"
                    variants={itemVariants}
                  >
                    <div className="text-3xl md:text-4xl font-bold text-finance-600 mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {stat.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {stat.change}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Mission Section */}
          <section className="py-20 bg-gray-50">
            <motion.div
              className="container px-4 md:px-6 mx-auto"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="max-w-4xl mx-auto text-center mb-16">
                <motion.h2
                  className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
                  variants={itemVariants}
                >
                  Our Mission
                </motion.h2>
                <motion.p
                  className="text-lg text-gray-600 leading-relaxed"
                  variants={itemVariants}
                >
                  In a world flooded with financial predictions, we believe investors deserve transparency and accountability.
                  Our platform tracks the real performance of financial forecasters, providing you with the data you need to
                  make informed decisions about who to trust with your investment strategy.
                </motion.p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {values.map((value, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-6 text-center">
                        <div className="flex justify-center mb-4">
                          {value.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          {value.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {value.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Capabilities Section */}
          <section className="py-20 bg-white">
            <motion.div
              className="container px-4 md:px-6 mx-auto"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="max-w-4xl mx-auto text-center mb-16">
                <motion.h2
                  className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
                  variants={itemVariants}
                >
                  How We Do It
                </motion.h2>
                <motion.p
                  className="text-lg text-gray-600 leading-relaxed"
                  variants={itemVariants}
                >
                  Our advanced technology platform combines AI-powered analysis with rigorous verification
                  to deliver the most accurate forecaster performance data in the industry.
                </motion.p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {capabilities.map((capability, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-finance-100 rounded-lg flex items-center justify-center text-finance-600">
                            {capability.icon}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 ml-4">
                            {capability.title}
                          </h3>
                        </div>
                        <p className="text-gray-600">
                          {capability.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Team Section */}
          <section className="py-20 bg-gray-50">
            <motion.div
              className="container px-4 md:px-6 mx-auto"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="max-w-4xl mx-auto text-center mb-16">
                <motion.h2
                  className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
                  variants={itemVariants}
                >
                  Meet the Team
                </motion.h2>
                <motion.p
                  className="text-lg text-gray-600 leading-relaxed"
                  variants={itemVariants}
                >
                  Our team combines decades of experience in finance, technology, and data science
                  to deliver unparalleled insights into forecaster performance.
                </motion.p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {team.map((member, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-6 text-center">
                        <div className="w-20 h-20 bg-gradient-to-r from-finance-500 to-finance-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {member.name}
                        </h3>
                        <p className="text-finance-600 font-medium mb-3">
                          {member.role}
                        </p>
                        <p className="text-gray-600 text-sm mb-3">
                          {member.bio}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {member.expertise}
                        </Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* CTA Section */}
          <section className="py-20 bg-gradient-to-r from-finance-600 to-finance-700 text-white">
            <motion.div
              className="container px-4 md:px-6 mx-auto text-center"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.h2
                className="text-3xl md:text-4xl font-bold mb-6"
                variants={itemVariants}
              >
                Ready to Find Top Forecasters?
              </motion.h2>
              <motion.p
                className="text-xl text-finance-100 mb-8 max-w-2xl mx-auto"
                variants={itemVariants}
              >
                Join thousands of investors who use our platform to identify the most accurate financial forecasters.
              </motion.p>
              <motion.div variants={itemVariants}>
                <Button
                  className="bg-white text-finance-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
                  size="lg"
                  asChild
                >
                  <Link href="/forecasters">
                    Start Exploring <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </section>
        </div>
    </>
  );
};

export default About;