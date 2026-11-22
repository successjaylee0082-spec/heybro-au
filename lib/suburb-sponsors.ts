import type { SuburbSponsor } from "@/components/SponsoredSpotlight";

/**
 * Exclusive suburb spotlight map.
 * Key = `${city}/${suburbSlug}` (e.g. `melbourne/south-melbourne`).
 * Leave unset to show the unsold FOMO placeholder.
 */
export const SUBURB_SPONSORS: Record<string, SuburbSponsor> = {
  // Example (disabled until sold):
  // "melbourne/south-melbourne": {
  //   name: "Gotham City House of Sin",
  //   tagline: "South Melbourne VIP roster · discreet entry · call tonight",
  //   badgeText: "Top Pick in South Melbourne",
  //   phone: "(03) 9699 9269",
  //   whatsapp: "61396999269",
  // },
};

export function getSuburbSponsor(
  city: string,
  suburbSlug: string,
): SuburbSponsor | undefined {
  return SUBURB_SPONSORS[`${city}/${suburbSlug}`];
}
