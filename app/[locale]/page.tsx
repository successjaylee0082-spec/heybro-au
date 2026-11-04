import { HomeFeed } from "@/components/heybro/HomeFeed";
import { isLocale } from "@/lib/i18n";
import { getDirectoryVenues } from "@/lib/venues";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { venues, source, error } = await getDirectoryVenues();
  return <HomeFeed venues={venues} source={source} error={error} />;
}
