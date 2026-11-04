import { SavedVenues } from "@/components/heybro/SavedVenues";
import { isLocale } from "@/lib/i18n";
import { getDirectoryVenues } from "@/lib/venues";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SavedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { venues, source } = await getDirectoryVenues();
  return <SavedVenues venues={source === "supabase" ? venues : []} />;
}
