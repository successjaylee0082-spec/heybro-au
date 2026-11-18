import { cities, cityLabel } from "@/lib/cities";
import { getSiteUrl } from "@/lib/site";
import type { CityId, Locale, Venue } from "@/types";

const CITY_IDS = new Set<CityId>(cities.map((city) => city.id));

export type CitySuburbPair = {
  city: CityId;
  suburb: string;
  suburbSlug: string;
  venueCount: number;
};

export function isCityId(value: string | null | undefined): value is CityId {
  return Boolean(value && CITY_IDS.has(value as CityId));
}

/** Normalize suburb / CBD labels into URL slugs (`South Melbourne` → `south-melbourne`). */
export function slugifySuburb(value: string | null | undefined): string {
  const raw = String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!raw) return "";
  return raw.replace(/-+/g, "-");
}

/** Pretty label for metadata / H1 (`south-melbourne` → `South Melbourne`). */
export function formatSuburbLabel(slugOrName: string): string {
  const cleaned = String(slugOrName || "")
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ");
  if (!cleaned) return "";
  if (/^cbd$/i.test(cleaned)) return "CBD";
  return cleaned
    .split(" ")
    .map((part) => {
      if (/^cbd$/i.test(part)) return "CBD";
      if (part.length <= 2) return part.toUpperCase();
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join(" ");
}

export function formatCityLabel(city: CityId, locale: Locale = "en"): string {
  return cityLabel(city, locale);
}

export function suburbCanonicalPath(city: CityId, suburbSlug: string): string {
  return `/${city}/${suburbSlug}`;
}

export function suburbCanonicalUrl(city: CityId, suburbSlug: string): string {
  return `${getSiteUrl()}${suburbCanonicalPath(city, suburbSlug)}`;
}

export function isCbdSlug(suburbSlug: string): boolean {
  return suburbSlug === "cbd" || suburbSlug.endsWith("-cbd");
}

export function venueLooksCbd(
  venue: Pick<Venue, "suburb" | "isCbd" | "tags">,
): boolean {
  if (venue.isCbd) return true;
  const hay = `${venue.suburb} ${(venue.tags || []).join(" ")}`.toLowerCase();
  return /\bcbd\b|melbourne cbd|sydney cbd|circular quay|haymarket|town hall/.test(
    hay,
  );
}

export function venueMatchesSuburbSlug(
  venue: Pick<Venue, "city" | "suburb" | "isCbd" | "tags">,
  suburbSlug: string,
): boolean {
  const target = slugifySuburb(suburbSlug);
  if (!target) return false;
  if (isCbdSlug(target)) return venueLooksCbd(venue);
  const venueSlug = slugifySuburb(venue.suburb);
  if (!venueSlug) return false;
  if (venueSlug === target) return true;
  return (
    venueSlug.replace(/-/g, "") === target.replace(/-/g, "") ||
    venueSlug.includes(target) ||
    target.includes(venueSlug)
  );
}

export function pairsFromVenues(venues: Venue[]): CitySuburbPair[] {
  const map = new Map<string, CitySuburbPair>();
  for (const venue of venues) {
    if (!isCityId(venue.city)) continue;
    const natural = slugifySuburb(venue.suburb);
    if (!natural) continue;
    const keys = new Set<string>([natural]);
    if (venueLooksCbd(venue)) keys.add("cbd");
    for (const suburbSlug of keys) {
      const id = `${venue.city}::${suburbSlug}`;
      const existing = map.get(id);
      if (existing) {
        existing.venueCount += 1;
        continue;
      }
      map.set(id, {
        city: venue.city,
        suburb:
          suburbSlug === "cbd"
            ? `${formatCityLabel(venue.city)} CBD`
            : venue.suburb,
        suburbSlug,
        venueCount: 1,
      });
    }
  }
  return [...map.values()].sort((a, b) => {
    if (a.city !== b.city) return a.city.localeCompare(b.city);
    return a.suburbSlug.localeCompare(b.suburbSlug);
  });
}
