/**
 * Curated dark-luxury lounge imagery for Hey Bro.
 * Mood studio / velvet lounge only — no neon party clubs or apartment stock.
 */

import {
  STAFF_PORTRAIT_FALLBACKS,
  portraitForEthnicity,
} from "@/lib/staff-image-map";

export const LUXURY_LOUNGES = [
  "/images/lounges/mood-01-velvet.jpg",
  "/images/lounges/mood-02-suite.jpg",
  "/images/lounges/mood-03-cocktail.jpg",
  "/images/hero/studio-silhouette.jpg",
] as const;

/** Female masked glamour portraits only. */
export const LUXURY_PORTRAITS = STAFF_PORTRAIT_FALLBACKS;

export const LUXURY_HERO = "/images/hero/studio-silhouette.jpg";
export const LUXURY_HERO_SCENE = "/images/lounges/mood-01-velvet.jpg";

const BLOCKED_COVER_PATTERNS =
  /apartment|living-room|real.?estate|suburb|daylight.?interior|sydney-harbour|neon.?club|night.?club|disco|party|crowd|concert|rose-haze|neon-silhouette|dancefloor|pink-neon|prague|charles.?bridge|photo-1560448204|photo-1618221195710|photo-1616486338812|photo-1566737236500|photo-1545128485|photo-1514525253161|photo-1470229722913/i;

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

/** @deprecated Prefer portraitForEthnicity */
export function luxuryPortraitFor(seed: string, offset = 0): string {
  return portraitForEthnicity("Western", seed, offset);
}

export function shouldReplaceCover(url?: string | null): boolean {
  if (!url?.trim()) return true;
  if (
    url.startsWith("/images/lounges/mood-") ||
    url === "/images/hero/studio-silhouette.jpg"
  ) {
    return false;
  }
  if (url.startsWith("/images/") && !url.includes("/staff/")) return true;
  if (BLOCKED_COVER_PATTERNS.test(url)) return true;
  if (/unsplash\.com\/photo-/i.test(url)) return true;
  return false;
}

export function isBlockedInteriorUrl(url?: string | null): boolean {
  if (!url?.trim()) return true;
  return BLOCKED_COVER_PATTERNS.test(url);
}
