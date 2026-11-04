"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "@/types";
import { copy, type CopyKey } from "@/lib/i18n";

const LocaleContext = createContext<Locale>("en");

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
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
