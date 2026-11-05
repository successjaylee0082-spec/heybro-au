/**
 * High-impact nightlife / dark-luxury hero imagery.
 * Moody neon lounges + alluring glamour silhouettes (illustrative).
 */
export const HERO_NIGHTLIFE_IMAGE =
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=2000&q=85";

export const HERO_NIGHTLIFE_FALLBACKS = [
  // Neon club / concert haze
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=2000&q=85",
  // Dark luxury lounge seating
  "https://images.unsplash.com/photo-1578736641330-3155e606cd40?auto=format&fit=crop&w=2000&q=85",
  // Moody cocktail / rose lighting
  "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=2000&q=85",
  // Glamour portrait silhouette energy
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1800&q=85",
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
