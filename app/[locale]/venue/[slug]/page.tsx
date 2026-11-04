import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { VenueDetail } from "@/components/heybro/VenueDetail";
import { feedVenues, getVenueById } from "@/lib/feed";
import { isLocale } from "@/lib/i18n";

export function generateStaticParams() {
  return ["en", "zh"].flatMap((locale) =>
    feedVenues.map((venue) => ({ locale, slug: venue.id })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const venue = getVenueById(slug);
  if (!venue || !isLocale(locale)) return { robots: { index: false } };
  const title =
    locale === "zh" && venue.nameZh
      ? `${venue.nameZh}｜Hey Bro`
      : `${venue.name} | Hey Bro`;
  return {
    title,
    description: venue.description,
    robots: { index: false, follow: true },
  };
}

export default async function VenuePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const venue = getVenueById(slug);
  if (!venue) notFound();
  return <VenueDetail venue={venue} />;
}
