"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { parseChannelUrl, type ParsedChannel } from "@/utils/channelParser";
import {
  Youtube,
  Twitter,
  Crown,
  Globe,
  Clock,
  Tag,
  Plus,
  X,
  Info
} from "lucide-react";

interface AddChannelFormForNewProps {
  forecasterName: string;
  onSuccess: (channel: {
    channelType: "YOUTUBE" | "TWITTER";
    channelId: string;
    channelName: string;
    channelUrl: string;
    isPrimary: boolean;
    keywords: string[];
  }) => void;
  onCancel: () => void;
  existingChannels: Array<{
    channelType: "YOUTUBE" | "TWITTER";
    isPrimary: boolean;
  }>;
}

export const AddChannelFormForNew: React.FC<AddChannelFormForNewProps> = ({
  forecasterName,
  onSuccess,
  onCancel,
  existingChannels = []
}) => {
  const [urlInput, setUrlInput] = useState("");
  const [parsedChannel, setParsedChannel] = useState<ParsedChannel | null>(null);
  const [isPrimary, setIsPrimary] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");

  // Parse the URL when it changes
  const handleUrlChange = (url: string) => {
    setUrlInput(url);
    const parsed = parseChannelUrl(url.trim());
    setParsedChannel(parsed);

    // Auto-set as primary if it's the first channel of this type
    if (parsed) {
      const hasPrimaryOfType = existingChannels.some(ch =>
        ch.isPrimary && ch.channelType === parsed.type
      );
      setIsPrimary(!hasPrimaryOfType);
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords(prev => [...prev, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setKeywords(prev => prev.filter(keyword => keyword !== keywordToRemove));
  };

  const handleSubmit = () => {
    if (!parsedChannel) {
      toast.error("Please enter a valid YouTube or X URL");
      return;
    }

    onSuccess({
      channelType: parsedChannel.type,
      channelId: parsedChannel.channelId,
      channelName: parsedChannel.channelName || parsedChannel.channelId,
      channelUrl: parsedChannel.channelUrl,
      isPrimary,
      keywords: isPrimary ? [] : keywords // Clear keywords for primary channels
    });
  };

  const formatCheckInterval = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
    }
    return `${minutes}m`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add New Channel</h2>
            <p className="text-gray-600">Configure a new content collection channel for {forecasterName}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Channel URL Input */}
            <Card>
              <CardHeader>
                <CardTitle>Channel URL</CardTitle>
                <CardDescription>
                  Paste any YouTube or X channel URL
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Channel URL *
                  </label>
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Paste YouTube or X URL here..."
                    autoFocus
                  />
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500">Supported formats:</p>
                    <p className="text-xs text-gray-400">
                      YouTube: @username, youtube.com/channel/..., youtube.com/c/..., youtube.com/@...
                    </p>
                    <p className="text-xs text-gray-400">
                      X: @username, twitter.com/username, x.com/username, or just username
                    </p>
                  </div>
                </div>

                {parsedChannel && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      {parsedChannel.type === "YOUTUBE" ? (
                        <Youtube className="h-5 w-5 text-red-500" />
                      ) : (
                        <Twitter className="h-5 w-5 text-blue-500" />
                      )}
                      <div>
                        <p className="font-medium text-green-800">
                          {parsedChannel.channelName || parsedChannel.channelId}
                        </p>
                        <p className="text-xs text-green-600">{parsedChannel.type} Channel Detected</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Keywords (Secondary Channels Only) */}
            {!isPrimary && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Keywords
                  </CardTitle>
                  <CardDescription>
                    Content will only be collected if it contains these keywords
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addKeyword()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter keyword..."
                    />
                    <Button onClick={addKeyword} type="button" variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {keyword}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-red-500"
                            onClick={() => removeKeyword(keyword)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">Default keyword: "{forecasterName}"</p>
                      <p>The forecaster's name will be automatically added as a keyword for secondary channels.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Channel Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Channel Priority
                </CardTitle>
                <CardDescription>
                  Set the collection strategy for this channel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    isPrimary
                      ? "border-yellow-500 bg-yellow-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setIsPrimary(true)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Crown className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium">Primary Channel</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Collect ALL content from this channel
                  </p>
                </div>

                <div
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    !isPrimary
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setIsPrimary(false)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Tag className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Secondary Channel</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Only collect content matching keywords
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  How this channel will appear
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {parsedChannel && (
                    <div className="flex items-center gap-2">
                      {parsedChannel.type === "YOUTUBE"
                        ? <Youtube className="h-5 w-5 text-red-500" />
                        : <Twitter className="h-5 w-5 text-blue-500" />
                      }
                      <span className="font-medium">
                        {parsedChannel.channelName || parsedChannel.channelId}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1">
                    {isPrimary ? (
                      <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                        <Crown className="h-3 w-3 mr-1" />
                        Primary
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Tag className="h-3 w-3 mr-1" />
                        Secondary
                      </Badge>
                    )}
                  </div>

                  {!isPrimary && keywords.length > 0 && (
                    <div className="text-xs text-gray-500">
                      {keywords.length} keyword{keywords.length !== 1 ? 's' : ''} configured
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!parsedChannel}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Channel
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};