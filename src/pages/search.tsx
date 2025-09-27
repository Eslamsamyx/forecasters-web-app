"use client";

import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search as SearchIcon,
  Filter,
  TrendingUp,
  Clock,
  Star,
  User,
  BarChart3,
  Target,
  Calendar,
  Tag,
  ArrowRight,
  Zap,
  Eye,
  Bookmark,
  Share2,
  Activity
} from "lucide-react";

const Search: NextPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"all" | "forecasters" | "predictions" | "articles">("all");
  const [sortBy, setSortBy] = useState<"relevance" | "accuracy" | "date" | "popularity">("relevance");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);

  const mockSearchResults = {
    forecasters: [
      {
        id: 1,
        name: "Michael Rodriguez",
        username: "@cryptomike",
        avatar: "MR",
        accuracy: 94.8,
        totalPredictions: 247,
        specialty: "Crypto Markets",
        verified: true,
        followers: 12500,
        description: "Crypto analyst with 5+ years experience in DeFi and blockchain technology"
      },
      {
        id: 2,
        name: "Sarah Chen",
        username: "@stocksarah",
        avatar: "SC",
        accuracy: 91.2,
        totalPredictions: 312,
        specialty: "Tech Stocks",
        verified: true,
        followers: 9800,
        description: "Former Goldman Sachs analyst specializing in tech sector valuations"
      }
    ],
    predictions: [
      {
        id: 1,
        forecaster: "Michael Rodriguez",
        title: "Bitcoin to reach $75,000 by Q2 2024",
        description: "Based on technical analysis and institutional adoption trends",
        accuracy: 94.8,
        date: "2024-01-15",
        status: "pending",
        category: "Crypto",
        votes: 234,
        comments: 45
      },
      {
        id: 2,
        forecaster: "Sarah Chen",
        title: "Apple stock will outperform S&P 500 in 2024",
        description: "Strong iPhone 15 sales and services growth driving momentum",
        accuracy: 91.2,
        date: "2024-01-12",
        status: "correct",
        category: "Stocks",
        votes: 189,
        comments: 67
      }
    ],
    articles: [
      {
        id: 1,
        title: "The Evolution of Crypto Prediction Markets",
        author: "Prediction Prism Team",
        excerpt: "How blockchain technology is revolutionizing financial forecasting and prediction accuracy...",
        date: "2024-01-10",
        readTime: "5 min read",
        category: "Analysis",
        tags: ["crypto", "blockchain", "predictions"],
        likes: 456
      }
    ]
  };

  const popularSearches = [
    "Bitcoin price prediction",
    "Tesla stock forecast",
    "Fed interest rates",
    "Ethereum merge impact",
    "Recession predictions",
    "Gold price analysis",
    "Oil market trends",
    "AI stock picks"
  ];

  const trendingTopics = [
    { name: "Crypto Market", searches: 1234, trend: "+12%" },
    { name: "Tech Stocks", searches: 987, trend: "+8%" },
    { name: "Interest Rates", searches: 756, trend: "+15%" },
    { name: "Oil Prices", searches: 543, trend: "+5%" }
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSearchResults(mockSearchResults);
    setIsSearching(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
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
        <title>Search - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Search for forecasters, predictions, market analysis, and insights across all financial markets."
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
              className="text-center max-w-4xl mx-auto mb-12"
              variants={itemVariants}
            >
              <Badge variant="secondary" className="mb-4">
                <SearchIcon className="w-4 h-4 mr-2" />
                Advanced Search
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Discover
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Everything</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Search across forecasters, predictions, market analysis, and insights.
                Find the information you need to make better investment decisions.
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              className="max-w-4xl mx-auto mb-12"
              variants={itemVariants}
            >
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardContent className="p-8">
                  <div className="flex flex-col gap-6">
                    {/* Main Search Input */}
                    <div className="relative">
                      <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
                      <Input
                        placeholder="Search forecasters, predictions, analysis..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-0"
                      />
                      <Button
                        onClick={handleSearch}
                        disabled={isSearching || !searchQuery.trim()}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        {isSearching ? "Searching..." : "Search"}
                      </Button>
                    </div>

                    {/* Search Filters */}
                    <div className="grid md:grid-cols-4 gap-4">
                      <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value as any)}
                        className="px-3 py-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Results</option>
                        <option value="forecasters">Forecasters</option>
                        <option value="predictions">Predictions</option>
                        <option value="articles">Articles</option>
                      </select>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-3 py-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="relevance">Most Relevant</option>
                        <option value="accuracy">Highest Accuracy</option>
                        <option value="date">Most Recent</option>
                        <option value="popularity">Most Popular</option>
                      </select>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Advanced Filters
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Date Range
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Search Results */}
            {searchResults ? (
              <motion.div
                className="space-y-8"
                variants={itemVariants}
              >
                {/* Forecasters Results */}
                {searchResults.forecasters.length > 0 && (
                  <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Forecasters ({searchResults.forecasters.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {searchResults.forecasters.map((forecaster: any) => (
                          <div key={forecaster.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                                  {forecaster.avatar}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-gray-900">{forecaster.name}</h3>
                                    {forecaster.verified && (
                                      <Badge className="bg-green-100 text-green-700 text-xs">Verified</Badge>
                                    )}
                                  </div>
                                  <p className="text-gray-600 text-sm">{forecaster.username} • {forecaster.specialty}</p>
                                  <p className="text-gray-500 text-sm mt-1">{forecaster.description}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-green-600">{forecaster.accuracy}%</div>
                                <div className="text-sm text-gray-500">{forecaster.totalPredictions} predictions</div>
                                <Button size="sm" className="mt-2" asChild>
                                  <Link href={`/forecasters/${forecaster.id}`}>
                                    View Profile
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Predictions Results */}
                {searchResults.predictions.length > 0 && (
                  <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Predictions ({searchResults.predictions.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {searchResults.predictions.map((prediction: any) => (
                          <div key={prediction.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline">{prediction.category}</Badge>
                                  <Badge className={prediction.status === "correct" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                                    {prediction.status}
                                  </Badge>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">{prediction.title}</h3>
                                <p className="text-gray-600 text-sm mb-2">{prediction.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span>By {prediction.forecaster}</span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(prediction.date).toLocaleDateString()}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Star className="h-3 w-3" />
                                    {prediction.votes} votes
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Activity className="h-3 w-3" />
                                    {prediction.comments} comments
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <Button size="sm" variant="outline">
                                  <Bookmark className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Articles Results */}
                {searchResults.articles.length > 0 && (
                  <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Articles ({searchResults.articles.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {searchResults.articles.map((article: any) => (
                          <div key={article.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline">{article.category}</Badge>
                                  <span className="text-sm text-gray-500">{article.readTime}</span>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">{article.title}</h3>
                                <p className="text-gray-600 text-sm mb-2">{article.excerpt}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span>By {article.author}</span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(article.date).toLocaleDateString()}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Star className="h-3 w-3" />
                                    {article.likes} likes
                                  </span>
                                </div>
                                <div className="flex gap-2 mt-2">
                                  {article.tags.map((tag: string) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      #{tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <Button size="sm" className="ml-4" asChild>
                                <Link href={`/articles/${article.id}`}>
                                  Read More
                                  <ArrowRight className="ml-1 h-3 w-3" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            ) : (
              /* No Search Results - Show Popular Searches and Trending */
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Popular Searches */}
                <motion.div variants={itemVariants}>
                  <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Popular Searches
                      </CardTitle>
                      <CardDescription>
                        What others are searching for right now
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {popularSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => setSearchQuery(search)}
                            className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between"
                          >
                            <span className="text-gray-700">{search}</span>
                            <SearchIcon className="h-4 w-4 text-gray-400" />
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Trending Topics */}
                <motion.div variants={itemVariants}>
                  <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Trending Topics
                      </CardTitle>
                      <CardDescription>
                        Hot topics gaining momentum
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {trendingTopics.map((topic, index) => (
                          <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                            <div>
                              <div className="font-medium text-gray-900">{topic.name}</div>
                              <div className="text-sm text-gray-500">{topic.searches} searches</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-100 text-green-700">
                                {topic.trend}
                              </Badge>
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )}

            {/* Search Tips */}
            <motion.div
              className="mt-16"
              variants={itemVariants}
            >
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle>Search Tips</CardTitle>
                  <CardDescription>Get better results with these search techniques</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Use specific terms</h4>
                      <p className="text-sm text-gray-600">Search for "Bitcoin price prediction 2024" instead of just "Bitcoin"</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Filter by category</h4>
                      <p className="text-sm text-gray-600">Use filters to narrow down to forecasters, predictions, or articles</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Sort by relevance</h4>
                      <p className="text-sm text-gray-600">Change sorting to find the most accurate or recent results</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
    </>
  );
};

export default Search;