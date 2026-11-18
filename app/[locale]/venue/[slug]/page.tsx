import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { VenueDetail } from "@/components/venue-detail";
import { cityLabel } from "@/lib/cities";
import { hardenVenueDetailPayload } from "@/lib/harden-venue-detail";
import { isLocale } from "@/lib/i18n";
import { formatSuburbLabel, slugifySuburb } from "@/lib/local-seo-shared";
import { getSiteUrl } from "@/lib/site";
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
  const suburbLabel = formatSuburbLabel(venue.suburb);
  const cityLabelText = cityLabel(venue.city, locale === "zh" ? "zh" : "en");
  const activeNow = (venue.ladies || []).some(
    (lady) => lady.status === "Available Now",
  );
  const title =
    locale === "zh" && venue.nameZh
      ? `${venue.nameZh}（${suburbLabel}）– 实时排班、地址与直连联系 | Hey Bro`
      : `${venue.name} (${suburbLabel}) – Live Roster, Address & Direct Contact | Hey Bro`;
  const description = [
    `${venue.name} in ${suburbLabel}, ${cityLabelText}.`,
    activeNow
      ? "Live roster shows ACTIVE NOW companions."
      : "Check tonight's live roster before you visit.",
    "Verified street address, 1-tap Google Maps transit, and WhatsApp/WeChat contact on VIP listings.",
    detail.content.overview || venue.description,
  ]
    .filter(Boolean)
    .join(" ")
    .slice(0, 300);

  const pageUrl = `${getSiteUrl()}/${locale}/venue/${venue.id}`;
  const suburbSlug = slugifySuburb(venue.isCbd ? "cbd" : venue.suburb);
  const suburbCanonical = `${getSiteUrl()}/${venue.city}/${suburbSlug || "cbd"}`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
      languages: {
        "en-AU": `${getSiteUrl()}/en/venue/${venue.id}`,
        "zh-Hans": `${getSiteUrl()}/zh/venue/${venue.id}`,
        "x-default": `${getSiteUrl()}/en/venue/${venue.id}`,
      },
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "Hey Bro",
      type: "website",
      locale: locale === "zh" ? "zh_CN" : "en_AU",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: venue.fictional
      ? { index: false, follow: false }
      : { index: true, follow: true },
    other: {
      "heybro:suburb": suburbCanonical,
    },
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
