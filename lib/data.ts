/**
 * Day 1 data facade — single source of truth helpers for pricing,
 * Melbourne CBD-first ranking hints, and masked staff portrait pools.
 */

import {
  formatPricingRateLine,
  parseVenueContent,
  resolveVenuePricing,
  syncContentPricing,
  type VenuePriceRow,
} from "@/lib/venue-content";
import {
  isTrustedStaffPortrait,
  portraitForEthnicity,
  STAFF_PORTRAIT_FALLBACKS,
} from "@/lib/staff-image-map";
import {
  buildVenueOperationalProfile,
  type VenueOperationalProfile,
} from "@/lib/venue-profiles";
import type { Venue } from "@/types";

export type { VenuePriceRow };
export {
  formatPricingRateLine,
  resolveVenuePricing,
  syncContentPricing,
  parseVenueContent,
};

/** Minimum AUD course price from the shared pricing ladder. */
export function minimumCoursePrice(pricing: VenuePriceRow[]): string | null {
  const ladder = [...pricing].sort((a, b) => {
    const mins = (row: VenuePriceRow) => {
      const n = Number.parseInt(row.duration, 10);
      if (/hr|hour/i.test(row.duration)) return (n || 1) * 60;
      return n || 0;
    };
    return mins(a) - mins(b);
  });
  return ladder[0]?.price || null;
}

function asOperationalProfile(
  venue: Venue,
  pricing: VenuePriceRow[],
  rateLine: string,
): VenueOperationalProfile {
  const base = buildVenueOperationalProfile(venue);
  return {
    ...base,
    ...(venue.profile?.payments
      ? { payments: venue.profile.payments as VenueOperationalProfile["payments"] }
      : {}),
    ...(venue.profile?.amenities
      ? {
          amenities: venue.profile
            .amenities as VenueOperationalProfile["amenities"],
        }
      : {}),
    ...(venue.profile?.services
      ? { services: venue.profile.services as VenueOperationalProfile["services"] }
      : {}),
    pricing,
    rateLine,
  };
}

/**
 * Attach `pricing` + `rateLine` onto a venue from the same ladder the
 * detail Rates cards use — never a separate hardcoded banner string.
 */
export function withVenuePricing<T extends Venue>(venue: T): T {
  if (venue.pricing && venue.pricing.length >= 2) {
    const pricing = resolveVenuePricing({
      pricing: venue.pricing,
      profile: asOperationalProfile(venue, venue.pricing, venue.rateLine || ""),
    });
    const rateLine = formatPricingRateLine(pricing);
    return {
      ...venue,
      pricing,
      rateLine,
      profile: asOperationalProfile(venue, pricing, rateLine),
    };
  }

  const content = syncContentPricing(
    parseVenueContent({
      description: venue.description,
      tags: venue.tags,
      venueId: venue.id,
      category: venue.category,
      city: venue.city,
      suburb: venue.suburb,
      isCbd: venue.isCbd,
    }),
  );

  return {
    ...venue,
    pricing: content.pricing,
    rateLine: content.profile.rateLine,
    profile: content.profile,
  };
}

export function attachPricingToVenues<T extends Venue>(venues: T[]): T[] {
  return venues.map((venue) => withVenuePricing(venue));
}

/**
 * High-res masked female portraits with non-repetitive fallbacks.
 * Prefer ethnicity pool, then any unused curated staff path, never interiors.
 */
export function nextMaskedStaffPortrait(options: {
  ethnicity?: string | null;
  seed: string;
  offset?: number;
  used?: Set<string>;
}): string {
  const used = options.used || new Set<string>();
  const primary = portraitForEthnicity(
    options.ethnicity,
    options.seed,
    options.offset || 0,
    used,
  );
  if (isTrustedStaffPortrait(primary) && used.has(primary)) {
    return primary;
  }

  // Cross-bucket unused fallback so long rosters stay unique.
  for (let step = 0; step < STAFF_PORTRAIT_FALLBACKS.length; step += 1) {
    const candidate =
      STAFF_PORTRAIT_FALLBACKS[
        (hashSeed(options.seed) + (options.offset || 0) + step * 5) %
          STAFF_PORTRAIT_FALLBACKS.length
      ];
    if (!used.has(candidate)) {
      used.add(candidate);
      return candidate;
    }
  }

  used.add(primary);
  return primary;
}

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Melbourne CBD / King · Little Bourke · Flinders · Southbank priority (0 = top). */
export function melbourneCbdPriority(
  venue: Pick<Venue, "city" | "suburb" | "address" | "tags" | "isCbd">,
): number {
  if (venue.city !== "melbourne") return 50;
  const hay = `${venue.suburb} ${venue.address} ${(venue.tags || []).join(" ")}`.toLowerCase();
  if (
    /king\s*st|little\s*bourke|flinders(\s*st|\s*street| lane)?|southbank|melbourne\s*cbd|\bcbd\b/.test(
      hay,
    )
  ) {
    return 0;
  }
  if (venue.isCbd || /melbourne|docklands|carlton|east melbourne/.test(hay)) {
    return 1;
  }
  return 2;
}
