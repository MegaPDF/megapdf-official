// components/footer.tsx
"use client";

import Link from "next/link";
import { LanguageLink } from "@/components/language-link";
import { useLanguageStore } from "@/src/store/store";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  Github,
  Youtube,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { useBranding } from "@/src/context/branding-context";

export function Footer() {
  const { t } = useLanguageStore();
  const { branding, loading, error } = useBranding();
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error(
        t("footer.validEmail") || "Please enter a valid email address"
      );
      return;
    }

    toast.success(
      t("footer.subscribeSuccess") ||
        "Thanks for subscribing to our newsletter!"
    );
    setEmail("");
  };

  const currentYear = new Date().getFullYear();

  // Show loading skeleton if branding is loading
  if (loading) {
    return (
      <footer className="border-t bg-muted/20 mt-12">
        <div className="container max-w-6xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-32 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                  <div className="h-3 bg-gray-300 rounded w-16"></div>
                  <div className="h-3 bg-gray-300 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t bg-muted/20 mt-12">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        {/* Top section with logo, description and newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              {branding.logoUrl ? (
                <Image
                  src={branding.logoUrl}
                  alt={branding.logoAltText}
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
              ) : null}
              <span className="font-bold text-xl">{branding.appName}</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md">
              {branding.appDescription}
            </p>

            {/* Social Media Links - only show if they exist in branding */}
            <div className="flex space-x-4 pt-2">
              {branding.socialMedia.facebook && (
                <a
                  href={branding.socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("footer.socialFacebook") || "Facebook"}
                >
                  <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                </a>
              )}
              {branding.socialMedia.twitter && (
                <a
                  href={branding.socialMedia.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("footer.socialTwitter") || "Twitter"}
                >
                  <X className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                </a>
              )}
              {branding.socialMedia.instagram && (
                <a
                  href={branding.socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("footer.socialInstagram") || "Instagram"}
                >
                  <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                </a>
              )}
              {branding.socialMedia.linkedin && (
                <a
                  href={branding.socialMedia.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("footer.socialLinkedin") || "LinkedIn"}
                >
                  <Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                </a>
              )}
              {branding.socialMedia.github && (
                <a
                  href={branding.socialMedia.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("footer.socialGithub") || "GitHub"}
                >
                  <Github className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                </a>
              )}
              {branding.socialMedia.youtube && (
                <a
                  href={branding.socialMedia.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("footer.socialYoutube") || "YouTube"}
                >
                  <Youtube className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                </a>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-medium mb-4">
              {t("footer.contact") || "Contact"}
            </h3>
            <div className="space-y-2">
              {branding.contact.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a
                    href={`mailto:${branding.contact.email}`}
                    className="hover:text-primary transition-colors"
                  >
                    {branding.contact.email}
                  </a>
                </div>
              )}
              {branding.contact.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <a
                    href={`tel:${branding.contact.phone}`}
                    className="hover:text-primary transition-colors"
                  >
                    {branding.contact.phone}
                  </a>
                </div>
              )}
              {branding.contact.address && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{branding.contact.address}</span>
                </div>
              )}
              {branding.contact.supportUrl && (
                <div className="pt-2">
                  <a
                    href={branding.contact.supportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t("footer.support") || "Support Center"}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {t("footer.subscribe") || "Subscribe to Our Newsletter"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("footer.subscribeText") ||
                "Get the latest news, updates and tips delivered directly to your inbox."}
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input
                type="email"
                placeholder={t("footer.emailPlaceholder") || "Enter your email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm">
                {t("footer.subscribe") || "Subscribe"}
              </Button>
            </form>
          </div>
        </div>

        {/* Links section with dynamic footer links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="font-medium mb-4">
              {t("footer.pdfTools") || "PDF Tools"}
            </h3>
            <ul className="space-y-2">
              <li>
                <LanguageLink
                  href="/merge-pdf"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("popular.mergePdf") || "Merge PDF"}
                </LanguageLink>
              </li>
              <li>
                <LanguageLink
                  href="/split-pdf"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("popular.splitPdf") || "Split PDF"}
                </LanguageLink>
              </li>
              <li>
                <LanguageLink
                  href="/compress-pdf"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("popular.compressPdf") || "Compress PDF"}
                </LanguageLink>
              </li>
              <li>
                <LanguageLink
                  href="/protect-pdf"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("popular.protectPdf") || "Protect PDF"}
                </LanguageLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4">
              {t("footer.company") || "Company"}
            </h3>
            <ul className="space-y-2">
              {/* Render dynamic footer links */}
              {branding.footer.links.map((link, index) => (
                <li key={index}>
                  <LanguageLink
                    href={link.url}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.title}
                  </LanguageLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4">
              {t("footer.support") || "Support"}
            </h3>
            <ul className="space-y-2">
              <li>
                <LanguageLink
                  href="/en/developer/api"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("footer.apiDocs") || "API Documentation"}
                </LanguageLink>
              </li>
              <li>
                <LanguageLink
                  href="/faq"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("footer.faqs") || "FAQs"}
                </LanguageLink>
              </li>
              <li>
                <LanguageLink
                  href="/sitemap"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("footer.sitemap") || "Sitemap"}
                </LanguageLink>
              </li>
              {branding.contact.documentationUrl && (
                <li>
                  <a
                    href={branding.contact.documentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t("footer.documentation") || "Documentation"}
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4">{t("footer.legal") || "Legal"}</h3>
            <ul className="space-y-2">
              {/* Render dynamic legal links */}
              {branding.footer.legalLinks.map((link, index) => (
                <li key={index}>
                  <LanguageLink
                    href={link.url}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.title}
                  </LanguageLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section with dynamic copyright */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-muted-foreground mb-4 md:mb-0">
            {branding.footer.copyright ||
              `© ${currentYear} ${branding.footer.companyName}. All rights reserved.`}
          </div>

          {/* Show custom footer text if provided */}
          {branding.footer.customText && (
            <div className="text-sm text-muted-foreground text-center md:text-right">
              {branding.footer.customText}
            </div>
          )}

          {/* Show branding credit if enabled */}
          {branding.footer.showBranding && (
            <div className="text-xs text-muted-foreground/50">
              Powered by {branding.appName}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
