"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import type { Locale } from "@/types";
import { copy, isLocale, type CopyKey } from "@/lib/i18n";

const LocaleContext = createContext<Locale>("en");

function localeFromPathname(pathname: string | null | undefined): Locale | null {
  if (!pathname) return null;
  const segment = pathname.split("/").filter(Boolean)[0];
  return isLocale(segment) ? segment : null;
}

export function LocaleProvider({
  locale: initialLocale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const locale = useMemo(() => {
    // Prefer the live URL segment so client navigations to /zh remount copy.
    return localeFromPathname(pathname) || initialLocale || "en";
  }, [pathname, initialLocale]);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-Hans" : "en-AU";
    document.documentElement.setAttribute(
      "data-locale",
      locale === "zh" ? "zh-Hans" : "en-AU",
    );
  }, [locale]);

  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

export function useCopy() {
  const locale = useLocale();
  return {
    locale,
    t: (key: CopyKey) => copy[locale][key],
  };
}
