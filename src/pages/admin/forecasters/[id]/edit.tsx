"use client";

import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  User,
  Save,
  X,
  Plus,
  Globe,
  Twitter,
  Linkedin,
  AlertCircle,
  Youtube,
  Settings
} from "lucide-react";

const ForecasterEdit: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  // State for form data
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    bio: "",
    isVerified: false,
    expertise: [] as string[],
    links: {
      website: "",
      twitter: "",
      linkedin: "",
    },
    youtubeChannels: {
      primary: {
        url: "",
        channelId: "",
        enabled: true,
        extractAllVideos: true,
      },
      secondary: {
        url: "",
        channelId: "",
        enabled: false,
        extractAllVideos: false,
        keywords: [] as string[],
        extractOnKeywordMatch: true,
      },
    },
  });

  const [newExpertise, setNewExpertise] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch forecaster details
  const { data: forecaster, isLoading, error } = api.admin.getForecaster.useQuery(
    { id: id as string },
    { enabled: !!id }
  );

  // Update forecaster mutation
  const updateForecasterMutation = api.admin.updateForecaster.useMutation({
    onSuccess: () => {
      router.push(`/admin/forecasters/${id}`);
    },
    onError: (error) => {
      console.error("Update failed:", error);
      setErrors({ submit: error.message });
      setIsSubmitting(false);
    },
  });

  // Populate form when forecaster data is loaded
  useEffect(() => {
    if (forecaster) {
      // The API returns flattened data, so we work with that
      const forecasterData = forecaster as any;
      const links = forecasterData.links || {};

      setFormData({
        name: forecaster.name || "",
        slug: forecaster.slug || "",
        bio: forecasterData.bio || "",
        isVerified: forecaster.isVerified || false,
        expertise: forecasterData.expertise || [],
        links: {
          website: links.website || "",
          twitter: links.twitter || "",
          linkedin: links.linkedin || "",
        },
        youtubeChannels: {
          primary: {
            url: "",
            channelId: "",
            enabled: true,
            extractAllVideos: true,
          },
          secondary: {
            url: "",
            channelId: "",
            enabled: false,
            extractAllVideos: false,
            keywords: [],
            extractOnKeywordMatch: true,
          },
        },
      });
    }
  }, [forecaster]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleLinksChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      links: {
        ...prev.links,
        [platform]: value
      }
    }));
  };

  const addExpertise = () => {
    if (newExpertise.trim() && !formData.expertise.includes(newExpertise.trim())) {
      setFormData(prev => ({
        ...prev,
        expertise: [...prev.expertise, newExpertise.trim()]
      }));
      setNewExpertise("");
    }
  };

  const removeExpertise = (expertiseToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.filter(exp => exp !== expertiseToRemove)
    }));
  };

  const handleYoutubeChannelChange = (channel: 'primary' | 'secondary', field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      youtubeChannels: {
        ...prev.youtubeChannels,
        [channel]: {
          ...prev.youtubeChannels[channel],
          [field]: value
        }
      }
    }));
  };

  const [newKeyword, setNewKeyword] = useState("");

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.youtubeChannels.secondary.keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        youtubeChannels: {
          ...prev.youtubeChannels,
          secondary: {
            ...prev.youtubeChannels.secondary,
            keywords: [...prev.youtubeChannels.secondary.keywords, newKeyword.trim()]
          }
        }
      }));
      setNewKeyword("");
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      youtubeChannels: {
        ...prev.youtubeChannels,
        secondary: {
          ...prev.youtubeChannels.secondary,
          keywords: prev.youtubeChannels.secondary.keywords.filter(keyword => keyword !== keywordToRemove)
        }
      }
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    } else if (!/^[a-z0-9-_]+$/.test(formData.slug)) {
      newErrors.slug = "Slug can only contain lowercase letters, numbers, hyphens, and underscores";
    }

    if (formData.links.website && !formData.links.website.startsWith('http')) {
      newErrors.website = "Website must be a valid URL starting with http or https";
    }

    // YouTube channel URL validation
    if (formData.youtubeChannels.primary.url &&
        (!formData.youtubeChannels.primary.url.startsWith('http') ||
         !formData.youtubeChannels.primary.url.includes('youtube.com'))) {
      newErrors.primaryYoutube = "Primary YouTube URL must be a valid YouTube channel URL";
    }

    if (formData.youtubeChannels.secondary.url &&
        (!formData.youtubeChannels.secondary.url.startsWith('http') ||
         !formData.youtubeChannels.secondary.url.includes('youtube.com'))) {
      newErrors.secondaryYoutube = "Secondary YouTube URL must be a valid YouTube channel URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await updateForecasterMutation.mutateAsync({
        id: id as string,
        name: formData.name,
        slug: formData.slug,
        bio: formData.bio || undefined,
        isVerified: formData.isVerified,
        expertise: formData.expertise.length > 0 ? formData.expertise : undefined,
        links: {
          website: formData.links.website || undefined,
          twitter: formData.links.twitter || undefined,
          linkedin: formData.links.linkedin || undefined,
        },
        youtubeChannels: {
          primary: {
            url: formData.youtubeChannels.primary.url || undefined,
            channelId: formData.youtubeChannels.primary.channelId || undefined,
            enabled: formData.youtubeChannels.primary.enabled,
            extractAllVideos: formData.youtubeChannels.primary.extractAllVideos,
          },
          secondary: {
            url: formData.youtubeChannels.secondary.url || undefined,
            channelId: formData.youtubeChannels.secondary.channelId || undefined,
            enabled: formData.youtubeChannels.secondary.enabled,
            extractAllVideos: formData.youtubeChannels.secondary.extractAllVideos,
            keywords: formData.youtubeChannels.secondary.keywords.length > 0 ? formData.youtubeChannels.secondary.keywords : undefined,
            extractOnKeywordMatch: formData.youtubeChannels.secondary.extractOnKeywordMatch,
          },
        },
      });
    } catch (error) {
      // Error handling is done in the mutation's onError
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading forecaster details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !forecaster) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Forecaster not found</h3>
          <p className="text-gray-600 mb-4">The forecaster you're trying to edit doesn't exist.</p>
          <Button asChild>
            <Link href="/admin/forecasters">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forecasters
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Edit {forecaster.name} - Admin - Prediction Prism Analytics</title>
        <meta
          name="description"
          content={`Edit forecaster ${forecaster.name}`}
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
                  <Link href={`/admin/forecasters/${id}`}>
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                    Edit
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Forecaster</span>
                  </h1>
                  <p className="text-xl text-gray-600">
                    Update forecaster profile and information.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Edit Form */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20 max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>Forecaster Information</CardTitle>
                <CardDescription>
                  Update the forecaster's profile and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name and Slug */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter forecaster name"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                        Slug *
                      </label>
                      <input
                        type="text"
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.slug ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="forecaster-slug"
                      />
                      {errors.slug && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.slug}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief description of the forecaster..."
                    />
                  </div>

                  {/* Verification Status */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isVerified"
                      checked={formData.isVerified}
                      onChange={(e) => handleInputChange('isVerified', e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isVerified" className="ml-2 text-sm font-medium text-gray-700">
                      Verified Forecaster
                    </label>
                  </div>

                  {/* Expertise */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Areas of Expertise
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newExpertise}
                        onChange={(e) => setNewExpertise(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Add expertise area..."
                      />
                      <Button type="button" onClick={addExpertise} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.expertise.map((exp, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {exp}
                          <button
                            type="button"
                            onClick={() => removeExpertise(exp)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Social Links */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Social Links
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-500" />
                        <input
                          type="url"
                          value={formData.links.website}
                          onChange={(e) => handleLinksChange('website', e.target.value)}
                          className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.website ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="https://website.com"
                        />
                      </div>
                      {errors.website && (
                        <p className="text-red-500 text-sm flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.website}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        <Twitter className="h-4 w-4 text-gray-500" />
                        <input
                          type="text"
                          value={formData.links.twitter}
                          onChange={(e) => handleLinksChange('twitter', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://twitter.com/username"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Linkedin className="h-4 w-4 text-gray-500" />
                        <input
                          type="text"
                          value={formData.links.linkedin}
                          onChange={(e) => handleLinksChange('linkedin', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                    </div>
                  </div>

                  {/* YouTube Channels */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      YouTube Channels
                    </label>

                    {/* Primary YouTube Channel */}
                    <div className="space-y-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Youtube className="h-4 w-4 text-red-500" />
                          <span className="font-medium text-gray-900">Primary Channel</span>
                          <span className="text-sm text-gray-600">(Extract all videos)</span>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="primaryEnabled"
                              checked={formData.youtubeChannels.primary.enabled}
                              onChange={(e) => handleYoutubeChannelChange('primary', 'enabled', e.target.checked)}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="primaryEnabled" className="text-sm font-medium text-gray-700">
                              Enable primary channel monitoring
                            </label>
                          </div>

                          <div>
                            <input
                              type="url"
                              value={formData.youtubeChannels.primary.url}
                              onChange={(e) => handleYoutubeChannelChange('primary', 'url', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.primaryYoutube ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="https://youtube.com/@channelname"
                              disabled={!formData.youtubeChannels.primary.enabled}
                            />
                            {errors.primaryYoutube && (
                              <p className="text-red-500 text-sm mt-1 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {errors.primaryYoutube}
                              </p>
                            )}
                          </div>

                          <div>
                            <input
                              type="text"
                              value={formData.youtubeChannels.primary.channelId}
                              onChange={(e) => handleYoutubeChannelChange('primary', 'channelId', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Channel ID (optional)"
                              disabled={!formData.youtubeChannels.primary.enabled}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Secondary YouTube Channel */}
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Youtube className="h-4 w-4 text-red-500" />
                          <span className="font-medium text-gray-900">Secondary Channel</span>
                          <span className="text-sm text-gray-600">(Extract videos matching keywords)</span>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="secondaryEnabled"
                              checked={formData.youtubeChannels.secondary.enabled}
                              onChange={(e) => handleYoutubeChannelChange('secondary', 'enabled', e.target.checked)}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="secondaryEnabled" className="text-sm font-medium text-gray-700">
                              Enable secondary channel monitoring
                            </label>
                          </div>

                          <div>
                            <input
                              type="url"
                              value={formData.youtubeChannels.secondary.url}
                              onChange={(e) => handleYoutubeChannelChange('secondary', 'url', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.secondaryYoutube ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="https://youtube.com/@channelname"
                              disabled={!formData.youtubeChannels.secondary.enabled}
                            />
                            {errors.secondaryYoutube && (
                              <p className="text-red-500 text-sm mt-1 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {errors.secondaryYoutube}
                              </p>
                            )}
                          </div>

                          <div>
                            <input
                              type="text"
                              value={formData.youtubeChannels.secondary.channelId}
                              onChange={(e) => handleYoutubeChannelChange('secondary', 'channelId', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Channel ID (optional)"
                              disabled={!formData.youtubeChannels.secondary.enabled}
                            />
                          </div>

                          {/* Keywords Management */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Keywords for Video Filtering
                            </label>
                            <p className="text-xs text-gray-600 mb-2">
                              Videos containing these keywords in title or description will be extracted
                            </p>
                            <div className="flex gap-2 mb-2">
                              <input
                                type="text"
                                value={newKeyword}
                                onChange={(e) => setNewKeyword(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Add keyword..."
                                disabled={!formData.youtubeChannels.secondary.enabled}
                              />
                              <Button
                                type="button"
                                onClick={addKeyword}
                                size="sm"
                                disabled={!formData.youtubeChannels.secondary.enabled}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {formData.youtubeChannels.secondary.keywords.map((keyword, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                  {keyword}
                                  <button
                                    type="button"
                                    onClick={() => removeKeyword(keyword)}
                                    className="ml-1 hover:text-red-600"
                                    disabled={!formData.youtubeChannels.secondary.enabled}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Error */}
                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                        <p className="text-red-700">{errors.submit}</p>
                      </div>
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="flex items-center justify-end gap-3 pt-6 border-t">
                    <Button variant="outline" asChild>
                      <Link href={`/admin/forecasters/${id}`}>
                        Cancel
                      </Link>
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
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

export default ForecasterEdit;

// Force server-side rendering to avoid SSG issues with useRouter in Next.js 16
export async function getServerSideProps() {
  return { props: {} };
}