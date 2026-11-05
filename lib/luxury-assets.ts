/**
 * Curated dark-luxury nightlife lounge imagery for Hey Bro.
 * Apartment / real-estate interiors and male portraits are intentionally excluded.
 */

import {
  STAFF_PORTRAIT_FALLBACKS,
  portraitForEthnicity,
} from "@/lib/staff-image-map";

export const LUXURY_LOUNGES = [
  "/images/lounges/01.jpg",
  "/images/lounges/02.jpg",
  "/images/lounges/03.jpg",
  "/images/lounges/04.jpg",
  "/images/lounges/05.jpg",
  "/images/lounges/06.jpg",
  "/images/lounges/07.jpg",
  "/images/lounges/08.jpg",
  "/images/lounges/09.jpg",
  "/images/lounges/10.jpg",
  "/images/lounges/11-lounge.jpg",
  "/images/lounges/12-cocktail.jpg",
  "/images/lounges/13-late-night.jpg",
  "/images/lounges/14-rooftop.jpg",
] as const;

/** Female glamour portraits only — ethnicity-bucketed via staff-image-map. */
export const LUXURY_PORTRAITS = STAFF_PORTRAIT_FALLBACKS;

export const LUXURY_HERO = "/images/lounges/02.jpg";
export const LUXURY_HERO_SCENE = "/images/lounges/07.jpg";

/** Patterns that indicate generic apartment / bright real-estate stock. */
const BLOCKED_COVER_PATTERNS =
  /apartment|living-room|real.?estate|suburb|daylight.?interior|sydney-harbour|rooftop\.jpg|cocktail-bar|late-night|photo-1560448204|photo-1618221195710|photo-1616486338812|photo-1616594039964|photo-1631049307264|photo-1618773928121|photo-1631049552057|photo-1500648767791|photo-1552058544/i;

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function luxuryCoverFor(seed: string): string {
  const index = hashSeed(seed) % LUXURY_LOUNGES.length;
  return LUXURY_LOUNGES[index];
}

/** @deprecated Prefer portraitForEthnicity — kept for non-staff card seeds. */
export function luxuryPortraitFor(seed: string, offset = 0): string {
  return portraitForEthnicity("Western", seed, offset);
}

export function shouldReplaceCover(url?: string | null): boolean {
  if (!url?.trim()) return true;
  if (url.startsWith("/images/lounges/")) return false;
  if (url.startsWith("/images/") && !url.includes("/staff/")) return true;
  if (BLOCKED_COVER_PATTERNS.test(url)) return true;
  if (/unsplash\.com\/photo-/i.test(url) && !/lounges\//.test(url)) {
    // Prefer curated local nightlife assets over unverified remote interiors.
    return true;
  }
  return false;
}

export function isBlockedInteriorUrl(url?: string | null): boolean {
  if (!url?.trim()) return true;
  return BLOCKED_COVER_PATTERNS.test(url);
}
