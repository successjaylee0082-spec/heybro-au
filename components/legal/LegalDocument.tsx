import Link from "next/link";
import type { ReactNode } from "react";
import { SUPPORT_EMAIL, SITE_HOST } from "@/lib/site";
import { withLocale } from "@/lib/i18n";
import type { Locale } from "@/types";

export function LegalDocument({
  locale,
  title,
  updated,
  children,
}: {
  locale: Locale;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <article className="legal-doc mx-auto w-full max-w-3xl px-1 py-6 sm:py-10">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-rose-300/80">
        HeyBro · {SITE_HOST}
      </p>
      <h1
        className="mt-3 text-3xl text-neutral-50 sm:text-4xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h1>
      <p className="mt-2 text-sm text-neutral-500">Last updated: {updated}</p>
      <div className="legal-doc-body mt-8 space-y-5 text-[15px] leading-7 text-neutral-300">
        {children}
      </div>
      <nav className="mt-10 flex flex-wrap gap-4 border-t border-neutral-800 pt-6 text-sm">
        <Link
          href={withLocale(locale, "/terms")}
          className="text-rose-300 hover:text-rose-200"
        >
          Terms of Service
        </Link>
        <Link
          href={withLocale(locale, "/privacy")}
          className="text-rose-300 hover:text-rose-200"
        >
          Privacy Policy
        </Link>
        <Link
          href={withLocale(locale, "/report")}
          className="text-rose-300 hover:text-rose-200"
        >
          Report / Takedown
        </Link>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="text-neutral-400 hover:text-neutral-200"
        >
          {SUPPORT_EMAIL}
        </a>
      </nav>
    </article>
  );
}
