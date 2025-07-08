"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, Calculator, LoaderCircle } from "lucide-react";
import { useLanguageStore } from "@/src/store/store";
import { LanguageLink } from "@/components/language-link";
import { Slider } from "@/components/ui/slider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/src/context/auth-context";
import { toast } from "sonner";

export function PricingContent() {
  const { t } = useLanguageStore();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [operationsEstimate, setOperationsEstimate] = useState(2000);
  const [depositAmount, setDepositAmount] = useState(10);
  const [pricingLoading, setPricingLoading] = useState(true);
  const [pricing, setPricing] = useState({
    operationCost: 0.005, // Default operation cost (fallback only)
    freeOperationsMonthly: 500, // Default free operations monthly (fallback only)
    customPrices: {}, // Custom prices for specific operations
  });

  // Fetch pricing information from API
  useEffect(() => {
    async function fetchPricing() {
      try {
        setPricingLoading(true);
        console.log("Fetching pricing from API..."); // Debug log

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/pricing`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          console.warn(`API request failed with status ${response.status}`);
          toast.error("Failed to fetch current pricing. Using default values.");
          return;
        }

        const data = await response.json();
        console.log("Received pricing data:", data); // Debug log

        // ✅ FIXED: Updated to match new API response format
        if (data && typeof data.operationCost === "number") {
          const newPricing = {
            operationCost: data.operationCost,
            freeOperationsMonthly: data.freeOperationsMonthly || 500,
            customPrices: data.customPrices || {},
          };

          console.log("Setting new pricing:", newPricing); // Debug log
          setPricing(newPricing);

          // Recalculate deposit based on new operation cost
          setDepositAmount(
            calculateDeposit(operationsEstimate, newPricing.operationCost)
          );

          // Show success message if pricing loaded from database
          if (data.source === "database") {
            console.log("✅ Pricing loaded from database successfully");
          } else {
            console.warn("⚠️ Using fallback pricing values");
          }
        } else {
          console.error("Invalid pricing data structure:", data);
          toast.error("Invalid pricing data received. Using default values.");
        }
      } catch (error) {
        console.error("Error fetching pricing:", error);
        toast.error(
          "Failed to load pricing information. Using default values."
        );
      } finally {
        setPricingLoading(false);
      }
    }

    fetchPricing();
  }, []);

  // Calculate deposit needed for operations
  const calculateDeposit = (
    operations: number,
    cost: number = pricing.operationCost
  ) => {
    return Math.ceil(operations * cost);
  };

  // Update deposit based on operations
  const handleOperationsChange = (value: number[]) => {
    const operations = value[0];
    setOperationsEstimate(operations);
    setDepositAmount(calculateDeposit(operations));
  };

  // Handle get started action
  const handleGetStarted = () => {
    if (isLoading) return; // Prevent action during loading

    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }

    router.push("/en/dashboard");
  };

  // Pricing features (now dynamic)
  const features = [
    `${pricing.freeOperationsMonthly} free operations every month`,
    `Pay-as-you-go pricing at $${pricing.operationCost.toFixed(
      3
    )} per operation`,
    "No subscription, no recurring fees",
    "Unused balance never expires",
    "Only pay for what you use",
    "Top up your balance anytime",
    "All PDF tools included",
    "Full API access",
  ];

  return (
    <div className="py-10 px-4 bg-background">
      <div className="mx-auto max-w-3xl text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight">
          {t("pricing.title") || "Simple, transparent pricing"}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Pay only for what you use, with no monthly subscriptions.
        </p>
      </div>

      <div className="mx-auto max-w-3xl">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Pay-As-You-Go</CardTitle>
              <Badge className="px-3 py-1">Most Flexible</Badge>
            </div>
            {pricingLoading ? (
              <div className="flex items-center space-x-2">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                <span>Loading pricing...</span>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold">
                  ${pricing.operationCost.toFixed(3)}
                </div>
                <div className="text-sm text-muted-foreground">
                  per operation
                </div>
              </>
            )}
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm mb-6">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="bg-muted p-4 rounded-lg mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium flex items-center">
                  <Calculator className="h-4 w-4 mr-2" />
                  Estimate Your Costs
                </h3>
                <div className="text-sm font-bold">
                  {operationsEstimate.toLocaleString()} operations
                </div>
              </div>

              <Slider
                defaultValue={[2000]}
                min={500}
                max={10000}
                step={100}
                onValueChange={handleOperationsChange}
                className="mb-4"
              />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Monthly Free:</div>
                  <div className="font-medium">
                    {pricing.freeOperationsMonthly.toLocaleString()} operations
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Additional:</div>
                  <div className="font-medium">
                    {Math.max(
                      0,
                      operationsEstimate - pricing.freeOperationsMonthly
                    ).toLocaleString()}{" "}
                    operations
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Cost:</div>
                  <div className="font-medium">
                    $
                    {Math.max(
                      0,
                      (operationsEstimate - pricing.freeOperationsMonthly) *
                        pricing.operationCost
                    ).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">
                    Recommended Deposit:
                  </div>
                  <div className="font-medium">${depositAmount.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleGetStarted}
              disabled={isLoading || pricingLoading}
            >
              {isLoading || pricingLoading
                ? "Loading..."
                : isAuthenticated
                ? "Add Funds to Account"
                : "Get Started"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mx-auto max-w-3xl text-center mt-10">
        <h2 className="text-2xl font-bold">
          {t("pricing.cta.title") || "Ready to get started?"}
        </h2>
        <p className="mt-2 text-muted-foreground">
          Create an account and get {pricing.freeOperationsMonthly} free
          operations every month.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Button
            size="lg"
            onClick={handleGetStarted}
            disabled={isLoading || pricingLoading}
          >
            {isLoading || pricingLoading
              ? "Loading..."
              : isAuthenticated
              ? "Go to Dashboard"
              : "Create Account"}
          </Button>
          <LanguageLink href="/pdf-tools">
            <Button variant="outline" size="lg">
              {t("pricing.cta.explorePdfTools") || "Explore PDF Tools"}
            </Button>
          </LanguageLink>
        </div>
      </div>

      {showLoginDialog && (
        <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("pricing.loginRequired") || "Sign in required"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Create an account to get {pricing.freeOperationsMonthly} free
                operations every month and add funds as needed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {t("common.cancel") || "Cancel"}
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <LanguageLink href={`/login?callbackUrl=/pricing`}>
                  <Button>{t("auth.signIn") || "Sign In"}</Button>
                </LanguageLink>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
