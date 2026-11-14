/** Canonical public origin for HeyBro Directory. */
export const SITE_ORIGIN = "https://heybro-au.com";
export const SITE_HOST = "heybro-au.com";
export const SUPPORT_EMAIL = "support@heybro-au.com";

/**
 * Absolute site URL for metadata, sitemap, and Open Graph.
 * Prefers NEXT_PUBLIC_SITE_URL when set; otherwise heybro-au.com.
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "").trim();
  if (fromEnv) return fromEnv;
  return SITE_ORIGIN;
}
