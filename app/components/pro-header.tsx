// components/pro-header.tsx
"use client";
import { useState, useEffect } from "react";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type React from "react";
import Link from "next/link";
import Image from "next/image";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  HamburgerMenuIcon,
  Cross1Icon,
  ChevronDownIcon,
  MobileIcon,
  ChatBubbleIcon,
} from "@radix-ui/react-icons";
import {
  FileText,
  Image as ImageIcon,
  Table,
  ArrowRight,
  ArrowDown,
  Shield,
  Lock,
  Download,
  Apple,
  FileBoxIcon,
  FileCheck2,
  PenTool,
  ScanFace,
  ScanEyeIcon,
} from "lucide-react";
import { useLanguageStore } from "@/src/store/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LanguageLink } from "./language-link";
import { LanguageSwitcher } from "./language-switcher";
import { LogoutButton } from "./auth/logout-button";
import { LineShadowText } from "@/src/components/magicui/line-shadow-text";
import { useTheme } from "next-themes";
import { useAuth } from "@/src/context/auth-context";
import { useBranding } from "@/src/context/branding-context";

type ToolDefinition = {
  name: string;
  href: string;
  icon: React.ReactNode;
  description: string;
};

type CategoryDefinition = {
  category: string;
  description: string;
  tools: ToolDefinition[];
};

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

interface ProHeaderProps {
  urlLanguage: string;
}

export function ProHeader({ urlLanguage }: ProHeaderProps) {
  const theme = useTheme();
  const { language, setLanguage, t } = useLanguageStore();
  const { branding, loading, error } = useBranding();
  const { isAuthenticated, user, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showAppBanner, setShowAppBanner] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const shadowColor = theme.resolvedTheme === "dark" ? "white" : "black";

  useEffect(() => {
    setIsClient(true);
    if (urlLanguage && urlLanguage !== language) {
      useLanguageStore.setState({ language: urlLanguage as any });
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [urlLanguage, language]);

  const userMenu = isLoading ? (
    <Button variant="ghost" size="sm" disabled>
      Loading...
    </Button>
  ) : isAuthenticated && user ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
            {user.name
              ? user.name.charAt(0).toUpperCase()
              : user.email?.charAt(0).toUpperCase()}
          </div>
          {user.name || user.email}
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem>
          <Link href="/dashboard" className="flex w-full">
            {t("nav.dashboard") || "Dashboard"}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/profile" className="flex w-full">
            {t("nav.profile") || "Profile"}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <LogoutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <div className="flex items-center gap-2">
      <LanguageLink href="/login">
        <Button variant="ghost" size="sm">
          {t("nav.login") || "Sign In"}
        </Button>
      </LanguageLink>
      <LanguageLink href="/register">
        <Button size="sm">{t("nav.signup") || "Sign Up"}</Button>
      </LanguageLink>
    </div>
  );

  const PDF_TOOLS: CategoryDefinition[] = [
    {
      category: t("pdfTools.categories.convertFromPdf") || "Convert PDF",
      description: "Convert PDF files to various formats",
      tools: [
        {
          name: t("popular.pdfToJpg"),
          href: "/pdf-to-jpg",
          icon: <ImageIcon className="h-5 w-5 text-blue-500" />,
          description: t("popular.pdfToJpgDesc"),
        },
        {
          name: t("popular.pdfToWord"),
          href: "/pdf-to-word",
          icon: <FileText className="h-5 w-5 text-blue-500" />,
          description: t("popular.pdfToWordDesc"),
        },
        {
          name: t("popular.pdfToExcel"),
          href: "/pdf-to-excel",
          icon: <Table className="h-5 w-5 text-green-500" />,
          description: t("popular.pdfToExcelDesc"),
        },
        {
          name: t("popular.pdfToPpt"),
          href: "/pdf-to-ppt",
          icon: <FileBoxIcon className="h-5 w-5 text-orange-500" />,
          description: t("popular.pdfToPptDesc"),
        },
      ],
    },
    {
      category: t("pdfTools.categories.organizePdf") || "PDF Management",
      description: "Organize and manage your PDF files",
      tools: [
        {
          name: t("popular.mergePdf"),
          href: "/merge-pdf",
          icon: <ArrowDown className="h-5 w-5 text-green-500" />,
          description: t("popular.mergePdfDesc"),
        },
        {
          name: t("popular.splitPdf"),
          href: "/split-pdf",
          icon: <ArrowRight className="h-5 w-5 text-red-500" />,
          description: t("popular.splitPdfDesc"),
        },
        {
          name: t("popular.compressPdf"),
          href: "/compress-pdf",
          icon: <Download className="h-5 w-5 text-blue-500" />,
          description: t("popular.compressPdfDesc"),
        },
        {
          name: t("popular.rotatePdf"),
          href: "/rotate",
          icon: <ArrowRight className="h-5 w-5 rotate-45 text-blue-500" />,
          description: t("popular.rotatePdfDesc"),
        },
      ],
    },
    {
      category: t("pdfTools.categories.pdfSecurity") || "PDF Security",
      description: "Protect and manage PDF access",
      tools: [
        {
          name: t("popular.unlockPdf"),
          href: "/unlock-pdf",
          icon: <Lock className="h-5 w-5 text-blue-500" />,
          description: t("popular.unlockPdfDesc"),
        },
        {
          name: t("popular.protectPdf"),
          href: "/protect-pdf",
          icon: <Shield className="h-5 w-5 text-blue-500" />,
          description: t("popular.protectPdfDesc"),
        },
        {
          name: t("popular.signPdf"),
          href: "/sign-pdf",
          icon: <PenTool className="h-5 w-5 text-green-500" />,
          description: t("popular.signPdfDesc"),
        },
        {
          name: t("popular.ocr"),
          href: "/ocr",
          icon: <FileCheck2 className="h-5 w-5 text-blue-500" />,
          description: t("popular.ocrDesc"),
        },
      ],
    },
  ];

  const navItems = [
    {
      label: t("nav.convertPdf"),
      dropdown: PDF_TOOLS.filter(
        (cat) =>
          cat.category ===
          (isClient ? t("pdfTools.categories.convertFromPdf") : "Convert PDF")
      ),
    },
    {
      label: t("pdfTools.categories.organizePdf"),
      dropdown: PDF_TOOLS.filter(
        (cat) =>
          cat.category ===
          (isClient ? t("pdfTools.categories.organizePdf") : "PDF Management")
      ),
    },
    {
      label: t("pdfTools.categories.pdfSecurity"),
      dropdown: PDF_TOOLS.filter(
        (cat) =>
          cat.category ===
          (isClient ? t("pdfTools.categories.pdfSecurity") : "PDF Security")
      ),
    },
  ];

  // Show loading skeleton for logo area if branding is loading
  const LogoComponent = () => {
    if (loading) {
      return (
        <div className="flex items-center gap-2">
          <div className="animate-pulse">
            <div className="h-8 w-8 bg-gray-300 rounded"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-6 w-24 bg-gray-300 rounded"></div>
          </div>
        </div>
      );
    }

    return (
      <LanguageLink href="/" className="flex items-center gap-2">
        {branding.logoUrl && (
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL || ""}${branding.logoUrl}`}
            alt={branding.logoAltText}
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
        )}
        <span className="font-bold text-xl flex items-center gap-1">
          <span className="text-balance text-3xl font-semibold leading-none tracking-tighter sm:text-4xl md:text-4xl lg:text-2xl">
            <LineShadowText className="italic" shadowColor={shadowColor}>
              {branding.appName}
            </LineShadowText>
          </span>
        </span>
      </LanguageLink>
    );
  };

  return (
    <>
      {/* App Download Banner */}
      {showAppBanner && (
        <div className="bg-primary text-primary-foreground px-4 py-2 text-center text-sm relative">
          <div className="flex items-center justify-center gap-2">
            <MobileIcon className="h-4 w-4" />
            <span>
              {t("header.downloadApp") ||
                "Download our mobile app for iOS and Android"}
            </span>
            <Button
              variant="secondary"
              size="sm"
              className="ml-2 h-6 px-2 text-xs"
            >
              {t("header.getApp") || "Get App"}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => setShowAppBanner(false)}
          >
            <Cross1Icon className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 bg-gradient-to-r from-background/95 to-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${
          scrolled ? "shadow-sm" : "border-b"
        } transition-all duration-200`}
      >
        <div className="container max-w-6xl mx-auto flex h-16 items-center justify-between py-4 px-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <LogoComponent />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {/* Navigation items with dropdowns */}
            {navItems.map((item, index) => (
              <DropdownMenu key={index}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-1">
                    {item.label}
                    <ChevronDownIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 p-4">
                  {item.dropdown.map((category, catIndex) => (
                    <div key={catIndex} className="mb-4 last:mb-0">
                      <h4 className="font-medium mb-2 text-sm">
                        {category.category}
                      </h4>
                      <div className="grid gap-1">
                        {category.tools.map((tool, toolIndex) => (
                          <DropdownMenuItem key={toolIndex} asChild>
                            <LanguageLink
                              href={tool.href}
                              className="flex items-center gap-3 p-2 rounded-md hover:bg-muted"
                            >
                              {tool.icon}
                              <div>
                                <div className="font-medium text-sm">
                                  {tool.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {tool.description}
                                </div>
                              </div>
                            </LanguageLink>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}

            {/* Direct link to Pricing */}
            <LanguageLink
              href="/pricing"
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              {isClient ? t("nav.pricing") || "Pricing" : "Pricing"}
            </LanguageLink>
          </nav>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ModeToggle />
            {userMenu}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <Cross1Icon className="h-5 w-5" />
              ) : (
                <HamburgerMenuIcon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur">
            <div className="container max-w-6xl mx-auto px-4 py-4">
              <div className="flex flex-col space-y-4">
                {navItems.map((item, index) => (
                  <div key={index}>
                    <h4 className="font-medium mb-2">{item.label}</h4>
                    <div className="pl-4 space-y-2">
                      {item.dropdown.flatMap((category) =>
                        category.tools.map((tool, toolIndex) => (
                          <LanguageLink
                            key={toolIndex}
                            href={tool.href}
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-muted text-sm"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {tool.icon}
                            {tool.name}
                          </LanguageLink>
                        ))
                      )}
                    </div>
                  </div>
                ))}

                <LanguageLink
                  href="/pricing"
                  className="font-medium text-foreground transition-colors hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("nav.pricing") || "Pricing"}
                </LanguageLink>

                {branding.contact.supportUrl && (
                  <a
                    href={branding.contact.supportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-foreground transition-colors hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("nav.support") || "Support"}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
