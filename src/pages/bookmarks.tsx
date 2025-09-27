"use client";

import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Bookmark,
  BookmarkPlus,
  Search,
  Filter,
  Grid,
  List,
  Star,
  User,
  Target,
  BarChart3,
  Calendar,
  Trash2,
  Share2,
  Eye,
  Archive,
  Tag,
  Folder,
  Heart,
  TrendingUp,
  Activity
} from "lucide-react";

const Bookmarks: NextPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "forecasters" | "predictions" | "articles">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"recent" | "alphabetical" | "rating">("recent");

  const mockBookmarks = {
    forecasters: [
      {
        id: 1,
        type: "forecaster",
        name: "Michael Rodriguez",
        username: "@cryptomike",
        avatar: "MR",
        accuracy: 94.8,
        specialty: "Crypto Markets",
        verified: true,
        followers: 12500,
        bookmarkedAt: "2024-01-15",
        notes: "Great Bitcoin predictions, follow for crypto insights"
      },
      {
        id: 2,
        type: "forecaster",
        name: "Sarah Chen",
        username: "@stocksarah",
        avatar: "SC",
        accuracy: 91.2,
        specialty: "Tech Stocks",
        verified: true,
        followers: 9800,
        bookmarkedAt: "2024-01-12",
        notes: "Apple and Tesla expert, consistent performer"
      }
    ],
    predictions: [
      {
        id: 3,
        type: "prediction",
        title: "Bitcoin to reach $75,000 by Q2 2024",
        forecaster: "Michael Rodriguez",
        category: "Crypto",
        status: "pending",
        confidence: 85,
        bookmarkedAt: "2024-01-14",
        description: "Technical analysis suggests strong bullish momentum",
        deadline: "2024-06-30",
        votes: 234,
        notes: "Interesting TA perspective, monitor closely"
      },
      {
        id: 4,
        type: "prediction",
        title: "Fed will cut rates 3 times in 2024",
        forecaster: "David Thompson",
        category: "Economics",
        status: "pending",
        confidence: 78,
        bookmarkedAt: "2024-01-10",
        description: "Economic indicators point to aggressive easing",
        deadline: "2024-12-31",
        votes: 189,
        notes: "Important for portfolio positioning"
      }
    ],
    articles: [
      {
        id: 5,
        type: "article",
        title: "The Future of AI in Financial Predictions",
        author: "Prediction Prism Team",
        category: "Analysis",
        readTime: "8 min read",
        bookmarkedAt: "2024-01-08",
        excerpt: "How machine learning is revolutionizing market forecasting accuracy",
        tags: ["AI", "machine-learning", "predictions"],
        likes: 456,
        notes: "Great insights on ML applications"
      }
    ]
  };

  const allBookmarks = [
    ...mockBookmarks.forecasters,
    ...mockBookmarks.predictions,
    ...mockBookmarks.articles
  ];

  const filteredBookmarks = allBookmarks.filter((bookmark: any) => {
    const matchesSearch =
      ((bookmark as any)?.name && (bookmark as any).name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ((bookmark as any)?.title && (bookmark as any).title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ((bookmark as any)?.specialty && (bookmark as any).specialty.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ((bookmark as any)?.category && (bookmark as any).category.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === "all" || (bookmark as any)?.type === selectedCategory.slice(0, -1);

    return matchesSearch && matchesCategory;
  });

  const bookmarkCategories = [
    { id: "all", name: "All", count: allBookmarks.length },
    { id: "forecasters", name: "Forecasters", count: mockBookmarks.forecasters.length },
    { id: "predictions", name: "Predictions", count: mockBookmarks.predictions.length },
    { id: "articles", name: "Articles", count: mockBookmarks.articles.length }
  ];

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

  const renderBookmarkCard = (bookmark: any) => {
    switch (bookmark.type) {
      case "forecaster":
        return (
          <motion.div
            key={bookmark.id}
            className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            layout
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                  {bookmark.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">{bookmark.name}</h3>
                    {bookmark.verified && (
                      <Badge className="bg-green-100 text-green-700 text-xs">Verified</Badge>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">{bookmark.username}</p>
                  <p className="text-gray-500 text-xs">{bookmark.specialty}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
              <span>{bookmark.accuracy}% accuracy</span>
              <span>{bookmark.followers.toLocaleString()} followers</span>
              <span>Saved {new Date(bookmark.bookmarkedAt).toLocaleDateString()}</span>
            </div>
            {bookmark.notes && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                <p className="text-yellow-800 text-sm italic">"{bookmark.notes}"</p>
              </div>
            )}
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" asChild>
                <Link href={`/forecasters/${bookmark.id}`}>
                  <Eye className="h-4 w-4 mr-1" />
                  View Profile
                </Link>
              </Button>
              <Button size="sm" variant="outline">
                <BookmarkPlus className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        );

      case "prediction":
        return (
          <motion.div
            key={bookmark.id}
            className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            layout
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{bookmark.category}</Badge>
                  <Badge className={bookmark.status === "correct" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                    {bookmark.status}
                  </Badge>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{bookmark.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{bookmark.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>By {bookmark.forecaster}</span>
                  <span>{bookmark.confidence}% confidence</span>
                  <span>{bookmark.votes} votes</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
            {bookmark.notes && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <p className="text-blue-800 text-sm italic">"{bookmark.notes}"</p>
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span>Saved {new Date(bookmark.bookmarkedAt).toLocaleDateString()}</span>
              <span>Deadline: {new Date(bookmark.deadline).toLocaleDateString()}</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1">
                <Target className="h-4 w-4 mr-1" />
                View Prediction
              </Button>
              <Button size="sm" variant="outline">
                <BookmarkPlus className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        );

      case "article":
        return (
          <motion.div
            key={bookmark.id}
            className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            layout
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{bookmark.category}</Badge>
                  <span className="text-sm text-gray-500">{bookmark.readTime}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{bookmark.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{bookmark.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                  <span>By {bookmark.author}</span>
                  <span>{bookmark.likes} likes</span>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {bookmark.tags?.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button size="sm" variant="outline">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
            {bookmark.notes && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
                <p className="text-purple-800 text-sm italic">"{bookmark.notes}"</p>
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span>Saved {new Date(bookmark.bookmarkedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" asChild>
                <Link href={`/articles/${bookmark.id}`}>
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Read Article
                </Link>
              </Button>
              <Button size="sm" variant="outline">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>Bookmarks - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Manage your saved forecasters, predictions, and articles. Keep track of your favorite content."
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
                <Bookmark className="w-4 h-4 mr-2" />
                Your Collection
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Your
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Bookmarks</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Keep track of your favorite forecasters, predictions, and insights.
                Organize and manage your saved content in one place.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
              variants={itemVariants}
            >
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardContent className="p-6 text-center">
                  <Bookmark className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{allBookmarks.length}</div>
                  <div className="text-sm text-gray-600">Total Saved</div>
                </CardContent>
              </Card>
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardContent className="p-6 text-center">
                  <User className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{mockBookmarks.forecasters.length}</div>
                  <div className="text-sm text-gray-600">Forecasters</div>
                </CardContent>
              </Card>
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardContent className="p-6 text-center">
                  <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{mockBookmarks.predictions.length}</div>
                  <div className="text-sm text-gray-600">Predictions</div>
                </CardContent>
              </Card>
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardContent className="p-6 text-center">
                  <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{mockBookmarks.articles.length}</div>
                  <div className="text-sm text-gray-600">Articles</div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Filters and Controls */}
            <motion.div
              className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 mb-8"
              variants={itemVariants}
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search bookmarks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="recent">Most Recent</option>
                  <option value="alphabetical">Alphabetical</option>
                  <option value="rating">Highest Rated</option>
                </select>

                {/* View Mode */}
                <div className="flex border border-gray-200 rounded-md overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                      viewMode === "grid"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Grid className="h-4 w-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                      viewMode === "list"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <List className="h-4 w-4 mx-auto" />
                  </button>
                </div>

                {/* Additional Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Archive className="h-4 w-4 mr-1" />
                    Archive
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Folder className="h-4 w-4 mr-1" />
                    Organize
                  </Button>
                </div>
              </div>

              {/* Category Tabs */}
              <div className="flex gap-2 flex-wrap">
                {bookmarkCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Bookmarks Grid */}
            {filteredBookmarks.length > 0 ? (
              <motion.div
                className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
                variants={itemVariants}
              >
                {filteredBookmarks.map(renderBookmarkCard)}
              </motion.div>
            ) : (
              <motion.div
                className="text-center py-16"
                variants={itemVariants}
              >
                <Bookmark className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No bookmarks found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || selectedCategory !== "all"
                    ? "Try adjusting your search or filters"
                    : "Start saving your favorite forecasters, predictions, and articles"}
                </p>
                <div className="flex justify-center gap-4">
                  <Button asChild>
                    <Link href="/forecasters">
                      <User className="h-4 w-4 mr-2" />
                      Browse Forecasters
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/search">
                      <Search className="h-4 w-4 mr-2" />
                      Search Content
                    </Link>
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
              className="mt-16 bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20"
              variants={itemVariants}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Bookmark Management</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Archive className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2">Archive Old Items</h3>
                  <p className="text-sm text-gray-600 mb-4">Keep your bookmarks organized by archiving outdated content</p>
                  <Button variant="outline" size="sm">Manage Archives</Button>
                </div>
                <div className="text-center">
                  <Folder className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2">Create Collections</h3>
                  <p className="text-sm text-gray-600 mb-4">Group related bookmarks into custom collections</p>
                  <Button variant="outline" size="sm">Create Collection</Button>
                </div>
                <div className="text-center">
                  <Share2 className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2">Share Collections</h3>
                  <p className="text-sm text-gray-600 mb-4">Share your curated lists with other users</p>
                  <Button variant="outline" size="sm">Share Bookmarks</Button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
    </>
  );
};

export default Bookmarks;