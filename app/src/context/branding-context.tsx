// lib/branding-context.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export interface BrandingData {
  appName: string;
  appDescription: string;
  appTagline: string;
  logoUrl: string;
  logoAltText: string;
  faviconUrl: string;
  iconUrl: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string[];
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    twitterCard: string;
    twitterSite: string;
    canonicalUrl: string;
  };
  socialMedia: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
    youtube: string;
    github: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
    supportUrl: string;
    documentationUrl: string;
  };
  footer: {
    companyName: string;
    copyright: string;
    links: Array<{
      title: string;
      url: string;
    }>;
    legalLinks: Array<{
      title: string;
      url: string;
    }>;
    showBranding: boolean;
    customText: string;
  };
}

// Default fallback branding data
const defaultBranding: BrandingData = {
  appName: "MegaPDF",
  appDescription: "Professional PDF tools and document processing platform",
  appTagline: "Transform your PDFs with ease",
  logoUrl: "/logo.png",
  logoAltText: "MegaPDF Logo",
  faviconUrl: "/favicon.ico",
  iconUrl: "/icon.png",
  seo: {
    metaTitle: "MegaPDF - Professional PDF Tools",
    metaDescription:
      "Professional PDF tools for converting, merging, splitting, and editing PDF documents.",
    metaKeywords: [
      "PDF",
      "tools",
      "convert",
      "merge",
      "split",
      "compress",
      "online",
    ],
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterCard: "",
    twitterSite: "",
    canonicalUrl: "",
  },
  socialMedia: {
    facebook: "",
    twitter: "",
    linkedin: "",
    instagram: "",
    youtube: "",
    github: "",
  },
  contact: {
    email: "hello@megapdf.com",
    phone: "",
    address: "",
    supportUrl: "",
    documentationUrl: "",
  },
  footer: {
    companyName: "MegaPDF",
    copyright: "© 2024 MegaPDF. All rights reserved.",
    links: [
      { title: "About", url: "/about" },
      { title: "Features", url: "/features" },
      { title: "Pricing", url: "/pricing" },
      { title: "API", url: "/api-docs" },
    ],
    legalLinks: [
      { title: "Privacy Policy", url: "/privacy" },
      { title: "Terms of Service", url: "/terms" },
      { title: "Cookie Policy", url: "/cookies" },
    ],
    showBranding: true,
    customText: "",
  },
};

interface BrandingContextType {
  branding: BrandingData;
  loading: boolean;
  error: string | null;
  refreshBranding: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType | undefined>(
  undefined
);

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return context;
};

interface BrandingProviderProps {
  children: ReactNode;
  apiUrl?: string;
}

export const BrandingProvider: React.FC<BrandingProviderProps> = ({
  children,
  apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/branding/branding`,
}) => {
  const [branding, setBranding] = useState<BrandingData>(defaultBranding);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBranding = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Add cache busting to ensure fresh data
        cache: "no-cache",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch branding: ${response.status} ${response.statusText}`
        );
      }

      const data: BrandingData = await response.json();
      setBranding(data);

      // Update favicon dynamically
      if (data.faviconUrl) {
        updateFavicon(data.faviconUrl);
      }
    } catch (err) {
      console.error("Error fetching branding data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load branding data"
      );
      // Keep using default branding on error
      setBranding(defaultBranding);
    } finally {
      setLoading(false);
    }
  };

  const updateFavicon = (faviconUrl: string) => {
    try {
      // Remove existing favicon links
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      existingFavicons.forEach((link) => link.remove());

      // Add new favicon
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = faviconUrl;
      document.head.appendChild(link);

      // Also update apple touch icon if needed
      const appleLink = document.createElement("link");
      appleLink.rel = "apple-touch-icon";
      appleLink.href = faviconUrl;
      document.head.appendChild(appleLink);
    } catch (err) {
      console.error("Error updating favicon:", err);
    }
  };

  useEffect(() => {
    fetchBranding();

    // Set up periodic refresh (every 5 minutes)
    const interval = setInterval(fetchBranding, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [apiUrl]);

  const refreshBranding = async () => {
    await fetchBranding();
  };

  const contextValue: BrandingContextType = {
    branding,
    loading,
    error,
    refreshBranding,
  };

  return (
    <BrandingContext.Provider value={contextValue}>
      {children}
    </BrandingContext.Provider>
  );
};
