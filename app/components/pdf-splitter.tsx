"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CheckCircledIcon, DownloadIcon } from "@radix-ui/react-icons";
import { AlertCircle, FileTextIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguageStore } from "@/src/store/store";
import { UploadProgress } from "@/components/ui/upload-progress";
import { FileDropzone } from "@/components/dropzone";
import useFileUpload from "@/hooks/useFileUpload";

// Form schema
const formSchema = z.object({
  splitMethod: z.enum(["range", "extract", "every"]).default("range"),
  pageRanges: z.string().optional(),
  everyNPages: z.coerce.number().min(1).default(1),
});

type FormValues = z.infer<typeof formSchema>;

// Define a type for split results
interface SplitPart {
  fileUrl: string;
  filename: string;
  pages: number[] | string[];
  pageCount: number;
}

interface SplitResult {
  success: boolean;
  message: string;
  originalName?: string;
  totalPages?: number;
  splitParts?: SplitPart[];
  isLargeJob?: boolean;
  jobId?: string;
  statusUrl?: string;
  results?: SplitPart[]; // For status API responses
  estimatedSplits?: number;
}

// Status polling interface
interface JobStatus {
  id: string;
  status: "processing" | "completed" | "error";
  progress: number;
  total: number;
  completed: number;
  results: SplitPart[];
  error: string | null;
}

export function PdfSplitter() {
  const { t } = useLanguageStore();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [splitResult, setSplitResult] = useState<SplitResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);

  // For large job status polling
  const [jobId, setJobId] = useState<string | null>(null);
  const [statusUrl, setStatusUrl] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const {
    progress: uploadProgress,
    error: uploadError,
    uploadFile,
    resetUpload,
    uploadStats,
  } = useFileUpload();
  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      splitMethod: "range",
      pageRanges: "",
      everyNPages: 1,
    },
  });

  // Watch fields for conditional rendering
  const splitMethod = form.watch("splitMethod");

  // Handle file acceptance from FileDropzone
  const handleFileAccepted = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const newFile = acceptedFiles[0];
      setFile(newFile);
      setSplitResult(null);
      setError(null);
      setJobId(null);
      setStatusUrl(null);
      setIsPolling(false);
      resetUpload();

      // Estimate number of pages based on file size for better UX
      const fileSizeInMB = newFile.size / (1024 * 1024);
      const estimatedPages = Math.max(1, Math.round(fileSizeInMB * 10));
      setTotalPages(estimatedPages);
    }
  };

  // Handle file removal
  const handleRemoveFile = () => {
    setFile(null);
    setSplitResult(null);
    setError(null);
    setTotalPages(0);
    setJobId(null);
    setStatusUrl(null);
    setIsPolling(false);
    setProgress(0);
  };

  // Retry counter for status polling
  const [retryCount, setRetryCount] = useState(0);

  const pollJobStatus = useCallback(async () => {
    if (!statusUrl || !jobId) return;
    const goApiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const fullStatusUrl = statusUrl.startsWith("/")
      ? `${goApiUrl}${statusUrl}`
      : statusUrl;

    console.log("Polling status URL:", fullStatusUrl);

    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", fullStatusUrl);
      // xhr.setRequestHeader("x-api-key", `${process.env.GO_KEY_PDF}`);

      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const status: JobStatus = JSON.parse(xhr.responseText);
            console.log("Status response:", status);

            // Update progress for splitting phase (50–100%)
            const splittingProgress = 50 + (status.progress || 0) / 2; // Map 0–100 to 50–100
            setProgress(splittingProgress);

            if (status.status === "completed") {
              // Job completed successfully
              setIsPolling(false);
              setIsProcessing(false);
              setProgress(100);

              // Create a split result from job status
              const result: SplitResult = {
                success: true,
                message: `PDF split into ${status.results.length} files`,
                originalName: file?.name || "document.pdf",
                totalPages: totalPages,
                results: status.results,
              };

              setSplitResult(result);
              toast.success(t("splitPdf.success"), {
                description: t("splitPdf.successDesc"),
              });

              resolve();
            } else if (status.status === "error") {
              // Job failed
              setIsPolling(false);
              setIsProcessing(false);
              setError(status.error || t("splitPdf.error.failed"));
              setProgress(0);
              toast.error(t("splitPdf.error.failed"), {
                description: status.error || t("splitPdf.error.unknown"),
              });

              reject(new Error(status.error || t("splitPdf.error.failed")));
            } else {
              // Job still processing, continue polling
              setTimeout(pollJobStatus, 2000);
              resolve();
            }
          } catch (parseError) {
            console.error("Error parsing status response:", parseError);
            if (retryCount < 5) {
              setRetryCount((prev) => prev + 1);
              setTimeout(pollJobStatus, 3000);
              resolve();
            } else {
              setIsPolling(false);
              setIsProcessing(false);
              setError(t("splitPdf.error.statusFailed"));
              setProgress(0);
              toast.error(t("splitPdf.error.failed"));
              reject(new Error(t("splitPdf.error.statusFailed")));
            }
          }
        } else {
          console.error("Error fetching status:", xhr.status);
          if (retryCount < 5) {
            setRetryCount((prev) => prev + 1);
            setTimeout(pollJobStatus, 3000);
            resolve();
          } else {
            setIsPolling(false);
            setIsProcessing(false);
            setError(t("splitPdf.error.statusFailed"));
            setProgress(0);
            toast.error(t("splitPdf.error.failed"));
            reject(new Error(t("splitPdf.error.statusFailed")));
          }
        }
      };

      xhr.onerror = function () {
        console.error("Network error polling job status");
        if (retryCount < 5) {
          setRetryCount((prev) => prev + 1);
          setTimeout(pollJobStatus, 3000);
          resolve();
        } else {
          setIsPolling(false);
          setIsProcessing(false);
          setError(t("splitPdf.error.statusFailed"));
          setProgress(0);
          toast.error(t("splitPdf.error.failed"));
          reject(new Error(t("splitPdf.error.statusFailed")));
        }
      };

      xhr.send();
    });
  }, [
    statusUrl,
    jobId,
    file,
    totalPages,
    t,
    retryCount,
    `${process.env.GO_KEY_PDF}`,
  ]);

  // Start polling when status URL is available
  useEffect(() => {
    if (statusUrl && jobId && isPolling) {
      pollJobStatus();
    }

    return () => {
      setRetryCount(0);
    };
  }, [statusUrl, jobId, isPolling, pollJobStatus]);

  // Submit handler
  const onSubmit = async (values: FormValues) => {
    if (!file) {
      setError(t("splitPdf.error.noFile"));
      return;
    }

    setIsProcessing(false);
    setProgress(0);
    setError(null);
    setSplitResult(null);
    setJobId(null);
    setStatusUrl(null);
    setIsPolling(false);
    setRetryCount(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("splitMethod", values.splitMethod);

    if (values.splitMethod === "range" && values.pageRanges) {
      formData.append("pageRanges", values.pageRanges);
    } else if (values.splitMethod === "every") {
      formData.append("everyNPages", values.everyNPages.toString());
    }

    // Use the Go API URL instead of Next.js API
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/pdf/split`;
    console.log("Submitting to Go API URL:", apiUrl);

    try {
      setIsUploading(true);

      // Track upload progress
      const xhr = new XMLHttpRequest();
      xhr.open("POST", apiUrl);
      // xhr.setRequestHeader(
      //   "x-api-key",
      //   "sk_d6c1daa54dbc95956b281fa02c544e7273ed10df60b211fe"
      // );

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          // Update progress for upload phase (0–50%)
          setProgress(percentComplete / 2);
        }
      };

      xhr.onload = function () {
        setIsUploading(false);

        if (xhr.status >= 200 && xhr.status < 300) {
          // Success
          const data = JSON.parse(xhr.responseText);
          console.log("API response:", data);

          if (data.isLargeJob && data.jobId && data.statusUrl) {
            // Large job: start polling
            setJobId(data.jobId);
            setStatusUrl(data.statusUrl);
            setIsPolling(true);
            setIsProcessing(true);

            toast.info(t("splitPdf.largeSplitStarted"), {
              description: t("splitPdf.largeSplitDesc"),
            });
          } else {
            // Small job: immediate result
            setProgress(100);
            setSplitResult(data);
            setIsProcessing(false);

            toast.success(t("splitPdf.splitSuccess"), {
              description: t("splitPdf.splitSuccessDesc").replace(
                "{count}",
                getPartsCount(data).toString()
              ),
            });
          }
        } else {
          // Error
          setIsProcessing(false);
          setProgress(0);

          try {
            const errorData = JSON.parse(xhr.responseText);
            setError(errorData.error || t("splitPdf.error.unknown"));
            toast.error(t("splitPdf.error.failed"), {
              description: errorData.error || t("splitPdf.error.unknown"),
            });
          } catch (e) {
            setError(t("splitPdf.error.failed"));
            toast.error(t("splitPdf.error.failed"));
          }
        }
      };

      xhr.onerror = function () {
        setIsUploading(false);
        setIsProcessing(false);
        setProgress(0);

        setError(t("splitPdf.error.networkError"));
        toast.error(t("splitPdf.error.networkError"));
      };

      xhr.send(formData);
    } catch (err) {
      console.error("Error submitting form:", err);
      setIsUploading(false);
      setIsProcessing(false);
      setProgress(0);

      setError(t("splitPdf.error.unknown"));
      toast.error(t("splitPdf.error.failed"));
    }
  };

  // Helper state for tracking upload
  const [isUploading, setIsUploading] = useState(false);

  // Helper function to get split parts safely
  const getSplitParts = useCallback(
    (result: SplitResult | null): SplitPart[] => {
      if (!result) return [];
      if (result.results && Array.isArray(result.results)) {
        return result.results;
      }
      if (result.splitParts && Array.isArray(result.splitParts)) {
        return result.splitParts;
      }
      return [];
    },
    []
  );

  // Get parts count safely
  const getPartsCount = useCallback(
    (result: SplitResult | null): number => {
      return getSplitParts(result).length;
    },
    [getSplitParts]
  );

  // Format file URLs to include Go API base URL if needed
  const formatFileUrl = useCallback(
    (url: string): string => {
      if (!url) return "";
      return url.startsWith("/")
        ? `${process.env.NEXT_PUBLIC_API_URL}${url}`
        : url;
    },
    [`${process.env.NEXT_PUBLIC_API_URL}`]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>{t("splitPdf.title")}</CardTitle>
            <CardDescription>{t("splitPdf.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Drop Zone with FileDropzone component */}
            {!splitResult && (
              <FileDropzone
                multiple={false}
                acceptedFileTypes={{ "application/pdf": [".pdf"] }}
                disabled={isUploading || isProcessing || isPolling}
                maxFiles={1}
                onFileAccepted={handleFileAccepted}
                value={file}
                onRemove={handleRemoveFile}
                title={
                  t("fileUploader.dragAndDrop") || "Drag & drop your PDF file"
                }
                description={`${
                  t("fileUploader.dropHereDesc") ||
                  "Drop your PDF file here or click to browse."
                } ${t("fileUploader.maxSize") || "Maximum size is 50MB."}`}
                browseButtonText={t("fileUploader.browse") || "Browse Files"}
                browseButtonVariant="default"
                securityText={
                  t("fileUploader.filesSecurity") ||
                  "Your files are processed securely."
                }
                renderFilePreview={(file) => (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                      <FileTextIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {totalPages > 0
                          ? `${totalPages} ${t("removePdf.page")}`
                          : ""}
                      </p>
                    </div>
                  </div>
                )}
              />
            )}

            {/* Split Options */}
            {file && !splitResult && (
              <div>
                <FormField
                  control={form.control}
                  name="splitMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>{t("splitPdf.options.splitMethod")}</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                          disabled={isUploading || isProcessing}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="range" id="range-option" />
                            <label
                              htmlFor="range-option"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {t("splitPdf.options.byRange")}
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="extract"
                              id="extract-option"
                            />
                            <label
                              htmlFor="extract-option"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {t("splitPdf.options.extractAll")}
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="every" id="every-option" />
                            <label
                              htmlFor="every-option"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {t("splitPdf.options.everyNPages")}
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {splitMethod === "range" && (
                  <FormField
                    control={form.control}
                    name="pageRanges"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>
                          {t("splitPdf.options.pageRanges")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Example: 1-5, 8, 11-13"
                            {...field}
                            disabled={isUploading || isProcessing}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("splitPdf.options.pageRangesHint")}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {splitMethod === "every" && (
                  <FormField
                    control={form.control}
                    name="everyNPages"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>
                          {t("splitPdf.options.everyNPagesNumber")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={totalPages}
                            {...field}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (!isNaN(value) && value > 0) {
                                field.onChange(value);
                              }
                            }}
                            disabled={isUploading || isProcessing}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("splitPdf.options.everyNPagesHint")}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Progress Indicator */}
            {(isUploading || isProcessing || isPolling) && (
              <UploadProgress
                progress={progress}
                isUploading={isUploading}
                isProcessing={isProcessing || isPolling}
                label={
                  isUploading
                    ? t("ocr.uploading")
                    : isPolling
                    ? t("splitPdf.splittingLarge")
                    : t("splitPdf.splitting")
                }
              />
            )}

            {/* Results */}
            {splitResult && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <CheckCircledIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-green-600 dark:text-green-400">
                        {t("splitPdf.splitSuccess")}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 mb-3">
                        {t("splitPdf.splitSuccessDesc").replace(
                          "{count}",
                          getPartsCount(splitResult).toString()
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">{t("splitPdf.results.title")}</h3>
                  <div className="divide-y border rounded-md max-h-[400px] overflow-y-auto">
                    {getSplitParts(splitResult).map((part, index) => (
                      <div
                        key={index}
                        className="p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 flex-shrink-0 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <FileTextIcon className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {t("splitPdf.results.part")} {index + 1}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t("splitPdf.results.pages")}:{" "}
                              {Array.isArray(part.pages)
                                ? part.pages.join(", ")
                                : part.pages}{" "}
                              ({part.pageCount}{" "}
                              {t("splitPdf.results.pagesCount")})
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a
                            href={formatFileUrl(part.fileUrl)}
                            download
                            target="_blank"
                          >
                            <DownloadIcon className="h-4 w-4 mr-1" />{" "}
                            {t("ui.download")}
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  {t("fileUploader.filesSecurity")}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            {file &&
              !splitResult &&
              !isUploading &&
              !isProcessing &&
              !isPolling && (
                <Button type="submit" disabled={isUploading || isProcessing}>
                  {t("splitPdf.splitDocument")}
                </Button>
              )}

            {(splitResult || isUploading || isProcessing || isPolling) && (
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null);
                  setSplitResult(null);
                  setIsPolling(false);
                  setJobId(null);
                  setStatusUrl(null);
                  setProgress(0);
                  form.reset();
                }}
                disabled={isUploading || isProcessing}
              >
                {t("ui.reupload")}
              </Button>
            )}
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
