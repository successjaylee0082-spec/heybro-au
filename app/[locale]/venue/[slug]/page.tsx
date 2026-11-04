import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { VenueDetail } from "@/components/heybro/VenueDetail";
import { getVenueById } from "@/lib/feed";
import { isLocale } from "@/lib/i18n";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getVenueBySlug } from "@/lib/venues";

export const dynamic = "force-dynamic";

async function resolveVenue(slug: string) {
  const live = await getVenueBySlug(slug);
  if (live) return live;
  // Only fall back to local demo cards when Supabase is not configured.
  if (!isSupabaseConfigured()) return getVenueById(slug);
  return undefined;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return { robots: { index: false } };
  const venue = await resolveVenue(slug);
  if (!venue) return { robots: { index: false } };
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
  const venue = await resolveVenue(slug);
  if (!venue) notFound();
  return <VenueDetail venue={venue} />;
}
