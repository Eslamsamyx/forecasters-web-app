"use client";

import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/utils/api";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Eye,
  Trash2,
  Calendar,
  User,
  Tag,
  Image,
  Link as LinkIcon,
  Settings,
  Upload,
  Star,
  MessageSquare,
  ThumbsUp,
  Edit,
  BarChart3,
  Loader2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3
} from "lucide-react";

const ArticleEditor: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const articleId = Array.isArray(id) ? id[0] : id;

  const [activeTab, setActiveTab] = useState("content");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    status: "DRAFT" as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    featured: false,
    isPremium: false,
    tags: [] as string[],
    featuredImage: "",
    categoryId: "",
  });

  // Get utils for cache invalidation
  const utils = api.useContext();

  // Fetch article data
  const { data: article, isLoading: articleLoading, error: articleError } = api.admin.getArticle.useQuery(
    { id: articleId! },
    { enabled: !!articleId }
  );

  // Get categories for dropdown
  const { data: categories } = api.admin.getCategories.useQuery();

  // Update article mutation
  const updateArticleMutation = api.admin.updateArticle.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setHasUnsavedChanges(false);
      utils.admin.getArticle.invalidate({ id: articleId! });
      utils.admin.getArticles.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update article");
    },
  });

  // Delete article mutation
  const deleteArticleMutation = api.admin.deleteArticle.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      router.push('/admin/articles');
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete article");
    },
  });

  // Update form data when article is loaded
  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        content: article.content,
        excerpt: article.excerpt || "",
        status: article.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
        featured: article.featured,
        isPremium: article.isPremium,
        tags: article.tags,
        featuredImage: article.featuredImage || "",
        categoryId: article.categoryId || "",
      });
      setHasUnsavedChanges(false);
    }
  }, [article]);

  const tabs = [
    { id: "content", label: "Content", icon: <Edit className="h-4 w-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
    { id: "seo", label: "SEO", icon: <LinkIcon className="h-4 w-4" /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-700';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-700';
      case 'ARCHIVED':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleSave = () => {
    if (!articleId) return;

    updateArticleMutation.mutate({
      id: articleId,
      ...formData,
    });
  };

  const handleSaveAsDraft = () => {
    if (!articleId) return;

    updateArticleMutation.mutate({
      id: articleId,
      ...formData,
      status: "DRAFT",
    });
  };

  const handlePublish = () => {
    if (!articleId) return;

    updateArticleMutation.mutate({
      id: articleId,
      ...formData,
      status: "PUBLISHED",
    });
  };

  const handleDelete = () => {
    if (!articleId) return;

    if (confirm("Are you sure you want to delete this article? This action cannot be undone.")) {
      deleteArticleMutation.mutate({ id: articleId });
    }
  };

  const handlePreview = () => {
    if (!article) return;
    // Open article in new tab for preview
    const previewUrl = `/articles/${article.slug}`;
    window.open(previewUrl, '_blank');
  };

  const handleCopyLink = async () => {
    if (!article) return;
    try {
      const articleUrl = `${window.location.origin}/articles/${article.slug}`;
      await navigator.clipboard.writeText(articleUrl);
      toast.success("Article link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link to clipboard");
    }
  };

  const handleSchedulePublish = () => {
    toast.info("Schedule publish feature coming soon!");
  };

  // Rich text formatting helpers
  const insertMarkdown = (prefix: string, suffix = "", wrapSelection = true) => {
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);

    let newText;
    if (wrapSelection && selectedText) {
      newText = prefix + selectedText + suffix;
    } else {
      newText = prefix;
    }

    const newContent =
      formData.content.substring(0, start) +
      newText +
      formData.content.substring(end);

    handleFieldChange('content', newContent);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + newText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  const handleBold = () => insertMarkdown('**', '**');
  const handleItalic = () => insertMarkdown('*', '*');
  const handleHeading1 = () => insertMarkdown('# ', '', false);
  const handleHeading2 = () => insertMarkdown('## ', '', false);
  const handleHeading3 = () => insertMarkdown('### ', '', false);
  const handleUnorderedList = () => insertMarkdown('- ', '', false);
  const handleOrderedList = () => insertMarkdown('1. ', '', false);
  const handleQuote = () => insertMarkdown('> ', '', false);
  const handleCode = () => insertMarkdown('`', '`');
  const handleCodeBlock = () => insertMarkdown('\n```\n', '\n```\n');

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
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

  // Handle loading state
  if (articleLoading) {
    return (
      <>
        <Head>
          <title>Loading Article - Admin</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">Loading article...</span>
          </div>
        </div>
      </>
    );
  }

  // Handle error state
  if (articleError || !article) {
    return (
      <>
        <Head>
          <title>Article Not Found - Admin</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button asChild>
              <Link href="/admin/articles">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Articles
              </Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Article - {article.title} - Admin</title>
        <meta
          name="description"
          content="Edit article content, settings, and metadata."
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
              className="mb-8"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" asChild>
                    <Link href="/admin/articles">
                      <ArrowLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Edit Article
                    </h1>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge className={getStatusColor(formData.status)}>
                        {formData.status}
                      </Badge>
                      {formData.featured && (
                        <Badge className="bg-yellow-100 text-yellow-700">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      <span className="text-sm text-gray-500">by {article.author?.fullName || article.author?.email}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  {formData.status === "DRAFT" && (
                    <Button
                      variant="outline"
                      onClick={handleSaveAsDraft}
                      disabled={updateArticleMutation.isPending}
                    >
                      {updateArticleMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {updateArticleMutation.isPending ? "Saving..." : "Save Draft"}
                    </Button>
                  )}
                  {formData.status === "DRAFT" ? (
                    <Button
                      onClick={handlePublish}
                      disabled={updateArticleMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {updateArticleMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      {updateArticleMutation.isPending ? "Publishing..." : "Publish"}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSave}
                      disabled={updateArticleMutation.isPending}
                    >
                      {updateArticleMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {updateArticleMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <motion.div
                className="lg:col-span-2"
                variants={itemVariants}
              >
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardContent className="p-6">
                    {activeTab === "content" && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title
                          </label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleFieldChange('title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Content
                          </label>

                          {/* Rich Text Toolbar */}
                          <div className="border border-gray-300 border-b-0 rounded-t-lg bg-gray-50 p-3">
                            <div className="flex flex-wrap gap-1">
                              {/* Headings */}
                              <div className="flex gap-1 mr-3">
                                <button
                                  type="button"
                                  onClick={handleHeading1}
                                  className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                                  title="Heading 1"
                                >
                                  <Heading1 className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={handleHeading2}
                                  className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                                  title="Heading 2"
                                >
                                  <Heading2 className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={handleHeading3}
                                  className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                                  title="Heading 3"
                                >
                                  <Heading3 className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="border-l border-gray-300 mx-2"></div>

                              {/* Text Formatting */}
                              <div className="flex gap-1 mr-3">
                                <button
                                  type="button"
                                  onClick={handleBold}
                                  className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                                  title="Bold"
                                >
                                  <Bold className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={handleItalic}
                                  className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                                  title="Italic"
                                >
                                  <Italic className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCode}
                                  className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                                  title="Inline Code"
                                >
                                  <Code className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="border-l border-gray-300 mx-2"></div>

                              {/* Lists & Quote */}
                              <div className="flex gap-1 mr-3">
                                <button
                                  type="button"
                                  onClick={handleUnorderedList}
                                  className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                                  title="Bullet List"
                                >
                                  <List className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={handleOrderedList}
                                  className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                                  title="Numbered List"
                                >
                                  <ListOrdered className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={handleQuote}
                                  className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                                  title="Quote"
                                >
                                  <Quote className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="border-l border-gray-300 mx-2"></div>

                              {/* Preview Toggle */}
                              <button
                                type="button"
                                onClick={() => setIsPreviewMode(!isPreviewMode)}
                                className={`p-2 rounded transition-colors ${
                                  isPreviewMode
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-200'
                                }`}
                                title="Toggle Preview"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Content Editor */}
                          {!isPreviewMode ? (
                            <textarea
                              name="content"
                              value={formData.content}
                              onChange={(e) => handleFieldChange('content', e.target.value)}
                              rows={20}
                              className="w-full px-3 py-2 border border-gray-300 rounded-b-lg rounded-t-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none"
                              placeholder="Write your article content in Markdown..."
                            />
                          ) : (
                            <div className="w-full min-h-[500px] px-3 py-2 border border-gray-300 rounded-b-lg rounded-t-none bg-white">
                              <div className="prose max-w-none">
                                {formData.content ? (
                                  <div dangerouslySetInnerHTML={{
                                    __html: formData.content.replace(/\n/g, '<br>')
                                  }} />
                                ) : (
                                  <p className="text-gray-500 italic">Preview will appear here...</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Excerpt
                          </label>
                          <textarea
                            value={formData.excerpt}
                            onChange={(e) => handleFieldChange('excerpt', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Brief excerpt for article preview..."
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === "settings" && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Status
                            </label>
                            <select
                              value={formData.status}
                              onChange={(e) => handleFieldChange('status', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="DRAFT">Draft</option>
                              <option value="PUBLISHED">Published</option>
                              <option value="ARCHIVED">Archived</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Category
                            </label>
                            <select
                              value={formData.categoryId}
                              onChange={(e) => handleFieldChange('categoryId', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">No Category</option>
                              {categories?.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tags
                          </label>
                          <input
                            type="text"
                            value={formData.tags.join(", ")}
                            onChange={(e) => handleFieldChange('tags', e.target.value.split(",").map(tag => tag.trim()).filter(tag => tag))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter tags separated by commas"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Featured Image
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              value={formData.featuredImage}
                              onChange={(e) => handleFieldChange('featuredImage', e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Image URL or path"
                            />
                            <Button variant="outline">
                              <Upload className="h-4 w-4 mr-2" />
                              Upload
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id="featured"
                              checked={formData.featured}
                              onChange={(e) => handleFieldChange('featured', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                              Mark as featured article
                            </label>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id="isPremium"
                              checked={formData.isPremium}
                              onChange={(e) => handleFieldChange('isPremium', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="isPremium" className="text-sm font-medium text-gray-700">
                              Premium content (requires subscription)
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "seo" && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SEO Title
                          </label>
                          <input
                            type="text"
                            value={formData.title} // Using title as SEO title for now
                            onChange={(e) => handleFieldChange('title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Optimized title for search engines"
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            {formData.title.length}/60 characters
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SEO Description
                          </label>
                          <textarea
                            value={formData.excerpt}
                            onChange={(e) => handleFieldChange('excerpt', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Meta description for search engines"
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            {formData.excerpt.length}/160 characters
                          </div>
                        </div>
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">Search Preview</h4>
                          <div className="space-y-1">
                            <div className="text-blue-600 text-sm">{formData.title}</div>
                            <div className="text-green-600 text-xs">yoursite.com/articles/{article.slug}</div>
                            <div className="text-gray-600 text-sm">{formData.excerpt}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "analytics" && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{article.viewCount.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">Total Views</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{article.likeCount}</div>
                            <div className="text-sm text-gray-600">Likes</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">0</div>
                            <div className="text-sm text-gray-600">Comments</div>
                          </div>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-3">Performance Metrics</h4>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Engagement Rate</span>
                                <span>{article.viewCount > 0 ? ((article.likeCount / article.viewCount) * 100).toFixed(1) : 0}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${article.viewCount > 0 ? Math.min((article.likeCount / article.viewCount) * 100, 100) : 0}%` }}
                                ></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Word Count</span>
                                <span>{formData.content.split(' ').length} words</span>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Reading Time</span>
                                <span>{Math.ceil(formData.content.split(' ').length / 200)} min</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Sidebar */}
              <motion.div
                className="space-y-6"
                variants={itemVariants}
              >
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Article Info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-600">Author</div>
                        <div className="font-medium">{article.author?.fullName || article.author?.email}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Created</div>
                        <div className="font-medium">{new Date(article.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Last Modified</div>
                        <div className="font-medium">{new Date(article.updatedAt).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Word Count</div>
                        <div className="font-medium">{formData.content.split(' ').length} words</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Slug</div>
                        <div className="font-mono text-xs text-gray-500">{article.slug}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {formData.status === "DRAFT" && (
                        <Button
                          className="w-full justify-start bg-green-600 hover:bg-green-700"
                          onClick={handlePublish}
                          disabled={updateArticleMutation.isPending}
                        >
                          {updateArticleMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          {updateArticleMutation.isPending ? "Publishing..." : "Publish Now"}
                        </Button>
                      )}
                      {formData.status === "DRAFT" && (
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={handleSaveAsDraft}
                          disabled={updateArticleMutation.isPending}
                        >
                          {updateArticleMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          {updateArticleMutation.isPending ? "Saving..." : "Save Draft"}
                        </Button>
                      )}
                      {formData.status === "PUBLISHED" && (
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => handleFieldChange('status', 'DRAFT')}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Unpublish
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={handlePreview}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview Article
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={handleCopyLink}
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Copy Link
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={handleSchedulePublish}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Publish
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full justify-start"
                        onClick={handleDelete}
                        disabled={deleteArticleMutation.isPending}
                      >
                        {deleteArticleMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        {deleteArticleMutation.isPending ? "Deleting..." : "Delete Article"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>
    </>
  );
};

export default ArticleEditor;