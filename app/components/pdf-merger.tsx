"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Cross2Icon,
  CheckCircledIcon,
  DownloadIcon,
  TrashIcon,
  MoveIcon,
} from "@radix-ui/react-icons";
import { AlertCircle, ArrowDown, ArrowUp, FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/src/store/store";
import { UploadProgress } from "@/components/ui/upload-progress";
import useFileUpload from "@/hooks/useFileUpload";
import { FileDropzone } from "@/components/dropzone";

// Interface for file with order
interface FileWithOrder {
  file: File;
  id: string;
  preview?: string;
  isUploading?: boolean;
  uploadProgress?: number;
  error?: Error | null;
}

export function PdfMerger() {
  const { t } = useLanguageStore();
  const [files, setFiles] = useState<FileWithOrder[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mergedFileUrl, setMergedFileUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  // Use our custom upload hook
  const {
    isUploading,
    progress: uploadProgress,
    error: uploadError,
    uploadFile,
    resetUpload,
    uploadStats,
  } = useFileUpload();

  // Generate a unique ID
  const generateId = () =>
    `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Clean up previews when component unmounts
  const cleanUpPreviews = useCallback(() => {
    files.forEach((file) => {
      if (file.preview) URL.revokeObjectURL(file.preview);
    });
  }, [files]);

  // Handle drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    if (isProcessing || isUploading) return;
    setDragId(id);
    e.dataTransfer.setData("text/plain", id);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    if (!dragId || dragId === targetId || isProcessing || isUploading) return;

    const newFiles = [...files];
    const draggedIndex = newFiles.findIndex((f) => f.id === dragId);
    const targetIndex = newFiles.findIndex((f) => f.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const [draggedItem] = newFiles.splice(draggedIndex, 1);
    newFiles.splice(targetIndex, 0, draggedItem);

    setFiles(newFiles);
    setDragId(null);
  };

  // Move file up in the list
  const moveFileUp = (index: number) => {
    if (index <= 0) return;
    const newFiles = [...files];
    [newFiles[index - 1], newFiles[index]] = [
      newFiles[index],
      newFiles[index - 1],
    ];
    setFiles(newFiles);
  };

  // Move file down in the list
  const moveFileDown = (index: number) => {
    if (index >= files.length - 1) return;
    const newFiles = [...files];
    [newFiles[index], newFiles[index + 1]] = [
      newFiles[index + 1],
      newFiles[index],
    ];
    setFiles(newFiles);
  };

  // Handle file removal
  const handleRemoveFile = (id: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove?.preview) URL.revokeObjectURL(fileToRemove.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  // Format file size for display
  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  };

  const handleMerge = async (): Promise<void> => {
    if (files.length < 2) {
      setError(
        t("mergePdf.error.minFiles") ||
          "Please upload at least two PDF files to merge"
      );
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setMergedFileUrl(null);

    return new Promise((resolve, reject) => {
      try {
        const formData = new FormData();
        files.forEach((fileObj) => {
          formData.append("files", fileObj.file);
        });
        formData.append(
          "order",
          JSON.stringify(files.map((_, index) => index))
        );

        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/pdf/merge`;
        console.log("Submitting to Go API URL:", apiUrl);
        console.log("Number of files:", files.length);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", apiUrl);
        // xhr.setRequestHeader(
        //   "x-api-key",
        //   "sk_d6c1daa54dbc95956b281fa02c544e7273ed10df60b211fe"
        // );

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
              setMergedFileUrl(data.fileUrl);
              setIsProcessing(false); // Reset processing state

              toast.success(
                t("mergePdf.ui.successMessage") || "Merge Successful"
              );

              resolve();
            } catch (parseError) {
              console.error("Error parsing response:", parseError);
              const errorMessage =
                t("mergePdf.error.unknown") || "An unknown error occurred";
              setError(errorMessage);
              setProgress(0);
              setIsProcessing(false);
              toast.error(t("mergePdf.error.failed") || "Merge Failed", {
                description: errorMessage,
              });
              reject(parseError);
            }
          } else {
            let errorMessage = "Merge failed";
            try {
              const errorData = JSON.parse(xhr.responseText);
              errorMessage = errorData.error || errorMessage;
            } catch (jsonError) {
              console.error("Failed to parse error response:", jsonError);
            }
            errorMessage = `${errorMessage} (Status: ${xhr.status})`;

            setError(errorMessage);
            setProgress(0);
            setIsProcessing(false);
            toast.error(t("mergePdf.error.failed") || "Merge Failed", {
              description: errorMessage,
            });
            reject(new Error(errorMessage));
          }
        };

        // Handle network errors
        xhr.onerror = function () {
          const errorMessage =
            t("mergePdf.error.unknown") || "An unknown error occurred";
          setError(errorMessage);
          setProgress(0);
          setIsProcessing(false);
          toast.error(t("mergePdf.error.failed") || "Merge Failed", {
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
            : t("mergePdf.error.unknown") || "An unknown error occurred";
        setError(errorMessage);
        setProgress(0);
        setIsProcessing(false);
        toast.error(t("mergePdf.error.failed") || "Merge Failed", {
          description: errorMessage,
        });
        reject(err);
      }
    });
  };
  // Handle files being accepted by the FileDropzone
  const handleFilesAccepted = (acceptedFiles: File[]) => {
    setError(null);
    resetUpload();
    setFiles((prev) => {
      const existingFileNames = new Set(prev.map((f) => f.file.name));
      const newFiles = acceptedFiles
        .filter((file) => !existingFileNames.has(file.name))
        .map((file) => ({
          file,
          id: generateId(),
          preview: URL.createObjectURL(file),
          isUploading: false,
          uploadProgress: 0,
          error: null,
        }));
      return [...prev, ...newFiles];
    });
  };

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6 space-y-6">
        {/* File Drop Zone */}
        {!mergedFileUrl && (
          <FileDropzone
            multiple={true}
            acceptedFileTypes={{ "application/pdf": [".pdf"] }}
            disabled={isProcessing || isUploading}
            maxFiles={100}
            onFileAccepted={handleFilesAccepted}
            title={
              t("fileUploader.dragAndDrop") || "Drag & drop your PDF files"
            }
            description={`${
              t("fileUploader.dropHereDesc") ||
              "Drop your PDF files here or click to browse."
            } ${
              t("fileUploader.maxSize") || "Maximum size is 100MB per file."
            }`}
            browseButtonText={t("fileUploader.browse") || "Browse Files"}
            browseButtonVariant="default"
            securityText={
              t("fileUploader.filesSecurity") ||
              "Your files are processed securely."
            }
          />
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="border rounded-lg">
            <div className="p-3 border-b bg-muted/30 flex justify-between items-center">
              <h3 className="font-medium">
                {t("mergePdf.ui.filesToMerge") || "Files to Merge"} (
                {files.length})
              </h3>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                >
                  <MoveIcon className="h-3 w-3 mr-1" />{" "}
                  {t("mergePdf.ui.dragToReorder") || "Drag to reorder"}
                </Badge>
                {!isProcessing && !isUploading && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      cleanUpPreviews();
                      setFiles([]);
                    }}
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />{" "}
                    {t("ui.clearAll") || "Clear All"}
                  </Button>
                )}
              </div>
            </div>

            <div className="divide-y overflow-y-auto max-h-[400px]">
              {files.map((fileObj, index) => (
                <div
                  key={fileObj.id}
                  draggable={!isProcessing && !isUploading}
                  onDragStart={(e) => handleDragStart(e, fileObj.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, fileObj.id)}
                  className={cn(
                    "p-3 flex items-center justify-between gap-4 hover:bg-muted/30",
                    dragId === fileObj.id && "opacity-50 bg-muted/50"
                  )}
                >
                  <div className="flex items-center justify-center p-1 rounded hover:bg-muted cursor-move">
                    <MoveIcon className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                      {index + 1}
                    </div>
                    <div className="h-9 w-9 rounded-md bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                      <FileIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {fileObj.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(fileObj.file.size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveFileUp(index)}
                      disabled={index === 0 || isProcessing || isUploading}
                      className="h-8 w-8"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveFileDown(index)}
                      disabled={
                        index === files.length - 1 ||
                        isProcessing ||
                        isUploading
                      }
                      className="h-8 w-8"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveFile(fileObj.id)}
                      disabled={isProcessing || isUploading}
                    >
                      <Cross2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Upload/Processing Progress Indicator */}
        {(isUploading || isProcessing) && (
          <UploadProgress
            progress={progress}
            isUploading={isUploading}
            isProcessing={isProcessing}
            processingProgress={progress}
            error={uploadError}
            label={
              isUploading
                ? t("watermarkPdf.uploading") || "Uploading..."
                : t("mergePdf.ui.processingMerge") || "Processing Merge..."
            }
            uploadStats={uploadStats}
          />
        )}

        {/* Results */}
        {mergedFileUrl && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <CheckCircledIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-green-600 dark:text-green-400">
                  {t("mergePdf.ui.successMessage") ||
                    "PDFs successfully merged!"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 mb-3">
                  {t("mergePdf.ui.downloadReady") ||
                    "Your merged PDF file is now ready for download."}
                </p>
                <Button className="w-full sm:w-auto" asChild variant="default">
                  <a
                    href={
                      `${process.env.NEXT_PUBLIC_API_URL}` + `${mergedFileUrl}`
                    }
                    download
                  >
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    {t("mergePdf.ui.downloadMerged") || "Download Merged PDF"}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between flex-col sm:flex-row gap-2 p-6">
        {files.length > 0 &&
          !isProcessing &&
          !isUploading &&
          !mergedFileUrl && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  cleanUpPreviews();
                  setFiles([]);
                }}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                {t("ui.clear") || "Clear All"}
              </Button>

              <Button
                className="sm:ml-auto"
                onClick={handleMerge}
                disabled={files.length < 2 || isProcessing || isUploading}
              >
                {isProcessing || isUploading
                  ? t("ui.processing") || "Merging..."
                  : t("mergePdf.ui.mergePdfs") || "Merge PDFs"}
              </Button>
            </>
          )}

        {mergedFileUrl && (
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => {
              cleanUpPreviews();
              setFiles([]);
              setMergedFileUrl(null);
              setError(null);
              setProgress(0);
            }}
          >
            {t("ui.reupload") || "Start Over"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
