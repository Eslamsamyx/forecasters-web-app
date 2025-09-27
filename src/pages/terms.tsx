"use client";

import { type NextPage } from "next";
import Head from "next/head";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const TermsPage: NextPage = () => {
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
        <title>Terms of Service - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Review the terms of service for using Prediction Prism Analytics platform."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <motion.div
          className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div
              className="text-center mb-16"
              variants={itemVariants}
            >
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent tracking-tight mb-6">
                Terms of Service
              </h1>
              <p className="text-lg text-gray-600">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </motion.div>

            <Card className="shadow-xl bg-white/90 backdrop-blur-xl border-white/20">
              <CardContent className="p-8">
                <motion.div
                  className="prose prose-lg max-w-none"
                  variants={itemVariants}
                >
                  <motion.section className="mb-8" variants={itemVariants}>
                    <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                    <p className="text-gray-600 leading-relaxed">
                      By accessing and using Prediction Prism Analytics ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                    </p>
                  </motion.section>

                  <motion.section className="mb-8" variants={itemVariants}>
                    <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
                    <p className="text-gray-600 leading-relaxed">
                      Prediction Prism Analytics provides a platform for tracking and analyzing financial predictions made by various forecasters. Our service includes accuracy tracking, performance metrics, and insights based on historical data.
                    </p>
                  </motion.section>

                  <motion.section className="mb-8" variants={itemVariants}>
                    <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      To access certain features of our service, you may be required to create an account. You agree to:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 leading-relaxed">
                      <li>Provide accurate and complete information when creating your account</li>
                      <li>Maintain the security of your password and account</li>
                      <li>Notify us immediately of any unauthorized use of your account</li>
                      <li>Accept responsibility for all activities under your account</li>
                    </ul>
                  </motion.section>

                  <motion.section className="mb-8" variants={itemVariants}>
                    <h2 className="text-2xl font-bold mb-4">4. Acceptable Use</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      You agree not to use the service to:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 leading-relaxed">
                      <li>Violate any applicable laws or regulations</li>
                      <li>Infringe on intellectual property rights</li>
                      <li>Transmit harmful or malicious code</li>
                      <li>Attempt to gain unauthorized access to our systems</li>
                      <li>Use the service for any commercial purpose without our consent</li>
                    </ul>
                  </motion.section>

                  <motion.section className="mb-8" variants={itemVariants}>
                    <h2 className="text-2xl font-bold mb-4">5. Financial Disclaimer</h2>
                    <p className="text-gray-600 leading-relaxed">
                      The information provided on our platform is for informational purposes only and should not be considered as financial advice. Past performance of forecasters does not guarantee future results. You should consult with a qualified financial advisor before making any investment decisions.
                    </p>
                  </motion.section>

                  <motion.section className="mb-8" variants={itemVariants}>
                    <h2 className="text-2xl font-bold mb-4">6. Intellectual Property</h2>
                    <p className="text-gray-600 leading-relaxed">
                      The service and its original content, features, and functionality are owned by Prediction Prism Analytics and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                    </p>
                  </motion.section>

                  <motion.section className="mb-8" variants={itemVariants}>
                    <h2 className="text-2xl font-bold mb-4">7. Privacy Policy</h2>
                    <p className="text-gray-600 leading-relaxed">
                      Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices.
                    </p>
                  </motion.section>

                  <motion.section className="mb-8" variants={itemVariants}>
                    <h2 className="text-2xl font-bold mb-4">8. Termination</h2>
                    <p className="text-gray-600 leading-relaxed">
                      We may terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>
                  </motion.section>

                  <motion.section className="mb-8" variants={itemVariants}>
                    <h2 className="text-2xl font-bold mb-4">9. Limitation of Liability</h2>
                    <p className="text-gray-600 leading-relaxed">
                      In no event shall Prediction Prism Analytics be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                    </p>
                  </motion.section>

                  <motion.section className="mb-8" variants={itemVariants}>
                    <h2 className="text-2xl font-bold mb-4">10. Changes to Terms</h2>
                    <p className="text-gray-600 leading-relaxed">
                      We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
                    </p>
                  </motion.section>

                  <motion.section className="mb-8" variants={itemVariants}>
                    <h2 className="text-2xl font-bold mb-4">11. Contact Information</h2>
                    <p className="text-gray-600 leading-relaxed">
                      If you have any questions about these Terms of Service, please contact us at{" "}
                      <a href="mailto:legal@predictionprism.com" className="text-blue-600 hover:underline">
                        legal@predictionprism.com
                      </a>.
                    </p>
                  </motion.section>
                </motion.div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
    </>
  );
};

export default TermsPage;