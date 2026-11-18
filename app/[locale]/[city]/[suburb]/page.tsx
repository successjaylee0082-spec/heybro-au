import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { SuburbNavPills } from "@/components/seo/SuburbNavPills";
import { SuburbSeoBlock } from "@/components/seo/SuburbSeoBlock";
import { VenueCard } from "@/components/venue-card";
import { isLocale, withLocale } from "@/lib/i18n";
import {
  buildSuburbBreadcrumbJsonLd,
  buildSuburbItemListJsonLd,
  countActiveNow,
  formatCityLabel,
  formatSuburbLabel,
  isCityId,
  listCitySuburbPairs,
  resolveSuburbPageData,
  suburbCanonicalUrl,
} from "@/lib/local-seo";

/** ISR — rebuild suburb pages hourly; unknown params fall back dynamically. */
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const pairs = await listCitySuburbPairs();
  return ["en", "zh"].flatMap((locale) =>
    pairs.map((pair) => ({
      locale,
      city: pair.city,
      suburb: pair.suburbSlug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; city: string; suburb: string }>;
}): Promise<Metadata> {
  const { locale, city, suburb } = await params;
  if (!isLocale(locale) || !isCityId(city)) {
    return { robots: { index: false, follow: false } };
  }

  const data = await resolveSuburbPageData(city, suburb);
  if (!data) return { robots: { index: false, follow: false } };

  const suburbLabel = data.suburbLabel || formatSuburbLabel(suburb);
  const cityLabelText = data.cityLabelText || formatCityLabel(city, locale);
  const canonical = suburbCanonicalUrl(city, data.suburbSlug);
  const title = `Best ${suburbLabel} Nightlife & Wellness Venues Open Now (Live Roster) | Hey Bro`;
  const description = `Check real-time 'ACTIVE NOW' rosters, verified addresses, 1-tap Google Maps transit, and direct WhatsApp/WeChat contacts for top venues in ${suburbLabel}, ${cityLabelText}. Updated daily.`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "en-AU": canonical,
        "x-default": canonical,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Hey Bro",
      locale: locale === "zh" ? "zh_CN" : "en_AU",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function SuburbDirectoryPage({
  params,
}: {
  params: Promise<{ locale: string; city: string; suburb: string }>;
}) {
  const { locale, city, suburb } = await params;
  if (!isLocale(locale) || !isCityId(city)) notFound();

  const data = await resolveSuburbPageData(city, suburb);
  if (!data) notFound();

  const allPairs = await listCitySuburbPairs();
  const cityPairs = allPairs.filter((pair) => pair.city === data.city);
  const activeNow = countActiveNow(data.venues);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <JsonLd
        data={[
          buildSuburbBreadcrumbJsonLd({
            city: data.city,
            suburbSlug: data.suburbSlug,
            suburbLabel: data.suburbLabel,
            cityLabelText: data.cityLabelText,
          }),
          buildSuburbItemListJsonLd({
            city: data.city,
            suburbSlug: data.suburbSlug,
            suburbLabel: data.suburbLabel,
            cityLabelText: data.cityLabelText,
            venues: data.venues,
          }),
        ]}
      />

      <nav className="mb-6 text-sm text-neutral-500" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href={withLocale(locale, "/")} className="hover:text-neutral-200">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link
              href={withLocale(locale, `/?city=${data.city}`)}
              className="capitalize hover:text-neutral-200"
            >
              {data.cityLabelText}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-neutral-300">{data.suburbLabel}</li>
        </ol>
      </nav>

      <header className="mb-8 max-w-3xl">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-200/90">
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          {data.cityLabelText} · Local SEO guide
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-50 sm:text-4xl">
          Best {data.suburbLabel} nightlife &amp; wellness venues open now
        </h1>
        <p className="mt-3 text-sm leading-7 text-neutral-400 sm:text-base">
          Live ACTIVE NOW rosters, verified street addresses, 1-tap transit, and
          WhatsApp / WeChat contact for {data.venues.length} venue
          {data.venues.length === 1 ? "" : "s"} in {data.suburbLabel},{" "}
          {data.cityLabelText}. VIP listings sort first.
        </p>
        <p className="mt-2 text-xs text-neutral-500">
          {activeNow} ACTIVE NOW roster slot{activeNow === 1 ? "" : "s"} · updated
          daily
        </p>
      </header>

      <div className="mb-8">
        <SuburbNavPills
          city={data.city}
          suburbs={cityPairs}
          activeSlug={data.suburbSlug}
          title={`${data.cityLabelText} suburbs`}
        />
      </div>

      {data.venues.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.venues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-6 text-sm text-neutral-400">
          No venues matched this suburb yet.
        </p>
      )}

      <SuburbSeoBlock
        city={data.city}
        cityLabel={data.cityLabelText}
        suburbLabel={data.suburbLabel}
        suburbSlug={data.suburbSlug}
        venues={data.venues}
        activeNowCount={activeNow}
        related={data.relatedSuburbs}
      />
    </div>
  );
}
