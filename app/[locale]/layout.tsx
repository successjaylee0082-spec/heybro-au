import { notFound } from "next/navigation";
import type { ReactNode } from "react";
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
  return <ApplicationShell>{children}</ApplicationShell>;
}
