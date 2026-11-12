/**
 * Safe photo URL helpers for venue roster portraits.
 * Allows curated local staff paths, https image URLs, and small data-URL uploads.
 */

const MAX_DATA_URL_CHARS = 900_000; // ~675KB payload ceiling

export function isSafePhotoUrl(value: unknown): boolean {
  const url = String(value || "").trim();
  if (!url) return false;

  if (
    url.startsWith("/images/staff/") ||
    url.startsWith("/images/venues/") ||
    url.startsWith("/images/hero/")
  ) {
    return url.length < 400 && !url.includes("..");
  }

  if (/^data:image\/(jpeg|jpg|png|webp|gif);base64,/i.test(url)) {
    return url.length <= MAX_DATA_URL_CHARS;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return false;
    }
    if (parsed.username || parsed.password) return false;
    return url.length < 2048;
  } catch {
    return false;
  }
}

export function sanitizePhotoUrl(value: unknown): string | null {
  const url = String(value || "").trim();
  if (!url) return null;
  return isSafePhotoUrl(url) ? url : null;
}

export function resolveCompanionPhoto(options: {
  photoUrl?: string | null;
  slotFallback?: string | null;
}): string {
  const custom = sanitizePhotoUrl(options.photoUrl);
  if (custom) return custom;
  const fallback = String(options.slotFallback || "").trim();
  if (fallback.startsWith("/images/")) return fallback;
  return "/images/staff/western/01.jpg";
}
