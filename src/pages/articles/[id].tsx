"use client";

import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Share2,
  Bookmark,
  ThumbsUp,
  MessageSquare,
  Twitter,
  Facebook,
  Linkedin,
  Link as LinkIcon
} from "lucide-react";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";

// Function to calculate reading time based on content
const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200; // Average reading speed
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return readingTime;
};

const ArticleDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [optimisticLikeCount, setOptimisticLikeCount] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");

  // Fetch article data from database using slug
  const { data: article, isLoading, error } = api.articles.getBySlug.useQuery(
    id as string,
    { enabled: !!id }
  );

  // Check if user has liked this article
  const { data: likeStatus } = api.userActions.checkAction.useQuery({
    actionType: "LIKE",
    targetType: "ARTICLE",
    targetId: article?.id || ""
  }, { enabled: !!article?.id && !!session });

  // Check if user has bookmarked this article
  const { data: bookmarkStatus } = api.userActions.checkAction.useQuery({
    actionType: "BOOKMARK",
    targetType: "ARTICLE",
    targetId: article?.id || ""
  }, { enabled: !!article?.id && !!session });

  // Like/Unlike mutations
  const likeMutation = api.userActions.likeArticle.useMutation({
    onSuccess: () => {
      setOptimisticLikeCount(prev => (prev || article?.likeCount || 0) + 1);
      console.log("Article liked!");
    },
    onError: (error) => {
      console.error("Error liking article:", error.message);
      alert("Error liking article. Please try again.");
    }
  });

  const unlikeMutation = api.userActions.unlikeArticle.useMutation({
    onSuccess: () => {
      setOptimisticLikeCount(prev => Math.max(0, (prev || article?.likeCount || 0) - 1));
      console.log("Article unliked");
    },
    onError: (error) => {
      console.error("Error unliking article:", error.message);
      alert("Error unliking article. Please try again.");
    }
  });

  // Bookmark/Unbookmark mutations
  const bookmarkMutation = api.userActions.bookmarkArticle.useMutation({
    onSuccess: () => {
      console.log("Article bookmarked!");
    },
    onError: (error) => {
      console.error("Error bookmarking article:", error.message);
      alert("Error bookmarking article. Please try again.");
    }
  });

  const unbookmarkMutation = api.userActions.unbookmarkArticle.useMutation({
    onSuccess: () => {
      console.log("Article unbookmarked");
    },
    onError: (error) => {
      console.error("Error unbookmarking article:", error.message);
      alert("Error unbookmarking article. Please try again.");
    }
  });

  // Fetch comments for this article
  const { data: commentsData, refetch: refetchComments } = api.comments.getByArticleId.useQuery({
    articleId: article?.id || "",
    limit: 10
  }, { enabled: !!article?.id });

  // Create comment mutation
  const createCommentMutation = api.comments.create.useMutation({
    onSuccess: () => {
      setNewComment("");
      refetchComments();
      console.log("Comment created successfully!");
    },
    onError: (error) => {
      console.error("Error creating comment:", error.message);
      alert("Error creating comment. Please try again.");
    }
  });

  // Fetch related articles - moved before conditional returns to fix hooks order
  const { data: relatedArticlesData } = api.articles.getAll.useQuery({
    limit: 3,
    categoryId: article?.categoryId || undefined
  }, { enabled: !!article?.categoryId });

  // Helper functions for data formatting
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAuthorInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const relatedArticles = relatedArticlesData?.articles?.filter(a => a.id !== article?.id)?.slice(0, 2) || [];

  // Handle like/unlike
  const handleLike = () => {
    if (!session) {
      alert("Please sign in to like articles");
      return;
    }

    if (!article) return;

    if (likeStatus?.hasAction) {
      unlikeMutation.mutate(article.id);
    } else {
      likeMutation.mutate(article.id);
    }
  };

  // Handle bookmark/unbookmark
  const handleBookmark = () => {
    if (!session) {
      alert("Please sign in to bookmark articles");
      return;
    }

    if (!article) return;

    if (bookmarkStatus?.hasAction) {
      unbookmarkMutation.mutate(article.id);
    } else {
      bookmarkMutation.mutate(article.id);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      alert("Please sign in to comment");
      return;
    }

    if (!article || !newComment.trim()) return;

    createCommentMutation.mutate({
      content: newComment.trim(),
      articleId: article.id,
    });
  };

  // Handle social sharing
  const handleShare = (platform: string) => {
    if (!article) return;

    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(article.title);

    let shareUrl = "";

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case "copy":
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-lg">Loading article...</div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-lg text-red-600">Article not found</div>
      </div>
    );
  }

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
        <title>{article.title} | Prediction Prism Analytics</title>
        <meta name="description" content={article.excerpt || ''} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <motion.div
          className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* Back Button */}
            <motion.div variants={itemVariants} className="mb-6">
              <Link href="/articles">
                <Button variant="ghost" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Articles
                </Button>
              </Link>
            </motion.div>

            {/* Article Header */}
            <motion.article variants={itemVariants}>
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border-white/20 overflow-hidden">
                {/* Hero Image */}
                <div className="relative h-96">
                  <Image
                    src={article.featuredImage || "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=600&fit=crop"}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <CardContent className="p-8">
                  {/* Title and Category */}
                  <div className="mb-6">
                    <Badge className="mb-4 bg-blue-100 text-blue-700">
                      {article.category?.name}
                    </Badge>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                      {article.title}
                    </h1>
                    <p className="text-gray-600 text-lg">
                      {article.excerpt}
                    </p>
                  </div>
                  {/* Article Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={article.author?.avatarUrl || ''} alt={article.author?.fullName || ''} />
                        <AvatarFallback>{getAuthorInitials(article.author?.fullName || 'Unknown')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{article.author?.fullName}</p>
                        <p className="text-sm text-gray-600">Author</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(article.publishDate || article.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {calculateReadingTime(article.content || '')} min read
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {article.viewCount?.toLocaleString() || 0} views
                      </span>
                    </div>
                  </div>

                  {/* Article Content */}
                  <div
                    className="prose prose-lg max-w-none py-8"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />

                  {/* Tags */}
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 py-6 border-t">
                      {(Array.isArray(article.tags) ? article.tags : []).map((tag, index) => (
                        <Badge key={`${tag}-${index}`} variant="outline" className="text-sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Article Actions */}
                  <div className="flex items-center justify-between py-6 border-t">
                    <div className="flex items-center gap-4">
                      <Button
                        variant={likeStatus?.hasAction ? "default" : "outline"}
                        size="sm"
                        className="gap-2"
                        onClick={handleLike}
                        disabled={likeMutation.isPending || unlikeMutation.isPending}
                      >
                        <ThumbsUp className={`h-4 w-4 ${likeStatus?.hasAction ? "fill-current" : ""}`} />
                        {optimisticLikeCount ?? (article.likeCount || 0)}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          const commentsSection = document.getElementById('comments-section');
                          commentsSection?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <MessageSquare className="h-4 w-4" />
                        {commentsData?.total || 0} Comments
                      </Button>
                      <Button
                        variant={bookmarkStatus?.hasAction ? "default" : "outline"}
                        size="sm"
                        className="gap-2"
                        onClick={handleBookmark}
                        disabled={bookmarkMutation.isPending || unbookmarkMutation.isPending}
                      >
                        <Bookmark className={`h-4 w-4 ${bookmarkStatus?.hasAction ? "fill-current" : ""}`} />
                        {bookmarkStatus?.hasAction ? "Saved" : "Save"}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 mr-2">Share:</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleShare("twitter")}
                      >
                        <Twitter className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleShare("facebook")}
                      >
                        <Facebook className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleShare("linkedin")}
                      >
                        <Linkedin className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleShare("copy")}
                        title="Copy link"
                      >
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Author Bio */}
                  <div className="bg-gray-50 rounded-lg p-6 mt-8">
                    <h3 className="font-semibold mb-4">About the Author</h3>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={article.author?.avatarUrl || ''} alt={article.author?.fullName || ''} />
                        <AvatarFallback>{getAuthorInitials(article.author?.fullName || 'Unknown')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{article.author?.fullName}</p>
                        <p className="text-sm text-gray-600 mb-2">Author</p>
                        <p className="text-sm text-gray-700">{article.author?.bio || 'No bio available.'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div id="comments-section" className="mt-12 pt-8 border-t">
                    <h3 className="text-xl font-bold mb-6">
                      Comments ({commentsData?.total || 0})
                    </h3>

                    {/* Add Comment Form */}
                    {session ? (
                      <form onSubmit={handleCommentSubmit} className="mb-8">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                            <AvatarFallback>{getAuthorInitials(session.user.name || 'User')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <Textarea
                              placeholder="Add a comment..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              className="min-h-[100px] mb-3"
                              maxLength={1000}
                            />
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">
                                {newComment.length}/1000 characters
                              </span>
                              <Button
                                type="submit"
                                disabled={!newComment.trim() || createCommentMutation.isPending}
                                size="sm"
                              >
                                {createCommentMutation.isPending ? "Posting..." : "Post Comment"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-6 mb-8 text-center">
                        <p className="text-gray-600">
                          Please sign in to join the conversation and share your thoughts.
                        </p>
                      </div>
                    )}

                    {/* Comments List */}
                    <div className="space-y-6">
                      {commentsData?.comments?.map((comment) => (
                        <div key={comment.id} className="flex items-start gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={comment.author.avatarUrl || ''} alt={comment.author.fullName || ''} />
                            <AvatarFallback>{getAuthorInitials(comment.author.fullName || 'User')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-sm">{comment.author.fullName}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                {comment.isEdited && (
                                  <span className="text-xs text-gray-400">(edited)</span>
                                )}
                              </div>
                              <p className="text-gray-800">{comment.content}</p>
                            </div>

                            {/* Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="ml-6 mt-4 space-y-4">
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="flex items-start gap-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={reply.author.avatarUrl || ''} alt={reply.author.fullName || ''} />
                                      <AvatarFallback className="text-xs">{getAuthorInitials(reply.author.fullName || 'User')}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-semibold text-sm">{reply.author.fullName}</span>
                                          <span className="text-xs text-gray-500">
                                            {new Date(reply.createdAt).toLocaleDateString('en-US', {
                                              month: 'short',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </span>
                                        </div>
                                        <p className="text-gray-800 text-sm">{reply.content}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8">
                          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.article>

            {/* Related Articles */}
            <motion.div variants={itemVariants} className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <Link key={relatedArticle.id} href={`/articles/${relatedArticle.slug}`}>
                    <Card className="shadow-xl bg-white/90 backdrop-blur-xl border-white/20 hover:shadow-2xl transition-all duration-300 cursor-pointer">
                      <div className="relative h-48">
                        <Image
                          src={relatedArticle.featuredImage || "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop"}
                          alt={relatedArticle.title}
                          fill
                          className="object-cover rounded-t-lg"
                        />
                      </div>
                      <CardContent className="p-6">
                        <h3 className="font-semibold mb-2">{relatedArticle.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{relatedArticle.excerpt}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {calculateReadingTime(relatedArticle.content || '')} min
                          </span>
                          <span>{formatDate(relatedArticle.publishDate || relatedArticle.createdAt)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
    </>
  );
};

export default ArticleDetailPage;