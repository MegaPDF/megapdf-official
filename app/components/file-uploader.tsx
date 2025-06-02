"use client";

import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileIcon,
  Cross2Icon,
  CheckCircledIcon,
  CrossCircledIcon,
  UploadIcon,
  ReloadIcon,
  DownloadIcon,
  FileTextIcon,
  ImageIcon,
  TableIcon,
} from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/src/store/store";

const FORMAT_CATEGORIES = [
  {
    name: "Documents",
    icon: <FileTextIcon className="h-4 w-4" />,
    formats: [
      { value: "pdf", label: "PDF Document (.pdf)", accept: "application/pdf" },
      {
        value: "docx",
        label: "Word Document (.docx)",
        accept:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
      {
        value: "rtf",
        label: "Rich Text Format (.rtf)",
        accept: "application/rtf",
      },
      { value: "txt", label: "Text File (.txt)", accept: "text/plain" },
      { value: "html", label: "HTML Document (.html)", accept: "text/html" },
    ],
  },
  {
    name: "Spreadsheets",
    icon: <TableIcon className="h-4 w-4" />,
    formats: [
      {
        value: "xlsx",
        label: "Excel Spreadsheet (.xlsx)",
        accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    ],
  },
  {
    name: "Presentations",
    icon: <FileTextIcon className="h-4 w-4" />,
    formats: [
      {
        value: "pptx",
        label: "PowerPoint Presentation (.pptx)",
        accept:
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      },
    ],
  },
  {
    name: "Images",
    icon: <ImageIcon className="h-4 w-4" />,
    formats: [
      { value: "jpg", label: "JPEG Image (.jpg)", accept: "image/jpeg" },
      { value: "png", label: "PNG Image (.png)", accept: "image/png" },
    ],
  },
];

// Form schema
const formSchema = z.object({
  inputFormat: z.string().min(1, "Please select an input format"),
  outputFormat: z.string().min(1, "Please select an output format"),
  enableOcr: z.boolean().default(false),
  quality: z.number().min(10).max(100).default(90),
  password: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Get all input formats as flattened array
const getAllInputFormats = () => {
  return FORMAT_CATEGORIES.flatMap((category) => category.formats);
};

// Get all acceptable MIME types for the selected input format
const getAcceptedFileTypes = (inputFormat: string) => {
  const allFormats = getAllInputFormats();
  const format = allFormats.find((f) => f.value === inputFormat);
  return format ? { [format.accept]: [`.${format.value}`] } : {};
};

// Get file Icon based on format
const getFileIcon = (format: string) => {
  if (["jpg", "jpeg", "png"].includes(format)) {
    return <ImageIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
  } else if (["xlsx", "xls"].includes(format)) {
    return <TableIcon className="h-6 w-6 text-green-600 dark:text-green-400" />;
  } else if (["pptx"].includes(format)) {
    return (
      <FileTextIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
    );
  } else {
    return <FileIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
  }
};

interface FileUploaderProps {
  initialInputFormat?: string;
  initialOutputFormat?: string;
}

export function FileUploader({
  initialInputFormat = "pdf",
  initialOutputFormat = "docx",
}: FileUploaderProps) {
  const { t } = useLanguageStore();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedFileUrl, setConvertedFileUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [acceptedFileTypes, setAcceptedFileTypes] = useState<
    Record<string, string[]>
  >({});

  // Initialize form with provided initial values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inputFormat: initialInputFormat,
      outputFormat: initialOutputFormat,
      enableOcr: false,
      quality: 90,
      password: "",
    },
  });

  // Update form when initialInputFormat or initialOutputFormat changes
  useEffect(() => {
    form.setValue("inputFormat", initialInputFormat);
    form.setValue("outputFormat", initialOutputFormat);

    // Also update the accepted file types when initialInputFormat changes
    setAcceptedFileTypes(getAcceptedFileTypes(initialInputFormat));
  }, [initialInputFormat, initialOutputFormat, form]);

  // Watch inputFormat to update accepted file types for the dropzone
  const inputFormat = form.watch("inputFormat");

  useEffect(() => {
    setAcceptedFileTypes(getAcceptedFileTypes(inputFormat));

    // Reset file if format changes
    if (file) {
      setFile(null);
      setConvertedFileUrl(null);
    }
  }, [inputFormat]);

  // Set up dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: acceptedFileTypes,
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.file.size > 50 * 1024 * 1024) {
          setError(t("fileUploader.maxSize"));
        } else {
          setError(
            `${t("fileUploader.inputFormat")} ${inputFormat.toUpperCase()}`
          );
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setConvertedFileUrl(null);
        setError(null);
      }
    },
  });
  // Handle form submission
  // Update the onSubmit function in the FileUploader component

  const onSubmit = async (values: FormValues) => {
    if (!file) {
      setError(t("compressPdf.error.noFiles"));
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);
    setConvertedFileUrl(null);

    try {
      // Create form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("inputFormat", values.inputFormat);
      formData.append("outputFormat", values.outputFormat);
      formData.append("ocr", values.enableOcr ? "true" : "false");
      formData.append("quality", values.quality.toString());

      if (values.password) {
        formData.append("password", values.password);
      }

      // Determine API URL
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || ""}/api/pdf/convert`;
      console.log("Submitting to API URL:", apiUrl);
      console.log("File name:", file.name, "File size:", file.size);
      console.log(
        "Input format:",
        values.inputFormat,
        "Output format:",
        values.outputFormat
      );

      return new Promise<void>((resolve, reject) => {
        // Create a new XHR request
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
            // Update progress for upload phase (0-50%)
            setProgress(Math.min(50, Math.floor(percentComplete / 2)));
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

              // Handle the filename from either API response format
              const filename =
                data.filename ||
                `${data.uniqueId}-output.${values.outputFormat}`;

              // Construct the full URL for the file
              const fileUrl = `/api/file?folder=conversions&filename=${encodeURIComponent(
                filename
              )}`;
              setConvertedFileUrl(filename);

              toast.success(t("fileUploader.successful"), {
                description: `${t(
                  "fileUploader.successDesc"
                )} ${values.inputFormat.toUpperCase()} to ${values.outputFormat.toUpperCase()}.`,
              });

              resolve();
            } catch (parseError) {
              console.error("Error parsing response:", parseError);
              const errorMessage = t("compressPdf.error.unknown");
              setError(errorMessage);
              toast.error(t("compressPdf.error.failed"), {
                description: errorMessage,
              });
              reject(parseError);
            }
          } else {
            let errorMessage = `${t(
              "compressPdf.error.failed"
            )} ${values.inputFormat.toUpperCase()} to ${values.outputFormat.toUpperCase()}`;

            try {
              const errorData = JSON.parse(xhr.responseText);
              errorMessage = errorData.error || errorMessage;
            } catch (jsonError) {
              console.error("Failed to parse error response:", jsonError);
            }

            errorMessage = `${errorMessage} (Status: ${xhr.status})`;
            setError(errorMessage);

            toast.error(t("compressPdf.error.failed"), {
              description: errorMessage,
            });

            reject(new Error(errorMessage));
          }
        };

        // Handle network errors
        xhr.onerror = function () {
          const errorMessage = t("compressPdf.error.unknown");
          setError(errorMessage);

          toast.error(t("compressPdf.error.failed"), {
            description: errorMessage,
          });

          reject(new Error("Network error"));
        };

        // Simulate progress during processing phase
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 95) {
              clearInterval(progressInterval);
              return 95;
            }
            // Increment more slowly after upload completes
            return prev < 50 ? 50 : prev + 2;
          });
        }, 300);

        // Clean up interval on xhr completion or error
        xhr.addEventListener("loadend", () => {
          clearInterval(progressInterval);
        });

        // Send the request
        xhr.send(formData);
      })
        .then(() => {
          setIsUploading(false);
        })
        .catch((error) => {
          setIsUploading(false);
          throw error;
        });
    } catch (err) {
      setIsUploading(false);
      setError(
        err instanceof Error ? err.message : t("compressPdf.error.unknown")
      );
      toast.error(t("compressPdf.error.failed"), {
        description:
          err instanceof Error ? err.message : t("compressPdf.error.unknown"),
      });
    }
  };

  // Handle file removal
  const handleRemoveFile = () => {
    setFile(null);
    setConvertedFileUrl(null);
    setError(null);
  };

  // Get file extension
  const getFileExtension = (filename: string) => {
    return filename.split(".").pop()?.toUpperCase() || "";
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

  // Check if format is an image format
  const isImageFormat =
    form.watch("outputFormat") === "jpg" ||
    form.watch("outputFormat") === "png";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column: File selection */}
          <div className="space-y-4">
            <div className="text-lg font-medium">1. {t("ui.upload")}</div>

            {/* Input Format Dropdown - Hidden, now controlled by parent */}
            <div className="hidden">
              <FormField
                control={form.control}
                name="inputFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fileUploader.inputFormat")}</FormLabel>
                    <Select
                      disabled={isUploading}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("fileUploader.inputFormat")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FORMAT_CATEGORIES.map((category) => (
                          <div key={category.name}>
                            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground flex items-center">
                              {category.icon}
                              <span className="ml-1">
                                {t(
                                  `fileUploader.categories.${category.name.toLowerCase()}`
                                )}
                              </span>
                            </div>
                            {category.formats.map((format) => (
                              <SelectItem
                                key={format.value}
                                value={format.value}
                              >
                                {format.label}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* File Drop Zone */}
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                isDragActive
                  ? "border-primary bg-primary/10"
                  : file
                  ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50",
                isUploading && "pointer-events-none opacity-60"
              )}
            >
              <input {...getInputProps()} disabled={isUploading} />

              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    {getFileIcon(getFileExtension(file.name).toLowerCase())}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} •{" "}
                      {getFileExtension(file.name)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                  >
                    <Cross2Icon className="h-4 w-4 mr-1" />{" "}
                    {t("fileUploader.remove")}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <UploadIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="text-lg font-medium">
                    {isDragActive
                      ? t("fileUploader.dropHere")
                      : t("fileUploader.dragAndDrop")}
                  </div>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {t("fileUploader.dropHereDesc")} {t("fileUploader.maxSize")}
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="mt-2"
                  >
                    {t("fileUploader.browse")}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right column: Conversion options */}
          <div className="space-y-4">
            <div className="text-lg font-medium">
              2. {t("convert.options.title")}
            </div>

            {/* Output Format Dropdown - Hidden, now controlled by parent */}
            <div className="hidden">
              <FormField
                control={form.control}
                name="outputFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fileUploader.outputFormat")}</FormLabel>
                    <Select
                      disabled={isUploading}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("fileUploader.outputFormat")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FORMAT_CATEGORIES.map((category) => (
                          <div key={category.name}>
                            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground flex items-center">
                              {category.icon}
                              <span className="ml-1">
                                {t(
                                  `fileUploader.categories.${category.name.toLowerCase()}`
                                )}
                              </span>
                            </div>
                            {category.formats.map((format) => (
                              <SelectItem
                                key={format.value}
                                value={format.value}
                              >
                                {format.label}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Conversion Info */}
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${
                        getFileIcon(inputFormat) === getFileIcon("pdf")
                          ? "bg-blue-100 dark:bg-blue-900/30"
                          : inputFormat === "xlsx"
                          ? "bg-green-100 dark:bg-green-900/30"
                          : inputFormat === "pptx"
                          ? "bg-orange-100 dark:bg-orange-900/30"
                          : "bg-blue-100 dark:bg-blue-900/30"
                      }`}
                    >
                      {getFileIcon(inputFormat)}
                    </div>
                    <span className="font-medium">
                      {inputFormat.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-muted-foreground">→</div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${
                        getFileIcon(form.watch("outputFormat")) ===
                        getFileIcon("pdf")
                          ? "bg-blue-100 dark:bg-blue-900/30"
                          : form.watch("outputFormat") === "xlsx"
                          ? "bg-green-100 dark:bg-green-900/30"
                          : form.watch("outputFormat") === "pptx"
                          ? "bg-orange-100 dark:bg-orange-900/30"
                          : "bg-blue-100 dark:bg-blue-900/30"
                      }`}
                    >
                      {getFileIcon(form.watch("outputFormat"))}
                    </div>
                    <span className="font-medium">
                      {form.watch("outputFormat").toUpperCase()}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("converter.description")}{" "}
                  <span className="font-medium">
                    {inputFormat.toUpperCase()}
                  </span>{" "}
                  {t("ui.to")}{" "}
                  <span className="font-medium">
                    {form.watch("outputFormat").toUpperCase()}
                  </span>
                </p>
              </CardContent>
            </Card>

            {/* OCR Option */}
            <FormField
              control={form.control}
              name="enableOcr"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isUploading}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{t("fileUploader.ocr")}</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      {t("fileUploader.ocrDesc")}
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {/* Image Quality (only for image outputs) */}
            {isImageFormat && (
              <FormField
                control={form.control}
                name="quality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("fileUploader.quality")}: {field.value}%
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{t("fileUploader.low")}</span>
                        <Input
                          type="range"
                          min={10}
                          max={100}
                          step={5}
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                          disabled={isUploading}
                          className="[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4"
                        />
                        <span className="text-xs">
                          {t("fileUploader.high")}
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              <div className="flex items-center gap-2">
                <CrossCircledIcon className="h-4 w-4" />
                {error}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Progress indicator */}
        {isUploading && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <ReloadIcon className="h-4 w-4 animate-spin" />
              {t("fileUploader.converting")}... {progress}%
            </div>
          </div>
        )}

        {convertedFileUrl && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-green-600 dark:text-green-400 flex items-center gap-2">
                <CheckCircledIcon className="h-5 w-5" />
                {t("fileUploader.successful")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {t("fileUploader.successDesc")}
              </p>
              <Button className="w-full" asChild variant="default">
                <a
                  href={`${
                    process.env.NEXT_PUBLIC_API_URL || ""
                  }/api/file?folder=conversions&filename=${encodeURIComponent(
                    convertedFileUrl
                  )}`}
                  download
                >
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  {t("fileUploader.download")}
                </a>
              </Button>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              {t("fileUploader.filesSecurity")}
            </CardFooter>
          </Card>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full"
          disabled={!file || isUploading}
        >
          {isUploading ? t("ui.processing") : t("convert.howTo.step2.title")}
        </Button>
      </form>
    </Form>
  );
}
