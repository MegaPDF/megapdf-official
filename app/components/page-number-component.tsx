"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ArrowDown,
  Check,
  FileText,
  Download,
  X,
  RefreshCw,
  Eye,
  Settings,
  Palette,
  AlignLeft,
  DownloadIcon,
  ArrowDownIcon,
} from "lucide-react";
import { useLanguageStore } from "@/src/store/store";
import { FileDropzone } from "@/components/dropzone";

export function PdfPageNumberer() {
  const { t } = useLanguageStore();

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [numberedPdfUrl, setNumberedPdfUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [numberedPages, setNumberedPages] = useState<number>(0);

  // Get format from URL if provided
  const [initialFormat, setInitialFormat] = useState<string>("numeric");

  // Page numbering options
  const [options, setOptions] = useState({
    format: "numeric",
    position: "bottom-center",
    fontFamily: "Helvetica",
    fontSize: 12,
    color: "#000000",
    startNumber: 1,
    prefix: "",
    suffix: "",
    marginX: 40,
    marginY: 30,
    selectedPages: "",
    skipFirstPage: false,
  });

  // Initialize from URL params on component mount
  useEffect(() => {
    // Get format from URL params if available
    const urlParams = new URLSearchParams(window.location.search);
    const format = urlParams.get("format");

    if (format && ["numeric", "roman", "alphabetic"].includes(format)) {
      setInitialFormat(format);
      setOptions((prev) => ({ ...prev, format }));
    }
  }, []);

  // Get the Go API URL from env
  const goApiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  const handleOptionChange = (key: string, value: any) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  // Apply page numbering using Go API
  const applyPageNumbering = async () => {
    if (!file) {
      toast.error(
        t("pageNumber.messages.noFile") || "Please upload a PDF file first"
      );
      return;
    }

    setIsUploading(true);
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setTotalPages(0);
    setNumberedPages(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Add all options to the form data
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      // Use the Go API URL instead of Next.js API
      const apiUrl = `${goApiUrl}/api/pdf/pagenumber`;
      console.log("Submitting to Go API URL:", apiUrl);

      // Create a new XHR request to track upload progress
      const xhr = new XMLHttpRequest();
      xhr.open("POST", apiUrl);

      // Add API key if available
      // const apiKey =
      //   localStorage.getItem("apiKey") ||
      //   "sk_d6c1daa54dbc95956b281fa02c544e7273ed10df60b211fe";
      // if (apiKey) {
      //   xhr.setRequestHeader("x-api-key", apiKey);
      // }

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setProgress(percentComplete / 2);
        }
      };

      // Handle completion
      xhr.onload = function () {
        setIsUploading(false);

        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log("API response:", response);

            setProgress(100);
            setIsProcessing(false);

            if (response.totalPages) {
              setTotalPages(response.totalPages);
            }

            if (response.numberedPages) {
              setNumberedPages(response.numberedPages);
            }

            const fileUrl = response.fileUrl.startsWith("/")
              ? `${goApiUrl}${response.fileUrl}`
              : response.fileUrl;

            setNumberedPdfUrl(fileUrl);

            toast.success(
              t("pageNumber.messages.success") ||
                "Page numbers added successfully!"
            );
          } catch (parseError) {
            console.error("Error parsing response:", parseError);
            setError("Error parsing server response");
            setIsProcessing(false);

            toast.error(
              t("pageNumber.messages.error") || "Error processing PDF"
            );
          }
        } else {
          setIsProcessing(false);
          setProgress(0);

          try {
            const errorData = JSON.parse(xhr.responseText);
            setError(errorData.error || "Unknown error");

            toast.error(
              errorData.error ||
                t("pageNumber.messages.error") ||
                "Error adding page numbers"
            );
          } catch (e) {
            setError("Server error");
            toast.error(
              t("pageNumber.messages.error") || "Error adding page numbers"
            );
          }
        }
      };

      xhr.onerror = function () {
        setIsUploading(false);
        setIsProcessing(false);
        setProgress(0);
        setError("Network error");

        toast.error(
          t("pageNumber.messages.networkError") ||
            "Network error. Please try again."
        );
      };

      xhr.send(formData);
    } catch (error) {
      console.error("Error adding page numbers:", error);
      setIsUploading(false);
      setIsProcessing(false);
      setProgress(0);
      setError(error instanceof Error ? error.message : "Unknown error");

      toast.error(
        t("pageNumber.messages.error") || "Error adding page numbers"
      );
    }
  };

  // Reset form
  const resetForm = () => {
    setFile(null);
    setNumberedPdfUrl("");
    setError(null);
    setProgress(0);
    setIsUploading(false);
    setIsProcessing(false);
    setTotalPages(0);
    setNumberedPages(0);
  };

  // Check if form is being submitted
  const isSubmitting = isUploading || isProcessing;

  // Format preview label
  const getFormatPreview = () => {
    let formattedNumber = "";

    switch (options.format) {
      case "roman":
        formattedNumber = "IV";
        break;
      case "alphabetic":
        formattedNumber = "D";
        break;
      case "numeric":
      default:
        formattedNumber = "4";
    }

    return `${options.prefix}${formattedNumber}${options.suffix}`;
  };

  // Position configurations
  const positions = [
    { id: "top-left", label: "Top Left", icon: "↖" },
    { id: "top-center", label: "Top Center", icon: "↑" },
    { id: "top-right", label: "Top Right", icon: "↗" },
    { id: "bottom-left", label: "Bottom Left", icon: "↙" },
    { id: "bottom-center", label: "Bottom Center", icon: "↓" },
    { id: "bottom-right", label: "Bottom Right", icon: "↘" },
  ];

  return (
    <div className="w-full">
      {!numberedPdfUrl ? (
        <Card className="w-full border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {t("pageNumber.title") || "Add Page Numbers to PDF"}
                </h1>
                <p className="text-muted-foreground font-normal mt-1">
                  {t("pageNumber.description") ||
                    "Add customizable page numbers to your PDF document"}
                </p>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-8">
            {!file ? (
              // File Upload Section
              <FileDropzone
                onFileAccepted={(files) => {
                  if (files.length > 0) {
                    setFile(files[0]);
                    setNumberedPdfUrl("");
                    setError(null);
                  }
                }}
                acceptedFileTypes={{ "application/pdf": [".pdf"] }}
                maxSize={15 * 1024 * 1024} // 15MB
                title={t("pageNumber.uploadTitle") || "Upload Your PDF"}
                description={
                  t("pageNumber.uploadDesc") ||
                  "Upload a PDF file to add page numbers. Your file will be processed securely."
                }
                browseButtonText={t("pageNumber.ui.browse") || "Browse Files"}
                securityText={
                  t("pageNumber.ui.filesSecurity") ||
                  "Your files are secure and never stored permanently"
                }
              />
            ) : (
              // Options Section
              <div className="space-y-8">
                {/* File Info */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={resetForm}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {error && (
                  <div className="bg-destructive/10 text-destructive p-4 rounded-lg border border-destructive/20">
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                {isSubmitting && (
                  <div className="space-y-3">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      {isUploading
                        ? t("pageNumber.ui.uploading") || "Uploading..."
                        : t("pageNumber.ui.processing") || "Processing..."}
                      {progress > 0 && ` (${Math.round(progress)}%)`}
                    </p>
                  </div>
                )}

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Settings Panel */}
                  <div className="space-y-6">
                    {/* Number Format Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <AlignLeft className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">Number Format</h3>
                      </div>
                      <Tabs
                        value={options.format}
                        onValueChange={(value) =>
                          handleOptionChange("format", value)
                        }
                        className="w-full"
                      >
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="numeric" className="text-sm">
                            1, 2, 3...
                          </TabsTrigger>
                          <TabsTrigger value="roman" className="text-sm">
                            I, II, III...
                          </TabsTrigger>
                          <TabsTrigger value="alphabetic" className="text-sm">
                            A, B, C...
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    <Separator />

                    {/* Position Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">Position</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {positions.map((pos) => (
                          <Button
                            key={pos.id}
                            type="button"
                            variant={
                              options.position === pos.id
                                ? "default"
                                : "outline"
                            }
                            className="h-16 flex-col gap-1 text-xs"
                            onClick={() =>
                              handleOptionChange("position", pos.id)
                            }
                            disabled={isSubmitting}
                          >
                            <span className="text-lg">{pos.icon}</span>
                            <span>{pos.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Styling Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">Styling</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fontFamily">Font Family</Label>
                          <select
                            id="fontFamily"
                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            value={options.fontFamily}
                            onChange={(e) =>
                              handleOptionChange("fontFamily", e.target.value)
                            }
                            disabled={isSubmitting}
                          >
                            <option value="Helvetica">Helvetica</option>
                            <option value="Times New Roman">
                              Times New Roman
                            </option>
                            <option value="Courier">Courier</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fontSize">Font Size</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="fontSize"
                              type="number"
                              min="6"
                              max="72"
                              value={options.fontSize}
                              onChange={(e) =>
                                handleOptionChange(
                                  "fontSize",
                                  parseInt(e.target.value) || 12
                                )
                              }
                              className="flex-1"
                              disabled={isSubmitting}
                            />
                            <span className="text-sm text-muted-foreground">
                              pt
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="color">Color</Label>
                        <div className="flex items-center gap-3">
                          <Input
                            id="color"
                            type="color"
                            value={options.color}
                            onChange={(e) =>
                              handleOptionChange("color", e.target.value)
                            }
                            className="w-16 h-10 p-1 rounded-md"
                            disabled={isSubmitting}
                          />
                          <Input
                            type="text"
                            value={options.color}
                            onChange={(e) =>
                              handleOptionChange("color", e.target.value)
                            }
                            className="flex-1"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Advanced Options */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Advanced Options
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="startNumber">Start From</Label>
                          <Input
                            id="startNumber"
                            type="number"
                            min="1"
                            value={options.startNumber}
                            onChange={(e) =>
                              handleOptionChange(
                                "startNumber",
                                parseInt(e.target.value) || 1
                              )
                            }
                            disabled={isSubmitting}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="prefix">Prefix</Label>
                          <Input
                            id="prefix"
                            type="text"
                            value={options.prefix}
                            onChange={(e) =>
                              handleOptionChange("prefix", e.target.value)
                            }
                            placeholder="Page "
                            disabled={isSubmitting}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="suffix">Suffix</Label>
                          <Input
                            id="suffix"
                            type="text"
                            value={options.suffix}
                            onChange={(e) =>
                              handleOptionChange("suffix", e.target.value)
                            }
                            placeholder=" of 10"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="selectedPages">Pages to Number</Label>
                          <Input
                            id="selectedPages"
                            type="text"
                            value={options.selectedPages}
                            onChange={(e) =>
                              handleOptionChange(
                                "selectedPages",
                                e.target.value
                              )
                            }
                            placeholder="1,3,5-10 (leave blank for all pages)"
                            disabled={isSubmitting}
                          />
                          <p className="text-xs text-muted-foreground">
                            Use commas for individual pages and hyphens for
                            ranges
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="skipFirstPage"
                            className="cursor-pointer"
                          >
                            Skip first page
                          </Label>
                          <Switch
                            id="skipFirstPage"
                            checked={options.skipFirstPage}
                            onCheckedChange={(checked) =>
                              handleOptionChange("skipFirstPage", checked)
                            }
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview Panel */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold">Live Preview</h3>
                    </div>
                    <div className="sticky top-4">
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 rounded-xl border shadow-inner">
                        <div
                          className="relative mx-auto"
                          style={{ width: "280px", height: "400px" }}
                        >
                          {/* PDF Page Container */}
                          <div className="w-full h-full bg-white dark:bg-gray-50 rounded-lg shadow-lg border border-gray-200 dark:border-gray-300 relative overflow-hidden">
                            {/* PDF Content Simulation */}
                            <div className="p-6 space-y-3">
                              <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-200 rounded-full w-3/4"></div>
                              <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full w-full"></div>
                              <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full w-5/6"></div>
                              <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full w-2/3"></div>
                              <div className="mt-6 space-y-2">
                                <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full w-full"></div>
                                <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full w-4/5"></div>
                                <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full w-full"></div>
                                <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full w-3/4"></div>
                              </div>
                            </div>

                            {/* Page Number */}
                            <div
                              className={`absolute transition-all duration-200 ${
                                options.position.includes("top")
                                  ? "top-4"
                                  : "bottom-4"
                              } ${
                                options.position.includes("left")
                                  ? "left-4"
                                  : options.position.includes("right")
                                  ? "right-4"
                                  : "left-1/2 transform -translate-x-1/2"
                              }`}
                              style={{
                                fontFamily: options.fontFamily,
                                fontSize: `${Math.max(
                                  options.fontSize * 1.2,
                                  14
                                )}px`,
                                color: options.color,
                                fontWeight: "500",
                                textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                              }}
                            >
                              {getFormatPreview()}
                            </div>

                            {/* Page corners shadow effect */}
                            <div className="absolute inset-0 border border-gray-300 dark:border-gray-400 rounded-lg pointer-events-none"></div>
                          </div>

                          {/* Shadow beneath */}
                          <div className="absolute -bottom-2 -right-2 w-full h-full bg-gray-400/20 dark:bg-gray-600/20 rounded-lg -z-10"></div>
                        </div>

                        <div className="mt-4 text-center">
                          <p className="text-sm font-medium text-muted-foreground">
                            Preview: Page Number Position
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {getFormatPreview()} •{" "}
                            {options.position.replace("-", " ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between pt-6 border-t">
            {file && (
              <>
                <Button
                  variant="outline"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="px-6"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={applyPageNumbering}
                  disabled={isSubmitting}
                  size="lg"
                  className="px-8"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing... ({Math.round(progress)}%)
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Add Page Numbers
                    </>
                  )}
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      ) : (
        // Success Section
        <Card className="w-full border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-green-600 dark:text-green-400">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Check className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  Page Numbers Added Successfully
                </h1>
                <p className="text-muted-foreground font-normal mt-1">
                  Your PDF has been processed and is ready to download
                </p>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="py-8">
            <div className="text-center space-y-6">
              <div className="mx-auto w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Check className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Your PDF is ready!
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your PDF file has been processed and page numbers have been
                  added according to your settings.
                </p>
              </div>

              {(totalPages > 0 || numberedPages > 0) && (
                <div className="bg-muted/30 rounded-xl p-6 max-w-xs mx-auto">
                  <div className="grid grid-cols-2 gap-6">
                    {totalPages > 0 && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {totalPages}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Pages
                        </div>
                      </div>
                    )}
                    {numberedPages > 0 && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {numberedPages}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Pages Numbered
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Button
                size="lg"
                className="px-8 py-3"
                onClick={() => {
                  if (numberedPdfUrl) {
                    window.location.href = numberedPdfUrl;
                  }
                }}
              >
                <DownloadIcon className="h-5 w-5 mr-2" />
                Download PDF
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center border-t bg-muted/20 py-4">
            <Button variant="ghost" onClick={resetForm} className="px-6">
              <ArrowDownIcon className="h-4 w-4 mr-2" />
              Process Another PDF
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
