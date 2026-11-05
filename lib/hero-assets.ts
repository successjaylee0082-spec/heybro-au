import { LUXURY_HERO, LUXURY_HERO_SCENE, LUXURY_LOUNGES } from "@/lib/luxury-assets";

/**
 * High-impact nightlife / dark-luxury hero imagery.
 * Moody neon lounges + alluring glamour silhouettes (illustrative).
 */
export const HERO_NIGHTLIFE_IMAGE = LUXURY_HERO;

export const HERO_NIGHTLIFE_FALLBACKS = [
  LUXURY_HERO,
  LUXURY_HERO_SCENE,
  LUXURY_LOUNGES[0],
  LUXURY_LOUNGES[4],
] as const;

export const HERO_HOOK_BADGES = [
  { id: "active", label: "🔥 Active Ladies Online", labelZh: "🔥 今日出勤中" },
  {
    id: "chat",
    label: "💬 WeChat / WhatsApp Direct",
    labelZh: "💬 微信 / WhatsApp 直聊",
  },
  {
    id: "pay",
    label: "💳 EFTPOS / Cash Accepted",
    labelZh: "💳 EFTPOS / 现金支付",
  },
] as const;
