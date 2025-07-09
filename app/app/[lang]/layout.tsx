// app/[lang]/layout.tsx
import type React from "react";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/footer";
import { ProHeader } from "@/components/pro-header";
import { notFound } from "next/navigation";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import "../globals.css";
import { Analytics } from "@/lib/analytics";

// Import language configuration
import { SUPPORTED_LANGUAGES, getTranslation } from "@/src/lib/i18n/config";
import { CookieConsentBanner } from "@/components/cookie-banner-component";
import { getBrandingData } from "@/lib/branding-server";
import { BrandingProvider } from "@/src/context/branding-context";

// Font configuration - optimize with display: swap
export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap", // This improves performance by allowing text to display in fallback font while loading
});

// For static generation of all language variants
export function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map((lang) => ({ lang }));
}

// Generate metadata based on language parameter and branding data
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  // Await the params object before accessing its properties
  const { lang } = await params;

  // Validate language parameter
  if (!SUPPORTED_LANGUAGES.includes(lang)) {
    notFound();
  }

  // Create a translation function similar to t()
  const t = (key: string) => getTranslation(lang, key);

  // Fetch branding data for metadata
  const branding = await getBrandingData();

  // Use branding data for SEO metadata, with translation fallbacks
  const metaTitle = branding.seo.metaTitle || t("metadata.title");
  const metaDescription =
    branding.seo.metaDescription || t("metadata.description");
  const ogTitle = branding.seo.ogTitle || metaTitle;
  const ogDescription = branding.seo.ogDescription || metaDescription;
  const ogImage =
    branding.seo.ogImage ||
    `${process.env.NEXT_PUBLIC_APP_URL || "https://mega-pdf.com"}/og-image.png`;

  return {
    title: {
      default: metaTitle,
      template: `%s | ${branding.appName}`,
    },
    description: metaDescription,
    keywords:
      branding.seo.metaKeywords.length > 0
        ? branding.seo.metaKeywords
        : t("metadata.keywords"),

    // Open Graph metadata
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [{ url: ogImage, alt: branding.logoAltText }] : [],
      siteName: branding.appName,
      type: "website",
      locale: lang,
    },

    // Twitter metadata
    twitter: {
      card: (branding.seo.twitterCard as any) || "summary_large_image",
      site: branding.seo.twitterSite || undefined,
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : [],
    },

    // Dynamic favicon and icons
    icons: {
      icon: [
        { url: branding.faviconUrl || "/favicon/favicon.ico" },
        {
          url: branding.iconUrl || "/favicon/favicon-16x16.png",
          sizes: "16x16",
          type: "image/png",
        },
        {
          url: branding.iconUrl || "/favicon/favicon-32x32.png",
          sizes: "32x32",
          type: "image/png",
        },
        {
          url: branding.iconUrl || "/favicon/favicon-96x96.png",
          sizes: "96x96",
          type: "image/png",
        },
      ],
      apple: [
        {
          url:
            branding.iconUrl ||
            branding.faviconUrl ||
            "/favicon/apple-icon.png",
        },
        {
          url: branding.iconUrl || "/favicon/apple-icon-57x57.png",
          sizes: "57x57",
        },
        {
          url: branding.iconUrl || "/favicon/apple-icon-60x60.png",
          sizes: "60x60",
        },
        {
          url: branding.iconUrl || "/favicon/apple-icon-72x72.png",
          sizes: "72x72",
        },
        {
          url: branding.iconUrl || "/favicon/apple-icon-76x76.png",
          sizes: "76x76",
        },
        {
          url: branding.iconUrl || "/favicon/apple-icon-114x114.png",
          sizes: "114x114",
        },
        {
          url: branding.iconUrl || "/favicon/apple-icon-120x120.png",
          sizes: "120x120",
        },
        {
          url: branding.iconUrl || "/favicon/apple-icon-144x144.png",
          sizes: "144x144",
        },
        {
          url: branding.iconUrl || "/favicon/apple-icon-152x152.png",
          sizes: "152x152",
        },
        {
          url: branding.iconUrl || "/favicon/apple-icon-180x180.png",
          sizes: "180x180",
        },
      ],
    },
    manifest: "/favicon/manifest.json",
    other: {
      "msapplication-TileImage":
        branding.iconUrl || "/favicon/ms-icon-144x144.png",
      "msapplication-config": "/favicon/browserconfig.xml",
      "theme-color": "#ffffff",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "default",
      "mobile-web-app-capable": "yes",
    },
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_APP_URL || "https://mega-pdf.com"
    ),
    alternates: {
      canonical: branding.seo.canonicalUrl || `/${lang}`,
      languages: Object.fromEntries(
        SUPPORTED_LANGUAGES.map((code) => [code, `/${code}`])
      ),
    },
  };
}

export default async function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  // Await the params object before accessing its properties
  const { lang } = await params;

  // Validate language parameter
  if (!SUPPORTED_LANGUAGES.includes(lang)) {
    notFound();
  }
  const isRTL = lang === "ar";

  return (
    <html lang={lang} dir={isRTL ? "rtl" : "ltr"} suppressHydrationWarning>
      <head></head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <BrandingProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="relative flex min-h-screen flex-col">
              <ProHeader urlLanguage={lang} />
              <div className="flex-1 mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8">
                {children}
              </div>
              <Footer />
            </div>
            <Toaster />
            <CookieConsentBanner />
          </ThemeProvider>
        </BrandingProvider>
        {/* Place Analytics component at the end of body for better performance */}
        <Analytics />
      </body>
    </html>
  );
}
