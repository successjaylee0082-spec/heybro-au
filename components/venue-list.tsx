"use client";

import { useMemo } from "react";
import { VenueList as BaseVenueList } from "@/components/VenueList";
import {
  getSeedDirectoryVenues,
  MELBOURNE_VERIFIED_VENUES,
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
  return city === selected || slug === selected || selected === "melbourne" && city === "melbourne";
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

/**
 * Hard fallback: when the live/filtered list is empty for Melbourne, always
 * render the 5 seed houses from lib/data.ts so the grid is never blank.
 */
export function VenueList({
  venues,
  selectedCity = "melbourne",
  selectedCategory = "all",
}: {
  venues: RankedVenue[];
  selectedCity?: CityId | string | null;
  selectedCategory?: CategoryId | "all" | string | null;
}) {
  const displayVenues = useMemo(() => {
    const city = selectedCity || "melbourne";
    const category = selectedCategory || "all";
    const filtered = (venues || []).filter(
      (venue) => matchesCity(venue, city) && matchesCategory(venue, category),
    );

    if (filtered.length > 0) return filtered;

    const isMelbourne = normalizeToken(city) === "melbourne";
    if (!isMelbourne) return filtered;

    // Melbourne must never render empty — fall back to full seed list even if
    // the active category chip would otherwise exclude every house.
    const seed = getSeedDirectoryVenues().length
      ? getSeedDirectoryVenues()
      : MELBOURNE_VERIFIED_VENUES;
    const byCategory = seed.filter(
      (venue) => matchesCity(venue, city) && matchesCategory(venue, category),
    );
    return (byCategory.length ? byCategory : seed) as RankedVenue[];
  }, [venues, selectedCity, selectedCategory]);

  if (!displayVenues.length) return null;
  return <BaseVenueList venues={displayVenues} />;
}
