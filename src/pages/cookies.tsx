"use client";

import { type NextPage } from "next";
import Head from "next/head";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const CookiesPage: NextPage = () => {
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
        <title>Cookie Policy - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Learn how Prediction Prism Analytics uses cookies to enhance your experience."
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
                Cookie Policy
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
                    <h2 className="text-2xl font-bold mb-4">What Are Cookies?</h2>
                    <p className="text-gray-600 leading-relaxed">
                      Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and improving our service.
                    </p>
                  </motion.section>

                  <motion.section className="mb-8" variants={itemVariants}>
                    <h2 className="text-2xl font-bold mb-4">Types of Cookies We Use</h2>

                    <h3 className="text-xl font-semibold mb-2">Essential Cookies</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      These cookies are necessary for the website to function properly. They enable basic functions like page navigation and access to secure areas.
                    </p>

                    <h3 className="text-xl font-semibold mb-2">Analytics Cookies</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      We use analytics cookies to understand how visitors interact with our website, helping us improve our service and user experience.
                    </p>

                    <h3 className="text-xl font-semibold mb-2">Preference Cookies</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      These cookies remember your preferences and settings to provide a more personalized experience.
                    </p>

                    <h3 className="text-xl font-semibold mb-2">Marketing Cookies</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Marketing cookies track your activity across websites to deliver more relevant advertisements.
                    </p>
                  </motion.section>

                  <motion.section className="mb-8" variants={itemVariants}>
                    <h2 className="text-2xl font-bold mb-4">How We Use Cookies</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      We use cookies for the following purposes:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 leading-relaxed">
                      <li>To keep you logged in during your session</li>
                      <li>To remember your preferences and settings</li>
                      <li>To analyze website traffic and usage patterns</li>
                      <li>To improve our website performance and user experience</li>
                      <li>To provide personalized content and recommendations</li>
                      <li>To measure the effectiveness of our marketing campaigns</li>
                    </ul>
                  </motion.section>

                  <motion.section className="mb-8" variants={itemVariants}>
                    <h2 className="text-2xl font-bold mb-4">Third-Party Cookies</h2>
                    <p className="text-gray-600 leading-relaxed">
                      We may also use third-party services that place cookies on your device. These include analytics providers, advertising networks, and social media platforms. These third parties have their own privacy policies and cookie policies.
                    </p>
                  </motion.section>

                  <motion.section className="mb-8" variants={itemVariants}>
                    <h2 className="text-2xl font-bold mb-4">Managing Cookies</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      You can control and manage cookies in several ways:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 leading-relaxed">
                      <li>Browser settings: Most browsers allow you to view, delete, and block cookies</li>
                      <li>Opt-out tools: Many advertising networks provide opt-out mechanisms</li>
                      <li>Our cookie preferences: You can adjust your cookie preferences in your account settings</li>
                    </ul>
                    <p className="text-gray-600 leading-relaxed mt-4">
                      Please note that disabling certain cookies may affect the functionality of our website.
                    </p>
                  </motion.section>

                  <motion.section className="mb-8" variants={itemVariants}>
                    <h2 className="text-2xl font-bold mb-4">Cookie Retention</h2>
                    <p className="text-gray-600 leading-relaxed">
                      The length of time cookies remain on your device depends on their type:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 leading-relaxed mt-4">
                      <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
                      <li><strong>Persistent cookies:</strong> Remain until they expire or you delete them</li>
                      <li><strong>Essential cookies:</strong> Typically expire after your session ends</li>
                      <li><strong>Analytics cookies:</strong> Usually expire after 1-2 years</li>
                    </ul>
                  </motion.section>

                  <motion.section className="mb-8" variants={itemVariants}>
                    <h2 className="text-2xl font-bold mb-4">Updates to This Policy</h2>
                    <p className="text-gray-600 leading-relaxed">
                      We may update this Cookie Policy from time to time to reflect changes in our practices or applicable law. We will notify you of any material changes by posting the updated policy on our website.
                    </p>
                  </motion.section>

                  <motion.section className="mb-8" variants={itemVariants}>
                    <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                    <p className="text-gray-600 leading-relaxed">
                      If you have any questions about our use of cookies, please contact us at{" "}
                      <a href="mailto:privacy@predictionprism.com" className="text-blue-600 hover:underline">
                        privacy@predictionprism.com
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

export default CookiesPage;