import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { ApplicationShell } from "@/components/layout/ApplicationShell";
import { isLocale } from "@/lib/i18n";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "zh" }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  // LocaleProvider must live here (not only in the root layout) so /en ↔ /zh
  // client navigations update header copy and page strings immediately.
  return (
    <LocaleProvider locale={locale}>
      <ApplicationShell>{children}</ApplicationShell>
    </LocaleProvider>
  );
}
