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
  Code,
  Play,
  Copy,
  Check,
  Terminal,
  Key,
  Globe,
  Zap,
  BarChart3,
  Users,
  Target,
  Activity,
  Settings,
  Book,
  ExternalLink,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Server
} from "lucide-react";

const ApiTest: NextPage = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState("forecasters");
  const [apiKey, setApiKey] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const endpoints = [
    {
      id: "forecasters",
      name: "Get Forecasters",
      method: "GET",
      endpoint: "/api/v1/forecasters",
      description: "Retrieve a list of all forecasters with their accuracy metrics",
      parameters: [
        { name: "limit", type: "number", optional: true, description: "Number of results to return (default: 10)" },
        { name: "offset", type: "number", optional: true, description: "Number of results to skip" },
        { name: "sort", type: "string", optional: true, description: "Sort by: accuracy, predictions, date" },
        { name: "category", type: "string", optional: true, description: "Filter by category: crypto, stocks, forex" }
      ],
      example: {
        url: "https://api.predictionprism.com/v1/forecasters?limit=5&sort=accuracy",
        response: {
          data: [
            {
              id: "f_001",
              name: "Michael Rodriguez",
              username: "cryptomike",
              accuracy: 94.8,
              totalPredictions: 247,
              correctPredictions: 234,
              specialty: "Crypto Markets",
              verified: true,
              joinedDate: "2022-03-15T00:00:00Z"
            }
          ],
          meta: {
            total: 2847,
            limit: 5,
            offset: 0,
            hasMore: true
          }
        }
      }
    },
    {
      id: "predictions",
      name: "Get Predictions",
      method: "GET",
      endpoint: "/api/v1/predictions",
      description: "Retrieve predictions with filtering and sorting options",
      parameters: [
        { name: "forecaster", type: "string", optional: true, description: "Filter by forecaster ID" },
        { name: "category", type: "string", optional: true, description: "Filter by category" },
        { name: "status", type: "string", optional: true, description: "Filter by status: pending, correct, incorrect" },
        { name: "date_from", type: "string", optional: true, description: "Filter predictions from date (ISO 8601)" },
        { name: "date_to", type: "string", optional: true, description: "Filter predictions to date (ISO 8601)" }
      ],
      example: {
        url: "https://api.predictionprism.com/v1/predictions?category=crypto&status=pending",
        response: {
          data: [
            {
              id: "p_001",
              forecaster: "f_001",
              title: "Bitcoin to reach $75,000 by Q2 2024",
              description: "Technical analysis suggests strong bullish momentum",
              category: "crypto",
              asset: "BTC",
              targetPrice: 75000,
              currentPrice: 45000,
              confidence: 85,
              status: "pending",
              deadline: "2024-06-30T23:59:59Z",
              createdAt: "2024-01-15T10:30:00Z"
            }
          ],
          meta: {
            total: 156,
            limit: 10,
            offset: 0
          }
        }
      }
    },
    {
      id: "rankings",
      name: "Get Rankings",
      method: "GET",
      endpoint: "/api/v1/rankings",
      description: "Get forecaster rankings with various sorting and filtering options",
      parameters: [
        { name: "timeframe", type: "string", optional: true, description: "Rankings timeframe: 7d, 30d, 90d, 1y, all" },
        { name: "category", type: "string", optional: true, description: "Filter by prediction category" },
        { name: "min_predictions", type: "number", optional: true, description: "Minimum number of predictions required" }
      ],
      example: {
        url: "https://api.predictionprism.com/v1/rankings?timeframe=30d&category=crypto",
        response: {
          data: [
            {
              rank: 1,
              forecaster: {
                id: "f_001",
                name: "Michael Rodriguez",
                username: "cryptomike"
              },
              accuracy: 94.8,
              totalPredictions: 47,
              correctPredictions: 45,
              avgConfidence: 82.4,
              performanceScore: 876
            }
          ],
          meta: {
            timeframe: "30d",
            category: "crypto",
            generatedAt: "2024-01-20T12:00:00Z"
          }
        }
      }
    },
    {
      id: "analytics",
      name: "Get Analytics",
      method: "GET",
      endpoint: "/api/v1/analytics",
      description: "Retrieve platform analytics and statistics",
      parameters: [
        { name: "metric", type: "string", required: true, description: "Metric type: accuracy, volume, performance" },
        { name: "period", type: "string", optional: true, description: "Time period: daily, weekly, monthly" },
        { name: "category", type: "string", optional: true, description: "Filter by category" }
      ],
      example: {
        url: "https://api.predictionprism.com/v1/analytics?metric=accuracy&period=daily",
        response: {
          data: {
            metric: "accuracy",
            period: "daily",
            points: [
              {
                date: "2024-01-20",
                value: 73.2,
                count: 234
              },
              {
                date: "2024-01-19",
                value: 72.8,
                count: 198
              }
            ],
            average: 73.0,
            trend: "up"
          }
        }
      }
    }
  ];

  const currentEndpoint = endpoints.find(e => e.id === selectedEndpoint);

  const handleApiTest = async () => {
    setIsLoading(true);
    setResponse(null);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setResponse(currentEndpoint?.example.response);
    } catch (error) {
      setResponse({
        error: "Failed to fetch data",
        message: "API endpoint is not available in demo mode"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const generateCurl = () => {
    if (!currentEndpoint) return "";

    return `curl -X ${currentEndpoint.method} \\
  "${currentEndpoint.example.url}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`;
  };

  const generateJavaScript = () => {
    if (!currentEndpoint) return "";

    return `const response = await fetch('${currentEndpoint.example.url}', {
  method: '${currentEndpoint.method}',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`;
  };

  const generatePython = () => {
    if (!currentEndpoint) return "";

    return `import requests

url = "${currentEndpoint.example.url}"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

response = requests.${currentEndpoint.method.toLowerCase()}(url, headers=headers)
data = response.json()
print(data)`;
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
        <title>API Testing - Prediction Prism Analytics</title>
        <meta
          name="description"
          content="Test and explore Prediction Prism API endpoints. Interactive API documentation and testing tool."
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
              className="text-center max-w-4xl mx-auto mb-12"
              variants={itemVariants}
            >
              <Badge variant="secondary" className="mb-4">
                <Code className="w-4 h-4 mr-2" />
                API Testing Console
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                API
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Testing</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Test our prediction analytics API endpoints. Get real data, see response formats,
                and integrate our services into your applications.
              </p>
            </motion.div>

            {/* API Stats */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
              variants={itemVariants}
            >
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardContent className="p-6 text-center">
                  <Server className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </CardContent>
              </Card>
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardContent className="p-6 text-center">
                  <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">&lt;100ms</div>
                  <div className="text-sm text-gray-600">Avg Response</div>
                </CardContent>
              </Card>
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardContent className="p-6 text-center">
                  <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">1M+</div>
                  <div className="text-sm text-gray-600">API Calls/Month</div>
                </CardContent>
              </Card>
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardContent className="p-6 text-center">
                  <Globe className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">REST</div>
                  <div className="text-sm text-gray-600">JSON API</div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Endpoints List */}
              <motion.div
                className="lg:col-span-1"
                variants={itemVariants}
              >
                <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20 sticky top-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Terminal className="h-5 w-5" />
                      API Endpoints
                    </CardTitle>
                    <CardDescription>
                      Select an endpoint to test
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {endpoints.map((endpoint) => (
                        <button
                          key={endpoint.id}
                          onClick={() => setSelectedEndpoint(endpoint.id)}
                          className={`w-full text-left p-3 rounded-lg transition-all ${
                            selectedEndpoint === endpoint.id
                              ? "bg-blue-50 border-2 border-blue-200"
                              : "hover:bg-gray-50 border-2 border-transparent"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900">{endpoint.name}</span>
                            <Badge
                              variant={endpoint.method === "GET" ? "secondary" : "default"}
                              className="text-xs"
                            >
                              {endpoint.method}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600 font-mono">{endpoint.endpoint}</div>
                        </button>
                      ))}
                    </div>

                    {/* API Key */}
                    <div className="mt-6 pt-6 border-t">
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        API Key
                      </label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          type="password"
                          placeholder="Enter your API key"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          className="pl-10 font-mono text-sm"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Get your API key from{" "}
                        <Link href="/settings/api" className="text-blue-600 hover:underline">
                          Settings
                        </Link>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Main Content */}
              <motion.div
                className="lg:col-span-2 space-y-6"
                variants={itemVariants}
              >
                {currentEndpoint && (
                  <>
                    {/* Endpoint Details */}
                    <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Badge
                              variant={currentEndpoint.method === "GET" ? "secondary" : "default"}
                              className="font-mono"
                            >
                              {currentEndpoint.method}
                            </Badge>
                            {currentEndpoint.name}
                          </CardTitle>
                          <Button
                            onClick={handleApiTest}
                            disabled={isLoading}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                          >
                            {isLoading ? (
                              <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Testing...
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                Test API
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="font-mono text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                          {currentEndpoint.endpoint}
                        </div>
                        <CardDescription>{currentEndpoint.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* Parameters */}
                        {currentEndpoint.parameters.length > 0 && (
                          <div className="mb-6">
                            <h4 className="font-medium text-gray-900 mb-3">Parameters</h4>
                            <div className="space-y-3">
                              {currentEndpoint.parameters.map((param, index) => (
                                <div key={index} className="grid grid-cols-4 gap-4 text-sm">
                                  <div className="font-mono text-blue-600">{param.name}</div>
                                  <div>
                                    <Badge variant="outline" className="text-xs">
                                      {param.type}
                                    </Badge>
                                  </div>
                                  <div>
                                    {param.optional ? (
                                      <Badge variant="secondary" className="text-xs">
                                        Optional
                                      </Badge>
                                    ) : (
                                      <Badge variant="destructive" className="text-xs">
                                        Required
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-gray-600">{param.description}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Example URL */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">Example Request</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(currentEndpoint.example.url, "url")}
                            >
                              {copied === "url" ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          <div className="font-mono text-sm bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto">
                            {currentEndpoint.example.url}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Code Examples */}
                    <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                      <CardHeader>
                        <CardTitle>Code Examples</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {/* cURL */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">cURL</h4>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(generateCurl(), "curl")}
                              >
                                {copied === "curl" ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                            <pre className="text-sm bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto">
                              <code>{generateCurl()}</code>
                            </pre>
                          </div>

                          {/* JavaScript */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">JavaScript</h4>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(generateJavaScript(), "js")}
                              >
                                {copied === "js" ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                            <pre className="text-sm bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto">
                              <code>{generateJavaScript()}</code>
                            </pre>
                          </div>

                          {/* Python */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">Python</h4>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(generatePython(), "python")}
                              >
                                {copied === "python" ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                            <pre className="text-sm bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto">
                              <code>{generatePython()}</code>
                            </pre>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Response */}
                    {(response || isLoading) && (
                      <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                              <Terminal className="h-5 w-5" />
                              Response
                            </CardTitle>
                            {response && (
                              <div className="flex items-center gap-2">
                                {response.error ? (
                                  <>
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                    <Badge variant="destructive">Error</Badge>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <Badge className="bg-green-100 text-green-700">200 OK</Badge>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                              <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                              <span className="text-gray-600">Making API request...</span>
                            </div>
                          ) : (
                            <div className="relative">
                              <Button
                                variant="outline"
                                size="sm"
                                className="absolute top-2 right-2 z-10"
                                onClick={() => copyToClipboard(JSON.stringify(response, null, 2), "response")}
                              >
                                {copied === "response" ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                              <pre className="text-sm bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto max-h-96">
                                <code>{JSON.stringify(response, null, 2)}</code>
                              </pre>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </motion.div>
            </div>

            {/* Resources */}
            <motion.div
              className="mt-16 grid md:grid-cols-3 gap-6"
              variants={itemVariants}
            >
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardContent className="p-6 text-center">
                  <Book className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2">API Documentation</h3>
                  <p className="text-sm text-gray-600 mb-4">Complete API reference and guides</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/docs/api">
                      <ExternalLink className="mr-1 h-3 w-3" />
                      View Docs
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardContent className="p-6 text-center">
                  <Download className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2">SDKs & Libraries</h3>
                  <p className="text-sm text-gray-600 mb-4">Official SDKs for popular languages</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/docs/sdks">
                      <Download className="mr-1 h-3 w-3" />
                      Download SDKs
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-xl bg-white/90 backdrop-blur-xl border border-white/20">
                <CardContent className="p-6 text-center">
                  <Settings className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2">API Keys</h3>
                  <p className="text-sm text-gray-600 mb-4">Manage your API keys and rate limits</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/settings/api">
                      <Settings className="mr-1 h-3 w-3" />
                      Manage Keys
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
    </>
  );
};

export default ApiTest;