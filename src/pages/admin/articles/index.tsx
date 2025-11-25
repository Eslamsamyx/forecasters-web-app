"use client";

import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  ArrowLeft,
  MoreVertical,
  Star,
  MessageSquare,
  ThumbsUp
} from "lucide-react";

const ArticlesManagement: NextPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Fetch articles from database using tRPC
  const { data: articlesData, isLoading, error } = api.admin.getArticles.useQuery({
    page: 1,
    limit: 50,
    search: searchTerm || undefined,
    status: selectedStatus === "all" ? "ALL" : selectedStatus.toUpperCase() as "DRAFT" | "PUBLISHED" | "ARCHIVED"
  });

  // Use real data from database or fallback to empty array
  const articles = articlesData?.articles.map(article => ({
    id: article.id,
    title: article.title,
    author: article.author?.fullName || article.author?.email || 'Unknown',
    status: article.status.toLowerCase(),
    publishDate: article.publishDate ? new Date(article.publishDate).toISOString().split('T')[0] : null,
    views: article.viewCount || 0,
    likes: 0, // Not available in current schema
    comments: 0, // Not available in current schema
    category: article.category?.name || 'Uncategorized',
    featured: article.featured
  })) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700';
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'review':
        return 'bg-yellow-100 text-yellow-700';
      case 'archived':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || article.status === selectedStatus;
    return matchesSearch && matchesStatus;
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading articles...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Articles Management - Admin - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Manage articles, blog posts, and content across the platform."
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
              className="mb-12"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" asChild>
                    <Link href="/admin">
                      <ArrowLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                  <div>
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                      Articles
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Management</span>
                    </h1>
                    <p className="text-xl text-gray-600">
                      Create, edit, and manage all content across the platform.
                    </p>
                  </div>
                </div>
                <Button asChild>
                  <Link href="/admin/articles/new">
                    <Plus className="h-4 w-4 mr-2" />
                    New Article
                  </Link>
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="review">In Review</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </motion.div>

            {/* Articles List */}
            <motion.div
              variants={itemVariants}
            >
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Articles ({filteredArticles.length})
                  </CardTitle>
                  <CardDescription>
                    Manage and organize all content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredArticles.map((article) => (
                      <motion.div
                        key={article.id}
                        className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-2">
                              {article.featured && (
                                <Star className="h-4 w-4 text-yellow-500 mt-1" />
                              )}
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                  {article.title}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    <span>{article.author}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                      {article.publishDate 
                                        ? new Date(article.publishDate).toLocaleDateString()
                                        : 'Unpublished'
                                      }
                                    </span>
                                  </div>
                                  <Badge className="text-xs">
                                    {article.category}
                                  </Badge>
                                </div>
                                {article.status === 'published' && (
                                  <div className="flex items-center gap-6 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <Eye className="h-3 w-3" />
                                      <span>{article.views.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <ThumbsUp className="h-3 w-3" />
                                      <span>{article.likes}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <MessageSquare className="h-3 w-3" />
                                      <span>{article.comments}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(article.status)}>
                              {article.status}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/admin/articles/${article.id}`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {filteredArticles.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
                      <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
                      <Button asChild>
                        <Link href="/admin/articles/new">
                          <Plus className="h-4 w-4 mr-2" />
                          Create New Article
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
    </>
  );
};

export default ArticlesManagement;

// Force server-side rendering to avoid SSG issues with useRouter in Next.js 16
export async function getServerSideProps() {
  return { props: {} };
}