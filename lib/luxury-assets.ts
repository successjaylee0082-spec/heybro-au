/**
 * Curated high-res dark-luxury lounge imagery for Hey Bro.
 * Gallery / detail mood boards only — listing cards use directory poses
 * (`lib/directory-covers.ts`), never these interiors.
 */

import { directoryPoseFor } from "@/lib/directory-covers";
import {
  STAFF_PORTRAIT_FALLBACKS,
  portraitForEthnicity,
} from "@/lib/staff-image-map";

/** Detail gallery pool — high-res interiors only (not for roster cards). */
export const LUXURY_LOUNGES = [
  "/images/lounges/mood-01-velvet.jpg",
  "/images/lounges/mood-02-suite.jpg",
  "/images/lounges/mood-03-cocktail.jpg",
  "/images/lounges/mood-04-spa.jpg",
  "/images/lounges/mood-05-members.jpg",
  "/images/lounges/mood-06-boutique.jpg",
  "/images/lounges/mood-07-velvet-hi.jpg",
  "/images/lounges/mood-08-suite-hi.jpg",
  "/images/lounges/mood-09-cocktail-hi.jpg",
  "/images/lounges/mood-10-spa-hi.jpg",
  "/images/lounges/hires-01.jpg",
  "/images/lounges/hires-02.jpg",
  "/images/lounges/hires-03.jpg",
  "/images/lounges/hires-09.jpg",
] as const;

/** Female masked glamour portraits only. */
export const LUXURY_PORTRAITS = STAFF_PORTRAIT_FALLBACKS;

export const LUXURY_HERO = "/images/hero/studio-silhouette.jpg";
export const LUXURY_HERO_SCENE = "/images/lounges/mood-07-velvet-hi.jpg";

const BLOCKED_COVER_PATTERNS =
  /apartment|living-room|real.?estate|suburb|daylight.?interior|sydney-harbour|neon.?club|night.?club|disco|party|crowd|concert|rose-haze|neon-silhouette|dancefloor|pink-neon|prague|charles.?bridge|photo-1560448204|photo-1618221195710|photo-1616486338812|photo-1566737236500|photo-1545128485|photo-1514525253161|photo-1470229722913/i;

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** @deprecated Listing cards must use directory poses — never lounge interiors. */
export function luxuryCoverFor(seed: string): string {
  return directoryPoseFor(seed);
}

/** Gallery filler that avoids repeating the cover when possible. */
export function luxuryGalleryExtras(seed: string, count = 6): string[] {
  const start = hashSeed(seed) % LUXURY_LOUNGES.length;
  const out: string[] = [];
  for (let i = 0; i < LUXURY_LOUNGES.length && out.length < count; i += 1) {
    const url = LUXURY_LOUNGES[(start + i + 1) % LUXURY_LOUNGES.length];
    if (!out.includes(url)) out.push(url);
  }
  return out;
}

/** @deprecated Prefer portraitForEthnicity */
export function luxuryPortraitFor(seed: string, offset = 0): string {
  return portraitForEthnicity("Western", seed, offset);
}

export function shouldReplaceCover(url?: string | null): boolean {
  if (!url?.trim()) return true;
  if (url.startsWith("/images/lounges/")) return false;
  if (url === "/images/hero/studio-silhouette.jpg") return true;
  if (url.startsWith("/images/") && !url.includes("/staff/")) return true;
  if (BLOCKED_COVER_PATTERNS.test(url)) return true;
  if (/unsplash\.com\/photo-/i.test(url)) return true;
  return false;
}

export function isBlockedInteriorUrl(url?: string | null): boolean {
  if (!url?.trim()) return true;
  return BLOCKED_COVER_PATTERNS.test(url);
}
