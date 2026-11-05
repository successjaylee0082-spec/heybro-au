"use client";

import { useMemo } from "react";
import { VenueList as BaseVenueList } from "@/components/VenueList";
import {
  getSeedDirectoryVenues,
  MELBOURNE_VERIFIED_VENUES,
  seedVenues,
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

const MELBOURNE_SEED: Venue[] =
  getSeedDirectoryVenues().length > 0
    ? getSeedDirectoryVenues()
    : MELBOURNE_VERIFIED_VENUES;

/**
 * Seed-first venue grid. Ignores empty Supabase payloads and always has the
 * Melbourne seedVenues houses available for instant render.
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
    const isMelbourne = normalizeToken(city) === "melbourne";

    // Primary source for Melbourne: hardcoded seedVenues (via MELBOURNE_SEED).
    const source = isMelbourne
      ? MELBOURNE_SEED
      : venues && venues.length > 0
        ? venues
        : MELBOURNE_SEED;

    const filtered = source.filter(
      (venue) => matchesCity(venue, city) && matchesCategory(venue, category),
    );

    if (filtered.length > 0) return filtered as RankedVenue[];
    if (isMelbourne) return MELBOURNE_SEED as RankedVenue[];
    return [] as RankedVenue[];
  }, [venues, selectedCity, selectedCategory]);

  // Keep a data attribute for debugging seed count in the DOM.
  if (!displayVenues.length) {
    return (
      <div className="venue-list" data-seed-count={seedVenues.length}>
        {/* Intentionally empty — Melbourne path above should never land here. */}
      </div>
    );
  }

  return (
    <div data-seed-count={seedVenues.length} data-source="seedVenues">
      <BaseVenueList venues={displayVenues} />
    </div>
  );
}
