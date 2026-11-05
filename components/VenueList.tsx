"use client";

import { useMemo } from "react";
import { HeyBroCard } from "@/components/HeyBroCard";
import { assignDirectoryPoseCovers } from "@/lib/directory-covers";
import type { RankedVenue } from "@/lib/geo";

/**
 * CBD-first / proximity-ranked venue grid.
 * Card images are masked female poses with consecutive non-repetition.
 */
export function VenueList({ venues }: { venues: RankedVenue[] }) {
  const displayVenues = useMemo(
    () => assignDirectoryPoseCovers(venues),
    [venues],
  );

  if (!displayVenues.length) return null;
  return (
    <div className="venue-list" data-sort="cbd-first" data-covers="masked-poses">
      {displayVenues.map((venue) => (
        <HeyBroCard key={venue.id} venue={venue} />
      ))}
    </div>
  );
}
