"use client";

import { type NextPage } from "next";
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen, Calendar, Clock, Eye, ArrowRight, TrendingUp } from "lucide-react";
import { api } from "@/utils/api";

// Function to calculate reading time based on content
const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200; // Average reading speed
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return readingTime;
};

const ArticlesPage: NextPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Use tRPC to fetch articles
  const { data: articlesResponse, isLoading, error } = api.articles.getAll.useQuery({
    limit: 50
  });

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

  // Mock data for now if API not available
  const mockArticles = [
    {
      id: 1,
      title: "The Rise of AI in Financial Forecasting",
      excerpt: "How artificial intelligence is revolutionizing the way we predict market movements and analyze financial data.",
      category: "AI & Technology",
      author: "Dr. Sarah Chen",
      date: "2024-01-15",
      readTime: 8,
      views: 1234,
      featured: true,
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop"
    },
    {
      id: 2,
      title: "Cryptocurrency Market Analysis 2024",
      excerpt: "A deep dive into the cryptocurrency market trends and predictions for the upcoming year.",
      category: "Crypto",
      author: "Michael Roberts",
      date: "2024-01-14",
      readTime: 12,
      views: 987,
      featured: false,
      image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&h=400&fit=crop"
    },
    {
      id: 3,
      title: "Understanding Market Volatility",
      excerpt: "Key factors that drive market volatility and how to navigate uncertain times.",
      category: "Markets",
      author: "Emily Zhang",
      date: "2024-01-13",
      readTime: 6,
      views: 765,
      featured: false,
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop"
    },
    {
      id: 4,
      title: "The Future of DeFi",
      excerpt: "Exploring the potential of decentralized finance and its impact on traditional banking.",
      category: "DeFi",
      author: "Alex Thompson",
      date: "2024-01-12",
      readTime: 10,
      views: 543,
      featured: false,
      image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&h=400&fit=crop"
    }
  ];

  // Only use real data when it's loaded, otherwise show loading or empty state
  const articlesData = articlesResponse?.articles || [];
  const isUsingMockData = !articlesResponse?.articles;

  // Helper functions to handle different data structures
  const getArticleDate = (article: any) => {
    if (isUsingMockData) {
      return article.date;
    }
    const date = article.publishDate || article.createdAt;
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getArticleViews = (article: any) => {
    return isUsingMockData ? article.views : article.viewCount;
  };

  const getArticleReadTime = (article: any) => {
    if (isUsingMockData) {
      return article.readTime;
    }
    return calculateReadingTime(article.content || '');
  };

  // Filter and sort articles
  const filteredArticles = articlesData
    ?.filter((article: any) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          article.title?.toLowerCase().includes(query) ||
          article.excerpt?.toLowerCase().includes(query) ||
          article.category?.toLowerCase().includes(query)
        );
      }
      return true;
    })
    ?.filter((article: any) => {
      if (categoryFilter !== "all") {
        const articleCategory = typeof article.category === 'string'
          ? article.category
          : article.category?.name;
        return articleCategory === categoryFilter;
      }
      return true;
    })
    ?.sort((a: any, b: any) => {
      if (sortBy === "recent") {
        return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
      }
      if (sortBy === "popular") {
        return (b.views || 0) - (a.views || 0);
      }
      return 0;
    });

  const featuredArticle = filteredArticles?.find((article: any) => article.featured) || filteredArticles?.[0];
  const regularArticles = filteredArticles?.filter((article: any) => article.id !== featuredArticle?.id);

  // Get unique categories - handle both string and object categories
  const categories = [...new Set(articlesData?.map((article: any) => {
    if (typeof article.category === 'string') {
      return article.category;
    } else if (article.category?.name) {
      return article.category.name;
    }
    return null;
  }).filter(Boolean))];

  return (
    <>
      <Head>
        <title>Articles - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Deep analysis and expert predictions on financial markets, crypto, and emerging trends."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <motion.div
          className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="container mx-auto px-4 py-12 max-w-7xl">
            {/* Header */}
            <motion.div className="text-center mb-12" variants={itemVariants}>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Articles & Insights
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Deep analysis and expert predictions on financial markets, crypto, and emerging trends
              </p>
            </motion.div>

            {/* Filters */}
            <motion.div
              className="flex flex-col md:flex-row gap-4 mb-12"
              variants={itemVariants}
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search articles..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                defaultValue="recent"
                value={sortBy}
                onValueChange={setSortBy}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
              <Select
                defaultValue="all"
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category, index) => (
                    <SelectItem key={`category-${index}-${category}`} value={category as string}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            {/* Featured Article */}
            {featuredArticle && (
              <motion.div className="mb-12" variants={itemVariants}>
                <Link href={`/articles/${(featuredArticle as any)?.slug}`}>
                  <Card className="shadow-xl bg-white/90 backdrop-blur-xl border-white/20 hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer">
                    <div className="grid md:grid-cols-2 gap-0">
                      <div className="relative h-64 md:h-full">
                        <Image
                          src={(featuredArticle as any)?.image || "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop"}
                          alt={(featuredArticle as any)?.title || "Featured Article"}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        </div>
                      </div>
                      <div className="p-8">
                        <Badge className="mb-4 bg-blue-100 text-blue-700">
                          {typeof (featuredArticle as any)?.category === 'string'
                            ? (featuredArticle as any)?.category
                            : (featuredArticle as any)?.category?.name || 'Uncategorized'}
                        </Badge>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                          {(featuredArticle as any)?.title}
                        </h2>
                        <p className="text-gray-600 mb-6">
                          {(featuredArticle as any)?.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {getArticleDate(featuredArticle)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {getArticleReadTime(featuredArticle)} min read
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {getArticleViews(featuredArticle)} views
                            </span>
                          </div>
                          <ArrowRight className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            )}

            {/* Articles Grid */}
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
            >
              {regularArticles?.map((article: any) => (
                <motion.div key={(article as any)?.id} variants={itemVariants}>
                  <Link href={`/articles/${(article as any)?.slug}`}>
                    <Card className="shadow-xl bg-white/90 backdrop-blur-xl border-white/20 hover:shadow-2xl transition-all duration-300 cursor-pointer h-full">
                      <div className="relative h-48">
                        <Image
                          src={(article as any)?.image || "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop"}
                          alt={(article as any)?.title || "Article"}
                          fill
                          className="object-cover rounded-t-lg"
                        />
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-white/90 text-gray-700">
                            {typeof (article as any)?.category === 'string'
                              ? (article as any)?.category
                              : (article as any)?.category?.name || 'Uncategorized'}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                          {(article as any)?.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {(article as any)?.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {getArticleReadTime(article)} min
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {(article as any)?.viewCount}
                            </span>
                          </div>
                          <span className="text-xs">{new Date((article as any)?.publishDate || (article as any)?.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Empty State */}
            {filteredArticles?.length === 0 && (
              <motion.div
                className="text-center py-16"
                variants={itemVariants}
              >
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No articles found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </motion.div>
            )}
          </div>
        </motion.div>
    </>
  );
};

export default ArticlesPage;