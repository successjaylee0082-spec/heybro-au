"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Search } from "lucide-react";
import { BrandMark } from "@/components/layout/BrandMark";
import { RedditLogo } from "@/components/RedditLogo";
import { PrimaryNav } from "@/components/navigation";
import { useCopy } from "@/components/i18n/LocaleProvider";
import { Button } from "@/components/ui/button";
import { swapLocalePath, withLocale } from "@/lib/i18n";

export function Header() {
  const { locale, t } = useCopy();
  const pathname = usePathname();
  const other = locale === "en" ? "zh" : "en";
  const communityHref = withLocale(locale, "/community");
  const partnersHref = withLocale(locale, "/partners");
  const languageHref = swapLocalePath(
    pathname || withLocale(locale, "/"),
    other,
  );

  return (
    <header className="site-header">
      <div className="header-inner">
        <BrandMark locale={locale} />
        <PrimaryNav variant="desktop" />
        <div className="header-actions">
          <span className="age-label">18+</span>
          <Link
            href={languageHref}
            className="nav-link"
            hrefLang={other === "zh" ? "zh-Hans" : "en-AU"}
            prefetch
            scroll={false}
          >
            {t("language")}
          </Link>
          <Button asChild variant="outline" className="business-button">
            <Link href={partnersHref}>
              <Building2 className="h-3.5 w-3.5" />
              {locale === "zh" ? "商家合作" : "Business"}
            </Link>
          </Button>
        </div>
      </div>
      <div className="mobile-community-row page-shell">
        <Link
          href={communityHref}
          className="mobile-community-link"
          title="Community Discussions & Reddit Threads"
        >
          <RedditLogo size={16} />
          {locale === "zh" ? "社区讨论" : "Community Discussions"}
        </Link>
        <Link href={partnersHref} className="mobile-community-link">
          <Building2 className="h-3.5 w-3.5" />
          {t("partners")}
        </Link>
        <Link
          href={languageHref}
          className="mobile-community-link"
          hrefLang={other === "zh" ? "zh-Hans" : "en-AU"}
          prefetch
          scroll={false}
        >
          {t("language")}
        </Link>
        <span className="mobile-search-hint">
          <Search className="h-3.5 w-3.5" />
          {t("searchPlaceholder")}
        </span>
      </div>
    </header>
  );
}
