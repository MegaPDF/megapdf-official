"use client";

import React, { useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useLanguageStore } from "@/src/store/store";
import {
  CheckIcon,
  LoaderIcon,
  DownloadIcon,
  RefreshCwIcon,
  XCircleIcon,
  ZoomInIcon,
  ZoomOutIcon,
  EyeIcon,
  SaveIcon,
  Trash2Icon,
  FileTextIcon,
  AlertTriangleIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileDropzone } from "./dropzone";
import { useAuth } from "@/src/context/auth-context";
import { cn } from "@/lib/utils";

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.mjs`;

interface PdfPage {
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
}

export function PdfRemove() {
  const { t } = useLanguageStore();
  const { isAuthenticated, user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PdfPage[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [processing, setProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [processedPdfUrl, setProcessedPdfUrl] = useState<string>("");
  const [previewPage, setPreviewPage] = useState<number | null>(null);
  const [previewScale, setPreviewScale] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [insufficientBalance, setInsufficientBalance] =
    useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processPdf = async (pdfFile: File) => {
    setProcessing(true);
    setProgress(0);
    setError(null);
    setInsufficientBalance(false);

    try {
      const fileUrl = URL.createObjectURL(pdfFile);
      const pdf = await pdfjs.getDocument(fileUrl).promise;
      const numPages = pdf.numPages;
      const newPages: PdfPage[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1 });

        newPages.push({
          width: viewport.width,
          height: viewport.height,
          originalWidth: viewport.width,
          originalHeight: viewport.height,
        });

        setProgress(Math.floor((i / numPages) * 100));
      }

      setPages(newPages);
      setProgress(100);
      URL.revokeObjectURL(fileUrl);
    } catch (error) {
      console.error("Error processing PDF:", error);
      setError(t("removePdf.messages.error") || "Error processing PDF");
      toast.error(t("removePdf.messages.error") || "Error processing PDF");
    } finally {
      setProcessing(false);
    }
  };

  const handlePageSelect = (event: React.MouseEvent, pageNumber: number) => {
    event.stopPropagation();
    const newSelectedPages = new Set(selectedPages);
    if (newSelectedPages.has(pageNumber)) {
      newSelectedPages.delete(pageNumber);
    } else {
      // Don't allow selecting all pages
      if (newSelectedPages.size >= pages.length - 1) {
        toast.error(
          t("removePdf.messages.cannotRemoveAll") || "Cannot remove all pages"
        );
        return;
      }
      newSelectedPages.add(pageNumber);
    }
    setSelectedPages(newSelectedPages);
  };

  const handlePageClick = (pageNumber: number) => {
    setPreviewPage(pageNumber);
    setPreviewScale(1);
  };

  const handleSelectAll = () => {
    if (selectedPages.size === pages.length - 1) {
      // If already at max, clear all
      setSelectedPages(new Set());
    } else {
      // Select all except one
      const newSelection = new Set<number>();
      for (let i = 0; i < pages.length - 1; i++) {
        newSelection.add(i);
      }
      setSelectedPages(newSelection);
    }
  };

  const handleSaveDocument = async () => {
    if (!file || selectedPages.size === 0) return;

    setProcessing(true);
    setProgress(0);
    setError(null);
    setInsufficientBalance(false);

    return new Promise((resolve, reject) => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        // Convert 0-indexed to 1-indexed for API
        const pagesToRemove = Array.from(selectedPages).map((page) => page + 1);
        formData.append("pagesToRemove", JSON.stringify(pagesToRemove));

        // Use the Go API endpoint when authenticated, otherwise use Next.js API
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/pdf/remove`;

        console.log("Submitting to API URL:", apiUrl);
        console.log("Pages to remove:", pagesToRemove);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", apiUrl);
        // xhr.setRequestHeader(
        //   "x-api-key",
        //   "sk_d6c1daa54dbc95956b281fa02c544e7273ed10df60b211fe"
        // );

        // Add auth headers if authenticated
        if (isAuthenticated) {
          // Include cookies for auth
          xhr.withCredentials = true;
        }

        // Track upload progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            // Update progress for upload phase (0–50%)
            setProgress(percentComplete / 2);
          }
        };

        // Handle completion
        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              console.log("API response:", data);

              // Update progress to complete
              setProgress(100);
              setProcessedPdfUrl(data.fileUrl);
              setProcessing(false);

              toast.success(
                t("removePdf.messages.success") || "Pages removed successfully!"
              );

              resolve(data);
            } catch (parseError) {
              console.error("Error parsing response:", parseError);
              const errorMessage =
                t("removePdf.messages.error") || "An unknown error occurred";
              setError(errorMessage);
              setProgress(0);
              setProcessing(false);
              toast.error(t("removePdf.messages.error") || "Operation Failed", {
                description: errorMessage,
              });
              reject(parseError);
            }
          } else if (xhr.status === 402) {
            // Handle insufficient balance error
            let errorMessage =
              t("removePdf.messages.insufficientBalance") ||
              "Insufficient balance";
            try {
              const errorData = JSON.parse(xhr.responseText);
              if (errorData.insufficientBalance) {
                setInsufficientBalance(true);
              }
            } catch (jsonError) {
              console.error("Failed to parse error response:", jsonError);
            }

            setError(errorMessage);
            setProgress(0);
            setProcessing(false);
            toast.error(t("removePdf.messages.error") || "Operation Failed", {
              description: errorMessage,
            });
            reject(new Error(errorMessage));
          } else {
            let errorMessage = "Operation failed";
            try {
              const errorData = JSON.parse(xhr.responseText);
              errorMessage = errorData.error || errorMessage;
            } catch (jsonError) {
              console.error("Failed to parse error response:", jsonError);
            }
            errorMessage = `${errorMessage} (Status: ${xhr.status})`;

            setError(errorMessage);
            setProgress(0);
            setProcessing(false);
            toast.error(t("removePdf.messages.error") || "Operation Failed", {
              description: errorMessage,
            });
            reject(new Error(errorMessage));
          }
        };

        // Handle network errors
        xhr.onerror = function () {
          const errorMessage =
            t("removePdf.messages.error") || "An unknown error occurred";
          setError(errorMessage);
          setProgress(0);
          setProcessing(false);
          toast.error(t("removePdf.messages.error") || "Operation Failed", {
            description: errorMessage,
          });
          reject(new Error("Network error"));
        };

        // Send the request
        xhr.send(formData);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : t("removePdf.messages.error") || "An unknown error occurred";
        setError(errorMessage);
        setProgress(0);
        setProcessing(false);
        toast.error(t("removePdf.messages.error") || "Operation Failed", {
          description: errorMessage,
        });
        reject(err);
      }
    });
  };

  const reset = () => {
    setFile(null);
    setSelectedPages(new Set());
    setProcessedPdfUrl("");
    setPages([]);
    setPreviewPage(null);
    setPreviewScale(1);
    setError(null);
    setInsufficientBalance(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const renderPageThumbnails = () => {
    return (
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
        {pages.map((_, index) => {
          const isSelected = selectedPages.has(index);
          return (
            <div
              key={index}
              className={cn(
                "relative cursor-pointer transition-all duration-200 group",
                "rounded-lg border-2 overflow-hidden",
                isSelected
                  ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              )}
              onClick={() => handlePageClick(index)}
            >
              {/* Page Content */}
              <div className="relative bg-white dark:bg-gray-900">
                <Document file={file}>
                  <Page
                    pageNumber={index + 1}
                    width={window.innerWidth < 640 ? 120 : 150}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="w-full"
                  />
                </Document>

                {/* Selection Checkbox */}
                <div className="absolute top-2 right-2 z-10">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => {}}
                    onClick={(e) => handlePageSelect(e, index)}
                    className="bg-white shadow-md border-2 w-5 h-5 sm:w-6 sm:h-6"
                  />
                </div>

                {/* Selection Overlay */}
                {isSelected && (
                  <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center pointer-events-none">
                    <div className="bg-red-500 rounded-full p-2 sm:p-3">
                      <XCircleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
              </div>

              {/* Page Label */}
              <div className="p-2 bg-gray-50 dark:bg-gray-800 text-center">
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("removePdf.page") || "Page"} {index + 1}
                </span>
                {isSelected && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    Remove
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const getRemainingPages = () => {
    const remaining = [];
    for (let i = 0; i < pages.length; i++) {
      if (!selectedPages.has(i)) {
        remaining.push(i + 1);
      }
    }
    return remaining;
  };

  // Show insufficient balance message
  if (insufficientBalance) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card className="border shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <div className="text-center max-w-md mx-auto">
              <div className="mb-6 p-4 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 mx-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                <AlertTriangleIcon className="h-8 w-8 sm:h-10 sm:w-10" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-3">
                {t("common.insufficientBalance") || "Insufficient Balance"}
              </h3>
              <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                {t("common.insufficientBalanceDesc") ||
                  "You don't have enough balance to perform this operation. Please add funds to your account."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" onClick={reset} size="sm">
                  <RefreshCwIcon className="h-4 w-4 mr-2" />
                  {t("ui.reupload") || "Start Over"}
                </Button>
                <Button
                  onClick={() => (window.location.href = "/dashboard/billing")}
                  size="sm"
                >
                  {t("common.addFunds") || "Add Funds"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Card className="border shadow-sm">
        {/* File Upload Section */}
        {!file && (
          <CardContent className="p-6 sm:p-8">
            <div className="max-w-2xl mx-auto">
              <FileDropzone
                multiple={false}
                maxFiles={1}
                acceptedFileTypes={{ "application/pdf": [".pdf"] }}
                disabled={processing}
                onFileAccepted={(acceptedFiles) => {
                  if (acceptedFiles.length > 0) {
                    const uploadedFile = acceptedFiles[0];
                    setFile(uploadedFile);
                    setSelectedPages(new Set());
                    setProcessedPdfUrl("");
                    processPdf(uploadedFile);
                  }
                }}
                title={t("removePdf.uploadTitle") || "Upload Your PDF"}
                description={
                  t("removePdf.uploadDesc") ||
                  "Upload a PDF file to remove pages. Your file will be processed securely."
                }
                browseButtonText={t("ui.browse") || "Browse Files"}
                browseButtonVariant="default"
                securityText={
                  t("ui.filesSecurity") ||
                  "Your files are secure and never stored permanently"
                }
              />
            </div>
          </CardContent>
        )}

        {/* Page Selection Section */}
        {file && !processing && !processedPdfUrl && pages.length > 0 && (
          <>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-2">
                  <CardTitle className="text-lg sm:text-xl">
                    <FileTextIcon className="h-5 w-5 sm:h-6 sm:w-6 inline mr-2" />
                    {t("removePdf.selectPages") || "Select Pages to Remove"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t("removePdf.selectPagesDesc") ||
                      "Click on pages to mark them for removal"}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-muted-foreground">
                    <Badge variant="destructive" className="text-xs">
                      {selectedPages.size}{" "}
                      {t("removePdf.pagesSelected") || "pages selected"}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {getRemainingPages().length}{" "}
                      {t("removePdf.pagesRemaining") || "pages remaining"}
                    </Badge>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => reset()}
                    className="text-xs sm:text-sm"
                  >
                    <RefreshCwIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    {t("ui.clearAll") || "Clear All"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="text-xs sm:text-sm"
                  >
                    <CheckIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    {selectedPages.size === pages.length - 1
                      ? t("removePdf.clearSelection") || "Clear Selection"
                      : t("removePdf.selectMax") || "Select Max"}
                  </Button>
                  {selectedPages.size > 0 && (
                    <Button
                      size="sm"
                      onClick={handleSaveDocument}
                      className="text-xs sm:text-sm"
                    >
                      <SaveIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      {t("removePdf.saveDocument") || "Save Document"}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Warning Alert */}
              {selectedPages.size > 0 && (
                <Alert className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
                  <AlertTriangleIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
                    {selectedPages.size === 1
                      ? `1 page will be removed from your PDF.`
                      : `${selectedPages.size} pages will be removed from your PDF.`}
                  </AlertDescription>
                </Alert>
              )}

              {/* Page Thumbnails */}
              <div className="space-y-4">{renderPageThumbnails()}</div>
            </CardContent>
          </>
        )}

        {/* Processing Section */}
        {file && processing && !processedPdfUrl && (
          <CardContent className="p-6 sm:p-8">
            <div className="text-center max-w-md mx-auto">
              <LoaderIcon className="h-12 w-12 sm:h-16 sm:w-16 animate-spin text-primary mb-6 mx-auto" />
              <h3 className="text-lg sm:text-xl font-semibold mb-3">
                {t("removePdf.processing") || "Processing PDF..."}
              </h3>
              <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                {t("removePdf.messages.processing") ||
                  "Please wait while we process your PDF."}
              </p>
              <div className="space-y-2">
                <Progress value={progress} className="w-full h-2" />
                <p className="text-xs text-muted-foreground">
                  {progress}% complete
                </p>
              </div>
            </div>
          </CardContent>
        )}

        {/* Success Section */}
        {file && !processing && processedPdfUrl && (
          <CardContent className="p-6 sm:p-8">
            <div className="text-center max-w-md mx-auto">
              <div className="mb-6 p-4 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 mx-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                <CheckIcon className="h-8 w-8 sm:h-10 sm:w-10" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-3">
                {t("removePdf.messages.success") ||
                  "Pages Removed Successfully!"}
              </h3>
              <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                {t("removePdf.messages.downloadReady") ||
                  "Your processed PDF is ready for download."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" onClick={reset} size="sm">
                  <RefreshCwIcon className="h-4 w-4 mr-2" />
                  {t("ui.reupload") || "Start Over"}
                </Button>
                <Button
                  onClick={() =>
                    window.open(
                      `${process.env.NEXT_PUBLIC_API_URL}${processedPdfUrl}`,
                      "_blank"
                    )
                  }
                  size="sm"
                >
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  {t("ui.download") || "Download"}
                </Button>
              </div>
            </div>
          </CardContent>
        )}

        {/* Error Section */}
        {error && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
            <Card className="w-full max-w-md mx-4">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="mb-6 p-4 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 mx-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                  <XCircleIcon className="h-8 w-8 sm:h-10 sm:w-10" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3">
                  {t("common.error") || "Error"}
                </h3>
                <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                  {error}
                </p>
                <Button
                  onClick={() => {
                    setError(null);
                    setProcessing(false);
                  }}
                  size="sm"
                >
                  {t("ui.tryAgain") || "Try Again"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </Card>

      {/* Page Preview Modal */}
      <Dialog
        open={previewPage !== null}
        onOpenChange={() => setPreviewPage(null)}
      >
        <DialogContent className="w-[95vw] sm:w-[90vw] max-w-6xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-4 pb-2 border-b">
            <DialogTitle className="text-lg sm:text-xl">
              {t("removePdf.pagePreview") || "Page Preview"}{" "}
              {previewPage !== null ? previewPage + 1 : ""}
            </DialogTitle>
          </DialogHeader>

          {previewPage !== null && (
            <div className="flex flex-col flex-1 p-4 pt-0 gap-3 min-h-0">
              {/* Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 flex-shrink-0">
                {/* Zoom Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPreviewScale((prev) => Math.max(prev - 0.2, 0.5))
                    }
                    disabled={previewScale <= 0.5}
                  >
                    <ZoomOutIcon className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium min-w-[60px] text-center">
                    {Math.round(previewScale * 100)}%
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPreviewScale((prev) => Math.min(prev + 0.2, 3))
                    }
                    disabled={previewScale >= 3}
                  >
                    <ZoomInIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewScale(1)}
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Fit</span>
                  </Button>
                </div>

                {/* Action Button */}
                <div className="flex justify-center sm:justify-end">
                  {selectedPages.has(previewPage) ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => handlePageSelect(e, previewPage)}
                    >
                      <XCircleIcon className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">
                        {t("removePdf.removeFromDocument") ||
                          "Remove from Document"}
                      </span>
                      <span className="sm:hidden">Remove</span>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handlePageSelect(e, previewPage)}
                      disabled={selectedPages.size >= pages.length - 1}
                    >
                      <Trash2Icon className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">
                        {t("removePdf.markForRemoval") || "Mark for Removal"}
                      </span>
                      <span className="sm:hidden">Mark</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Page Display */}
              <div className="flex-1 border rounded-lg bg-gray-50 dark:bg-gray-900 overflow-auto min-h-0">
                <div className="p-4 flex items-center justify-center min-h-full">
                  <div
                    style={{
                      transform: `scale(${previewScale})`,
                      transformOrigin: "center",
                    }}
                  >
                    <Document file={file}>
                      <Page
                        pageNumber={previewPage + 1}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        height={Math.min(window.innerHeight * 0.6, 800)}
                      />
                    </Document>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center flex-shrink-0 gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPreviewPage((prev) => Math.max(0, prev! - 1))
                  }
                  disabled={previewPage === 0}
                  className="min-w-0"
                >
                  <span className="hidden sm:inline">Previous Page</span>
                  <span className="sm:hidden">Previous</span>
                </Button>
                <div className="text-center">
                  <span className="text-sm font-medium">
                    Page {previewPage + 1} of {pages.length}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPreviewPage((prev) =>
                      Math.min(pages.length - 1, prev! + 1)
                    )
                  }
                  disabled={previewPage === pages.length - 1}
                  className="min-w-0"
                >
                  <span className="hidden sm:inline">Next Page</span>
                  <span className="sm:hidden">Next</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
