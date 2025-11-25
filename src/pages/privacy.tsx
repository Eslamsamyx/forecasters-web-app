"use client";

import { type NextPage } from "next";
import Head from "next/head";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const PrivacyPage: NextPage = () => {
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
        <title>Privacy Policy - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Learn how Prediction Prism Analytics protects your privacy and handles your personal information."
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
                Privacy Policy
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
                    <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      We collect information you provide directly to us, such as when you create an account, subscribe to our service, or contact us for support.
                    </p>
                    <h3 className="text-xl font-semibold mb-2">Personal Information</h3>
                    <ul className="list-disc pl-6 text-gray-600 leading-relaxed">
                      <li>Name and email address</li>
                      <li>Account preferences and settings</li>
                      <li>Payment information (processed securely by third-party providers)</li>
                      <li>Communications with our support team</li>
                    </ul>
                  </motion.section>

                  <motion.section className="mb-8" variants={itemVariants}>
                    <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      We use the information we collect to:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 leading-relaxed">
                      <li>Provide, maintain, and improve our services</li>
                      <li>Process transactions and send related information</li>
                      <li>Send technical notices and support messages</li>
                      <li>Communicate with you about products, services, and events</li>
                      <li>Monitor and analyze trends and usage</li>
                      <li>Detect, investigate, and prevent fraudulent transactions</li>
                    </ul>
                  </motion.section>

                  <motion.section className="mb-8" variants={itemVariants}>
                    <h2 className="text-2xl font-bold mb-4">3. Information Sharing</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      We do not sell, trade, or otherwise transfer your personal information to third parties except as described in this policy:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 leading-relaxed">
                      <li>With your consent</li>
                      <li>To comply with legal obligations</li>
                      <li>To protect our rights and safety</li>
                      <li>With service providers who assist in our operations</li>
                      <li>In connection with a merger, sale, or acquisition</li>
                    </ul>
                  </motion.section>

                  <motion.section className="mb-8" variants={itemVariants}>
                    <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
                    <p className="text-gray-600 leading-relaxed">
                      We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
                    </p>
                  </motion.section>

                  <motion.section className="mb-8" variants={itemVariants}>
                    <h2 className="text-2xl font-bold mb-4">5. Your Rights</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Depending on your location, you may have certain rights regarding your personal information:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 leading-relaxed">
                      <li>Access to your personal information</li>
                      <li>Correction of inaccurate data</li>
                      <li>Deletion of your personal information</li>
                      <li>Portability of your data</li>
                      <li>Restriction of processing</li>
                      <li>Objection to processing</li>
                    </ul>
                  </motion.section>

                  <motion.section className="mb-8" variants={itemVariants}>
                    <h2 className="text-2xl font-bold mb-4">6. Data Retention</h2>
                    <p className="text-gray-600 leading-relaxed">
                      We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. When we no longer need your information, we will securely delete or anonymize it.
                    </p>
                  </motion.section>

                  <motion.section className="mb-8" variants={itemVariants}>
                    <h2 className="text-2xl font-bold mb-4">7. International Transfers</h2>
                    <p className="text-gray-600 leading-relaxed">
                      Your information may be transferred to and processed in countries other than your own. We ensure that such transfers are made in accordance with applicable data protection laws and with appropriate safeguards in place.
                    </p>
                  </motion.section>

                  <motion.section className="mb-8" variants={itemVariants}>
                    <h2 className="text-2xl font-bold mb-4">8. Children's Privacy</h2>
                    <p className="text-gray-600 leading-relaxed">
                      Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
                    </p>
                  </motion.section>

                  <motion.section className="mb-8" variants={itemVariants}>
                    <h2 className="text-2xl font-bold mb-4">9. Changes to This Policy</h2>
                    <p className="text-gray-600 leading-relaxed">
                      We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy on our website and, where appropriate, by other means such as email notification.
                    </p>
                  </motion.section>

                  <motion.section className="mb-8" variants={itemVariants}>
                    <h2 className="text-2xl font-bold mb-4">10. Contact Us</h2>
                    <p className="text-gray-600 leading-relaxed">
                      If you have any questions about this Privacy Policy, please contact us at{" "}
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

export default PrivacyPage;

// Force server-side rendering to avoid SSG issues with useRouter in Next.js 16
export async function getServerSideProps() {
  return { props: {} };
}