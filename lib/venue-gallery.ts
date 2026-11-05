import { LUXURY_LOUNGES, LUXURY_PORTRAITS } from "@/lib/luxury-assets";

/** Curated Unsplash fallbacks for venue galleries (luxury interiors + portraits). */
export const VENUE_GALLERY_FALLBACKS = [
  ...LUXURY_LOUNGES.slice(0, 4),
  ...LUXURY_PORTRAITS.slice(0, 6),
] as const;

export function buildVenueGallery(options: {
  cover?: string | null;
  staffImages?: Array<string | null | undefined>;
  fallbackCount?: number;
}): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  const push = (url?: string | null) => {
    const value = url?.trim();
    if (!value) return;
    if (value.startsWith("/images/") && out.length > 0) return;
    if (seen.has(value)) return;
    seen.add(value);
    out.push(value);
  };

  push(options.cover);
  for (const image of options.staffImages ?? []) {
    if (image && !/slider|desktop|banner/i.test(image)) push(image);
  }

  const need = Math.max(options.fallbackCount ?? 8, 6);
  for (const fallback of VENUE_GALLERY_FALLBACKS) {
    if (out.length >= need) break;
    push(fallback);
  }

  return out;
}
