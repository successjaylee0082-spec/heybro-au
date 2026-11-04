import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CommunityPageClient } from "@/components/heybro/CommunityPageClient";
import { isLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <CommunityPageClient />;
}
