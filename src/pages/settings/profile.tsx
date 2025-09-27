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
  User,
  Camera,
  Save,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  Twitter,
  Linkedin,
  Github,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Crown
} from "lucide-react";

const ProfileSettings: NextPage = () => {
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    bio: "Crypto enthusiast and market analyst with 5+ years of experience in financial forecasting.",
    location: "New York, NY",
    website: "https://johndoe.com",
    twitter: "@johndoe",
    linkedin: "johndoe",
    github: "johndoe",
    timezone: "America/New_York",
    language: "en",
    publicProfile: true,
    showEmail: false,
    showLocation: true
  });

  const [avatar, setAvatar] = useState("/default-avatar.jpg");
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setHasChanges(false);
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
        <title>Profile Settings - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Manage your personal information, preferences, and public profile settings."
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
              className="flex items-center justify-between mb-12"
              variants={itemVariants}
            >
              <div>
                <Button variant="ghost" className="mb-4" asChild>
                  <Link href="/settings">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Settings
                  </Link>
                </Button>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                  Profile
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Settings</span>
                </h1>
                <p className="text-xl text-gray-600">
                  Manage your personal information and public profile.
                </p>
              </div>
              {hasChanges && (
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                  <Save className="ml-2 h-4 w-4" />
                </Button>
              )}
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Profile Picture */}
              <motion.div
                variants={itemVariants}
              >
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      Profile Picture
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="relative inline-block mb-6">
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-4xl mx-auto">
                        {profile.firstName[0]}{profile.lastName[0]}
                      </div>
                      <button className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload a new profile picture. JPG, PNG or GIF. Max size 5MB.
                    </p>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm">
                        Upload Photo
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        Remove Photo
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Profile Visibility */}
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20 mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Profile Visibility
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Public Profile</div>
                          <div className="text-sm text-gray-600">Make your profile visible to others</div>
                        </div>
                        <button
                          onClick={() => handleInputChange('publicProfile', !profile.publicProfile)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            profile.publicProfile ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            profile.publicProfile ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Show Email</div>
                          <div className="text-sm text-gray-600">Display email on public profile</div>
                        </div>
                        <button
                          onClick={() => handleInputChange('showEmail', !profile.showEmail)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            profile.showEmail ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            profile.showEmail ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Show Location</div>
                          <div className="text-sm text-gray-600">Display location on public profile</div>
                        </div>
                        <button
                          onClick={() => handleInputChange('showLocation', !profile.showLocation)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            profile.showLocation ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            profile.showLocation ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Main Profile Form */}
              <motion.div
                className="lg:col-span-2 space-y-6"
                variants={itemVariants}
              >
                {/* Personal Information */}
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Update your personal details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          First Name
                        </label>
                        <Input
                          value={profile.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          placeholder="Enter first name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Last Name
                        </label>
                        <Input
                          value={profile.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          placeholder="Enter last name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            type="email"
                            value={profile.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="Enter email address"
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            type="tel"
                            value={profile.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="Enter phone number"
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Location
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            value={profile.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            placeholder="Enter location"
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Website
                        </label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            type="url"
                            value={profile.website}
                            onChange={(e) => handleInputChange('website', e.target.value)}
                            placeholder="Enter website URL"
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Bio
                      </label>
                      <textarea
                        value={profile.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Tell others about yourself..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {profile.bio.length}/500 characters
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Social Links */}
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LinkIcon className="h-5 w-5" />
                      Social Links
                    </CardTitle>
                    <CardDescription>
                      Connect your social media profiles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          X
                        </label>
                        <div className="relative">
                          <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            value={profile.twitter}
                            onChange={(e) => handleInputChange('twitter', e.target.value)}
                            placeholder="@username"
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          LinkedIn
                        </label>
                        <div className="relative">
                          <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            value={profile.linkedin}
                            onChange={(e) => handleInputChange('linkedin', e.target.value)}
                            placeholder="username"
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          GitHub
                        </label>
                        <div className="relative">
                          <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            value={profile.github}
                            onChange={(e) => handleInputChange('github', e.target.value)}
                            placeholder="username"
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Preferences */}
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Preferences
                    </CardTitle>
                    <CardDescription>
                      Language and timezone settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Language
                        </label>
                        <select
                          value={profile.language}
                          onChange={(e) => handleInputChange('language', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="en">English</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                          <option value="de">Deutsch</option>
                          <option value="ja">日本語</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Timezone
                        </label>
                        <select
                          value={profile.timezone}
                          onChange={(e) => handleInputChange('timezone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="America/New_York">Eastern Time (ET)</option>
                          <option value="America/Chicago">Central Time (CT)</option>
                          <option value="America/Denver">Mountain Time (MT)</option>
                          <option value="America/Los_Angeles">Pacific Time (PT)</option>
                          <option value="Europe/London">London (GMT)</option>
                          <option value="Europe/Paris">Paris (CET)</option>
                          <option value="Asia/Tokyo">Tokyo (JST)</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleSave}
                    disabled={!hasChanges || isLoading}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {isLoading ? "Saving..." : "Save Profile"}
                    <Save className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
    </>
  );
};

export default ProfileSettings;