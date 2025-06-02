"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/utils/auth";
import {
  Settings as SettingsIcon,
  Globe,
  Mail,
  Database,
  Key,
  AlertCircle,
  ExternalLink,
  CheckCircle,
  Server,
  FileText,
  Shield,
  CreditCard,
  Eye,
  EyeOff,
  Copy,
  Save,
  RefreshCw,
  AlertTriangle,
  History,
} from "lucide-react";

interface EnvVariable {
  key: string;
  value: string;
  description: string;
  category: string;
  required: boolean;
  sensitive: boolean;
  example: string;
}

interface EnvCategory {
  name: string;
  description: string;
  variables: EnvVariable[];
}

interface EnvStatus {
  fileExists: boolean;
  filePath: string;
  status: "complete" | "partial" | "incomplete";
  configured: number;
  total: number;
  requiredMissing: string[];
  optionalMissing: string[];
  backupCount: number;
  lastBackup: string;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

export default function SettingsPage() {
  const [categories, setCategories] = useState<EnvCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<EnvStatus | null>(null);
  const [changes, setChanges] = useState<Record<string, string>>({});
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>(
    {}
  );
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [backups, setBackups] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"variables" | "backups">(
    "variables"
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch environment status and variables
  useEffect(() => {
    fetchEnvironmentData();
  }, []);

  const fetchEnvironmentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch status
      const statusResponse = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/environment/status`
      );
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setStatus(statusData);
      }

      // Fetch variables
      const varsResponse = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/environment/variables`
      );
      if (varsResponse.ok) {
        const varsData = await varsResponse.json();
        setCategories(varsData.categories || []);
      } else {
        throw new Error("Failed to fetch environment variables");
      }

      // Fetch backups
      const backupsResponse = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/environment/backups`
      );
      if (backupsResponse.ok) {
        const backupsData = await backupsResponse.json();
        setBackups(backupsData.backups || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleVariableChange = (key: string, value: string) => {
    setChanges((prev) => ({ ...prev, [key]: value }));

    // Clear validation when user makes changes
    if (validation) {
      setValidation(null);
    }
  };

  const validateChanges = async (): Promise<boolean> => {
    try {
      // Create variables object with current values plus changes
      const variables: Record<string, string> = {};
      categories.forEach((category) => {
        category.variables.forEach((variable) => {
          variables[variable.key] =
            changes[variable.key] !== undefined
              ? changes[variable.key]
              : variable.value;
        });
      });

      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/environment/validate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variables }),
        }
      );

      const result = await response.json();
      setValidation(result);
      return result.valid;
    } catch (err) {
      setError(
        "Validation failed: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
      return false;
    }
  };

  const saveChanges = async () => {
    if (Object.keys(changes).length === 0) {
      setError("No changes to save");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Validate first
      const isValid = await validateChanges();
      if (!isValid) {
        setError("Please fix validation errors before saving");
        return;
      }

      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/environment/variables`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variables: changes }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setSuccess("Environment variables updated successfully!");
        setChanges({});

        if (result.restartRecommended) {
          setSuccess(
            "Environment variables updated successfully! Restart recommended for critical changes."
          );
        }

        // Refresh data
        await fetchEnvironmentData();
      } else {
        throw new Error(result.error || "Failed to save changes");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const toggleSensitiveVisibility = (key: string) => {
    setShowSensitive((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess("Copied to clipboard!");
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  const createEnvFile = async (template: string = "basic") => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/environment/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ template }),
        }
      );

      const result = await response.json();
      if (result.success) {
        setSuccess("Environment file created successfully!");
        await fetchEnvironmentData();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const restoreBackup = async (backupName: string) => {
    if (
      !confirm(
        `Are you sure you want to restore from ${backupName}? This will overwrite your current .env file.`
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/environment/restore/${backupName}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();
      if (result.success) {
        setSuccess("Successfully restored from backup!");
        await fetchEnvironmentData();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    const icons: Record<string, any> = {
      Application: Globe,
      Database: Database,
      Security: Shield,
      Email: Mail,
      Payment: CreditCard,
      OAuth: Key,
      "File Storage": FileText,
      Development: Server,
    };
    return icons[categoryName] || SettingsIcon;
  };

  const getStatusColor = (statusValue: string) => {
    const colors: Record<string, string> = {
      complete: "text-green-600 bg-green-100",
      partial: "text-yellow-600 bg-yellow-100",
      incomplete: "text-red-600 bg-red-100",
    };
    return colors[statusValue] || "text-gray-600 bg-gray-100";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Environment Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your application&apos;s environment variables and
            configuration
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              window.open("https://docs.mega-pdf.com/configuration", "_blank")
            }
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Documentation
          </button>
          {Object.keys(changes).length > 0 && (
            <button
              onClick={saveChanges}
              disabled={saving}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes ({Object.keys(changes).length})
            </button>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-destructive/15 border border-destructive/20 text-destructive px-4 py-3 rounded-md flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-md flex items-center">
          <CheckCircle className="h-4 w-4 mr-2" />
          {success}
        </div>
      )}

      {/* Status Overview */}
      {status && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Configuration Status</h2>
            <span
              className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(
                status.status
              )}`}
            >
              {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {status.configured}
              </div>
              <div className="text-sm text-muted-foreground">Configured</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {status.total}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Variables
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {status.requiredMissing?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Required Missing
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {status.backupCount}
              </div>
              <div className="text-sm text-muted-foreground">
                Backups Available
              </div>
            </div>
          </div>
          {!status.fileExists && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800 font-medium">No .env file found</p>
              <p className="text-yellow-700 text-sm mt-1">
                Create a new .env file to get started with your configuration.
              </p>
              <div className="mt-3 space-x-2">
                <button
                  onClick={() => createEnvFile("development")}
                  className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                >
                  Create Development Config
                </button>
                <button
                  onClick={() => createEnvFile("production")}
                  className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                >
                  Create Production Config
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("variables")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "variables"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            }`}
          >
            Environment Variables
          </button>
          <button
            onClick={() => setActiveTab("backups")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "backups"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            }`}
          >
            Backups & Restore
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === "variables" && (
        <div className="space-y-6">
          {/* Validation Results */}
          {validation && (
            <div
              className={`border rounded-md p-4 ${
                validation.valid
                  ? "bg-green-50 border-green-200"
                  : "bg-destructive/15 border-destructive/20"
              }`}
            >
              <div className="flex items-center">
                {validation.valid ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
                )}
                <h3 className="font-medium">
                  {validation.valid ? "Validation Passed" : "Validation Failed"}
                </h3>
              </div>
              {validation.error && (
                <p className="mt-2 text-sm text-destructive">
                  {validation.error}
                </p>
              )}
              {validation.warnings && validation.warnings.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-yellow-800">
                    Warnings:
                  </p>
                  <ul className="mt-1 text-sm text-yellow-700 space-y-1">
                    {validation.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Categories */}
          {categories.map((category) => {
            const IconComponent = getCategoryIcon(category.name);
            return (
              <div
                key={category.name}
                className="bg-card border border-border rounded-lg overflow-hidden"
              >
                <div className="border-b border-border px-6 py-4">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-xl font-semibold">{category.name}</h2>
                  </div>
                  {category.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {category.description}
                    </p>
                  )}
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {category.variables.map((variable) => {
                      const currentValue =
                        changes[variable.key] !== undefined
                          ? changes[variable.key]
                          : variable.value || "";
                      const isChanged = changes[variable.key] !== undefined;
                      const isVisible =
                        !variable.sensitive || showSensitive[variable.key];

                      return (
                        <div key={variable.key} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium">
                              {variable.key}
                              {variable.required && (
                                <span className="text-destructive ml-1">*</span>
                              )}
                              {isChanged && (
                                <span className="text-primary ml-1">
                                  (modified)
                                </span>
                              )}
                            </label>
                            <div className="flex items-center space-x-2">
                              {variable.sensitive && (
                                <button
                                  onClick={() =>
                                    toggleSensitiveVisibility(variable.key)
                                  }
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  {isVisible ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              )}
                              {currentValue && (
                                <button
                                  onClick={() => copyToClipboard(currentValue)}
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          {variable.description && (
                            <p className="text-xs text-muted-foreground">
                              {variable.description}
                            </p>
                          )}
                          <div className="relative">
                            <input
                              type={isVisible ? "text" : "password"}
                              value={currentValue}
                              onChange={(e) =>
                                handleVariableChange(
                                  variable.key,
                                  e.target.value
                                )
                              }
                              placeholder={variable.example || ""}
                              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                                isChanged
                                  ? "border-primary bg-primary/5"
                                  : "border-border"
                              }`}
                            />
                          </div>
                          {variable.example && !currentValue && (
                            <p className="text-xs text-muted-foreground">
                              Example: {variable.example}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "backups" && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <History className="h-5 w-5" />
              Backup Management
            </h2>
            <button
              onClick={fetchEnvironmentData}
              className="px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {backups.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No backups available</p>
              <p className="text-muted-foreground text-sm">
                Backups are created automatically when you save changes
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {backups.map((backup) => (
                <div
                  key={backup}
                  className="flex items-center justify-between p-3 border border-border rounded-md"
                >
                  <div>
                    <p className="font-medium">{backup}</p>
                    <p className="text-sm text-muted-foreground">
                      {backup.includes("_")
                        ? new Date(
                            backup
                              .split("_")[1]
                              ?.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3") ||
                              ""
                          ).toLocaleDateString()
                        : "Unknown date"}
                    </p>
                  </div>
                  <button
                    onClick={() => restoreBackup(backup)}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
