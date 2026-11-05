import type {
  CustomHighlights,
  VenueHighlightBadge,
  VenueHookBanner,
  VenueListingTier,
  VenueVisibility,
} from "@/lib/venue-highlights";

export type { VenueListingTier };

export const VIP_PLAN_LABEL = "$40/mo VIP";
export const VIP_PLAN_NOTE = "Verified elite profile · priority placement";

/** Standardized Canva-style section order for every venue page. */
export const VENUE_TEMPLATE_SLOTS = [
  "hero",
  "hook",
  "quick-info",
  "highlights",
  "staff",
  "pricing",
  "gallery",
  "quality",
  "overview",
  "contact",
  "related",
] as const;

export type VenueTemplateSlot = (typeof VENUE_TEMPLATE_SLOTS)[number];

const DEFAULT_MANAGED_HOOKS: VenueHookBanner[] = [
  {
    title: "🔥 20s Korean Staff • Top Tier Service • 100% Discreet",
    subtitle: "VERIFIED PRO · Call / WhatsApp / WeChat booking",
  },
  {
    title: "❤️부천/시드니 최다인원! 20대 한국인 상큼함 내상제로❤️",
    subtitle: "VIP roster · $150/30m · $200/45m · $250/60m",
  },
  {
    title: "💎 Fresh Asian Beauties On Shift · GFE Specials From $150",
    subtitle: "WeChat / WhatsApp booking · discreet entry",
  },
  {
    title: "✨ 시드니 최강 라인업 · 30/45/60분 코스 바로 예약",
    subtitle: "Agency-managed profile with live availability",
  },
];

const DEFAULT_FREE_HOOK: VenueHookBanner = {
  title: "Browse tonight's roster · Call to confirm availability",
  subtitle: "Standard listing · upgrade to VIP for custom promo hooks",
};

const DEFAULT_VIP_BADGES: VenueHighlightBadge[] = [
  { kind: "promo", label: "VIP Elite", value: VIP_PLAN_LABEL, tone: "violet" },
  { kind: "service", label: "Live Lineup", tone: "emerald" },
  { kind: "event", label: "Priority Placement", tone: "amber" },
];

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function resolveListingTier(options: {
  isManaged?: boolean | null;
  managedBadge?: "pro" | "vip";
  tier?: VenueListingTier | null;
}): VenueListingTier {
  if (options.tier === "free" || options.tier === "managed" || options.tier === "vip") {
    return options.tier;
  }
  if (!options.isManaged) return "free";
  if (options.managedBadge === "vip") return "vip";
  return "managed";
}

export function defaultHookForVenue(options: {
  venueId: string;
  tier: VenueListingTier;
  custom?: VenueHookBanner | null;
}): VenueHookBanner {
  if (options.custom?.title) return options.custom;
  if (options.tier === "free") return DEFAULT_FREE_HOOK;
  const index = hashSeed(options.venueId) % DEFAULT_MANAGED_HOOKS.length;
  return DEFAULT_MANAGED_HOOKS[index];
}

export function enrichVisibilityForTemplate(options: {
  venueId: string;
  visibility: VenueVisibility;
  customHighlights?: CustomHighlights | null;
}): VenueVisibility {
  const tier = resolveListingTier({
    isManaged: options.visibility.isManaged,
    managedBadge: options.visibility.managedBadge,
    tier: options.customHighlights?.tier,
  });
  const hook = defaultHookForVenue({
    venueId: options.venueId,
    tier,
    custom: options.visibility.hook || options.customHighlights?.hook || null,
  });

  let badges = options.visibility.badges;
  if (tier !== "free" && badges.length < 2) {
    badges = [...badges, ...DEFAULT_VIP_BADGES].slice(0, 6);
  }

  return {
    ...options.visibility,
    isManaged: tier !== "free",
    managedBadge:
      tier === "vip" ? "vip" : tier === "managed" ? "pro" : undefined,
    tier,
    hook,
    badges,
    planLabel: tier === "free" ? "Free listing" : VIP_PLAN_LABEL,
  };
}
