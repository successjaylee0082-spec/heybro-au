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
  const melbourneSeed = getSeedDirectoryVenues();

  // Always ensure Melbourne seed rows are present — even when Supabase returns
  // a non-empty catalog that has zero Melbourne venues.
  const hasMelbourne = venues.some((venue) => venue.city === "melbourne");
  const catalog = !venues.length
    ? melbourneSeed
    : hasMelbourne
      ? venues
      : [...melbourneSeed, ...venues];

  return (
    <HomeFeed
      venues={catalog}
      source={venues.length > 0 && hasMelbourne ? source : "seed"}
      error={error}
    />
  );
}
