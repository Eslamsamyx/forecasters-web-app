"use client";

import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/utils/api";
import { toast } from "sonner";
import { ArrowLeft, Save, User, Loader2 } from "lucide-react";

const AddUser: NextPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "FREE" as "FREE" | "PREMIUM" | "ADMIN",
    sendInvite: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Create user mutation
  const createUserMutation = api.admin.createUser.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      router.push('/admin/users');
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create user");
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    createUserMutation.mutate(formData);
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
        <title>Add New User - Admin - Prediction Prism Analytics</title>
        <meta name="description" content="Add a new user account to the platform." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <motion.div
          className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="container mx-auto px-4 py-16">
            <motion.div className="mb-8" variants={itemVariants}>
              <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" asChild>
                  <Link href="/admin/users">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <h1 className="text-3xl font-bold text-gray-900">Add New User</h1>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20 max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>User Information</CardTitle>
                  <CardDescription>Create a new user account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => {
                            setFormData({ ...formData, fullName: e.target.value });
                            if (errors.fullName) {
                              setErrors({ ...errors, fullName: "" });
                            }
                          }}
                          placeholder="Enter full name"
                          className={errors.fullName ? "border-red-500" : ""}
                          disabled={createUserMutation.isPending}
                        />
                        {errors.fullName && (
                          <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            if (errors.email) {
                              setErrors({ ...errors, email: "" });
                            }
                          }}
                          placeholder="Enter email address"
                          className={errors.email ? "border-red-500" : ""}
                          disabled={createUserMutation.isPending}
                        />
                        {errors.email && (
                          <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="role">Role</Label>
                      <select
                        id="role"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as "FREE" | "PREMIUM" | "ADMIN" })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={createUserMutation.isPending}
                      >
                        <option value="FREE">Free User</option>
                        <option value="PREMIUM">Premium User</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="sendInvite"
                        checked={formData.sendInvite}
                        onChange={(e) => setFormData({ ...formData, sendInvite: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600"
                        disabled={createUserMutation.isPending}
                      />
                      <Label htmlFor="sendInvite">
                        Send invitation email to user
                      </Label>
                    </div>

                    <div className="flex justify-end gap-3 pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        asChild
                        disabled={createUserMutation.isPending}
                      >
                        <Link href="/admin/users">Cancel</Link>
                      </Button>
                      <Button
                        type="submit"
                        disabled={createUserMutation.isPending}
                      >
                        {createUserMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        {createUserMutation.isPending ? "Creating..." : "Add User"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
    </>
  );
};

export default AddUser;