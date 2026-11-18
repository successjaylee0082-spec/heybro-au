import "server-only";

import { getSeedDirectoryVenues } from "@/lib/data";
import { listingTierSortRank, isVipListing } from "@/lib/listing-tier";
import { getSiteUrl } from "@/lib/site";
import { getDirectoryVenues } from "@/lib/venues";
import type { CityId, Venue } from "@/types";
import {
  type CitySuburbPair,
  formatCityLabel,
  formatSuburbLabel,
  isCityId,
  pairsFromVenues,
  slugifySuburb,
  suburbCanonicalUrl,
  venueMatchesSuburbSlug,
} from "@/lib/local-seo-shared";

export type { CitySuburbPair } from "@/lib/local-seo-shared";
export {
  formatCityLabel,
  formatSuburbLabel,
  isCityId,
  pairsFromVenues,
  slugifySuburb,
  suburbCanonicalPath,
  suburbCanonicalUrl,
  venueLooksCbd,
  venueMatchesSuburbSlug,
} from "@/lib/local-seo-shared";

export function filterVenuesByCitySuburb(
  venues: Venue[],
  city: CityId,
  suburbSlug: string,
): Venue[] {
  return venues.filter(
    (venue) =>
      venue.city === city && venueMatchesSuburbSlug(venue, suburbSlug),
  );
}

function activeNowScore(venue: Venue): number {
  const ladies = Array.isArray(venue.ladies) ? venue.ladies : [];
  const active = ladies.filter((lady) => lady.status === "Available Now").length;
  const inShift = ladies.filter((lady) => lady.status === "In Shift").length;
  return active * 10 + inShift;
}

/** VIP / Enterprise first, then ACTIVE NOW roster density, then name. */
export function sortSuburbVenues(venues: Venue[]): Venue[] {
  return [...venues].sort((a, b) => {
    const tier = listingTierSortRank(a) - listingTierSortRank(b);
    if (tier !== 0) return tier;
    const vipDelta = Number(isVipListing(b)) - Number(isVipListing(a));
    if (vipDelta !== 0) return vipDelta;
    const active = activeNowScore(b) - activeNowScore(a);
    if (active !== 0) return active;
    return a.name.localeCompare(b.name);
  });
}

/** All indexable city/suburb combinations from Supabase (seed fallback). */
export async function listCitySuburbPairs(): Promise<CitySuburbPair[]> {
  try {
    const { venues } = await getDirectoryVenues();
    if (venues.length) return pairsFromVenues(venues);
  } catch {
    // fall through to seed
  }
  return pairsFromVenues(getSeedDirectoryVenues());
}

export async function resolveSuburbPageData(
  cityParam: string,
  suburbParam: string,
): Promise<{
  city: CityId;
  suburbSlug: string;
  suburbLabel: string;
  cityLabelText: string;
  venues: Venue[];
  relatedSuburbs: CitySuburbPair[];
} | null> {
  if (!isCityId(cityParam)) return null;
  const suburbSlug = slugifySuburb(suburbParam);
  if (!suburbSlug) return null;

  let catalog: Venue[] = [];
  try {
    const { venues } = await getDirectoryVenues();
    catalog = venues;
  } catch {
    catalog = [];
  }
  if (!catalog.length) catalog = getSeedDirectoryVenues();

  const matched = sortSuburbVenues(
    filterVenuesByCitySuburb(catalog, cityParam, suburbSlug),
  );
  if (!matched.length) return null;

  const relatedSuburbs = (await listCitySuburbPairs())
    .filter((pair) => pair.city === cityParam && pair.suburbSlug !== suburbSlug)
    .slice(0, 12);

  const suburbLabel =
    suburbSlug === "cbd"
      ? "CBD"
      : formatSuburbLabel(matched[0]?.suburb || suburbSlug);

  return {
    city: cityParam,
    suburbSlug,
    suburbLabel,
    cityLabelText: formatCityLabel(cityParam),
    venues: matched,
    relatedSuburbs,
  };
}

export function buildSuburbItemListJsonLd(options: {
  city: CityId;
  suburbSlug: string;
  suburbLabel: string;
  cityLabelText: string;
  venues: Venue[];
}): Record<string, unknown> {
  const pageUrl = suburbCanonicalUrl(options.city, options.suburbSlug);
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Best ${options.suburbLabel} Nightlife & Wellness Venues`,
    description: `Live roster directory for ${options.suburbLabel}, ${options.cityLabelText}.`,
    url: pageUrl,
    numberOfItems: options.venues.length,
    itemListElement: options.venues.map((venue, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${getSiteUrl()}/en/venue/${venue.id}`,
      name: venue.name,
      item: {
        "@type": "LocalBusiness",
        "@id": `${getSiteUrl()}/en/venue/${venue.id}`,
        name: venue.name,
        address: {
          "@type": "PostalAddress",
          streetAddress: venue.address,
          addressLocality: venue.suburb,
          addressRegion: options.city === "melbourne" ? "VIC" : "NSW",
          addressCountry: "AU",
        },
        ...(typeof venue.lat === "number" && typeof venue.lng === "number"
          ? {
              geo: {
                "@type": "GeoCoordinates",
                latitude: venue.lat,
                longitude: venue.lng,
              },
            }
          : {}),
        telephone: venue.phone || undefined,
        url: `${getSiteUrl()}/en/venue/${venue.id}`,
      },
    })),
  };
}

export function buildSuburbBreadcrumbJsonLd(options: {
  city: CityId;
  suburbSlug: string;
  suburbLabel: string;
  cityLabelText: string;
}): Record<string, unknown> {
  const origin = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Hey Bro",
        item: `${origin}/en`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: options.cityLabelText,
        item: `${origin}/en?city=${options.city}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: options.suburbLabel,
        item: suburbCanonicalUrl(options.city, options.suburbSlug),
      },
    ],
  };
}

export function countActiveNow(venues: Venue[]): number {
  return venues.reduce((sum, venue) => {
    const ladies = Array.isArray(venue.ladies) ? venue.ladies : [];
    return (
      sum + ladies.filter((lady) => lady.status === "Available Now").length
    );
  }, 0);
}
