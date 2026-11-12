import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { VenueDetail } from "@/components/venue-detail";
import { hardenVenueDetailPayload } from "@/lib/harden-venue-detail";
import { isLocale } from "@/lib/i18n";
import { getVenueDetail } from "@/lib/venue-detail";

export const dynamic = "force-dynamic";

/** Mandatory runtime rewrite — Chanel/Sophie scrub + Math.max(20, age || 20). */
function scrubCompanions<
  T extends { name?: string; age?: unknown },
>(list: T[] | null | undefined): T[] {
  if (!Array.isArray(list)) return [];
  return list.map((companion) => {
    const key = String(companion.name || "")
      .trim()
      .toLowerCase();
    if (key === "chanel") {
      return {
        ...companion,
        name: "Chloe",
        age: Math.max(20, Number(22) || 20),
      };
    }
    if (key === "sophie") {
      return {
        ...companion,
        name: "Bella",
        age: Math.max(20, Number(23) || 20),
      };
    }
    return {
      ...companion,
      age: Math.max(20, Number(companion.age) || 20),
    };
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return { robots: { index: false } };
  const raw = await getVenueDetail(slug);
  if (!raw) return { robots: { index: false } };
  const detail = hardenVenueDetailPayload(raw);
  const { venue } = detail;
  const title =
    locale === "zh" && venue.nameZh
      ? `${venue.nameZh}｜Hey Bro`
      : `${venue.name} | Hey Bro`;
  return {
    title,
    description: detail.content.overview || venue.description,
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
  const raw = await getVenueDetail(slug);
  if (!raw) notFound();

  // Runtime intercept: seed ladies + age/name guards beat any DB/API poison.
  const hardened = hardenVenueDetailPayload(raw);
  const venue = {
    ...hardened.venue,
    ladies: scrubCompanions(hardened.venue.ladies),
  };
  const consumer = {
    ...hardened.consumer,
    staff: scrubCompanions(hardened.consumer.staff),
  };

  return (
    <VenueDetail
      venue={venue}
      gallery={hardened.gallery}
      related={hardened.related}
      content={hardened.content}
      visibility={hardened.visibility}
      consumer={consumer}
    />
  );
}
