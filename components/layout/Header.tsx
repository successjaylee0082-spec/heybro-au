"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Search } from "lucide-react";
import { BrandMark } from "@/components/layout/BrandMark";
import { RedditLogo } from "@/components/RedditLogo";
import { useCopy } from "@/components/i18n/LocaleProvider";
import { useNavigation } from "@/components/layout/NavigationProvider";
import { Button } from "@/components/ui/button";
import { swapLocalePath, withLocale } from "@/lib/i18n";

export function Header() {
  const { locale, t } = useCopy();
  const pathname = usePathname();
  const { savedIds } = useNavigation();
  const other = locale === "en" ? "zh" : "en";
  const communityHref = withLocale(locale, "/community");
  const savedHref = withLocale(locale, "/saved");
  const blogHref = withLocale(locale, "/blog");
  const languageHref = swapLocalePath(pathname || withLocale(locale, "/"), other);

  return (
    <header className="site-header">
      <div className="header-inner">
        <BrandMark locale={locale} />
        <nav className="desktop-nav" aria-label="Primary">
          <Link
            href={withLocale(locale, "/")}
            className={`nav-link${pathname === withLocale(locale, "/") ? " active" : ""}`}
          >
            {t("list")}
          </Link>
          <Link
            href={communityHref}
            className={`nav-link${pathname?.includes("/community") ? " active" : ""}`}
          >
            <RedditLogo size={14} />
            {t("community")}
          </Link>
          <Link
            href={blogHref}
            className={`nav-link${pathname?.includes("/blog") ? " active" : ""}`}
          >
            {t("blog")}
          </Link>
          <Link
            href={savedHref}
            className={`nav-link${pathname?.includes("/saved") ? " active" : ""}`}
          >
            {t("saved")}
            {savedIds.length > 0 ? (
              <span className="saved-count">{savedIds.length}</span>
            ) : null}
          </Link>
        </nav>
        <div className="header-actions">
          <span className="age-label">18+</span>
          <Link href={languageHref} className="nav-link" hrefLang={other === "zh" ? "zh-Hans" : "en-AU"}>
            {t("language")}
          </Link>
          <Button type="button" variant="outline" className="business-button" disabled>
            <Building2 className="h-3.5 w-3.5" />
            Business
          </Button>
        </div>
      </div>
      <div className="mobile-community-row page-shell">
        <Link href={communityHref} className="mobile-community-link">
          <RedditLogo size={16} />
          {t("community")}
        </Link>
        <Link href={languageHref} className="mobile-community-link">
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
