/**
 * Runtime intercept — secondary safety net for companion names/ages.
 * Prefers live venue.ladies (companions table) when present; seed is fallback.
 */

import {
  isBlockedCompanionName,
  sanitizeCompanionForDisplay,
  sanitizeCompanionList,
  sanitizeCompanionName,
} from "@/lib/companion-profile";
import { getSeedDirectoryVenues } from "@/lib/data";
import type { VenueConsumerView } from "@/lib/venue-consumer";
import type { Venue } from "@/types";

function hardenLady<T extends { name?: string; age?: unknown; id?: string }>(
  lady: T,
): T {
  const key = String(lady.name || "")
    .trim()
    .toLowerCase();
  const replaced =
    key === "chanel"
      ? { ...lady, name: "Chloe", age: 22 }
      : key === "sophie"
        ? { ...lady, name: "Bella", age: 23 }
        : lady;
  // Secondary safety net: strict 20+ floor.
  const age = Math.max(20, Number(replaced.age) || 20);
  return sanitizeCompanionForDisplay({
    ...replaced,
    name: sanitizeCompanionName(replaced.name),
    age,
  }) as T;
}

/**
 * Scrub ladies already attached to the venue.
 * Falls back to seed catalog only when the venue has no roster rows yet.
 */
export function hardenVenueLadies(venue: Venue): Venue {
  const seed = getSeedDirectoryVenues().find((item) => item.id === venue.id);
  const source =
    Array.isArray(venue.ladies) && venue.ladies.length > 0
      ? venue.ladies
      : seed?.ladies && seed.ladies.length > 0
        ? seed.ladies
        : [];

  const ladies = sanitizeCompanionList(
    source.map((lady) => {
      const scrubbed = hardenLady(lady);
      return {
        ...scrubbed,
        // Preserve seed slot images whenever ids/slots align.
        image:
          lady.image ||
          seed?.ladies?.find((item) => item.id === lady.id)?.image ||
          scrubbed.image,
        age: Math.max(20, Number(scrubbed.age) || 20),
      };
    }),
  );
  return { ...venue, ladies };
}

type HardenableDetail = {
  venue: Venue;
  related: Venue[];
  consumer: VenueConsumerView;
  staffRows?: unknown[];
  [key: string]: unknown;
};

/**
 * Final gate applied in the venue page + getVenueDetail.
 * Scrubs Chanel/Sophie and enforces Math.max(20, age || 20).
 */
export function hardenVenueDetailPayload<T extends HardenableDetail>(
  detail: T,
): T {
  const venue = hardenVenueLadies(detail.venue);
  const staff = sanitizeCompanionList(
    (detail.consumer?.staff || []).map((member) => hardenLady(member)),
  ).filter((member) => {
    const age = Math.max(20, Number(member.age) || 20);
    return age >= 20 && !isBlockedCompanionName(member.name);
  });

  const activeStaffCount = staff.filter(
    (member) => member.status === "active",
  ).length;

  const related = (detail.related || []).map((item) => hardenVenueLadies(item));

  return {
    ...detail,
    venue,
    related,
    staffRows: [],
    consumer: {
      ...detail.consumer,
      staff,
      activeStaffCount,
      quickInfo: (detail.consumer.quickInfo || []).map((badge) =>
        badge.kind === "staff"
          ? { ...badge, value: `${activeStaffCount} Ladies` }
          : badge,
      ),
    },
  };
}
