import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

const NotFoundPage: NextPage = () => {
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
        <title>404 - Page Not Found | Prediction Prism Analytics</title>
        <meta
          name="description"
          content="The page you are looking for could not be found."
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
          className="text-center max-w-2xl"
          variants={itemVariants}
        >
          {/* Animated 404 Number */}
          <motion.div
            className="relative mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
          >
            <h1 className="text-[150px] md:text-[200px] font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent leading-none">
              404
            </h1>
            <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-blue-400 to-indigo-400 opacity-20"></div>
          </motion.div>

          {/* Error Message */}
          <motion.div variants={itemVariants} className="space-y-4 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Page Not Found
            </h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={itemVariants}
          >
            <Button
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              size="lg"
              asChild
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go to Homepage
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.history.back()}
              className="border-blue-200 hover:bg-blue-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </motion.div>

          {/* Helpful Links */}
          <motion.div
            className="mt-12 pt-8 border-t border-gray-200"
            variants={itemVariants}
          >
            <p className="text-sm text-gray-600 mb-4">Here are some helpful links:</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/forecasters" className="text-blue-600 hover:text-blue-700 hover:underline">
                Forecasters
              </Link>
              <Link href="/predictions" className="text-blue-600 hover:text-blue-700 hover:underline">
                Predictions
              </Link>
              <Link href="/pricing" className="text-blue-600 hover:text-blue-700 hover:underline">
                Pricing
              </Link>
              <Link href="/contact" className="text-blue-600 hover:text-blue-700 hover:underline">
                Contact Us
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default NotFoundPage;