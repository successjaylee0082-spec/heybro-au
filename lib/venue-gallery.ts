import {
  LUXURY_LOUNGES,
  isBlockedInteriorUrl,
  luxuryGalleryExtras,
} from "@/lib/luxury-assets";

/** High-res dark-luxury lounge fallbacks — no apartments, no portraits. */
export const VENUE_GALLERY_FALLBACKS = [...LUXURY_LOUNGES] as const;

function isUsableVenueImage(url?: string | null): boolean {
  if (!url?.trim()) return false;
  if (isBlockedInteriorUrl(url)) return false;
  if (/slider|desktop|banner|ad-|promo/i.test(url)) return false;
  if (/\/images\/staff\//i.test(url)) return false;
  if (/\/images\/hero\//i.test(url)) return false;
  return true;
}

export function buildVenueGallery(options: {
  cover?: string | null;
  staffImages?: Array<string | null | undefined>;
  fallbackCount?: number;
  seed?: string;
}): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  const push = (url?: string | null) => {
    const value = url?.trim();
    if (!value || !isUsableVenueImage(value)) return;
    if (
      value.startsWith("/images/") &&
      !value.includes("/lounges/") &&
      out.length > 0
    ) {
      return;
    }
    if (seen.has(value)) return;
    seen.add(value);
    out.push(value);
  };

  if (options.cover && !isBlockedInteriorUrl(options.cover)) {
    push(options.cover);
  }

  void options.staffImages;

  const need = Math.max(options.fallbackCount ?? 8, 6);
  const extras = luxuryGalleryExtras(options.seed || options.cover || "gallery", need);
  for (const fallback of extras) {
    if (out.length >= need) break;
    push(fallback);
  }
  for (const fallback of VENUE_GALLERY_FALLBACKS) {
    if (out.length >= need) break;
    push(fallback);
  }

  return out;
}
