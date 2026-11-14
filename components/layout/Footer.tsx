"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { BrandMark } from "@/components/layout/BrandMark";
import { useCopy } from "@/components/i18n/LocaleProvider";
import { cities } from "@/lib/cities";
import { useNavigation } from "@/components/layout/NavigationProvider";
import { withLocale } from "@/lib/i18n";
import { SITE_HOST, SUPPORT_EMAIL } from "@/lib/site";

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

        <div className="footer-compliance">
          <p className="footer-copyright">
            © 2026 HeyBro Directory ({SITE_HOST}). All rights reserved.
          </p>
          <p className="footer-disclaimer">
            Disclaimer: HeyBro ({SITE_HOST}) operates strictly as an independent
            online directory and digital advertising platform. We do not own,
            operate, manage, or endorse any listed venues, agencies, or
            independent advertisers, nor do we act as a booking agent or
            intermediary. All listings, rosters, availability, and visual
            materials are uploaded and managed directly by third-party venue
            managers via PIN-authenticated access. Each advertiser is solely
            responsible for ensuring full compliance with applicable Australian
            federal and state laws (including Victoria and New South Wales
            regulations). HeyBro assumes no liability for the accuracy of
            user-generated content or any offline interactions.
          </p>
          <p className="footer-report">
            18+ Only | Zero Tolerance for Illegal Content or Underage Material.
            For takedown requests, copyright claims, or compliance inquiries,
            contact:{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </p>
          <nav className="footer-legal-links" aria-label="Legal">
            <Link href={withLocale(locale, "/terms")}>Terms of Service</Link>
            <Link href={withLocale(locale, "/privacy")}>Privacy Policy</Link>
            <Link href={withLocale(locale, "/report")}>Report / Takedown</Link>
          </nav>
        </div>

        <div className="footer-bottom">
          <span>
            Independent directory · Not a booking agent · {SITE_HOST}
          </span>
          <span>
            <Shield className="h-3.5 w-3.5" />
            18+ age verification required
          </span>
        </div>
      </div>
    </footer>
  );
}
