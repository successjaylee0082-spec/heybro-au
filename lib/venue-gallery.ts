import { LUXURY_LOUNGES, isBlockedInteriorUrl } from "@/lib/luxury-assets";
import { isTrustedStaffPortrait } from "@/lib/staff-image-map";

/** Sparse luxury lounge accents — paired with staff portraits, never alone as a banner. */
const LOUNGE_HIGHLIGHTS = LUXURY_LOUNGES.slice(0, 10);

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Lingerie banners, empty-room stock, apartments, neon party plates. */
function isBannedGalleryUrl(url?: string | null): boolean {
  if (!url?.trim()) return true;
  if (isBlockedInteriorUrl(url)) return true;
  return /slider|desktop|banner|ad-|promo|lingerie|underwear|bra|panties|stock-banner|hero-banner|\/images\/hero\/|\/images\/directory\//i.test(
    url,
  );
}

function isLoungeHighlight(url: string): boolean {
  return url.startsWith("/images/lounges/");
}

function canUseGalleryAsset(url: string): boolean {
  if (isTrustedStaffPortrait(url)) return true;
  if (isLoungeHighlight(url)) return true;
  if (url.startsWith("/images/")) return false;
  return !isBannedGalleryUrl(url);
}

/**
 * Detail gallery: masked staff portraits first, then a few luxury lounge
 * highlights. Purges empty-room / lingerie stock banners.
 */
export function buildVenueGallery(options: {
  cover?: string | null;
  staffImages?: Array<string | null | undefined>;
  fallbackCount?: number;
  seed?: string;
}): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const seed = hashSeed(options.seed || "gallery");
  const need = Math.max(options.fallbackCount ?? 8, 6);

  const push = (url?: string | null) => {
    const value = url?.trim();
    if (!value || seen.has(value) || !canUseGalleryAsset(value)) return;
    seen.add(value);
    out.push(value);
  };

  for (const image of options.staffImages || []) {
    if (out.length >= Math.max(need - 2, 4)) break;
    push(image);
  }

  const loungeStart = seed % LOUNGE_HIGHLIGHTS.length;
  const loungeBudget = 3;
  for (let step = 0; step < LOUNGE_HIGHLIGHTS.length; step += 1) {
    if (out.filter(isLoungeHighlight).length >= loungeBudget) break;
    if (out.length >= need) break;
    push(LOUNGE_HIGHLIGHTS[(loungeStart + step) % LOUNGE_HIGHLIGHTS.length]);
  }

  for (let step = 0; out.length < need && step < LOUNGE_HIGHLIGHTS.length * 2; step += 1) {
    push(LOUNGE_HIGHLIGHTS[(loungeStart + step * 3) % LOUNGE_HIGHLIGHTS.length]);
  }

  // Scraped lingerie / empty-room covers are intentionally ignored.
  void options.cover;
  return out.slice(0, need);
}

export const VENUE_GALLERY_FALLBACKS = [...LOUNGE_HIGHLIGHTS] as const;
