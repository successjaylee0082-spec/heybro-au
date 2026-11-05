import { LUXURY_LOUNGES, isBlockedInteriorUrl } from "@/lib/luxury-assets";

/** Nightlife / dark-luxury lounge fallbacks only — no apartments, no portraits. */
export const VENUE_GALLERY_FALLBACKS = [...LUXURY_LOUNGES] as const;

function isUsableVenueImage(url?: string | null): boolean {
  if (!url?.trim()) return false;
  if (isBlockedInteriorUrl(url)) return false;
  if (/slider|desktop|banner|ad-|promo/i.test(url)) return false;
  // Staff portraits belong on roster cards, not venue gallery placeholders.
  if (/\/images\/staff\//i.test(url)) return false;
  return true;
}

export function buildVenueGallery(options: {
  cover?: string | null;
  staffImages?: Array<string | null | undefined>;
  fallbackCount?: number;
}): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  const push = (url?: string | null) => {
    const value = url?.trim();
    if (!value || !isUsableVenueImage(value)) return;
    if (value.startsWith("/images/") && !value.includes("/lounges/") && out.length > 0) {
      return;
    }
    if (seen.has(value)) return;
    seen.add(value);
    out.push(value);
  };

  // Prefer curated cover; blocked apartment stock is skipped.
  if (options.cover && !isBlockedInteriorUrl(options.cover)) {
    push(options.cover);
  }

  // Ignore scraped staff photos in gallery — ethnicity/gender unverified.
  void options.staffImages;

  const need = Math.max(options.fallbackCount ?? 8, 6);
  for (const fallback of VENUE_GALLERY_FALLBACKS) {
    if (out.length >= need) break;
    push(fallback);
  }

  return out;
}
