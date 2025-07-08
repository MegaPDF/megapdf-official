// components/dashboard/usage-stats.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useLanguageStore } from "@/src/store/store";

interface UsageStatsProps {
  user: any;
  usageStats?: {
    totalOperations?: number;
    operationCounts?: Record<string, number>;
  };
}
const formatLargeNumber = (num: number) => {
  if (num >= 1_000_000_000_000) {
    return `${(num / 1_000_000_000_000).toFixed(1)}T`; // Trillions
  } else if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`; // Billions
  } else if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`; // Millions
  } else {
    return num.toLocaleString(); // Use commas for smaller numbers
  }
};
export function UsageStats({ user, usageStats }: UsageStatsProps) {
  const { t } = useLanguageStore();
  const [chartData, setChartData] = useState<any[]>([]);

  // Constants for usage tracking
  const FREE_OPERATIONS_MONTHLY = 500;
  const OPERATION_COST = 0.005;

  // Calculate free operations remaining
  const freeOperationsRemaining = Math.max(
    0,
    FREE_OPERATIONS_MONTHLY - (user.freeOperationsUsed || 0)
  );

  // Calculate usage percentage
  const freeOpsPercentage = Math.min(
    Math.round(
      ((user.freeOperationsUsed || 0) / FREE_OPERATIONS_MONTHLY) * 100
    ),
    100
  );

  // Calculate operations coverage with current balance
  const operationsCoverage = Math.floor((user.balance || 0) / OPERATION_COST);

  // Format operation name for display
  const formatOperation = (op: string): string => {
    if (!op || op === "None") return op;

    // Special case for operations that might be abbreviations
    if (op.toLowerCase() === "ocr") return "OCR";
    if (op.toLowerCase() === "pdf") return "PDF";

    // Default formatting: capitalize first letter
    return op.charAt(0).toUpperCase() + op.slice(1);
  };

  // Format percentage
  const formatPercentage = (value: number, total: number): string => {
    if (total === 0) return "0%";
    return `${Math.round((value / total) * 100)}% of total usage`;
  };

  // Format date for display
  const formatDate = (dateString: string | Date | null | undefined): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Get total operations safely
  const totalOperations =
    typeof usageStats?.totalOperations === "number"
      ? usageStats.totalOperations
      : 0;

  // Prepare chart data
  useEffect(() => {
    if (
      usageStats?.operationCounts &&
      typeof usageStats.operationCounts === "object"
    ) {
      try {
        const data = Object.entries(usageStats.operationCounts).map(
          ([operation, count]) => ({
            name: formatOperation(operation),
            value: count,
          })
        );
        setChartData(data);
      } catch (error) {
        console.error("Error preparing chart data:", error);
        setChartData([]);
      }
    } else {
      setChartData([]);
    }
  }, [usageStats]);

  // Get the most used operation
  const getMostUsedOperation = (): { operation: string; count: number } => {
    if (
      !usageStats?.operationCounts ||
      Object.keys(usageStats.operationCounts).length === 0
    ) {
      return { operation: t("dashboard.none") || "None", count: 0 };
    }

    try {
      const entries = Object.entries(usageStats.operationCounts);
      if (entries.length === 0)
        return { operation: t("dashboard.none") || "None", count: 0 };

      // Filter out any entries where the operation name is "pdf" (case insensitive)
      const validEntries = entries.filter(
        ([op, _]) => op.toLowerCase() !== "pdf"
      );

      if (validEntries.length === 0)
        return { operation: t("dashboard.none") || "None", count: 0 };

      // Sort operations by count in descending order and get the top one
      const [operation, count] = validEntries.sort((a, b) => b[1] - a[1])[0];
      return { operation, count: count as number };
    } catch (error) {
      console.error("Error getting most used operation:", error);
      return { operation: t("dashboard.none") || "None", count: 0 };
    }
  };

  const mostUsed = getMostUsedOperation();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.totalUsage") || "Total Usage"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOperations}</div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.operationsThisMonth") || "Operations this month"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("balancePanel.title.freeOperations") || "Free Operations"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {freeOperationsRemaining} / {FREE_OPERATIONS_MONTHLY}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("balancePanel.description.resetsOn").replace(
                "{date}",
                formatDate(user.freeOperationsReset)
              ) || `Resets on ${formatDate(user.freeOperationsReset)}`}
            </p>
            <Progress value={freeOpsPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("balancePanel.table.balance") || "Balance"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${user.balance}</div>

            <p className="text-xs text-muted-foreground">
              {t("balancePanel.title.operationsCoverage") || "Covers"}{" "}
              {formatLargeNumber(Math.floor(operationsCoverage / 0.005))}{" "}
              {t("dashboard.operations") || "operations"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.mostUsed") || "Most Used"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mostUsed.operation !== "None"
                ? formatOperation(mostUsed.operation)
                : mostUsed.operation}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(mostUsed.count, totalOperations)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("dashboard.usageByOperation") || "Usage By Operation"}
          </CardTitle>
          <CardDescription>
            {t("dashboard.apiUsageBreakdown") || "API usage breakdown"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">
                  {t("dashboard.noData") || "No data available"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
