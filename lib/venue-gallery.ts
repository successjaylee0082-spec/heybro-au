/** Curated Unsplash fallbacks for venue galleries (luxury interiors + portraits). */
export const VENUE_GALLERY_FALLBACKS = [
  // Luxury lounge / suite interiors
  "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=80",
  // Soft portrait / lifestyle samples (illustrative only)
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
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
  for (const image of options.staffImages ?? []) push(image);

  const need = Math.max(options.fallbackCount ?? 6, 4);
  for (const fallback of VENUE_GALLERY_FALLBACKS) {
    if (out.length >= need) break;
    push(fallback);
  }

  return out;
}
