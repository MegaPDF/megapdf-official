"use client";

import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useLanguageStore } from "@/src/store/store";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Download,
  RotateCw,
  RotateCcw,
  Trash,
  Loader2,
  Check,
  Info,
  FileText,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  MousePointer,
  Settings,
  Eye,
  Zap,
} from "lucide-react";
import { FileDropzone } from "@/components/dropzone";

// Initialize pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.mjs`;

interface PageRotation {
  pageNumber: number;
  angle: number;
  original: number;
}

interface UploadStats {
  startTime: number;
  endTime: number | null;
  bytesTotal: number;
  bytesUploaded: number;
  uploadSpeed: number;
  estimatedTimeRemaining: number | null;
}

interface UploadProgressProps {
  progress: number;
  isUploading: boolean;
  isProcessing: boolean;
  processingProgress: number;
  error: string | null;
  label: string;
  uploadStats: UploadStats | null;
}

const UploadProgress = ({
  progress,
  isUploading,
  isProcessing,
  processingProgress,
  error,
  label,
  uploadStats,
}: UploadProgressProps) => {
  return (
    <div className="mt-6 p-4 border rounded-lg bg-muted/20">
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm font-medium flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {label}
        </p>
        <Badge variant="secondary">{Math.round(progress)}%</Badge>
      </div>
      <Progress value={progress} className="h-2" />
      {uploadStats && uploadStats.uploadSpeed > 0 && (
        <div className="text-xs text-muted-foreground mt-3 flex justify-between">
          <span>
            Speed: {(uploadStats.uploadSpeed / 1024 / 1024).toFixed(2)} MB/s
          </span>
          {uploadStats.estimatedTimeRemaining && (
            <span>ETA: {Math.ceil(uploadStats.estimatedTimeRemaining)}s</span>
          )}
        </div>
      )}
      {error && (
        <div className="mt-3 p-2 bg-destructive/10 text-destructive text-sm rounded border border-destructive/20">
          {error}
        </div>
      )}
    </div>
  );
};

export function PdfRotator() {
  const { t } = useLanguageStore();
  const [file, setFile] = useState<File | null>(null);
  const [rotationMode, setRotationMode] = useState<string>("individual");
  const [fileUrl, setFileUrl] = useState<string>("");
  const [numPages, setNumPages] = useState<number>(0);
  const [pageRotations, setPageRotations] = useState<PageRotation[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [processedFileUrl, setProcessedFileUrl] = useState<string>("");
  const [isPagesLoading, setIsPagesLoading] = useState<boolean>(false);
  const [pageFormat, setPageFormat] = useState<string>("all");
  const [customRange, setCustomRange] = useState<string>("");
  const [showPageSelector, setShowPageSelector] = useState<boolean>(true);
  const [rotationAngle, setRotationAngle] = useState<number>(90);
  const [originalName, setOriginalName] = useState<string>("");

  // File upload states
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadStats, setUploadStats] = useState<UploadStats | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const resetUpload = () => {
    setIsUploading(false);
    setUploadProgress(0);
    setUploadError(null);
    setUploadStats(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const uploadFile = async (
    file: File,
    formData: FormData,
    options: {
      url: string;
      headers?: Record<string, string>;
      onProgress?: (progress: number) => void;
      onSuccess?: (result: any) => void;
      onError?: (error: Error) => void;
    }
  ) => {
    const { url, headers = {}, onProgress, onSuccess, onError } = options;

    try {
      setIsUploading(true);
      setUploadError(null);

      const stats: UploadStats = {
        startTime: Date.now(),
        endTime: null,
        bytesTotal: file.size,
        bytesUploaded: 0,
        uploadSpeed: 0,
        estimatedTimeRemaining: null,
      };
      setUploadStats(stats);

      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(progress);

          if (onProgress) {
            onProgress(progress);
          }

          const now = Date.now();
          const elapsedTime = (now - stats.startTime) / 1000;
          const uploadSpeed = event.loaded / elapsedTime;
          const remainingBytes = event.total - event.loaded;
          const estimatedTimeRemaining =
            uploadSpeed > 0 ? remainingBytes / uploadSpeed : null;

          setUploadStats({
            ...stats,
            bytesUploaded: event.loaded,
            uploadSpeed,
            estimatedTimeRemaining,
          });
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const result = JSON.parse(xhr.responseText);
          setUploadStats((prevStats) => ({
            ...prevStats!,
            endTime: Date.now(),
            bytesUploaded: prevStats!.bytesTotal,
          }));

          setIsUploading(false);

          if (onSuccess) {
            onSuccess(result);
          }
        } else {
          const errorMessage = `Upload failed with status ${xhr.status}: ${xhr.statusText}`;
          setUploadError(errorMessage);
          setIsUploading(false);

          if (onError) {
            onError(new Error(errorMessage));
          }
        }
      });

      xhr.addEventListener("error", () => {
        const errorMessage = "Network error occurred during upload";
        setUploadError(errorMessage);
        setIsUploading(false);

        if (onError) {
          onError(new Error(errorMessage));
        }
      });

      xhr.addEventListener("abort", () => {
        setIsUploading(false);
        const errorMessage = "Upload was aborted";
        setUploadError(errorMessage);

        if (onError) {
          onError(new Error(errorMessage));
        }
      });

      xhr.open("POST", url, true);

      // Object.keys(headers).forEach((key) => {
      //   xhr.setRequestHeader(key, headers[key]);
      // });

      signal.addEventListener("abort", () => {
        xhr.abort();
      });

      xhr.send(formData);
    } catch (error) {
      setIsUploading(false);
      setUploadError((error as Error).message);

      if (onError) {
        onError(error as Error);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
      resetUpload();
    };
  }, [fileUrl]);

  const processSelectedFile = (selectedFile: File) => {
    setFile(selectedFile);
    setFileUrl(URL.createObjectURL(selectedFile));
    setCurrentPage(1);
    setSelectedPages([]);
    setPageRotations([]);
    setProcessedFileUrl("");
    setProgress(0);
    setOriginalName(selectedFile.name);
  };

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsPagesLoading(false);

    const initialRotations = Array.from({ length: numPages }, (_, i) => ({
      pageNumber: i + 1,
      angle: 0,
      original: 0,
    }));

    setPageRotations(initialRotations);

    if (pageFormat === "all") {
      setSelectedPages(Array.from({ length: numPages }, (_, i) => i + 1));
    }
  };

  const handlePageSelect = (pageNumber: number) => {
    if (selectedPages.includes(pageNumber)) {
      setSelectedPages(selectedPages.filter((p) => p !== pageNumber));
    } else {
      setSelectedPages([...selectedPages, pageNumber].sort((a, b) => a - b));
    }
  };

  const handleSelectAll = () => {
    if (selectedPages.length === numPages) {
      setSelectedPages([]);
    } else {
      setSelectedPages(Array.from({ length: numPages }, (_, i) => i + 1));
    }
  };

  const handleRotateSelected = (
    direction: "clockwise" | "counterclockwise"
  ) => {
    if (selectedPages.length === 0) {
      toast.error("Please select at least one page to rotate");
      return;
    }

    const angle = direction === "clockwise" ? rotationAngle : -rotationAngle;

    setPageRotations((prevRotations) =>
      prevRotations.map((rotation) =>
        selectedPages.includes(rotation.pageNumber)
          ? { ...rotation, angle }
          : rotation
      )
    );
  };

  const handleProcessPdf = async () => {
    if (!file) return;
    const goApiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    if (!goApiUrl) {
      toast.error("API URL is not configured. Please contact support.");
      return;
    }

    const rotatedPages = pageRotations.filter(
      (rotation) => rotation.angle !== 0
    );

    if (rotatedPages.length === 0) {
      toast.error("Please rotate at least one page before processing");
      return;
    }

    const angle = Math.abs(rotatedPages[0].angle).toString();
    const rotatedPageNumbers = rotatedPages
      .map((page) => page.pageNumber)
      .join(",");

    setIsProcessing(true);
    setProgress(0);
    const apiUrl = `${goApiUrl}/api/pdf/rotate`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("angle", angle);
    formData.append("pages", rotatedPageNumbers);

    try {
      await uploadFile(file, formData, {
        url: apiUrl,
        headers: {
          "x-api-key": "sk_d6c1daa54dbc95956b281fa02c544e7273ed10df60b211fe",
        },
        onProgress: (progress) => {
          setProgress(progress);
        },
        onSuccess: (result) => {
          setProgress(100);
          const fileUrl = result.fileUrl.startsWith("http")
            ? result.fileUrl
            : `${process.env.NEXT_PUBLIC_API_URL}${result.fileUrl}`;
          setProcessedFileUrl(fileUrl);
          toast.success("PDF rotated successfully!");
        },
        onError: (err) => {
          console.error("Error processing PDF:", err);
          toast.error(
            "An error occurred while processing your PDF. Please try again."
          );
        },
      });
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast.error(
        "An error occurred while processing your PDF. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRotatePage = (
    pageNumber: number,
    direction: "clockwise" | "counterclockwise"
  ) => {
    const angle = direction === "clockwise" ? rotationAngle : -rotationAngle;

    setPageRotations((prevRotations) =>
      prevRotations.map((rotation) =>
        rotation.pageNumber === pageNumber ? { ...rotation, angle } : rotation
      )
    );

    if (angle !== 0 && !selectedPages.includes(pageNumber)) {
      setSelectedPages([...selectedPages, pageNumber].sort((a, b) => a - b));
    }
  };

  const handleReset = () => {
    setFile(null);
    setFileUrl("");
    setNumPages(0);
    setPageRotations([]);
    setSelectedPages([]);
    setCurrentPage(1);
    setProcessedFileUrl("");
    setProgress(0);
    resetUpload();
  };

  const handlePageFormatChange = (format: string) => {
    setPageFormat(format);

    if (format === "all") {
      setSelectedPages(Array.from({ length: numPages }, (_, i) => i + 1));
    } else if (format === "none") {
      setSelectedPages([]);
    } else if (format === "even") {
      setSelectedPages(
        Array.from({ length: numPages }, (_, i) => i + 1).filter(
          (p) => p % 2 === 0
        )
      );
    } else if (format === "odd") {
      setSelectedPages(
        Array.from({ length: numPages }, (_, i) => i + 1).filter(
          (p) => p % 2 === 1
        )
      );
    }
  };

  const parseCustomRange = () => {
    if (!customRange.trim()) return;

    const ranges = customRange.split(",").map((r) => r.trim());
    const newSelectedPages: number[] = [];

    for (const range of ranges) {
      if (range.includes("-")) {
        const [start, end] = range.split("-").map(Number);
        if (
          !isNaN(start) &&
          !isNaN(end) &&
          start > 0 &&
          end <= numPages &&
          start <= end
        ) {
          for (let i = start; i <= end; i++) {
            if (!newSelectedPages.includes(i)) {
              newSelectedPages.push(i);
            }
          }
        }
      } else {
        const page = Number(range);
        if (
          !isNaN(page) &&
          page > 0 &&
          page <= numPages &&
          !newSelectedPages.includes(page)
        ) {
          newSelectedPages.push(page);
        }
      }
    }

    setSelectedPages(newSelectedPages.sort((a, b) => a - b));
  };

  const handleFileAccepted = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      processSelectedFile(selectedFile);
    }
  };

  const getRotatedPagesCount = () => {
    return pageRotations.filter((r) => r.angle !== 0).length;
  };

  const renderPageSelector = () => (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Grid3X3 className="h-5 w-5 text-primary" />
          Page Selection & Rotation
        </CardTitle>
        <CardDescription>
          Select pages to rotate and choose rotation options
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Selection Tabs */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Selection Mode</Label>
          <Tabs value={pageFormat} onValueChange={handlePageFormatChange}>
            <TabsList className="grid grid-cols-4 h-9">
              <TabsTrigger value="all" className="text-sm">
                All Pages
              </TabsTrigger>
              <TabsTrigger value="even" className="text-sm">
                Even
              </TabsTrigger>
              <TabsTrigger value="odd" className="text-sm">
                Odd
              </TabsTrigger>
              <TabsTrigger value="custom" className="text-sm">
                Custom
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {pageFormat === "custom" && (
          <div className="space-y-2">
            <Label htmlFor="customRange" className="text-sm font-medium">
              Custom Page Range
            </Label>
            <div className="flex gap-2">
              <Input
                id="customRange"
                placeholder="e.g. 1-3, 5, 7-9"
                value={customRange}
                onChange={(e) => setCustomRange(e.target.value)}
                className="flex-1"
              />
              <Button variant="secondary" onClick={parseCustomRange}>
                Apply
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use commas for individual pages and hyphens for ranges
            </p>
          </div>
        )}

        <Separator />

        {/* Selection Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id="selectAll"
              checked={selectedPages.length === numPages && numPages > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="selectAll" className="text-sm font-medium">
              Select All Pages
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {selectedPages.length}/{numPages} selected
            </Badge>
            {getRotatedPagesCount() > 0 && (
              <Badge variant="default">{getRotatedPagesCount()} rotated</Badge>
            )}
          </div>
        </div>

        {/* Rotation Controls */}
        <div className="flex items-center justify-center gap-3 p-4 bg-muted/30 rounded-lg">
          <Button
            variant="outline"
            onClick={() => handleRotateSelected("counterclockwise")}
            disabled={selectedPages.length === 0}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Rotate Left 90°
          </Button>
          <Button
            onClick={() => handleRotateSelected("clockwise")}
            disabled={selectedPages.length === 0}
            className="flex items-center gap-2"
          >
            <RotateCw className="h-4 w-4" />
            Rotate Right 90°
          </Button>
        </div>

        {/* Page Grid */}
        <div className="border rounded-lg p-4 bg-muted/10">
          <div className="text-sm font-medium mb-3">Pages Overview</div>
          <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 gap-2 max-h-60 overflow-y-auto">
            {isPagesLoading ? (
              <div className="col-span-full flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              Array.from(new Array(numPages), (_, index) => {
                const pageNum = index + 1;
                const isSelected = selectedPages.includes(pageNum);
                const rotation = pageRotations.find(
                  (r) => r.pageNumber === pageNum
                );
                const isRotated = rotation?.angle !== 0;
                const isCurrent = pageNum === currentPage;

                return (
                  <div
                    key={index}
                    className={cn(
                      "relative aspect-[3/4] border-2 rounded-md cursor-pointer transition-all hover:scale-105",
                      isSelected && "border-primary bg-primary/10",
                      !isSelected &&
                        "border-muted-foreground/30 hover:border-muted-foreground/60",
                      isCurrent && "ring-2 ring-primary/50"
                    )}
                    onClick={() => {
                      setCurrentPage(pageNum);
                      handlePageSelect(pageNum);
                    }}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                      <div className="text-xs font-medium mb-1">{pageNum}</div>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handlePageSelect(pageNum)}
                        onClick={(e) => e.stopPropagation()}
                        className="scale-75"
                      />
                    </div>
                    {isRotated && (
                      <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs px-1 py-0.5 rounded-full font-medium">
                        {rotation?.angle}°
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderProcessingSection = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Processing PDF...</h3>
            <p className="text-muted-foreground">
              Please wait while we rotate your PDF pages...
            </p>
          </div>
          <div className="space-y-2">
            <Progress value={progress} className="w-full h-2" />
            <p className="text-sm text-muted-foreground">
              {Math.round(progress)}% complete
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSuccessSection = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">
              PDF Rotated Successfully!
            </h3>
            <p className="text-muted-foreground">
              Your PDF has been processed and is ready to download.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button asChild size="lg" className="w-full">
              <a
                href={processedFileUrl}
                download={
                  originalName
                    ? originalName.replace(/\.pdf$/, "_rotated.pdf")
                    : file
                    ? file.name.replace(/\.pdf$/, "_rotated.pdf")
                    : "rotated.pdf"
                }
              >
                <Download className="h-4 w-4 mr-2" />
                Download Rotated PDF
              </a>
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCw className="h-4 w-4 mr-2" />
              Rotate Another PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderEditorSection = () => (
    <div className="space-y-6">
      {/* File Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{file?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file?.size! / 1024 / 1024).toFixed(2)} MB • {numPages} pages
                </p>
              </div>
            </div>
            <Button variant="ghost" onClick={handleReset}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Page Selector */}
      {showPageSelector && renderPageSelector()}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* PDF Preview */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              PDF Preview
            </CardTitle>
            <CardDescription>
              Click on pages to select them for rotation
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 min-h-[400px] items-center">
              {isPagesLoading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <div className="relative">
                  <Document
                    file={fileUrl}
                    onLoadSuccess={handleDocumentLoadSuccess}
                    onLoadStart={() => setIsPagesLoading(true)}
                    loading={<Loader2 className="h-8 w-8 animate-spin" />}
                    error={
                      <div className="text-center p-4">
                        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <p>Failed to load PDF. Please try a different file.</p>
                      </div>
                    }
                  >
                    {numPages > 0 && (
                      <div className="relative">
                        <Page
                          pageNumber={currentPage}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                          width={350}
                          rotate={
                            pageRotations.find(
                              (r) => r.pageNumber === currentPage
                            )?.angle || 0
                          }
                          className="shadow-lg border rounded-lg overflow-hidden"
                        />

                        {/* Selection overlay */}
                        {selectedPages.includes(currentPage) && (
                          <div className="absolute inset-0 border-4 border-primary/60 rounded-lg pointer-events-none" />
                        )}

                        {/* Page controls overlay */}
                        <div className="absolute top-3 right-3 flex gap-1">
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 bg-background/90 hover:bg-background"
                            onClick={() =>
                              handleRotatePage(currentPage, "counterclockwise")
                            }
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 bg-background/90 hover:bg-background"
                            onClick={() =>
                              handleRotatePage(currentPage, "clockwise")
                            }
                          >
                            <RotateCw className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Selection checkbox */}
                        <div className="absolute top-3 left-3">
                          <div className="flex items-center gap-2 bg-background/90 px-2 py-1 rounded">
                            <Checkbox
                              checked={selectedPages.includes(currentPage)}
                              onCheckedChange={() =>
                                handlePageSelect(currentPage)
                              }
                            />
                            <Label className="text-xs font-medium">
                              Select Page
                            </Label>
                          </div>
                        </div>

                        {/* Rotation indicator */}
                        {pageRotations.find((r) => r.pageNumber === currentPage)
                          ?.angle !== 0 && (
                          <div className="absolute bottom-3 left-3">
                            <Badge variant="default">
                              Rotated{" "}
                              {
                                pageRotations.find(
                                  (r) => r.pageNumber === currentPage
                                )?.angle
                              }
                              °
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}
                  </Document>
                </div>
              )}
            </div>

            {/* Page navigation */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="text-sm font-medium">
                Page {currentPage} of {numPages}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, numPages))
                }
                disabled={currentPage === numPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Settings Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Rotation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Actions */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Quick Actions</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleRotateSelected("counterclockwise")}
                    disabled={selectedPages.length === 0}
                    className="h-auto py-3 flex-col gap-1"
                  >
                    <RotateCcw className="h-5 w-5" />
                    <span className="text-xs">Left 90°</span>
                  </Button>
                  <Button
                    onClick={() => handleRotateSelected("clockwise")}
                    disabled={selectedPages.length === 0}
                    className="h-auto py-3 flex-col gap-1"
                  >
                    <RotateCw className="h-5 w-5" />
                    <span className="text-xs">Right 90°</span>
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Selection Summary */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Current Selection</Label>
                <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Selected Pages:</span>
                    <Badge variant="secondary">{selectedPages.length}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pages to Rotate:</span>
                    <Badge
                      variant={
                        getRotatedPagesCount() > 0 ? "default" : "secondary"
                      }
                    >
                      {getRotatedPagesCount()}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Process Button */}
              <Button
                onClick={handleProcessPdf}
                disabled={
                  isProcessing || pageRotations.every((r) => r.angle === 0)
                }
                size="lg"
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Apply Rotations
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Page Selector Toggle */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Page Selector</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPageSelector(!showPageSelector)}
                >
                  {showPageSelector ? "Hide" : "Show"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upload Progress */}
      {(isUploading || isProcessing) && (
        <UploadProgress
          progress={progress}
          isUploading={isUploading}
          isProcessing={isProcessing}
          processingProgress={progress}
          error={uploadError}
          label={isUploading ? "Uploading PDF..." : "Processing PDF..."}
          uploadStats={uploadStats}
        />
      )}
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <RotateCw className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Rotate PDF Pages</h1>
            <p className="text-muted-foreground font-normal mt-1">
              Easily rotate pages in your PDF document to the correct
              orientation
            </p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {!file && (
          <FileDropzone
            multiple={false}
            acceptedFileTypes={{ "application/pdf": [".pdf"] }}
            disabled={isProcessing || isUploading}
            maxFiles={1}
            onFileAccepted={handleFileAccepted}
            title="Upload PDF to Rotate"
            description="Upload your PDF file to rotate pages. You can rotate individual pages or apply rotation to multiple pages at once."
            browseButtonText="Browse Files"
            browseButtonVariant="default"
            securityText="Your files are processed securely. All uploads are automatically deleted after processing."
          />
        )}

        {file && isProcessing && renderProcessingSection()}
        {file && !isProcessing && processedFileUrl && renderSuccessSection()}
        {file && !isProcessing && !processedFileUrl && renderEditorSection()}
      </CardContent>

      <CardFooter className="border-t pt-6">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            Your files are processed securely and automatically deleted after
            processing to ensure privacy. All rotations are applied permanently
            to the output PDF.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
