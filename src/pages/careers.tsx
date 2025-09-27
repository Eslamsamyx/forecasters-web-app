"use client";

import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Clock,
  DollarSign,
  Users,
  Code,
  TrendingUp,
  Brain,
  ArrowRight,
  Briefcase
} from "lucide-react";

const CareersPage: NextPage = () => {
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

  const benefits = [
    {
      icon: <DollarSign className="h-6 w-6 text-blue-600" />,
      title: "Competitive Salary",
      description: "Market-leading compensation packages with equity options"
    },
    {
      icon: <Clock className="h-6 w-6 text-blue-600" />,
      title: "Flexible Schedule",
      description: "Work-life balance with flexible hours and remote options"
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-blue-600" />,
      title: "Growth Opportunities",
      description: "Continuous learning and career advancement programs"
    },
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: "Great Team",
      description: "Work with passionate, talented individuals in fintech"
    }
  ];

  const openPositions = [
    {
      title: "Senior Full Stack Developer",
      department: "Engineering",
      location: "Remote / New York",
      type: "Full-time",
      salary: "$120k - $180k",
      description: "Join our engineering team to build the next generation of financial forecasting tools.",
      requirements: ["5+ years React/Node.js", "Experience with AI/ML", "Financial domain knowledge preferred"],
      icon: <Code className="h-6 w-6 text-blue-600" />
    },
    {
      title: "Data Scientist",
      department: "AI/ML",
      location: "Remote / San Francisco",
      type: "Full-time",
      salary: "$130k - $200k",
      description: "Lead our AI initiatives to improve prediction accuracy and develop new forecasting models.",
      requirements: ["PhD/MS in related field", "Python, TensorFlow/PyTorch", "Statistical modeling expertise"],
      icon: <Brain className="h-6 w-6 text-blue-600" />
    },
    {
      title: "Product Marketing Manager",
      department: "Marketing",
      location: "New York",
      type: "Full-time",
      salary: "$90k - $130k",
      description: "Drive product positioning and go-to-market strategies for our platform.",
      requirements: ["3+ years product marketing", "B2B SaaS experience", "Financial services background"],
      icon: <TrendingUp className="h-6 w-6 text-blue-600" />
    }
  ];

  return (
    <>
      <Head>
        <title>Careers - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Join our team and help revolutionize financial forecasting. Explore career opportunities at Prediction Prism Analytics."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <motion.div
          className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Hero Section */}
          <motion.section
            className="py-20 md:py-32"
            variants={itemVariants}
          >
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <motion.h1
                  className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent tracking-tight mb-6"
                  variants={itemVariants}
                >
                  Join Our Team
                </motion.h1>
                <motion.p
                  className="text-xl text-gray-600 mb-8"
                  variants={itemVariants}
                >
                  Help us revolutionize financial forecasting and build the future of
                  investment decision-making.
                </motion.p>
                <motion.div variants={itemVariants}>
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    size="lg"
                    asChild
                  >
                    <Link href="#positions">
                      View Open Positions <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.section>

          {/* Why Join Us */}
          <motion.section
            className="py-20"
            variants={itemVariants}
          >
            <div className="container mx-auto px-4">
              <motion.div
                className="text-center mb-16"
                variants={itemVariants}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Join Prediction Prism?</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  We're building the future of financial intelligence. Join our mission to democratize
                  access to high-quality market predictions and insights.
                </p>
              </motion.div>

              <motion.div
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
                variants={containerVariants}
              >
                {benefits.map((benefit, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <Card className="text-center h-full shadow-xl bg-white/90 backdrop-blur-xl border-white/20 hover:shadow-2xl transition-shadow">
                      <CardContent className="pt-6">
                        <div className="rounded-full bg-blue-100 p-3 w-fit mx-auto mb-4">
                          {benefit.icon}
                        </div>
                        <h3 className="font-semibold mb-2">{benefit.title}</h3>
                        <p className="text-sm text-gray-600">
                          {benefit.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.section>

          {/* Open Positions */}
          <motion.section
            id="positions"
            className="py-20"
            variants={itemVariants}
          >
            <div className="container mx-auto px-4">
              <motion.div
                className="text-center mb-16"
                variants={itemVariants}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Open Positions</h2>
                <p className="text-lg text-gray-600">
                  Discover opportunities to grow your career with us.
                </p>
              </motion.div>

              <motion.div
                className="grid gap-6 max-w-4xl mx-auto"
                variants={containerVariants}
              >
                {openPositions.map((position, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <Card className="shadow-xl bg-white/90 backdrop-blur-xl border-white/20 hover:shadow-2xl transition-all duration-300">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-100 p-2">
                              {position.icon}
                            </div>
                            <div>
                              <CardTitle className="text-xl">{position.title}</CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-1">
                                <Briefcase className="h-4 w-4" />
                                {position.department}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Open</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-600">{position.description}</p>

                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            {position.location}
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="h-4 w-4" />
                            {position.type}
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <DollarSign className="h-4 w-4" />
                            {position.salary}
                          </div>
                        </div>

                        <div>
                          <p className="font-medium mb-2">Requirements:</p>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {position.requirements.map((req, i) => (
                              <li key={i}>{req}</li>
                            ))}
                          </ul>
                        </div>

                        <Button
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                          asChild
                        >
                          <Link href={`/contact?position=${encodeURIComponent(position.title)}`}>
                            Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.section
            className="py-20"
            variants={itemVariants}
          >
            <div className="container mx-auto px-4">
              <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white max-w-4xl mx-auto">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold mb-4">Don't See the Right Position?</h3>
                  <p className="mb-6 text-blue-50">
                    We're always looking for talented individuals. Send us your resume and we'll keep
                    you in mind for future opportunities.
                  </p>
                  <Button
                    className="bg-white text-blue-600 hover:bg-gray-100"
                    asChild
                  >
                    <Link href="/contact">
                      Get in Touch <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.section>
        </motion.div>
    </>
  );
};

export default CareersPage;