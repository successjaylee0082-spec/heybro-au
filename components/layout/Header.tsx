"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2 } from "lucide-react";
import { BrandMark } from "@/components/layout/BrandMark";
import { PrimaryNav } from "@/components/navigation";
import { useCopy } from "@/components/i18n/LocaleProvider";
import { Button } from "@/components/ui/button";
import { swapLocalePath, withLocale } from "@/lib/i18n";

export function Header() {
  const { locale, t } = useCopy();
  const pathname = usePathname();
  const other = locale === "en" ? "zh" : "en";
  const partnersHref = withLocale(locale, "/partners");
  const languageHref = swapLocalePath(
    pathname || withLocale(locale, "/"),
    other,
  );

  return (
    <header className="site-header">
      <div className="header-inner px-4 md:px-10">
        <BrandMark locale={locale} />
        <PrimaryNav variant="desktop" />
        <div className="header-actions">
          <span className="age-label">18+</span>
          <Link
            href={languageHref}
            className="nav-link language-toggle"
            hrefLang={other === "zh" ? "zh-Hans" : "en-AU"}
            prefetch
            scroll={false}
          >
            {t("language")}
          </Link>
          <Button
            asChild
            variant="outline"
            className="business-button hidden md:inline-flex"
          >
            <Link href={partnersHref}>
              <Building2 className="h-3.5 w-3.5" />
              {locale === "zh" ? "商家合作" : "Business"}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
