"use client";

import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Save,
  Eye,
  FileText,
  Upload,
  HelpCircle,
  Sparkles
} from "lucide-react";

interface Article {
  title: string;
  content: string;
  category: string;
  tags: string[];
  featured: boolean;
  status: string;
  seoTitle: string;
  seoDescription: string;
  featuredImage: string;
}

const NewArticle: NextPage = () => {
  const [article, setArticle] = useState<Article>({
    title: "",
    content: "",
    category: "Market Analysis",
    tags: [],
    featured: false,
    status: "draft",
    seoTitle: "",
    seoDescription: "",
    featuredImage: ""
  });

  const [activeTab, setActiveTab] = useState("content");

  const handleSave = () => {
    console.log("Saving new article...", article);
  };

  const handlePublish = () => {
    setArticle({ ...article, status: "published" });
    handleSave();
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
        <title>Create New Article - Admin - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Create and publish new articles on the Prism Analytics platform."
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
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                      Create New
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Article</span>
                    </h1>
                    <p className="text-gray-600">
                      Share your insights with the community
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={() => setArticle({ ...article, status: "draft" })}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button onClick={handlePublish}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Publish
                  </Button>
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
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Article Title *
                        </label>
                        <input
                          type="text"
                          value={article.title}
                          onChange={(e) => setArticle({ ...article, title: e.target.value })}
                          className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter an engaging title for your article"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Content *
                          </label>
                          <Button variant="ghost" size="sm">
                            <HelpCircle className="h-4 w-4 mr-2" />
                            Markdown Help
                          </Button>
                        </div>
                        <textarea
                          value={article.content}
                          onChange={(e) => setArticle({ ...article, content: e.target.value })}
                          rows={20}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                          placeholder="# Your Article Title

Write your article content here using Markdown formatting...

## Section Headings

- Use bullet points
- For better readability
- And structure

**Bold text** and *italic text* are supported.

> Use blockquotes for important notes

```javascript
// Code blocks are also supported
console.log('Hello, world!');
```"
                        />
                        <div className="text-sm text-gray-500 mt-2">
                          {article.content.split(' ').length} words • Supports Markdown formatting
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Sidebar */}
              <motion.div
                className="space-y-6"
                variants={itemVariants}
              >
                {/* Article Settings */}
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Article Settings</CardTitle>
                    <CardDescription>Configure your article options</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={article.category}
                        onChange={(e) => setArticle({ ...article, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Market Analysis">Market Analysis</option>
                        <option value="Technology">Technology</option>
                        <option value="Economics">Economics</option>
                        <option value="Environment">Environment</option>
                        <option value="Sports">Sports</option>
                        <option value="Politics">Politics</option>
                        <option value="Science">Science</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags
                      </label>
                      <input
                        type="text"
                        onChange={(e) => setArticle({
                          ...article,
                          tags: e.target.value.split(",").map(tag => tag.trim()).filter(tag => tag)
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="predictions, analysis, market"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Separate tags with commas
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Featured Image URL
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={article.featuredImage}
                          onChange={(e) => setArticle({ ...article, featuredImage: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://..."
                        />
                        <Button variant="outline">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={article.featured}
                        onChange={(e) => setArticle({ ...article, featured: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                        Feature this article
                      </label>
                    </div>
                  </CardContent>
                </Card>

                {/* SEO Settings */}
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-lg">SEO Optimization</CardTitle>
                    <CardDescription>Improve search visibility</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SEO Title
                      </label>
                      <input
                        type="text"
                        value={article.seoTitle || article.title}
                        onChange={(e) => setArticle({ ...article, seoTitle: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Optimized title for search engines"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {(article.seoTitle || article.title).length}/60 characters
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Description
                      </label>
                      <textarea
                        value={article.seoDescription}
                        onChange={(e) => setArticle({ ...article, seoDescription: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Brief description for search results"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {article.seoDescription.length}/160 characters
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Publishing Options */}
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Publishing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={article.status}
                        onChange={(e) => setArticle({ ...article, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="draft">Draft</option>
                        <option value="review">Submit for Review</option>
                        <option value="published">Publish Now</option>
                      </select>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" className="w-full justify-start">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Save className="h-4 w-4 mr-2" />
                          Save Draft
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Writing Tips */}
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Writing Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                        <div>Use clear, descriptive headlines that capture attention</div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                        <div>Include relevant data and examples to support your points</div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                        <div>Break up long paragraphs with subheadings</div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                        <div>Add a compelling conclusion with actionable insights</div>
                      </div>
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

export default NewArticle;