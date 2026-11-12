import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { VenueDetail } from "@/components/venue-detail";
import { hardenVenueDetailPayload } from "@/lib/harden-venue-detail";
import { isLocale } from "@/lib/i18n";
import { getVenueDetail } from "@/lib/venue-detail";

export const dynamic = "force-dynamic";

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
  const detail = hardenVenueDetailPayload(raw);

  return (
    <VenueDetail
      venue={detail.venue}
      gallery={detail.gallery}
      related={detail.related}
      content={detail.content}
      visibility={detail.visibility}
      consumer={detail.consumer}
    />
  );
}
