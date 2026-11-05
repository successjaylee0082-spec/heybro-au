/**
 * Free vs Business VIP (Managed) listing tiers — commercial upgrade triggers.
 */

import type { Venue } from "@/types";
import type { VenueListingTier } from "@/lib/venue-highlights";

export const VIP_MONTHLY_PRICE = "$40/mo";
export const VIP_UPGRADE_LABEL = "Business VIP";
export const VIP_BADGE_ELITE = "VERIFIED ELITE";
export const VIP_BADGE_MANAGED = "MANAGED VIP";

export function resolveVenueListingTier(venue: Pick<
  Venue,
  "isManaged" | "managedBadge" | "customHighlights"
>): VenueListingTier {
  const explicit = venue.customHighlights?.tier;
  if (explicit === "free" || explicit === "managed" || explicit === "vip") {
    return explicit;
  }
  if (!venue.isManaged) return "free";
  if (venue.managedBadge === "vip" || venue.customHighlights?.managedBadge === "vip") {
    return "vip";
  }
  return "managed";
}

export function isVipListing(venue: Pick<Venue, "isManaged" | "managedBadge" | "customHighlights">): boolean {
  const tier = resolveVenueListingTier(venue);
  return tier === "managed" || tier === "vip";
}

export function isFreeListing(venue: Pick<Venue, "isManaged" | "managedBadge" | "customHighlights">): boolean {
  return !isVipListing(venue);
}

/** Sort key: VIP/managed first (0), free later (1). */
export function listingTierSortRank(
  venue: Pick<Venue, "isManaged" | "managedBadge" | "customHighlights">,
): number {
  const tier = resolveVenueListingTier(venue);
  if (tier === "vip") return 0;
  if (tier === "managed") return 1;
  return 2;
}

export function vipBadgeLabel(variant?: "pro" | "vip" | null): string {
  return variant === "vip" ? VIP_BADGE_ELITE : VIP_BADGE_MANAGED;
}
