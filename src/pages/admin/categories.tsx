"use client";

import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Tag,
  MoreVertical,
  Search,
  Filter,
  Save
} from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  articleCount: number;
  color: string;
  active: boolean;
}

const CategoriesManagement: NextPage = () => {
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: "Market Analysis", slug: "market-analysis", description: "Financial market predictions and analysis", articleCount: 45, color: "#3B82F6", active: true },
    { id: 2, name: "Technology", slug: "technology", description: "Tech trends and innovation forecasts", articleCount: 32, color: "#10B981", active: true },
    { id: 3, name: "Economics", slug: "economics", description: "Economic indicators and policy predictions", articleCount: 28, color: "#F59E0B", active: true },
    { id: 4, name: "Environment", slug: "environment", description: "Climate and environmental forecasting", articleCount: 19, color: "#059669", active: true },
    { id: 5, name: "Sports", slug: "sports", description: "Sports analytics and outcome predictions", articleCount: 56, color: "#DC2626", active: true },
    { id: 6, name: "Politics", slug: "politics", description: "Political events and election forecasts", articleCount: 23, color: "#7C3AED", active: false }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

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
        <title>Categories Management - Admin - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Manage content categories and tags for better organization."
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
                      Categories
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Management</span>
                    </h1>
                    <p className="text-xl text-gray-600">
                      Organize content with categories and tags.
                    </p>
                  </div>
                </div>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </motion.div>

            {/* Categories List */}
            <motion.div
              variants={itemVariants}
            >
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Content Categories ({categories.length})
                  </CardTitle>
                  <CardDescription>
                    Manage and organize content categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categories.map((category) => (
                      <motion.div
                        key={category.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">{category.name}</h3>
                              <Badge className={category.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                                {category.active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">{category.description}</div>
                            <div className="text-xs text-gray-500">/{category.slug} • {category.articleCount} articles</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setEditingCategory(category)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Add/Edit Category Modal would go here */}
            {(showAddForm || editingCategory) && (
              <motion.div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Card className="w-full max-w-md mx-4">
                  <CardHeader>
                    <CardTitle>
                      {editingCategory ? "Edit Category" : "Add New Category"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter category name"
                        defaultValue={editingCategory?.name || ""}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter description"
                        rows={3}
                        defaultValue={editingCategory?.description || ""}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color
                      </label>
                      <input
                        type="color"
                        className="w-full h-10 border border-gray-300 rounded-lg"
                        defaultValue={editingCategory?.color || "#3B82F6"}
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddForm(false);
                          setEditingCategory(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={() => {
                        setShowAddForm(false);
                        setEditingCategory(null);
                      }}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </motion.div>
    </>
  );
};

export default CategoriesManagement;