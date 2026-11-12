/**
 * Runtime intercept — blocks DB / API companion poisoning before UI render.
 * Seed catalog ladies win over Supabase venue_staff and any remote ladies payload.
 */

import {
  forceSafeAge,
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
  const age = Math.max(21, Number(replaced.age) || 21);
  return sanitizeCompanionForDisplay({
    ...replaced,
    name: sanitizeCompanionName(replaced.name),
    age: forceSafeAge(age),
  }) as T;
}

/** Always prefer local seed ladies for known venue ids — never trust DB roster. */
export function hardenVenueLadies(venue: Venue): Venue {
  const seed = getSeedDirectoryVenues().find((item) => item.id === venue.id);
  const source =
    seed?.ladies && seed.ladies.length > 0
      ? seed.ladies
      : Array.isArray(venue.ladies)
        ? venue.ladies
        : [];

  const ladies = sanitizeCompanionList(source.map((lady) => hardenLady(lady)));
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
 * Replaces Chanel/Sophie, clamps ages with Math.max(21, …), drops under-21 leftovers.
 */
export function hardenVenueDetailPayload<T extends HardenableDetail>(
  detail: T,
): T {
  const venue = hardenVenueLadies(detail.venue);
  const staff = sanitizeCompanionList(
    (detail.consumer?.staff || []).map((member) => hardenLady(member)),
  ).filter((member) => {
    const age = Math.max(21, Number(member.age) || 21);
    return age >= 21 && !isBlockedCompanionName(member.name);
  });

  const activeStaffCount = staff.filter((member) => member.status === "active")
    .length;

  const related = (detail.related || []).map((item) => hardenVenueLadies(item));

  return {
    ...detail,
    venue,
    related,
    // Never forward raw DB staff identity rows into the UI tree.
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
