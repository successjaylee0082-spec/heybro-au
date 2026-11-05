"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { BrandMark } from "@/components/layout/BrandMark";
import { useCopy } from "@/components/i18n/LocaleProvider";
import { cities } from "@/lib/cities";
import { useNavigation } from "@/components/layout/NavigationProvider";
import { withLocale } from "@/lib/i18n";

export function Footer() {
  const { locale, t } = useCopy();
  const { setCity } = useNavigation();

  return (
    <footer className="site-footer">
      <div className="page-shell">
        <div className="footer-main">
          <div>
            <BrandMark locale={locale} compact />
            <p className="footer-tagline">{t("brandTagline")}</p>
          </div>
          <div className="footer-links">
            {cities.slice(0, 4).map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => {
                  setCity(city.id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                {locale === "zh" ? city.labelZh : city.label}
              </button>
            ))}
            <Link href={withLocale(locale, "/community")}>{t("community")}</Link>
            <Link href={withLocale(locale, "/partners")}>{t("partners")}</Link>
            <a
              href="https://www.esafety.gov.au/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("footerSafety")}
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Hey Bro Australia. Nightlife directory.</span>
          <span>
            <Shield className="h-3.5 w-3.5" />
            18+ self-declaration required
          </span>
        </div>
      </div>
    </footer>
  );
}
