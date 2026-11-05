import { HomeFeed } from "@/components/heybro/HomeFeed";
import { isLocale } from "@/lib/i18n";
import { getSeedDirectoryVenues } from "@/lib/data";
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
  // Guarantee Melbourne seed rows reach the client filter even if the
  // directory loader returned an empty catalog.
  const catalog =
    venues.length > 0
      ? venues
      : getSeedDirectoryVenues();
  return (
    <HomeFeed
      venues={catalog}
      source={venues.length > 0 ? source : "seed"}
      error={error}
    />
  );
}
