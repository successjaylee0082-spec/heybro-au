"use client";

import { HeyBroCard } from "@/components/HeyBroCard";
import type { RankedVenue } from "@/lib/geo";

/**
 * CBD-first / proximity-ranked venue grid.
 * Sorting is applied upstream via filterVenues(... sort: 'cbd-distance').
 */
export function VenueList({ venues }: { venues: RankedVenue[] }) {
  if (!venues.length) return null;
  return (
    <div className="venue-list" data-sort="cbd-first">
      {venues.map((venue) => (
        <HeyBroCard key={venue.id} venue={venue} />
      ))}
    </div>
  );
}
