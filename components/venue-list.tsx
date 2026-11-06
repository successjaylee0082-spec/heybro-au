"use client";

import { useMemo } from "react";
import { VenueList as BaseVenueList } from "@/components/VenueList";
import {
  getSeedDirectoryVenues,
  MELBOURNE_VERIFIED_VENUES,
  sydneyVenues,
  venues as unifiedVenues,
} from "@/lib/data";
import type { RankedVenue } from "@/lib/geo";
import type { CategoryId, CityId, Venue } from "@/types";

function normalizeToken(value: string | null | undefined): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function matchesCity(
  venue: Venue & { citySlug?: string },
  selectedCity?: string | null,
): boolean {
  if (!selectedCity || normalizeToken(selectedCity) === "all") return true;
  const selected = normalizeToken(selectedCity);
  const city = normalizeToken(venue.city);
  const slug = normalizeToken(venue.citySlug);
  return city === selected || slug === selected;
}

function matchesCategory(
  venue: Venue,
  selectedCategory?: string | null,
): boolean {
  if (!selectedCategory || normalizeToken(selectedCategory) === "all") {
    return true;
  }
  return normalizeToken(venue.category) === normalizeToken(selectedCategory);
}

function safeList(list: Venue[] | null | undefined): Venue[] {
  return Array.isArray(list) ? list : [];
}

const FALLBACK_CATALOG: Venue[] = (() => {
  try {
    const seeded = getSeedDirectoryVenues();
    if (safeList(seeded).length) return seeded;
  } catch {
    // ignore
  }
  return [
    ...safeList(sydneyVenues),
    ...safeList(MELBOURNE_VERIFIED_VENUES),
    ...safeList(unifiedVenues),
  ];
})();

/**
 * Seed-first venue grid for Sydney + Melbourne. Never throws on undefined arrays.
 */
export function VenueList({
  venues,
  selectedCity = "melbourne",
  selectedCategory = "all",
}: {
  venues?: RankedVenue[] | Venue[] | null;
  selectedCity?: CityId | string | null;
  selectedCategory?: CategoryId | "all" | string | null;
}) {
  const displayVenues = useMemo(() => {
    const city = selectedCity || "melbourne";
    const category = selectedCategory || "all";
    const incoming = safeList(venues as Venue[] | null | undefined);
    const catalog = incoming.length > 0 ? incoming : FALLBACK_CATALOG;

    const filtered = catalog.filter(
      (venue) => matchesCity(venue, city) && matchesCategory(venue, category),
    );

    if (filtered.length > 0) return filtered as RankedVenue[];

    // City-specific hard fallbacks so neither Sydney nor Melbourne blanks.
    const token = normalizeToken(city);
    if (token === "melbourne") {
      return safeList(MELBOURNE_VERIFIED_VENUES) as RankedVenue[];
    }
    if (token === "sydney") {
      return safeList(sydneyVenues) as RankedVenue[];
    }
    return [] as RankedVenue[];
  }, [venues, selectedCity, selectedCategory]);

  if (!displayVenues.length) {
    return <div className="venue-list" data-seed-count={0} />;
  }

  return (
    <div
      data-seed-count={displayVenues.length}
      data-source="sydney+melbourne"
    >
      <BaseVenueList venues={displayVenues || []} />
    </div>
  );
}
