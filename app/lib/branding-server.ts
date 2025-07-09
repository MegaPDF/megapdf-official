import { BrandingData } from "@/src/context/branding-context";


// Cache for branding data to avoid frequent API calls
let brandingCache: {
  data: BrandingData | null;
  timestamp: number;
  ttl: number;
} = {
  data: null,
  timestamp: 0,
  ttl: 5 * 60 * 1000, // 5 minutes cache
};

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
    metaDescription: "Professional PDF tools for converting, merging, splitting, and editing PDF documents.",
    metaKeywords: ["PDF", "tools", "convert", "merge", "split", "compress", "online"],
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
      { title: "API", url: "/api-docs" }
    ],
    legalLinks: [
      { title: "Privacy Policy", url: "/privacy" },
      { title: "Terms of Service", url: "/terms" },
      { title: "Cookie Policy", url: "/cookies" }
    ],
    showBranding: true,
    customText: "",
  },
};

export async function getBrandingData(
  apiUrl: string = "http://localhost:8080/api/branding/branding"
): Promise<BrandingData> {
  // Check cache first
  const now = Date.now();
  if (brandingCache.data && (now - brandingCache.timestamp) < brandingCache.ttl) {
    return brandingCache.data;
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-cache',
      // Add timeout for server-side requests
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch branding: ${response.status} ${response.statusText}`);
    }

    const data: BrandingData = await response.json();
    
    // Update cache
    brandingCache = {
      data,
      timestamp: now,
      ttl: brandingCache.ttl,
    };

    return data;
  } catch (error) {
    console.error('Error fetching branding data on server:', error);
    
    // Return cached data if available, otherwise default
    if (brandingCache.data) {
      return brandingCache.data;
    }
    
    return defaultBranding;
  }
}

export function clearBrandingCache() {
  brandingCache.data = null;
  brandingCache.timestamp = 0;
}