import { HomeFeed } from "@/components/heybro/HomeFeed";
import { isLocale } from "@/lib/i18n";
import { getSeedDirectoryVenues } from "@/lib/data";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * Home feed bypasses Supabase for now and renders Melbourne seedVenues
 * directly so listings appear on first paint.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const seed = getSeedDirectoryVenues();
  return <HomeFeed venues={seed} source="seed" />;
}
