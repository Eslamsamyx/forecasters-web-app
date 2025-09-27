import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Upload,
  Search,
  Filter,
  Youtube,
  Twitter,
  Clock,
  PlayCircle,
  StopCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  BarChart3,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckSquare,
  Square,
  Activity,
  ArrowLeft,
  Globe,
  Circle,
  CircleDot,
} from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

const AdminPredictionsPage: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState<"ALL" | "PENDING" | "CORRECT" | "INCORRECT" | "PARTIALLY_CORRECT">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPredictions, setSelectedPredictions] = useState<string[]>([]);
  const [editingPrediction, setEditingPrediction] = useState<any>(null);
  const [validatingPrediction, setValidatingPrediction] = useState<any>(null);
  const [extractionDialog, setExtractionDialog] = useState(false);
  const [extractionType, setExtractionType] = useState<"youtube" | "twitter">("youtube");
  const [extractionUrl, setExtractionUrl] = useState("");
  const [extractionUsername, setExtractionUsername] = useState("");
  const [selectedForecaster, setSelectedForecaster] = useState("");
  const [activeTab, setActiveTab] = useState("predictions");

  // Fetch data
  const { data: predictionsData, refetch: refetchPredictions, isLoading: loadingPredictions } = api.admin.getPredictions.useQuery({
    page: currentPage,
    limit: 20,
    search: searchTerm,
    outcome: outcomeFilter,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { data: forecastersData } = api.admin.getForecasters.useQuery({
    page: 1,
    limit: 100,
  });

  const { data: cronStatus, refetch: refetchCronStatus } = api.admin.getCronStatus.useQuery();

  // Mutations
  const updatePrediction = api.admin.updatePrediction.useMutation({
    onSuccess: () => {
      toast.success("Prediction updated successfully");
      setEditingPrediction(null);
      refetchPredictions();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deletePrediction = api.admin.deletePrediction.useMutation({
    onSuccess: () => {
      toast.success("Prediction deleted successfully");
      refetchPredictions();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const bulkDeletePredictions = api.admin.bulkDeletePredictions.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setSelectedPredictions([]);
      refetchPredictions();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const validatePredictionMutation = api.admin.validatePrediction.useMutation({
    onSuccess: () => {
      toast.success("Prediction validated successfully");
      setValidatingPrediction(null);
      refetchPredictions();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const extractYouTube = api.admin.extractFromYouTube.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setExtractionDialog(false);
      setExtractionUrl("");
      refetchCronStatus();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const extractTwitter = api.admin.extractFromTwitter.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setExtractionDialog(false);
      setExtractionUsername("");
      refetchCronStatus();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const bulkExtraction = api.admin.bulkExtraction.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetchCronStatus();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const cancelJob = api.admin.cancelJob.useMutation({
    onSuccess: () => {
      toast.success("Job cancelled successfully");
      refetchCronStatus();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Check authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    router.push("/");
    return null;
  }

  // Helper functions
  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOutcomeBadge = (outcome: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CORRECT: "bg-green-100 text-green-800",
      INCORRECT: "bg-red-100 text-red-800",
      PARTIALLY_CORRECT: "bg-blue-100 text-blue-800",
    };
    return colors[outcome] || "bg-gray-100 text-gray-800";
  };

  const getJobStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      RUNNING: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
      CANCELLED: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const handleSelectAll = () => {
    if (selectedPredictions.length === predictionsData?.predictions.length) {
      setSelectedPredictions([]);
    } else {
      setSelectedPredictions(predictionsData?.predictions.map(p => p.id) || []);
    }
  };

  const handleSelectPrediction = (id: string) => {
    if (selectedPredictions.includes(id)) {
      setSelectedPredictions(selectedPredictions.filter(p => p !== id));
    } else {
      setSelectedPredictions([...selectedPredictions, id]);
    }
  };

  const handleBulkExtraction = () => {
    const forecasterIds = forecastersData?.forecasters
      .filter(f => f.isVerified)
      .map(f => f.id) || [];

    if (forecasterIds.length === 0) {
      toast.error("No verified forecasters found");
      return;
    }

    toast.success(`Starting bulk extraction for ${forecasterIds.length} forecasters...`, {
      description: "Processing YouTube channels and X accounts → MP3 → Whisper → LLM extraction"
    });

    bulkExtraction.mutate({
      forecasterIds,
      sources: ["youtube", "twitter"],
    }, {
      onSuccess: (data) => {
        toast.success(`Bulk extraction started successfully!`, {
          description: `Job ID: ${data.jobId} - Processing in background`
        });
      },
      onError: (error) => {
        toast.error("Failed to start bulk extraction", {
          description: error.message
        });
      }
    });
  };

  return (
    <>
      <Head>
        <title>Predictions Management - Admin</title>
        <meta name="description" content="Manage predictions and extraction" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4">
          <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="icon">
                <Link href="/admin">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <h1 className="text-3xl font-bold">Predictions Management</h1>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setExtractionDialog(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                Extract Predictions
              </Button>
              <Button
                onClick={handleBulkExtraction}
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Bulk Extract All
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="predictions">Predictions</TabsTrigger>
              <TabsTrigger value="extraction">Extraction Jobs</TabsTrigger>
              <TabsTrigger value="cron">Cron Schedule</TabsTrigger>
            </TabsList>

            <TabsContent value="predictions" className="space-y-4">
              {/* Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search predictions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={outcomeFilter} onValueChange={(value: any) => setOutcomeFilter(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by outcome" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Outcomes</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="CORRECT">Correct</SelectItem>
                        <SelectItem value="INCORRECT">Incorrect</SelectItem>
                        <SelectItem value="PARTIALLY_CORRECT">Partially Correct</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedForecaster || "all"} onValueChange={(value) => setSelectedForecaster(value === "all" ? "" : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Forecasters" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Forecasters</SelectItem>
                        {forecastersData?.forecasters.map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedPredictions.length > 0 && (
                      <Button
                        variant="destructive"
                        onClick={() => bulkDeletePredictions.mutate({ ids: selectedPredictions })}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete {selectedPredictions.length}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Predictions Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Predictions ({predictionsData?.pagination.total || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingPredictions ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                      <p>Loading predictions...</p>
                    </div>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">
                              <input
                                type="checkbox"
                                checked={selectedPredictions.length === predictionsData?.predictions.length}
                                onChange={handleSelectAll}
                                className="rounded"
                              />
                            </TableHead>
                            <TableHead>Prediction</TableHead>
                            <TableHead>Forecaster</TableHead>
                            <TableHead>Asset</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Direction</TableHead>
                            <TableHead>Baseline Price</TableHead>
                            <TableHead>Target Price</TableHead>
                            <TableHead>Confidence</TableHead>
                            <TableHead>Target Date</TableHead>
                            <TableHead>Extracted</TableHead>
                            <TableHead>Outcome</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {predictionsData?.predictions.map((prediction) => (
                            <TableRow key={prediction.id}>
                              <TableCell>
                                <input
                                  type="checkbox"
                                  checked={selectedPredictions.includes(prediction.id)}
                                  onChange={() => handleSelectPrediction(prediction.id)}
                                  className="rounded"
                                />
                              </TableCell>
                              <TableCell className="max-w-md">
                                <div className="truncate" title={prediction.prediction}>
                                  {prediction.prediction || "No prediction content"}
                                </div>
                              </TableCell>
                              <TableCell>{prediction.forecaster?.name || "Unknown"}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {prediction.asset?.symbol || "N/A"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {prediction.metadata && typeof prediction.metadata === 'object' && (prediction.metadata as any)?.source ? (
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                                      {(prediction.metadata as any).source.type === "youtube" ? (
                                        <Youtube className="h-3 w-3" />
                                      ) : (prediction.metadata as any).source.type === "twitter" ? (
                                        <Twitter className="h-3 w-3" />
                                      ) : null}
                                      {(prediction.metadata as any).source.type === "youtube" ? "YouTube" :
                                       (prediction.metadata as any).source.type === "twitter" ? "Twitter" :
                                       (prediction.metadata as any).source.type || "Unknown"}
                                    </Badge>
                                    {(prediction.metadata as any).source.url && (
                                      <a
                                        href={(prediction.metadata as any).source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-xs"
                                      >
                                        <Globe className="h-3 w-3" />
                                      </a>
                                    )}
                                  </div>
                                ) : (
                                  <Badge variant="outline" className="text-xs">Unknown</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={`text-xs ${
                                  prediction.direction === "BULLISH" ? "bg-green-50 text-green-700" :
                                  prediction.direction === "BEARISH" ? "bg-red-50 text-red-700" :
                                  "bg-gray-50 text-gray-700"
                                }`}>
                                  <span className="flex items-center gap-1">
                                    {prediction.direction === "BULLISH" ? (
                                      <><TrendingUp className="h-3 w-3 text-green-600" /> Bullish</>
                                    ) : prediction.direction === "BEARISH" ? (
                                      <><TrendingDown className="h-3 w-3 text-red-600" /> Bearish</>
                                    ) : (
                                      <><Circle className="h-3 w-3 text-gray-500" /> Neutral</>
                                    )}
                                  </span>
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {prediction.baselinePrice ? (
                                  <div className="text-sm">
                                    <span className="font-medium text-gray-900">
                                      ${Number(prediction.baselinePrice).toLocaleString()}
                                    </span>
                                    <div className="text-xs text-gray-500">at creation</div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">N/A</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {prediction.targetPrice ? (
                                  <div className="text-sm">
                                    <span className="font-medium text-gray-900">
                                      ${Number(prediction.targetPrice).toLocaleString()}
                                    </span>
                                    {prediction.baselinePrice && prediction.targetPrice && (
                                      <div className={`text-xs ${
                                        Number(prediction.targetPrice) > Number(prediction.baselinePrice)
                                          ? 'text-green-600'
                                          : Number(prediction.targetPrice) < Number(prediction.baselinePrice)
                                          ? 'text-red-600'
                                          : 'text-gray-500'
                                      }`}>
                                        {((Number(prediction.targetPrice) - Number(prediction.baselinePrice)) / Number(prediction.baselinePrice) * 100).toFixed(1)}%
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">N/A</span>
                                )}
                              </TableCell>
                              <TableCell>{Math.round((prediction.confidence || 0) * 100)}%</TableCell>
                              <TableCell>{prediction.targetDate ? formatDate(prediction.targetDate) : "N/A"}</TableCell>
                              <TableCell>{formatDate(prediction.createdAt)}</TableCell>
                              <TableCell>
                                <Badge className={getOutcomeBadge(prediction.outcome)}>
                                  {prediction.outcome}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingPrediction(prediction)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  {prediction.outcome === "PENDING" && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setValidatingPrediction(prediction)}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deletePrediction.mutate({ id: prediction.id })}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {/* Pagination */}
                      {predictionsData?.pagination && (
                        <div className="flex justify-between items-center mt-4">
                          <p className="text-sm text-gray-600">
                            Showing {((currentPage - 1) * 20) + 1} to{" "}
                            {Math.min(currentPage * 20, predictionsData.pagination.total)} of{" "}
                            {predictionsData.pagination.total} results
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="px-3 py-1 text-sm">
                              Page {currentPage} of {predictionsData.pagination.pages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(currentPage + 1)}
                              disabled={currentPage === predictionsData.pagination.pages}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="extraction" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Extraction Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cronStatus?.recentJobs.map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`h-3 w-3 rounded-full ${
                            job.status === "RUNNING" ? "bg-blue-500 animate-pulse" :
                            job.status === "COMPLETED" ? "bg-green-500" :
                            job.status === "FAILED" ? "bg-red-500" :
                            "bg-gray-500"
                          }`} />
                          <div>
                            <p className="font-medium">{job.type.replace(/_/g, " ")}</p>
                            <p className="text-sm text-gray-600">
                              Started: {formatDate(job.createdAt)}
                              {job.completedAt && ` • Completed: ${formatDate(job.completedAt)}`}
                            </p>
                            {job.error && (
                              <p className="text-sm text-red-600 mt-1">Error: {job.error}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getJobStatusBadge(job.status)}>
                            {job.status}
                          </Badge>
                          {job.status === "RUNNING" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => cancelJob.mutate({ id: job.id })}
                            >
                              <StopCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Job Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                        <p className="text-2xl font-bold">{cronStatus?.statistics.total || 0}</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Completed</p>
                        <p className="text-2xl font-bold text-green-600">{cronStatus?.statistics.completed || 0}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Failed</p>
                        <p className="text-2xl font-bold text-red-600">{cronStatus?.statistics.failed || 0}</p>
                      </div>
                      <XCircle className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Success Rate</p>
                        <p className="text-2xl font-bold">{cronStatus?.statistics.successRate || 0}%</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="cron" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Scheduled Cron Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cronStatus?.cronJobs.map((job) => (
                      <div key={job.name} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Clock className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="font-medium">{job.name}</p>
                            <p className="text-sm text-gray-600">{job.description}</p>
                            <p className="text-xs text-gray-500 mt-1">Schedule: {job.schedule}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Next Run</p>
                          <p className="text-sm text-gray-600">{formatDate(job.nextRun)}</p>
                          <p className="text-xs text-gray-500">
                            {(() => {
                              const diff = new Date(job.nextRun).getTime() - new Date().getTime();
                              const minutes = Math.floor(diff / 60000);
                              const hours = Math.floor(minutes / 60);
                              if (hours > 0) return `in ${hours}h ${minutes % 60}m`;
                              return `in ${minutes}m`;
                            })()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Edit Prediction Dialog */}
          <Dialog open={!!editingPrediction} onOpenChange={() => setEditingPrediction(null)}>
            <DialogContent className="max-w-2xl bg-white">
              <DialogHeader>
                <DialogTitle>{editingPrediction?.prediction || "Edit Prediction"}</DialogTitle>
              </DialogHeader>
              {editingPrediction && (
                <div className="space-y-4">
                  <div>
                    <Label>Prediction Content</Label>
                    <Textarea
                      value={editingPrediction.prediction || ""}
                      onChange={(e) => setEditingPrediction({ ...editingPrediction, prediction: e.target.value })}
                      rows={4}
                      placeholder="Enter prediction content..."
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Direction</Label>
                      <Select
                        value={editingPrediction.direction || "NEUTRAL"}
                        onValueChange={(value) => setEditingPrediction({ ...editingPrediction, direction: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BULLISH">Bullish</SelectItem>
                          <SelectItem value="BEARISH">Bearish</SelectItem>
                          <SelectItem value="NEUTRAL">Neutral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Confidence (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={Math.round(editingPrediction.confidence * 100)}
                        onChange={(e) => setEditingPrediction({ ...editingPrediction, confidence: parseInt(e.target.value) / 100 })}
                      />
                    </div>
                    <div>
                      <Label>Baseline Price</Label>
                      <Input
                        type="number"
                        value={editingPrediction.baselinePrice || ""}
                        onChange={(e) => setEditingPrediction({ ...editingPrediction, baselinePrice: parseFloat(e.target.value) })}
                        placeholder="Price at prediction creation"
                      />
                    </div>
                    <div>
                      <Label>Target Price</Label>
                      <Input
                        type="number"
                        value={editingPrediction.targetPrice || ""}
                        onChange={(e) => setEditingPrediction({ ...editingPrediction, targetPrice: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Source Information</Label>
                    <div className="p-3 bg-gray-50 rounded-md text-sm">
                      <p><strong>Source:</strong> {editingPrediction.metadata?.source?.type === "twitter" ? "X Platform" : editingPrediction.metadata?.source?.type || "Unknown"}</p>
                      {editingPrediction.metadata?.source?.url && (
                        <p><strong>URL:</strong> <a href={editingPrediction.metadata.source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{editingPrediction.metadata.source.url}</a></p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Outcome</Label>
                    <Select
                      value={editingPrediction.outcome}
                      onValueChange={(value) => setEditingPrediction({ ...editingPrediction, outcome: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="CORRECT">Correct</SelectItem>
                        <SelectItem value="INCORRECT">Incorrect</SelectItem>
                        <SelectItem value="PARTIALLY_CORRECT">Partially Correct</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingPrediction(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    updatePrediction.mutate({
                      id: editingPrediction.id,
                      description: editingPrediction.prediction,
                      direction: editingPrediction.direction,
                      confidence: Math.round(editingPrediction.confidence * 100),
                      targetPrice: editingPrediction.targetPrice,
                      outcome: editingPrediction.outcome,
                    });
                  }}
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Validation Dialog */}
          <Dialog open={!!validatingPrediction} onOpenChange={() => setValidatingPrediction(null)}>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Validate Prediction</DialogTitle>
                <DialogDescription>
                  Mark this prediction as correct, incorrect, or partially correct
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Outcome</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select outcome" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CORRECT">Correct</SelectItem>
                      <SelectItem value="INCORRECT">Incorrect</SelectItem>
                      <SelectItem value="PARTIALLY_CORRECT">Partially Correct</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Notes (optional)</Label>
                  <Textarea placeholder="Add validation notes..." rows={3} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setValidatingPrediction(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // Implement validation logic
                    setValidatingPrediction(null);
                  }}
                >
                  Validate
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Extraction Dialog */}
          <Dialog open={extractionDialog} onOpenChange={setExtractionDialog}>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Extract Predictions</DialogTitle>
                <DialogDescription>
                  Extract predictions from YouTube videos or X posts
                </DialogDescription>
              </DialogHeader>
              <Tabs value={extractionType} onValueChange={(v: any) => setExtractionType(v)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="youtube">
                    <Youtube className="h-4 w-4 mr-2" />
                    YouTube
                  </TabsTrigger>
                  <TabsTrigger value="twitter">
                    <Twitter className="h-4 w-4 mr-2" />
                    X Platform
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="youtube" className="space-y-4">
                  <div>
                    <Label>YouTube Video URL</Label>
                    <Input
                      placeholder="https://youtube.com/watch?v=..."
                      value={extractionUrl}
                      onChange={(e) => setExtractionUrl(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Assign to Forecaster (optional)</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select forecaster" />
                      </SelectTrigger>
                      <SelectContent>
                        {forecastersData?.forecasters.map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                <TabsContent value="twitter" className="space-y-4">
                  <div>
                    <Label>X Platform Username</Label>
                    <Input
                      placeholder="@username"
                      value={extractionUsername}
                      onChange={(e) => setExtractionUsername(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Number of Posts</Label>
                    <Input type="number" defaultValue="20" min="1" max="100" />
                  </div>
                  <div>
                    <Label>Assign to Forecaster (optional)</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select forecaster" />
                      </SelectTrigger>
                      <SelectContent>
                        {forecastersData?.forecasters.map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter>
                <Button variant="outline" onClick={() => setExtractionDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (extractionType === "youtube") {
                      extractYouTube.mutate({ url: extractionUrl });
                    } else {
                      extractTwitter.mutate({ username: extractionUsername });
                    }
                  }}
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Start Extraction
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPredictionsPage;