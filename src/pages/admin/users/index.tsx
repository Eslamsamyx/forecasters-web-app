"use client";

import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ArrowLeft,
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  Ban,
  CheckCircle,
  Crown,
  Mail,
  Calendar,
  User,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const UsersManagement: NextPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<"ALL" | "FREE" | "PREMIUM" | "ADMIN">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: "", email: "", role: "FREE" as "FREE" | "PREMIUM" | "ADMIN" });

  // Fetch users data
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = api.admin.getUsers.useQuery({
    page: currentPage,
    limit: 10,
    search: searchTerm || undefined,
    role: selectedRole,
    status: "ALL"
  });

  // Fetch user stats
  const { data: userStats, isLoading: statsLoading } = api.admin.getUserStats.useQuery();

  // Update user mutation
  const updateUserMutation = api.admin.updateUser.useMutation({
    onSuccess: () => {
      toast.success("User updated successfully");
      setIsEditModalOpen(false);
      refetchUsers();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update user");
    },
  });

  // Get utils for cache invalidation
  const utils = api.useContext();

  // Delete user mutation
  const deleteUserMutation = api.admin.deleteUser.useMutation({
    onSuccess: () => {
      toast.success("User deleted successfully");
      // Force refetch both users list and stats
      refetchUsers();
      // Also invalidate the query cache to ensure fresh data
      utils.admin.getUsers.invalidate();
      utils.admin.getUserStats.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete user");
    },
  });

  // Get user details query (fixed from mutation to query)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { data: selectedUserData, isLoading: userLoading } = api.admin.getUser.useQuery(
    { userId: selectedUserId! },
    { enabled: !!selectedUserId }
  );

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when search changes
      refetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedRole, refetchUsers]);

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
    setIsViewModalOpen(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditForm({
      fullName: user.fullName || "",
      email: user.email || "",
      role: user.role || "FREE"
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;

    updateUserMutation.mutate({
      userId: selectedUser.id,
      ...editForm
    });
  };

  const handleDeleteUser = (userId: string, permanent = true) => {
    deleteUserMutation.mutate({ userId, permanent });
  };

  const getRoleColor = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return 'bg-red-100 text-red-700';
      case 'PREMIUM':
        return 'bg-purple-100 text-purple-700';
      case 'FREE':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'suspended':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const users = usersData?.users || [];
  const pagination = usersData?.pagination;

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
        <title>Users Management - Admin - Prediction Prism Analytics</title>
        <meta name="description" content="Manage user accounts, roles, and permissions." />
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
            <motion.div className="mb-12" variants={itemVariants}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" asChild>
                    <Link href="/admin">
                      <ArrowLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                  <div>
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                      Users
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Management</span>
                    </h1>
                    <p className="text-xl text-gray-600">
                      Manage user accounts, roles, and permissions.
                    </p>
                  </div>
                </div>
                <Button asChild>
                  <Link href="/admin/users/add">
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-blue-600 mb-2">
                      <Users className="h-8 w-8 mx-auto" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {statsLoading ? "..." : userStats?.totalUsers?.toLocaleString() || "0"}
                    </div>
                    <div className="text-sm text-gray-600">Total Users</div>
                  </CardContent>
                </Card>
                <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-green-600 mb-2">
                      <CheckCircle className="h-8 w-8 mx-auto" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {statsLoading ? "..." : userStats?.activeUsers?.toLocaleString() || "0"}
                    </div>
                    <div className="text-sm text-gray-600">Active (30d)</div>
                  </CardContent>
                </Card>
                <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-purple-600 mb-2">
                      <Crown className="h-8 w-8 mx-auto" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {statsLoading ? "..." : userStats?.premiumUsers?.toLocaleString() || "0"}
                    </div>
                    <div className="text-sm text-gray-600">Premium</div>
                  </CardContent>
                </Card>
                <Card className="shadow-lg bg-white/80 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-orange-600 mb-2">
                      <User className="h-8 w-8 mx-auto" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {statsLoading ? "..." : userStats?.adminUsers?.toLocaleString() || "0"}
                    </div>
                    <div className="text-sm text-gray-600">Admins</div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as "ALL" | "FREE" | "PREMIUM" | "ADMIN")}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">All Roles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="PREMIUM">Premium</option>
                  <option value="FREE">Free</option>
                </select>
                <Button
                  variant="outline"
                  onClick={() => refetchUsers()}
                  disabled={usersLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${usersLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </motion.div>

            {/* Users List */}
            <motion.div variants={itemVariants}>
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      User Accounts ({pagination?.total || 0})
                    </div>
                    {usersLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
                  </CardTitle>
                  <CardDescription>
                    Manage user accounts and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="p-6 border border-gray-200 rounded-lg animate-pulse">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                              <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                      <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {users.map((user) => (
                        <motion.div
                          key={user.id}
                          className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          whileHover={{ scale: 1.01 }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                                {(user.fullName || user.email)?.split(' ').map(n => n[0]).join('') || '?'}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {user.fullName || user.email}
                                  </h3>
                                  <Badge className={getRoleColor(user.role)}>
                                    {user.role === 'ADMIN' && <Crown className="h-3 w-3 mr-1" />}
                                    {user.role}
                                  </Badge>
                                  <Badge className={getStatusColor(user.status)}>
                                    {user.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                                    {user.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                  <Mail className="h-3 w-3" />
                                  <span>{user.email}</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <div className="text-gray-500">Joined</div>
                                    <div className="font-medium">
                                      {new Date(user.createdAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-gray-500">Last Active</div>
                                    <div className="font-medium">
                                      {user.lastActive ?
                                        new Date(user.lastActive).toLocaleDateString() :
                                        'Never'
                                      }
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-gray-500">Actions</div>
                                    <div className="font-medium">{user.totalActions || 0}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewUser(user.id)}
                                disabled={userLoading}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this user? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteUser(user.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {pagination && pagination.pages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <div className="text-sm text-gray-600">
                        Page {pagination.page} of {pagination.pages}
                        ({pagination.total} users total)
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={!pagination.hasPrev || usersLoading}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => prev + 1)}
                          disabled={!pagination.hasNext || usersLoading}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* View User Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                View detailed information about this user
              </DialogDescription>
            </DialogHeader>
            {userLoading ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-full animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-300 rounded w-48 animate-pulse"></div>
                    <div className="h-4 bg-gray-300 rounded w-64 animate-pulse"></div>
                    <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
                    <div className="space-y-2">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-4 bg-gray-300 rounded animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
                    <div className="space-y-2">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-4 bg-gray-300 rounded animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : selectedUserData ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {(selectedUserData.fullName || selectedUserData.email)?.split(' ').map(n => n[0]).join('') || '?'}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedUserData.fullName || selectedUserData.email}</h3>
                    <p className="text-gray-600">{selectedUserData.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getRoleColor(selectedUserData.role)}>
                        {selectedUserData.role === 'ADMIN' && <Crown className="h-3 w-3 mr-1" />}
                        {selectedUserData.role}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Account Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">User ID:</span>
                        <span className="font-mono text-xs">{selectedUserData.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Created:</span>
                        <span>{new Date(selectedUserData.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last Updated:</span>
                        <span>{new Date(selectedUserData.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Activity Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Actions:</span>
                        <span>{selectedUserData.totalActions || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Events:</span>
                        <span>{selectedUserData.totalEvents || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Articles:</span>
                        <span>{selectedUserData.totalArticles || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedUserData.actions && selectedUserData.actions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Recent Actions</h4>
                    <div className="max-h-48 overflow-y-auto">
                      <div className="space-y-2">
                        {selectedUserData.actions.map((action: any) => (
                          <div key={action.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{action.actionType}</div>
                                <div className="text-gray-500">
                                  {action.targetType}: {action.targetId}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(action.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No user selected</p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit User Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  value={editForm.role}
                  onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value as "FREE" | "PREMIUM" | "ADMIN" }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="FREE">Free</option>
                  <option value="PREMIUM">Premium</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateUser}
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? "Updating..." : "Update User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </>
  );
};

export default UsersManagement;