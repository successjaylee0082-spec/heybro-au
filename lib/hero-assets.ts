/**
 * Landing hero: striking female silhouette on a clean dark studio backdrop.
 * Neon party / crowded club plates are intentionally excluded.
 */

export const HERO_NIGHTLIFE_IMAGE = "/images/hero/studio-silhouette.jpg";

export const HERO_NIGHTLIFE_FALLBACKS = [
  "/images/hero/studio-silhouette.jpg",
] as const;

/** Optional soft accent — same studio aesthetic, no neon venue plate. */
export const HERO_GLAMOUR_SILHOUETTE = "/images/hero/studio-silhouette.jpg";

export const HERO_HOOK_BADGES = [
  { id: "active", label: "Active Ladies Online", labelZh: "Active Ladies Online" },
  {
    id: "chat",
    label: "WeChat / WhatsApp Direct",
    labelZh: "WeChat / WhatsApp Direct",
  },
  {
    id: "pay",
    label: "EFTPOS / Cash Accepted",
    labelZh: "EFTPOS / Cash Accepted",
  },
] as const;
