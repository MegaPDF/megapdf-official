"use client";

import { useState } from "react";
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
  DownloadIcon,
} from "@radix-ui/react-icons";
import { AlertCircle, LockIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguageStore } from "@/src/store/store";
import { FileDropzone } from "./dropzone";

export function PdfPasswordProtector() {
  const { t } = useLanguageStore();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [protectedFileUrl, setProtectedFileUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  // Define form schema with localized error messages
  const formSchema = z
    .object({
      password: z.string().min(1, t("protectPdf.form.password")),
      confirmPassword: z.string().min(1, t("fileUploader.password")),
      permission: z.enum(["all", "restricted"]).default("restricted"),
      allowPrinting: z.boolean().default(true),
      allowCopying: z.boolean().default(false),
      allowEditing: z.boolean().default(false),
      protectionLevel: z.enum(["128", "256"]).default("256"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("protectPdf.form.confirmPassword"),
      path: ["confirmPassword"],
    });

  type FormValues = z.infer<typeof formSchema>;

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      permission: "restricted",
      allowPrinting: true,
      allowCopying: false,
      allowEditing: false,
      protectionLevel: "256",
    },
  });

  // Watch permission field to conditionally render restrictions
  const permission = form.watch("permission");

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

  // Handle file removal
  const handleRemoveFile = () => {
    setFile(null);
    setProtectedFileUrl(null);
    setError(null);
  };
  // Submit handler
  const onSubmit = async (values: FormValues) => {
    if (!file) {
      setError(t("compressPdf.error.noFiles"));
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setProtectedFileUrl(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", values.password);
    formData.append("permission", values.permission);
    formData.append("protectionLevel", values.protectionLevel);

    if (values.permission === "restricted") {
      formData.append("allowPrinting", values.allowPrinting.toString());
      formData.append("allowCopying", values.allowCopying.toString());
      formData.append("allowEditing", values.allowEditing.toString());
    }

    // Use the Go API URL instead of Next.js API
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/pdf/protect`;
    console.log("Submitting to Go API URL:", apiUrl);

    try {
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

          setProgress(100);
          setProtectedFileUrl(data.filename);
          setIsProcessing(false);

          toast.success(t("protectPdf.protected"), {
            description: t("protectPdf.protectedDesc"),
          });
        } else {
          // Error
          setIsProcessing(false);
          setProgress(0);

          try {
            const errorData = JSON.parse(xhr.responseText);
            setError(errorData.error || t("protectPdf.error.failed"));
            toast.error(t("protectPdf.error.failed"), {
              description: errorData.error || t("protectPdf.error.unknown"),
            });
          } catch (e) {
            setError(t("protectPdf.error.failed"));
            toast.error(t("protectPdf.error.failed"));
          }
        }
      };

      xhr.onerror = function () {
        setIsUploading(false);
        setIsProcessing(false);
        setProgress(0);

        setError(t("protectPdf.error.networkError"));
        toast.error(t("protectPdf.error.networkError"));
      };

      xhr.send(formData);
    } catch (err) {
      console.error("Error submitting form:", err);
      setIsUploading(false);
      setIsProcessing(false);
      setProgress(0);

      setError(t("protectPdf.error.unknown"));
      toast.error(t("protectPdf.error.failed"));
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>{t("protectPdf.title") || "Protect PDF"}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* File Drop Zone */}
            <FileDropzone
              multiple={false}
              maxFiles={1}
              acceptedFileTypes={{ "application/pdf": [".pdf"] }}
              disabled={isProcessing}
              onFileAccepted={(acceptedFiles) => {
                if (acceptedFiles.length > 0) {
                  setFile(acceptedFiles[0]);
                  setProtectedFileUrl(null);
                  setError(null);
                }
              }}
              title={
                t("fileUploader.dragAndDrop") || "Drag & drop your PDF file"
              }
              description={`${
                t("fileUploader.dropHereDesc") ||
                "Drop your PDF file here or click to browse."
              } ${t("fileUploader.maxSize") || "Maximum size is 100MB."}`}
              browseButtonText={t("fileUploader.browse") || "Browse Files"}
              browseButtonVariant="default"
              securityText={
                t("fileUploader.filesSecurity") ||
                "Your files are processed securely."
              }
            />

            {/* File Display */}
            {file && !protectedFileUrl && (
              <div className="border rounded-lg p-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="h-9 w-9 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <FileIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={isProcessing}
                >
                  <Cross2Icon className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Protection Options */}
            {file && !protectedFileUrl && (
              <div className="space-y-6 mt-4">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("protectPdf.form.password")}</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder={t("protectPdf.form.password")}
                            {...field}
                            disabled={isProcessing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Confirm Password */}
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("protectPdf.form.confirmPassword")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder={t("protectPdf.form.confirmPassword")}
                            {...field}
                            disabled={isProcessing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Protection Level */}
                <FormField
                  control={form.control}
                  name="protectionLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("protectPdf.form.encryptionLevel")}
                      </FormLabel>
                      <Select
                        disabled={isProcessing}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("protectPdf.form.encryptionLevel")}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="128">
                            {t("protectPdf.security.encryption.aes128")}
                          </SelectItem>
                          <SelectItem value="256">
                            {t("protectPdf.security.encryption.aes256")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("protectPdf.faq.encryptionDifference.answer")}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Permission Selection */}
                <FormField
                  control={form.control}
                  name="permission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("protectPdf.form.permissions.title")}
                      </FormLabel>
                      <Select
                        disabled={isProcessing}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t(
                                "protectPdf.form.permissions.title"
                              )}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">
                            {t("protectPdf.form.permissions.allowAll")}
                          </SelectItem>
                          <SelectItem value="restricted">
                            {t("protectPdf.form.permissions.restricted")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Restricted Permissions */}
                {permission === "restricted" && (
                  <div className="space-y-4 border p-4 rounded-lg">
                    <h3 className="text-sm font-medium">
                      {t("protectPdf.form.allowedActions")}
                    </h3>

                    <FormField
                      control={form.control}
                      name="allowPrinting"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isProcessing}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              {t("protectPdf.form.allowPrinting")}
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="allowCopying"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isProcessing}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              {t("protectPdf.form.allowCopying")}
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="allowEditing"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isProcessing}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              {t("protectPdf.form.allowEditing")}
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Error message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Progress indicator */}
            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <LockIcon className="h-4 w-4 animate-pulse" />
                  <span>
                    {t("protectPdf.protecting")} {progress}%
                  </span>
                </div>
              </div>
            )}

            {/* Results */}
            {protectedFileUrl && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <CheckCircledIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-green-600 dark:text-green-400">
                      {t("protectPdf.protected")}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-3">
                      {t("protectPdf.protectedDesc")}
                    </p>
                    <Button
                      className="w-full sm:w-auto"
                      asChild
                      variant="default"
                    >
                      <a
                        href={`${
                          process.env.NEXT_PUBLIC_API_URL
                        }/api/file?folder=protected&filename=${encodeURIComponent(
                          protectedFileUrl
                        )}`}
                        download
                      >
                        <DownloadIcon className="h-4 w-4 mr-2" />
                        {t("ui.download")}
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            {!protectedFileUrl && file && (
              <Button type="submit" disabled={!file || isProcessing}>
                {isProcessing ? t("ui.processing") : t("protectPdf.title")}
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
