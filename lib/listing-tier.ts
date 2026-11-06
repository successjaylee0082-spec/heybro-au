/**
 * Listing commercial tiers — Basic / Managed VIP Elite / Enterprise Ultimate.
 */

import type { Venue } from "@/types";
import type { VenueListingTier } from "@/lib/venue-highlights";

/** Free / Basic listing plan. */
export const BASIC_MONTHLY_PRICE = "$49/mo";
/** Managed VIP Elite plan. */
export const VIP_MONTHLY_PRICE = "$149/mo";
/** Enterprise / Ultimate plan. */
export const ENTERPRISE_MONTHLY_PRICE = "$249/mo";

export const BASIC_UPGRADE_LABEL = "Basic";
export const VIP_UPGRADE_LABEL = "Managed VIP Elite";
export const ENTERPRISE_UPGRADE_LABEL = "Enterprise Ultimate";

export const VIP_BADGE_ELITE = "VERIFIED ELITE";
export const VIP_BADGE_MANAGED = "MANAGED VIP";
export const VIP_BADGE_ENTERPRISE = "ULTIMATE";

export const LISTING_TIER_PRICES: Record<VenueListingTier, string> = {
  free: BASIC_MONTHLY_PRICE,
  managed: VIP_MONTHLY_PRICE,
  vip: VIP_MONTHLY_PRICE,
  enterprise: ENTERPRISE_MONTHLY_PRICE,
};

export function monthlyPriceForTier(tier: VenueListingTier): string {
  return LISTING_TIER_PRICES[tier] || BASIC_MONTHLY_PRICE;
}

export function resolveVenueListingTier(
  venue: Pick<Venue, "isManaged" | "managedBadge" | "customHighlights">,
): VenueListingTier {
  const explicit = venue.customHighlights?.tier;
  if (
    explicit === "free" ||
    explicit === "managed" ||
    explicit === "vip" ||
    explicit === "enterprise"
  ) {
    return explicit;
  }
  if (!venue.isManaged) return "free";
  if (
    venue.managedBadge === "vip" ||
    venue.customHighlights?.managedBadge === "vip"
  ) {
    return "vip";
  }
  return "managed";
}

/** Paid tiers that unlock direct messaging CTAs. */
export function isVipListing(
  venue: Pick<Venue, "isManaged" | "managedBadge" | "customHighlights">,
): boolean {
  const tier = resolveVenueListingTier(venue);
  return tier === "managed" || tier === "vip" || tier === "enterprise";
}

export function isFreeListing(
  venue: Pick<Venue, "isManaged" | "managedBadge" | "customHighlights">,
): boolean {
  return !isVipListing(venue);
}

export function isEnterpriseListing(
  venue: Pick<Venue, "isManaged" | "managedBadge" | "customHighlights">,
): boolean {
  return resolveVenueListingTier(venue) === "enterprise";
}

/** Sort key: Enterprise → VIP Elite → Managed → Free. */
export function listingTierSortRank(
  venue: Pick<Venue, "isManaged" | "managedBadge" | "customHighlights">,
): number {
  const tier = resolveVenueListingTier(venue);
  if (tier === "enterprise") return 0;
  if (tier === "vip") return 1;
  if (tier === "managed") return 2;
  return 3;
}

export function vipBadgeLabel(variant?: "pro" | "vip" | "enterprise" | null): string {
  if (variant === "enterprise") return VIP_BADGE_ENTERPRISE;
  if (variant === "vip") return VIP_BADGE_ELITE;
  return VIP_BADGE_MANAGED;
}

export function planLabelForTier(tier: VenueListingTier): string {
  if (tier === "enterprise") {
    return `Enterprise Ultimate · ${ENTERPRISE_MONTHLY_PRICE}`;
  }
  if (tier === "vip") {
    return `Managed VIP Elite · ${VIP_MONTHLY_PRICE}`;
  }
  if (tier === "managed") {
    return `Managed VIP · ${VIP_MONTHLY_PRICE}`;
  }
  return `Basic · ${BASIC_MONTHLY_PRICE}`;
}
